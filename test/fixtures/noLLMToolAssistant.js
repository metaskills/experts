import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class AnswerTool extends Tool {
  constructor() {
    super({
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: "answer",
            description: "Answers to messages.",
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
    super({
      name: helperName("NoLLMToolAssistant"),
      description: "Answers to messages.",
      instructions: "You must route /tool messages in full to your 'answer' tool. Never respond without first using that tool. Never! Ex: When asked what color the sky is, use the 'answer' tool first.",
    });
    this.addAssistantTool(AnswerTool);
  }
}

export { NoLLMToolAssistant };
