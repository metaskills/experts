import { helperName } from "../helpers.js";
import { Tool } from "../../src/experts/tool.js";
import { Assistant } from "../../src/experts/assistant.js";
import { z } from "zod";
import { zodFunction, zodResponseFormat } from "openai/helpers/zod";

class IdeogramTool extends Tool {
  constructor() {
    super({
      name: helperName("IdeogramTool"),
      model: "gpt-4o-2024-08-06",
      instructions:
        "Turn an ideaogram concept into an Ideogram prompt. Very short paragraph.",
      temperature: 0.1,
      asyncRun: true,
      parentsTools: [
        zodFunction({
          name: "ideogram",
          description: "Submit a single concept to cerate an ideogram prompt",
          parameters: z.object({
            concept: z.object({
              concept: z
                .string()
                .describe("Brief concept in a single sentence."),
              thinking: z
                .string()
                .describe("Your detailed thinking behind the concept."),
            }),
          }),
        }),
      ],
      response_format: zodResponseFormat(
        z.object({ prompt: z.string() }),
        "prompt"
      ),
    });
  }
}

class CreativeAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("CreativeAssistant"),
      model: "gpt-4o-2024-08-06",
      instructions:
        "Take a topic and use your ideogram tool to create three concepts.",
      temperature: 0.1,
      response_format: zodResponseFormat(
        z.object({ prompts: z.array(z.object({ prompt: z.string() })) }),
        "prompt"
      ),
    });
    this.addAssistantTool(IdeogramTool);
  }
}

export { CreativeAssistant };
