import { helperName } from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";
import { EchoTool } from "./echoTool.js";

class RouterAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("Router"),
      description: "Conversational Router",
      instructions:
        "Routes messages to the right tool. Send any message starting with the /echo command to the echo tool. If no tool can be found for the message, reply with one word 'unrouteable' as the error.",
    });
    this.addAssistantTool(EchoTool);
  }
}

export { RouterAssistant };
