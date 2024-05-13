import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class AnswerToolTwo extends Tool {
  constructor() {
    const name = helperName("AnswerToolTwo");
    const description = "Answers to messages.";
    const instructions = description;
    super(name, description, instructions, {
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: AnswerToolTwo.toolName,
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

class AnswerToolOne extends Tool {
  constructor() {
    const name = helperName("AnswerToolOne");
    const description = "Answers to messages.";
    const instructions =
      "You must route the message in full to your answer tool. Never respond without first using that tool. Ex: What is my favorite food. Lastly, tespond only with the single word 'Success' to the question.";
    super(name, description, instructions, {
      temperature: 0.1,
      outputs: "tools", // THIS: Focus of the test. Combined with only success response.
      parentsTools: [
        {
          type: "function",
          function: {
            name: AnswerToolOne.toolName,
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
    this.addAssistantTool(AnswerToolTwo);
  }
}

class OutputsAssistant extends Assistant {
  constructor() {
    const name = helperName("OutputsAssistant");
    const description = "Answers to messages.";
    const instructions =
      "You must route the message in full to your answer tool. Never respond without first using that tool. Ex: What is my favorite food.";
    super(name, description, instructions, {
      temperature: 0.1,
    });
    this.addAssistantTool(AnswerToolOne);
  }
}

export { OutputsAssistant };
