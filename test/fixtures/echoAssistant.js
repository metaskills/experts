import { helperName } from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";

class EchoAssistant extends Assistant {
  constructor() {
    const name = helperName("Echo");
    const description = "Echo";
    const instructions = "Echo the same text back to the user";
    super(name, description, instructions);
  }
}

export { EchoAssistant };
