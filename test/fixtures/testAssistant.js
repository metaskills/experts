import { helperName } from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";

class TestAssistant extends Assistant {
  static get name() {
    return this._name || helperName("TestAssistant");
  }

  static set name(value) {
    this._name = value;
  }

  static async createWithOptions(options = {}) {
    const asst = new this(options);
    await asst.init();
    return asst;
  }

  constructor(options = {}) {
    super(TestAssistant.name, "test-description", "test-instructions", options);
  }
}

class TestIDAssistant extends Assistant {
  constructor() {
    const name = helperName("Test", { rand: false });
    super(name, "test-description", "test-instructions", {
      id: process.env.TEST_ASSISTANT_ID,
    });
  }
}

export { TestAssistant, TestIDAssistant };
