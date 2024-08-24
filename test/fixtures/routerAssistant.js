import { helperName } from "../helpers.js";
import { Assistant } from "../../src/index.js";
import { EchoTool } from "./echoTool.js";

class RouterAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("Router"),
      description: "Conversational Router",
      temperature: 0.1,
      instructions:
        "Routes messages to the right tool. Send any message starting with the '/echo' or '/marco' command to that tool using the exact message you received. If no tool can be found for the message, reply with one word 'unrouteable' as the error.",
    });
    this.addAssistantTool(EchoTool);
  }
}

export { RouterAssistant };
