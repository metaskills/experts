import { helperName } from "../helpers.js";
import { Tool } from "../../src/experts/tool.js";

class EchoTool extends Tool {
  constructor() {
    super({
      name: helperName("EchoTool"),
      instructions: "Echo the same text back to the user",
      parentsTools: [
        {
          type: "function",
          function: {
            name: EchoTool.toolName,
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

export { EchoTool };
