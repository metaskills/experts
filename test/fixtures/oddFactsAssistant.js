import fs from "fs";
import { openai } from "../../src/openai.js";
import { Assistant } from "../../src/experts/assistant.js";
import { helperName, helperPath } from "../helpers.js";

class OddFactsAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("OddFacts"),
      description: "Odd Facts",
      instructions: "Search your files for answers to questions.",
      tools: [{ type: "file_search" }],
      temperature: 0.1,
    });
  }

  async beforeInit() {
    await this._createFileSearch();
  }

  async _createFileSearch() {
    const fileStream = fs.createReadStream(
      helperPath("test/fixtures/oddFacts.txt")
    );
    this.vectorStore = await openai.beta.vectorStores.create({
      name: helperName("OddFacts"),
      expires_after: {
        anchor: "last_active_at",
        days: 1,
      },
    });
    this.tool_resources["file_search"] = {
      vector_store_ids: [this.vectorStore.id],
    };
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(
      this.vectorStore.id,
      { files: [fileStream] }
    );
  }
}

export { OddFactsAssistant };
