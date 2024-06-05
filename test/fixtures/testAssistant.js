import { helperName } from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";

class TestAssistant extends Assistant {
  static get name() {
    return this._name || helperName("TestAssistant");
  }

  static set name(value) {
    this._name = value;
  }

  constructor(options = {}) {
    options.name = TestAssistant.name;
    options.description = "test-description";
    options.instructions = "test-instructions";
    super(options);
  }
}

class TestIDAssistant extends Assistant {
  constructor() {
    super({
      id: process.env.TEST_ASSISTANT_ID,
      name: helperName("Test", { rand: false }),
      description: "test-description",
      instructions: "test-instructions",
    });
  }
}

export { TestAssistant, TestIDAssistant };
