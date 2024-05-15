import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class AnswerTool extends Tool {
  constructor() {
    const name = helperName("NoLLMAnswerTool");
    const description = "Answers to messages.";
    const instructions = description;
    super(name, description, instructions, {
      llm: false,
      temperature: 0.1,
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
    const instructions = `You must route the message in full to your '${AnswerTool.toolName}' tool. Never respond without first using that tool. Never! Ex: When asked what color the sky is, use the '${AnswerTool.toolName}' tool first.`;
    super(name, description, instructions);
    this.addAssistantTool(AnswerTool);
  }
}

export { NoLLMToolAssistant };
