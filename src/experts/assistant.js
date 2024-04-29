import { openai } from "../openai.js";
import { debug, formatToolOutputs } from "../helpers.js";
import { Thread } from "./thread.js";
import { Message } from "./messages.js";
import { Run } from "./run.js";

class Assistant {
  static async create() {
    const asst = new this();
    await asst.init();
    return asst;
  }

  static async delete() {
    const asst = new this();
    await asst.deleteByName();
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
    }
  }

  async init() {
    if (!this.llm) return;
    this.assistant = await this.reCreate();
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

  // Messages: Asking and access.

  async ask(message, threadID) {
    return await this.askAssistant(message, threadID);
  }

  get lastMessageContent() {
    return this.messages[0].content;
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

  // Tool Outputs: Used for response pass-thru.

  get isAssistantsToolsOutputs() {
    return (
      this.assistantsToolsOutputs && this.assistantsToolsOutputs.length > 0
    );
  }

  addAssistantsToolsOutputs(output) {
    this.assistantsToolsOutputs.push(output);
  }

  clearAssistantsToolsOutputs() {
    if (this.isAssistantsToolsOutputs) {
      this.assistantsToolsOutputs.length = 0;
    }
  }

  // Private

  async askAssistant(message, threadID) {
    if (!this.llm) return;
    this.clearAssistantsToolsOutputs();
    let thread = await Thread.find(threadID);
    if (this.isTool && this.hasToolThread) {
      thread = await thread.toolThread(this);
    }
    const _msg = await Message.createForAssistant(this, message, thread);
    const run = await Run.createForAssistant(this, thread);
    let output = await run.actions();
    if (this.isTool) {
      if (this.llm && this.ignoreLLMToolOutput) {
        output = "";
      }
    } else {
      if (this.isAssistantsToolsOutputs) {
        output = formatToolOutputs(this.assistantsToolsOutputs);
      }
    }
    debug(`🤖 ${output}`);
    return output;
  }

  // Private (Lifecycle)

  async reCreate() {
    const assistant = (await this.deleteByName()) || (await this.create());
    return assistant;
  }

  async findByID() {
    if (!this.id) return;
    const assistant = await openai.beta.assistants.retrieve(this.id);
    return assistant;
  }

  async findByName() {
    const assistant = (
      await openai.beta.assistants.list({ limit: "100" })
    ).data.find((a) => a.name === this.agentName);
    debug(`💁‍♂️  Found assistant: ${this.agentName}`);
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
    debug(`💁‍♂️ Created ${this.agentName} assistant ${assistant.id}...`);
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
