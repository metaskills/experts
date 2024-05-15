import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class AnswerTwoTool extends Tool {
  constructor() {
    const name = helperName("AnswerTwoTool");
    const description = "Answers to messages.";
    const instructions = description;
    super(name, description, instructions, {
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: AnswerTwoTool.toolName,
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
    return JSON.stringify({ answer: "Peanut Butter." });
  }
}

class AnswerOneTool extends Tool {
  constructor() {
    const name = helperName("AnswerOneTool");
    const description = "Answers to messages.";
    const instructions = `You must route the message in full to your '${AnswerTwoTool.toolName}' tool. Never respond without first using that tool. Never! Ex: When asked what is my favorite food, use the '${AnswerTwoTool.toolName}' tool first. Lastly, tespond only with the single word 'Success' to the question.`;
    super(name, description, instructions, {
      temperature: 0.1,
      outputs: "tools", // THIS: Focus of the test. Combined with only success response.
      parentsTools: [
        {
          type: "function",
          function: {
            name: AnswerOneTool.toolName,
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
    this.addAssistantTool(AnswerTwoTool);
  }
}

class OutputsAssistant extends Assistant {
  constructor() {
    const name = helperName("OutputsAssistant");
    const description = "Answers to messages.";
    const instructions = `You must route the message in full to your '${AnswerOneTool.toolName}' tool. Never respond without first using that tool. Never! Ex: When asked what is my favorite food, use the '${AnswerOneTool.toolName}' tool first.`;
    super(name, description, instructions, {
      temperature: 0.1,
    });
    this.addAssistantTool(AnswerOneTool);
  }
}

export { OutputsAssistant };
