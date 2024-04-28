import fs from "fs";
import { helperName, helperPath } from "../helpers.js";
import { openai } from "../../src/openai.js";
import { Tool } from "../../src/experts/tool.js";

class DataTool extends Tool {
  constructor() {
    const name = helperName("DataTool");
    const description = "Data Tool";
    const instructions = "Search your data files for answers to questions.";
    super(name, description, instructions, {
      tools: [{ type: "code_interpreter" }],
      temperature: 0.1,
    });
  }

  async init() {
    await this._createDataFile();
    await super.init();
  }

  async _createDataFile() {
    const path = helperPath("test/fixtures/data.csv");
    const file = await openai.files.create({
      file: fs.createReadStream(path),
      purpose: "assistants",
    });
    this.tool_resources["code_interpreter"] = {
      file_ids: [file.id],
    };
  }
}

export { DataTool };
