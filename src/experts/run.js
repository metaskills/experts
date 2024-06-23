import { debug, messagesContent } from "../helpers.js";
import { openai } from "../openai.js";

class Run {
  #stream;

  static async streamForAssistant(assistant, thread, options = {}) {
    debug("🦦 Streaming...");
    options.assistant_id ||= assistant.id;
    const stream = await openai.beta.threads.runs.stream(thread.id, options);
    return new Run(assistant, thread, stream);
  }

  constructor(assistant, thread, stream) {
    this.assistant = assistant;
    this.thread = thread;
    this.stream = stream;
  }

  get id() {
    return this.run.id;
  }

  get threadID() {
    return this.thread.id;
  }

  set stream(stream) {
    this.toolOutputs = [];
    this.isToolOuputs = false;
    this.#stream = stream;
    this.assistant.stream = stream;
    this.run = stream.currentRun();
    stream.on("event", (e) => this.getRun(e));
  }

  get stream() {
    return this.#stream;
  }

  get messagesOutput() {
    return messagesContent(this.messages || []);
  }

  get isRequiredSubmitToolOutputs() {
    return (
      this.run.status === "requires_action" &&
      this.run.required_action.type === "submit_tool_outputs"
    );
  }

  get toolCalls() {
    return this.run.required_action.submit_tool_outputs.tool_calls;
  }

  getRun(event) {
    if (
      !this.run &&
      event.event.startsWith("thread.run") &&
      event.data.id.startsWith("run_")
    ) {
      this.run = event.data;
    }
  }

  async wait() {
    this.messages = await this.stream.finalMessages();
    this.run = this.stream.currentRun();
    await this.assistant.waitForAsyncEvents();
    if (this.isRequiredSubmitToolOutputs) {
      await this.callTools();
      if (this.isToolOuputs) {
        const output = await this.submitToolOutputs();
        return output;
      } else {
        return this.messagesOutput;
      }
    } else {
      return this.messagesOutput;
    }
  }

  // Private (Tools)

  async callTools() {
    const toolCalls = this.toolCalls;
    debug(`🧰 ${JSON.stringify(toolCalls.map((tc) => tc.function.name))}`);
    for (const toolCall of toolCalls) {
      debug("🪚  " + JSON.stringify(toolCall));
      if (toolCall.type === "function") {
        const toolOutput = { tool_call_id: toolCall.id };
        const toolCaller = this.#findExpertByToolName(toolCall.function.name);
        if (toolCaller && typeof toolCaller.ask === "function") {
          const output = await toolCaller.ask(
            toolCall.function.arguments,
            this.threadID
          );
          toolOutput.output = output;
          this.isToolOuputs = true;
        }
        debug("🪵  " + JSON.stringify(toolOutput));
        this.toolOutputs.push(toolOutput);
      }
    }
  }

  async submitToolOutputs() {
    debug("🏡  Submitting outputs...");
    this.addExpertsOutputs();
    this.stream = await openai.beta.threads.runs.submitToolOutputsStream(
      this.threadID,
      this.id,
      { tool_outputs: this.toolOutputs }
    );
    const output = await this.wait();
    return output;
  }

  addExpertsOutputs() {
    if (this.assistant.isTool && this.assistant.outputs === "tools") {
      this.toolOutputs.forEach((to) => {
        this.assistant.addExpertOutput(to.output);
      });
    }
  }

  #findExpertByToolName(functionName) {
    let toolCaller;
    this.assistant.experts.forEach((expert) => {
      if (expert.isParentsTools) {
        expert.parentsTools.forEach((parentTool) => {
          if (
            parentTool.type === "function" &&
            parentTool.function.name === functionName
          ) {
            toolCaller = expert;
          }
        });
      }
    });
    return toolCaller;
  }
}

export { Run };
