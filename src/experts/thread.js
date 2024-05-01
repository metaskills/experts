import { debug } from "../helpers.js";
import { openai } from "../openai.js";

class Thread {
  static async find(threadID) {
    const thread = await openai.beta.threads.retrieve(threadID);
    debug("🧵 Found: " + JSON.stringify(thread));
    return new Thread(thread);
  }

  static async create() {
    const thrd = await openai.beta.threads.create();
    debug("🧵 Create: " + JSON.stringify(thrd));
    const thread = new Thread(thrd);
    return thread;
  }

  constructor(thread) {
    this.thread = thread;
  }

  get id() {
    return this.thread.id;
  }

  get metadata() {
    return this.thread.metadata;
  }

  async addMetaData(key, value) {
    this.metadata[key] = value;
    await openai.beta.threads.update(this.id, {
      metadata: this.metadata,
    });
    debug("🧵 Update: " + JSON.stringify(this.thread));
  }

  async toolThread(tool) {
    let thread;
    const threadKey = tool.toolName;
    const threadID = this.thread.metadata[threadKey];
    if (!threadID) {
      thread = await Thread.create();
      await this.addMetaData(threadKey, thread.id);
      await thread.addMetaData("tool", tool.agentName);
    } else {
      thread = await Thread.find(threadID);
    }
    return thread;
  }
}

export { Thread };
