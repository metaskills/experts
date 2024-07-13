import { helperName } from "../helpers.js";
import { Tool } from "../../src/experts/tool.js";

class EchoTool extends Tool {
  constructor() {
    super({
      name: helperName("EchoTool"),
      instructions: "Echo the same text back to the user",
      outputs: "tools",
      tools: [
        {
          type: "function",
          function: {
            name: "marco",
            description: "Use this tool if you get the /marco command.",
            parameters: {
              type: "object",
              properties: { invoke: { type: "boolean" } },
              required: ["invoke"],
            },
          },
        },
      ],
      parentsTools: [
        {
          type: "function",
          function: {
            name: "echo",
            description: "Echo",
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

  async ask(message, threadID, options = {}) {
    const json = JSON.parse(message);
    if (json.message === "marco") {
      return "polo";
    }
    return await super.ask(message, threadID, options);
  }
}

export { EchoTool };
