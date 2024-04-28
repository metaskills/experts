import { helperDeleteAllAssistants, helperThreadID } from "../helpers.js";
import { DataTool } from "../fixtures.js";

beforeEach(async () => {
  await helperDeleteAllAssistants();
});

afterEach(async () => {
  await helperDeleteAllAssistants();
});

test("simple qa with a CSV data tool", async () => {
  const tool = await DataTool.init();
  const threadID = await helperThreadID();
  const output = await tool.ask(
    "What is the name of the fourth person in the data?",
    threadID
  );
  expect(output).toMatch(/Emily Davis/);
});
