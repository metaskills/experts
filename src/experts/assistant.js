import { openai } from "../openai.js";
import { debug } from "../helpers.js";
import { Thread } from "./thread.js";
import { Run } from "./run.js";
import EventEmitter2Pkg from "eventemitter2";
const { EventEmitter2 } = EventEmitter2Pkg;

class Assistant {
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
      this.model = options.model || "gpt-4-turbo";
      this.messages = [];
      this.temperature =
        options.temperature !== undefined ? options.temperature : 1.0;
      this.top_p = options.top_p !== undefined ? options.top_p : 1.0;
      this.assistantsTools = {};
      this.assistantsToolsOutputs = [];
      this.tools = options.tools || [];
      this.tool_resources = options.tool_resources || {};
      this._metadata = options.metadata;
      this.response_format = options.response_format || "auto";
      this.eventEmitter = new EventEmitter2();
    }
  }

  async init() {
    await this.beforeInit();
    if (!this.llm) return;
    this.assistant =
      (await this.findByID()) ||
      (await this.findByName()) ||
      (await this.reCreate());
    for (const [_name, tool] of Object.entries(this.assistantsTools)) {
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
    const output = await this._askAssistant(message, threadID);
    return await this.answered(output);
  }

  async answered(output) {
    return output;
  }

  async beforeInit() {}

  async on(event, listener) {
    await this.eventEmitter.on(event, listener);
  }

  // Tool Assistant

  addAssistantTool(toolClass) {
    const assistantTool = new toolClass();
    this.assistantsTools[assistantTool.toolName] = assistantTool;
    if (assistantTool.isParentsTools) {
      for (const tool of assistantTool.parentsTools) {
        this.tools.push(tool);
      }
    }
  }

  // Private (Ask)

  async _askAssistant(message, threadID) {
    if (!this.llm) return;
    this.clearToolsOutputs();
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
    const messageContent =
      typeof message === "string" ? message : JSON.stringify(message);
    debug("💌 " + JSON.stringify(messageContent));
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messageContent,
    });
    const run = await Run.streamForAssistant(this, thread);
    let output = await run.wait();
    if (this.isTool) {
      switch (this.outputs) {
        case "ignored":
          output = "";
          break;
        case "tools":
          // console.log("_askAssistant:", this.agentName);
          // console.log("_askAssistant:", this.assistantsToolsOutputs);
          output = this.assistantsToolsOutputs.join("\n\n");
        default:
          break;
      }
    }
    debug(`🤖 ${output}`);
    return output;
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

  addToolsOutputs(output) {
    this.assistantsToolsOutputs.push(output);
  }

  clearToolsOutputs() {
    if (this.assistantsToolsOutputs?.length > 0) {
      this.assistantsToolsOutputs.length = 0;
    }
  }

  // Private (Event Handlers)

  _onEvent(event, metadata) {
    this.eventEmitter.emit("event", event, metadata);
  }

  _onTextDelta(delta, snapshot, metadata) {
    this.eventEmitter.emit("textDelta", delta, snapshot, metadata);
  }

  _onTextDone(content, snapshot, metadata) {
    this.eventEmitter.emit("textDone", content, snapshot, metadata);
  }

  _onImageFileDone(content, snapshot, metadata) {
    this.eventEmitter.emit("imageFileDone", content, snapshot, metadata);
  }

  _onToolCallDelta(delta, snapshot, metadata) {
    this.eventEmitter.emit("toolCallDelta", delta, snapshot, metadata);
  }

  _onRunStepDone(runStep, metadata) {
    this.eventEmitter.emit("runStepDone", runStep, metadata);
  }

  _onToolCallDone(toolCall, metadata) {
    this.eventEmitter.emit("toolCallDone", toolCall, metadata);
  }

  _onEnd(metadata) {
    this.eventEmitter.emit("end", metadata);
  }

  // Private (Lifecycle)

  async findByID() {
    if (!this.id) return;
    const assistant = await openai.beta.assistants.retrieve(this.id);
    debug(`💁‍♂️  Found by id ${this.agentName} assistant ${this.id}`);
    return assistant;
  }

  async findByName() {
    const assistant = (
      await openai.beta.assistants.list({ limit: "100" })
    ).data.find((a) => a.name === this.agentName);
    debug(`💁‍♂️  Found by name ${this.agentName} assistant`);
    return assistant;
  }

  async reCreate() {
    const assistant = (await this.deleteByName()) || (await this.create());
    return assistant;
  }

  async create() {
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

  async deleteByName() {
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
