import { helperName } from "../helpers.js";
import { Assistant } from "../../src/index.js";

class EchoAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("Echo"),
      description: "Echo",
      instructions: "Echo the same text back to the user",
    });
  }
}

export { EchoAssistant };
