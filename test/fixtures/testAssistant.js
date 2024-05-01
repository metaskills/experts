import { Assistant } from "../../src/experts/assistant.js";

class TestAssistant extends Assistant {
  static get name() {
    return this._name;
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

export { TestAssistant };
