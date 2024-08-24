import { helperName } from "../helpers.js";
import { Tool } from "../../src/index.js";

class BasicEchoTool extends Tool {
  constructor() {
    super({
      name: helperName("EchoTool"),
      instructions: "Echo the same text back to the user",
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
}

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
            description: "Use this tool if you get the '/marco' message.",
            parameters: {
              type: "object",
              properties: { invoke_marco: { type: "boolean" } },
              required: ["invoke_marco"],
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
    this.marcoToolCallCount = 0;
  }

  async ask(message, threadID, options = {}) {
    let json;
    try {
      json = JSON.parse(message);
    } catch (error) {}
    if (json?.invoke_marco === true) {
      this.marcoToolCallCount++;
      return "poolo";
    }
    return await super.ask(message, threadID, options);
  }
}

export { BasicEchoTool, EchoTool };
