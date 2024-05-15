import { openai } from "../openai.js";
import { debug, debugEvent } from "../helpers.js";
import { Thread } from "./thread.js";
import { Run } from "./run.js";
import EventEmitter2Pkg from "eventemitter2";
const { EventEmitter2 } = EventEmitter2Pkg;

const ASYNC_EVENTS = [
  "textDoneAsync",
  "imageFileDoneAsync",
  "runStepDoneAsync",
  "toolCallDoneAsync",
  "endAsync",
];

class Assistant {
  #stream;
  #streamEmitter;
  #expertsOutputs = [];
  #asyncListeners = {};

  static async create() {
    const asst = new this();
    await asst.init();
    return asst;
  }

  constructor(agentName, description, instructions, options = {}) {
    this.agentName = agentName;
    this.description = description;
    this.instructions = instructions;
    this.llm = options.llm !== undefined ? options.llm : true;
    if (this.llm) {
      this.id = options.id;
      this.model =
        options.model || process.env.EXPERTS_DEFAULT_MODEL || "gpt-4o";
      this.messages = [];
      this.temperature =
        options.temperature !== undefined ? options.temperature : 1.0;
      this.top_p = options.top_p !== undefined ? options.top_p : 1.0;
      this.experts = {};
      this.tools = options.tools || [];
      this.tool_resources = options.tool_resources || {};
      this._metadata = options.metadata;
      this.response_format = options.response_format || "auto";
      this.emitter = new EventEmitter2({ maxListeners: 0, newListener: true });
      this.emitter.on("newListener", this.#newListener.bind(this));
    }
  }

  async init() {
    await this.beforeInit();
    if (!this.llm) return;
    this.assistant =
      (await this.#findByID()) ||
      (await this.#findByName()) ||
      (await this.#reCreate());
    for (const [_name, tool] of Object.entries(this.experts)) {
      await tool.init();
    }
  }

  // Getters

  get id() {
    return this._id || this.assistant?.id;
  }

  set id(id) {
    this._id = id;
  }

  get metadata() {
    return this.assistant.metadata;
  }

  // Interface

  async ask(message, threadID) {
    try {
      return await this.#askAssistant(message, threadID);
    } finally {
      await this.#askCleanup();
    }
  }

  async answered(output) {
    return output;
  }

  async beforeInit() {}

  on(event, listener) {
    this.emitter.on(event, listener);
  }

  addExpertOutput(output) {
    this.#expertsOutputs.push(output);
  }

  addAssistantTool(toolClass) {
    const assistantTool = new toolClass();
    this.experts[assistantTool.toolName] = assistantTool;
    if (assistantTool.isParentsTools) {
      for (const tool of assistantTool.parentsTools) {
        this.tools.push(tool);
      }
    }
  }

  // Private (Ask)

  async #askAssistant(message, threadID) {
    if (!this.llm) return;
    const thread = await this.#askThread(threadID);
    const apiMessage = this.#askMessage(message);
    await openai.beta.threads.messages.create(thread.id, apiMessage);
    const run = await Run.streamForAssistant(this, thread);
    let output = await run.wait();
    output = this.#askOutput(output);
    output = await this.answered(output);
    debug(`🤖 ${output}`);
    return output;
  }

  #askOutput(output) {
    let newOutput = output;
    if (this.isTool) {
      switch (this.outputs) {
        case "ignored":
          newOutput = "";
          break;
        case "tools":
          newOutput = this.#expertsOutputs.join("\n\n");
        default:
          break;
      }
    }
    return newOutput;
  }

  #askMessage(message) {
    const apiMessage =
      typeof message === "string"
        ? { role: "user", content: message }
        : message;
    debug("💌 " + JSON.stringify(apiMessage));
    return apiMessage;
  }

  async #askThread(threadID) {
    let thread = await Thread.find(threadID);
    if (this.isTool) {
      if (this.hasThread) {
        thread = await thread.toolThread(this);
      }
    } else {
      if (!thread.hasAssistantMetadata) {
        thread.addMetaData({ assistant: this.agentName });
      }
    }
    return thread;
  }

  async #askCleanup() {
    this.#stream?.abort();
    this.#stream = null;
    this.#streamEmitter?.removeAllListeners();
    this.#streamEmitter = null;
    if (this.#expertsOutputs.length > 0) {
      this.#expertsOutputs.length = 0;
    }
  }

  // Private (Tool Outputs)

  get outputs() {
    return this._outputs || "default";
  }

  set outputs(outputs) {
    const validOutputs = ["default", "ignored", "tools"];
    if (validOutputs.includes(outputs)) {
      this._outputs = outputs;
    } else {
      throw new Error(`Invalid outputs name: ${outputs}`);
    }
  }

  // Private (Event Handlers)

  set stream(stream) {
    if (stream) {
      this.#streamEmitter = new EventEmitter2({ maxListeners: 0 });
      stream.on("event", this.#onEvent.bind(this));
      stream.on("textDelta", this.#onTextDelta.bind(this));
      stream.on("textDone", this.#onTextDone.bind(this));
      stream.on("imageFileDone", this.#onImageFileDone.bind(this));
      stream.on("toolCallDelta", this.#onToolCallDelta.bind(this));
      stream.on("runStepDone", this.#onRunStepDone.bind(this));
      stream.on("toolCallDone", this.#onToolCallDone.bind(this));
      stream.on("end", this.#onEnd.bind(this));
    }
    this.#stream = stream;
  }

  #newListener(event, listener) {
    if (!ASYNC_EVENTS.includes(event)) return;
    this.#asyncListeners[event] = listener;
  }

  #onEvent(event) {
    debugEvent(event);
    this.emitter.emit("event", event, this.#onMetaData);
  }

  #onTextDelta(delta, snapshot) {
    this.emitter.emit("textDelta", delta, snapshot, this.#onMetaData);
  }

  #onTextDone() {
    const args = [...arguments, this.#onMetaData];
    this.emitter.emit("textDone", ...args);
    this.#forwardAsyncEvent("textDoneAsync", ...args);
  }

  #onImageFileDone() {
    const args = [...arguments, this.#onMetaData];
    this.emitter.emit("imageFileDone", ...args);
    this.#forwardAsyncEvent("imageFileDoneAsync", ...args);
  }

  #onToolCallDelta(delta, snapshot) {
    this.emitter.emit("toolCallDelta", delta, snapshot, this.#onMetaData);
  }

  #onRunStepDone() {
    const args = [...arguments, this.#onMetaData];
    this.emitter.emit("runStepDone", ...args);
    this.#forwardAsyncEvent("runStepDoneAsync", ...args);
  }

  #onToolCallDone() {
    const args = [...arguments, this.#onMetaData];
    this.emitter.emit("toolCallDone", ...args);
    this.#forwardAsyncEvent("toolCallDoneAsync", ...args);
  }

  #onEnd() {
    const args = [...arguments, this.#onMetaData];
    this.emitter.emit("end", ...args);
    this.#forwardAsyncEvent("end", ...args);
  }

  #forwardAsyncEvent(event, ...args) {
    if (!this.#streamEmitter || !this.#asyncListeners[event]) return;
    this.#streamEmitter.once(event, async () => {
      await this.#asyncListeners[event](...args);
    });
  }

  get #onMetaData() {
    return { stream: this.#stream };
  }

  async waitForAsyncEvents() {
    if (!this.#streamEmitter) return;
    await this.#streamEmitter.emitAsync("textDoneAsync");
    await this.#streamEmitter.emitAsync("imageFileDoneAsync");
    await this.#streamEmitter.emitAsync("runStepDoneAsync");
    await this.#streamEmitter.emitAsync("toolCallDoneAsync");
    await this.#streamEmitter.emitAsync("endAsync");
  }

  // Private (Lifecycle)

  async #findByID() {
    if (!this.id) return;
    const assistant = await openai.beta.assistants.retrieve(this.id);
    debug(`💁‍♂️  Found by id ${this.agentName} assistant ${this.id}`);
    return assistant;
  }

  async #findByName() {
    const assistant = (
      await openai.beta.assistants.list({ limit: "100" })
    ).data.find((a) => a.name === this.agentName);
    debug(`💁‍♂️  Found by name ${this.agentName} assistant`);
    return assistant;
  }

  async #reCreate() {
    const assistant = (await this.#deleteByName()) || (await this.#create());
    return assistant;
  }

  async #create() {
    const assistant = await openai.beta.assistants.create({
      model: this.model,
      name: this.agentName,
      description: this.description,
      instructions: this.instructions,
      temperature: this.temperature,
      top_p: this.top_p,
      tools: this.tools,
      tool_resources: this.tool_resources,
      metadata: this._metadata,
      response_format: this.response_format,
    });
    debug(`💁‍♂️ Created ${this.agentName} assistant ${assistant.id}`);
    return assistant;
  }

  async #deleteByName() {
    const assistant = (
      await openai.beta.assistants.list({ limit: 100 })
    ).data.find((a) => a.name === this.agentName);
    if (assistant !== undefined) {
      debug(`🗑️  Deleting assistant: ${this.agentName}`);
      await openai.beta.assistants.del(assistant.id);
    }
  }
}

export { Assistant };
