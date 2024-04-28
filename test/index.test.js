import { helperName, helperDeleteAllAssistants } from "./helpers.js";
import { Thread, Assistant, Tool } from "../src/index.js";

beforeEach(async () => {
  await helperDeleteAllAssistants();
});

afterEach(async () => {
  await helperDeleteAllAssistants();
});

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
