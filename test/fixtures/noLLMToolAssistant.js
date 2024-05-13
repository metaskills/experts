import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class AnswerTool extends Tool {
  constructor() {
    const name = helperName("NoLLMAnswerTool");
    const description = "Answers to messages.";
    const instructions = description;
    super(name, description, instructions, {
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: AnswerTool.toolName,
            description: description,
            parameters: {
              type: "object",
              properties: { message: { type: "string" } },
              required: ["message"],
            },
          },
        },
      ],
    });
  }

  async ask(_message) {
    return JSON.stringify({ answer: "Red and green thanks to the aurora." });
  }
}

class NoLLMToolAssistant extends Assistant {
  constructor() {
    const name = helperName("NoLLMToolAssistant");
    const description = "Answers to messages.";
    const instructions =
      "Never answer questions directly. You must route all messages in full to your single answer tool.";
    super(name, description, instructions);
    this.addAssistantTool(AnswerTool);
  }
}

export { NoLLMToolAssistant };
