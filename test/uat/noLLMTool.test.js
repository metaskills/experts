import { helperThreadID } from "../helpers.js";
import { NoLLMToolAssistant } from "../fixtures.js";

test("using a tool wiht no llm", async () => {
  const assistant = await NoLLMToolAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask("What color is the sky today?", threadID);
  expect(output).toMatch(/red/i);
  expect(output).toMatch(/green/i);
});
