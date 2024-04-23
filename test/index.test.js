import { helperDeleteAllAssistants } from "./helpers.js";
import { Thread, Assistant, Tool } from "../src/index.js";

const NAME = "Experts.js (Test)";

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
  const assistant = await Assistant.create(
    NAME,
    "test-description",
    "test-instructions"
  );
  expect(assistant.id).toMatch(/^asst_/);
});

test("can import Tool", async () => {
  const tool = await Tool.create(
    NAME,
    "test-description",
    "test-instructions",
    { llm: false }
  );
  expect(tool.isTool).toBe(true);
});
