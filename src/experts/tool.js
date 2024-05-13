import { Assistant } from "./assistant.js";

class Tool extends Assistant {
  static get toolName() {
    let name = this.name
      .replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`)
      .slice(1);
    if (name.endsWith("_tool")) {
      name = name.slice(0, -5);
    }
    return name;
  }

  constructor(agentName, description, instructions, options = {}) {
    super(agentName, description, instructions, options);
    this.isTool = true;
    this.hasThread = options.hasThread !== undefined ? options.hasThread : true;
    this.outputs = options.outputs || "default";
    this.parentsTools = options.parentsTools || [];
  }

  get toolName() {
    return this.constructor.toolName;
  }

  get isParentsTools() {
    return this.parentsTools && this.parentsTools.length > 0;
  }
}

export { Tool };
