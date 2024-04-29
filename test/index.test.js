import { helperName } from "./helpers.js";
import { Thread, Assistant, Tool } from "../src/index.js";

test("can import Thread", async () => {
  const thread = await Thread.create();
  expect(thread.id).toMatch(/^thread_/);
});

test("can import Assistant", async () => {
  const assistant = new Assistant(helperName("Import"), "test", "test");
  await assistant.init();
  expect(assistant.id).toMatch(/^asst_/);
});

test("can import Tool", async () => {
  const opts = { llm: false };
  const tool = new Tool(helperName("Import"), "test", "test", opts);
  await tool.init();
  expect(tool.isTool).toBe(true);
});
