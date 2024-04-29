import { helperThreadID } from "../helpers.js";
import { EchoTool, DataTool } from "../fixtures.js";

test("simple echo tool", async () => {
  const tool = await EchoTool.create();
  expect(tool.isTool).toBe(true);
  const threadID = await helperThreadID();
  const output = await tool.ask("hello 123", threadID);
  expect(output).toMatch("hello 123");
});

test("simple qa with a CSV data tool", async () => {
  const tool = await DataTool.create();
  expect(tool.isTool).toBe(true);
  const threadID = await helperThreadID();
  const output = await tool.ask(
    "What is the name of the fourth person in the data?",
    threadID
  );
  expect(output).toMatch(/Emily Davis/);
});
