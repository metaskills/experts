import { openai } from "../openai.js";
import { debug } from "../helpers.js";
import { Thread } from "./thread.js";
import { Run } from "./run.js";
import { EventEmitter } from "events";

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
    this.eventEmitter = new EventEmitter();
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
    return await this.askAssistant(message, threadID);
  }

  async beforeInit() {}

  // Run Events

  on(event, listener) {
    this.eventEmitter.on(event, listener);
  }

  onEvent(event) {
    this.eventEmitter.emit("event", event);
  }

  onTextDelta(delta, snapshot) {
    this.eventEmitter.emit("textDelta", delta, snapshot);
  }

  onToolCallDelta(delta, snapshot) {
    this.eventEmitter.emit("toolCallDelta", delta, snapshot);
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

  async askAssistant(message, threadID) {
    if (!this.llm) return;
    let thread = await Thread.find(threadID);
    if (this.isTool && this.hasToolThread) {
      thread = await thread.toolThread(this);
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
      if (this.llm && this.ignoreLLMToolOutput) {
        output = "";
      }
    }
    debug(`🤖 ${output}`);
    return output;
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
