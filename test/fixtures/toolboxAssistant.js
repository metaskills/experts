import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class DrillTool extends Tool {
  static calls = 0;
  constructor() {
    super({
      name: helperName("DrillTool"),
      description: "A drill tool.",
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: DrillTool.toolName,
            description: "A drill tool.",
            parameters: {
              type: "object",
              properties: { use: { type: "boolean" } },
              required: ["use"],
            },
          },
        },
      ],
    });
  }

  async ask(_message) {
    this.constructor.calls += 1;
    return "The drill started working again. I drilled a hole in the wall so we can punch through to the other side. It was very loud, did you hear it?";
  }
}

class CarpenterAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("Carpenter"),
      description: "A carpenter that does not work.",
      instructions:
        "Avoid work at all costs because your drill is broken. But if you did do work, tell me what you did.",
      temperature: 0.1,
      run_options: {
        tool_choice: {
          type: "function",
          function: { name: DrillTool.toolName },
        },
      },
    });
    this.addAssistantTool(DrillTool);
  }
}

export { CarpenterAssistant, DrillTool };
