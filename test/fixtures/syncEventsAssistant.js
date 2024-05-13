import { helperName } from "../helpers.js";
import { Assistant, Tool } from "../../src/index.js";

class FactRetrievalTool extends Tool {
  constructor() {
    const name = helperName("FactRetrievalTool");
    const description =
      "Pulls facts from a semantic database based on a user's question.";
    const instructions = description;
    super(name, description, instructions, {
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: FactRetrievalTool.toolName,
            description: description,
            parameters: {
              type: "object",
              properties: { question: { type: "string" } },
              required: ["question"],
            },
          },
        },
      ],
    });
  }

  async ask(_message) {
    return JSON.stringify({
      fact: "The Ziggle whale is a new species found discovered in 2024.",
    });
  }
}

const INJECTED_FACT = {
  fact: "The Ziggle whale loves Yeti crabs found near geothermal vents.",
};

class GetRandomFactsTool extends Tool {
  constructor() {
    const name = helperName("GetRandomFactsTool");
    const description = "Get random facts tool.";
    const instructions =
      "Use the question to retrieve random facts about the question. Respond only with the single word 'Success' to the question.";
    super(name, description, instructions, {
      temperature: 0.1,
      outputs: "tools",
      parentsTools: [
        {
          type: "function",
          function: {
            name: GetRandomFactsTool.toolName,
            description: description,
            parameters: {
              type: "object",
              properties: { question: { type: "string" } },
              required: ["question"],
            },
          },
        },
      ],
    });
    this.addAssistantTool(FactRetrievalTool);
    this.on("toolCallDone", (tc, d) => this.toolCallDone(tc, d));
  }

  async toolCallDone(toolCall, data) {
    // This will simulate a reranking query.
    console.log("[DEBUG] toolCallDone START");
    // await new Promise((resolve) => setTimeout(resolve, 10000));
    data.assistant.addToolsOutputs(JSON.stringify(INJECTED_FACT));
    console.log("[DEBUG] toolCallDone END");
  }
}

class SyncEventsAssistant extends Assistant {
  constructor() {
    const name = helperName("SyncEventsAssistant");
    const description = "Get two random facts.";
    const instructions =
      "Before answering the question, you must use your get random facts tool.";
    super(name, description, instructions, {
      temperature: 0.1,
    });
    this.addAssistantTool(GetRandomFactsTool);
  }
}

export { SyncEventsAssistant };
