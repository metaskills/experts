import { debug, isDebug } from "../helpers.js";
import { openai } from "../openai.js";

class Run {
  static async createForAssistant(assistant, thread) {
    debug("ℹ️  Running...");
    const queuedRun = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });
    const run = new Run(assistant, thread, queuedRun);
    await run.wait();
    return run;
  }

  constructor(assistant, thread, run) {
    this.assistant = assistant;
    this.thread = thread;
    this.run = run;
  }

  get id() {
    return this.run.id;
  }

  get threadID() {
    return this.thread.id;
  }

  async wait() {
    let polledRun;
    let isRunning = true;
    while (isRunning) {
      polledRun = await openai.beta.threads.runs.retrieve(
        this.threadID,
        this.id
      );
      await this.waitTime(500);
      if (!/^(queued|in_progress|cancelling)$/.test(polledRun.status)) {
        if (isDebug) {
          delete polledRun.instructions;
          delete polledRun.description;
        }
        debug("🏃‍♂️ " + JSON.stringify(polledRun));
        isRunning = false;
      } else {
        debug("💨 " + JSON.stringify(polledRun.id));
      }
    }
    const completedRun = polledRun;
    const runSteps = await openai.beta.threads.runs.steps.list(
      this.threadID,
      this.id
    );
    for (const step of runSteps.data) {
      debug("👣 " + JSON.stringify(step));
    }
    this.run = completedRun;
    return completedRun;
  }

  // This looks for any required actions, runs them, submits tool outputs,
  // and returns the assistant's messages.
  //
  async actions() {
    if (
      this.run.status === "requires_action" &&
      this.run.required_action.type === "submit_tool_outputs"
    ) {
      let isToolOuputs = false;
      const toolOutputs = [];
      const toolCalls = this.run.required_action.submit_tool_outputs.tool_calls;
      debug("🧰 " + JSON.stringify(toolCalls.map((tc) => tc.function.name)));
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
            isToolOuputs = true;
          }
          debug("🪵  " + JSON.stringify(toolOutput));
          toolOutputs.push(toolOutput);
        }
      }
      if (isToolOuputs) {
        const output = await this.submitToolOutputs(toolOutputs);
        return output;
      } else {
        return await this.thread.assistantMessageContent();
      }
    } else {
      return await this.thread.assistantMessageContent();
    }
  }

  async submitToolOutputs(toolOutputs) {
    debug("🏡  Submitting outputs...");
    await openai.beta.threads.runs.submitToolOutputs(this.threadID, this.id, {
      tool_outputs: toolOutputs,
    });
    if (this.assistant.assistantsToolsPassOutputs) {
      toolOutputs.forEach((to) => {
        this.assistant.addAssistantsToolsOutputs(to.output);
      });
    }
    this.run = await this.wait();
    const output = await this.actions();
    return output;
  }

  // Private

  async waitTime(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}

export { Run };
