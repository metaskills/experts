import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class AnswerTwoTool extends Tool {
  constructor() {
    super({
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: "answer_two",
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
    return JSON.stringify({ answer: "Peanut Butter." });
  }
}

class AnswerOneTool extends Tool {
  constructor() {
    super({
      name: helperName("AnswerOneTool"),
      description: "Answers to messages.",
      instructions: "You must route the message in full to your 'answer_two' tool. Never respond without first using that tool. Never! Ex: When asked what is my favorite food, use the 'answer_two' tool first. Lastly, tespond only with the single word 'Success' to the question.",
      temperature: 0.1,
      outputs: "tools", // THIS: Focus of the test. Combined with only success response.
      parentsTools: [
        {
          type: "function",
          function: {
            name: "answer_one",
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
    this.addAssistantTool(AnswerTwoTool);
  }
}

class OutputsAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("OutputsAssistant"),
      description: "Answers to messages.",
      instructions: "You must route the message in full to your 'answer_one' tool. Never respond without first using that tool. Never! Ex: When asked what is my favorite food, use the 'answer_one' tool first.",
      temperature: 0.1,
    });
    this.addAssistantTool(AnswerOneTool);
  }
}

export { OutputsAssistant };
