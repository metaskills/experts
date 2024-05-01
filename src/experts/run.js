import { debug, messagesContent } from "../helpers.js";
import { openai } from "../openai.js";

class Run {
  static async streamForAssistant(assistant, thread) {
    debug("🦦 Streaming...");
    const stream = await openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistant.id,
    });
    return new Run(assistant, thread, stream);
  }

  constructor(assistant, thread, stream) {
    this.assistant = assistant;
    this.thread = thread;
    this.stream = stream;
  }

  set stream(stream) {
    this._stream = stream;
    this.run = stream.currentRun();
    stream.on("event", (e) => this.onEvent(e));
    stream.on("textDelta", (td, s) => this.onTextDelta(td, s));
    stream.on("toolCallDelta", (tcd, s) => this.onToolCallDelta(tcd, s));
    stream.on("runStepDone", (rs) => this.onRunStepDone(rs));
    stream.on("toolCallDone", (tc) => this.onToolCallDone(tc));
    this.toolOutputs = [];
    this.isToolOuputs = false;
  }

  get stream() {
    return this._stream;
  }

  get id() {
    return this.run.id;
  }

  get threadID() {
    return this.thread.id;
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

  async wait() {
    this.messages = await this.stream.finalMessages();
    this.run = this.stream.currentRun();
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

  // Private (Stream Event Handlers)

  onEvent(event) {
    debug(`📡 Event: ${JSON.stringify(event)}`);
    this.assistant.onEvent(event);
  }

  onTextDelta(delta, snapshot) {
    this.assistant.onTextDelta(delta, snapshot);
  }

  onToolCallDelta(delta, snapshot) {
    this.assistant.onToolCallDelta(delta, snapshot);
  }

  onRunStepDone(runStep) {
    this.assistant.onRunStepDone(runStep);
  }

  onToolCallDone(toolCall) {
    this.assistant.onToolCallDone(toolCall);
  }

  // Private (Tools)

  async callTools() {
    const toolCalls = this.toolCalls;
    debug(`🧰 ${JSON.stringify(toolCalls.map((tc) => tc.function.name))}`);
    for (const toolCall of toolCalls) {
      debug("🪚  " + JSON.stringify(toolCall));
      if (toolCall.type === "function") {
        const toolOutput = { tool_call_id: toolCall.id };
        const toolCaller =
          this.assistant.assistantsTools[toolCall.function.name];
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
    this.stream = await openai.beta.threads.runs.submitToolOutputsStream(
      this.threadID,
      this.id,
      {
        tool_outputs: this.toolOutputs,
      }
    );
    const output = await this.wait();
    return output;
  }
}

export { Run };
