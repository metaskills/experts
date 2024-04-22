import { debug } from "../helpers.js";
import { openai } from "../openai.js";

class Message {
  static async createForAssistant(asst, content, thread) {
    const contentString =
      typeof content === "string" ? content : JSON.stringify(content);
    const msg = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: contentString,
    });
    debug("💌 " + JSON.stringify(msg));
    const message = new Message(msg, thread);
    asst.messages.unshift(message);
    return message;
  }

  constructor(message, thread) {
    this.message = message;
    this.thread = thread;
  }

  // Getters

  get type() {
    return this.message.type;
  }

  get role() {
    return this.message.role;
  }

  get isUser() {
    return this.role === "user";
  }

  get isAssistant() {
    return this.role === "assistant";
  }

  get isImageFileContent() {
    return this.message.content[0].type === "image_file";
  }

  get content() {
    return this.message.content
      .filter((c) => c.type === "text")
      .map((c) => c.text.value)
      .join("\n\n");
  }

  // Assistant Response

  async assistantContent() {
    if (!this.isAssistant) return;
    const aContent = [this.content];
    // TODO: Handle image file content to public S3 for markdown.
    // if (this.isImageFileContent) {
    //   const imageFileID = message.content[0].image_file.file_id;
    //   const imageFilePath = await downloadFile(imageFileID);
    //   const imageMessage = `![Image](https://example.com${imageFilePath})`;
    //   aContent.push(imageMessage);
    // }
    return aContent.join("\n\n");
  }
}

export { Message };
