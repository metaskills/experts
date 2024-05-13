import { helperThreadID } from "../helpers.js";
import { OddFactsAssistant } from "../fixtures.js";

describe("with vector store", () => {
  test("can provide tools", async () => {
    const assistant = await OddFactsAssistant.create();
    const threadID = await helperThreadID();
    const output = await assistant.ask(
      "Using a single word response, tell me what food source do Proxima Centauri b inhabitants migrate for?",
      threadID
    );
    expect(output).toMatch(/Snorgronk/);
  });
});
