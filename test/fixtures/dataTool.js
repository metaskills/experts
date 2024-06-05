import fs from "fs";
import { helperName, helperPath } from "../helpers.js";
import { openai } from "../../src/openai.js";
import { Tool } from "../../src/experts/tool.js";

class DataTool extends Tool {
  constructor() {
    super({
      name: helperName("DataTool"),
      instructions: "Search your data files for answers to questions.",
      tools: [{ type: "code_interpreter" }],
      temperature: 0.1,
    });
  }

  async beforeInit() {
    await this._createDataFile();
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
