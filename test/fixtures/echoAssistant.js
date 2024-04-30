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

class EchoAssistantWithSetNameAndIdOption extends Assistant {
  constructor() {
    const name = helperName("Echo", { rand: false });
    const description = "Echo";
    const instructions = "Echo the same text back to the user";
    super(name, description, instructions, {
      id: process.env.TEST_ECHO_TOOL_ID,
    });
  }
}

export { EchoAssistant, EchoAssistantWithSetNameAndIdOption };
