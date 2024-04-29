import { helperName } from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";
import { EchoTool } from "./echoTool.js";

class RouterAssistant extends Assistant {
  constructor() {
    const name = helperName("Router");
    const description = "Conversational Router";
    const instructions =
      "Routes messages to the right tool. Send any message starting with the /echo command to the echo tool. If no tool can be found for the message, reply with one word 'unrouteable' as the error.";
    super(name, description, instructions);
    this.addAssistantTool(EchoTool);
  }
}

export { RouterAssistant };
