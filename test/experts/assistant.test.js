import fs from "fs";
import { openai } from "../../src/openai.js";
import {
  helperName,
  helperPath,
  helperFindAssistant,
  helperThreadID,
} from "../helpers.js";
import { TestAssistant, TestIDAssistant } from "../fixtures.js";
import { Thread } from "../../src/experts/thread.js";

beforeEach(() => {
  delete process.env.TEST_ASSISTANT_ID;
});

test("can use environment variables to find an assistant by id", async () => {
  const assistant = await TestIDAssistant.create();
  // Will find the same assistant by name.
  const assistant2 = await TestIDAssistant.create();
  expect(assistant.id).toBe(assistant2.id);
  // Will find by id.
  process.env.TEST_ASSISTANT_ID = assistant2.id;
  const assistant3 = await TestIDAssistant.create();
  expect(assistant2.id).toBe(assistant3.id);
});

test("can configure various options", async () => {
  const path = helperPath("test/fixtures/data.csv");
  const file = await openai.files.create({
    file: fs.createReadStream(path),
    purpose: "assistants",
  });
  const assistant = await TestAssistant.createWithOptions({
    metadata: { foo: "bar" },
    temperature: 0.5,
    top_p: 0.5,
    tool_resources: {
      code_interpreter: { file_ids: [file.id] },
    },
    response_format: { type: "json_object" },
  });
  expect(assistant.metadata).toStrictEqual({ foo: "bar" });
  expect(assistant.temperature).toBe(0.5);
  expect(assistant.top_p).toBe(0.5);
  expect(assistant.assistant.tool_resources).toStrictEqual({
    code_interpreter: { file_ids: [file.id] },
  });
  expect(assistant.assistant.response_format).toStrictEqual({
    type: "json_object",
  });
});

test("create new assistant using name, description, and instruction defaults", async () => {
  // None exists before creation.
  const name = helperName("Test");
  TestAssistant.name = name;
  const assistantNone = await helperFindAssistant(name);
  expect(assistantNone).toBeUndefined();
  const assistant = await TestAssistant.create();
  const backendAssistant = await helperFindAssistant(name);
  // Assistant
  expect(assistant.agentName).toBe(name);
  expect(assistant.description).toBe("test-description");
  expect(assistant.instructions).toBe("test-instructions");
  expect(assistant.llm).toBe(true);
  expect(assistant.model).toMatch(/gpt/);
  expect(assistant.temperature).toBe(1.0);
  expect(assistant.metadata).toStrictEqual({});
  expect(assistant.id).toMatch(/^asst_/);
  expect(assistant.id).toBe(backendAssistant.id);
  // Backend
  expect(backendAssistant).toBeDefined();
  expect(backendAssistant.name).toBe(name);
  expect(backendAssistant.description).toBe("test-description");
  expect(backendAssistant.instructions).toBe("test-instructions");
  expect(backendAssistant.model).toMatch(/gpt/);
  expect(backendAssistant.temperature).toBe(1.0);
  expect(backendAssistant.metadata).toStrictEqual({});
  expect(backendAssistant.id).toMatch(/^asst_/);
});

test("assistants store metadata in the thread", async () => {
  const threadID = await helperThreadID();
  const assistant = await TestAssistant.createWithOptions({
    instructions: "Only say hello.",
  });
  await assistant.ask("Hello", threadID);
  const thread = await Thread.find(threadID);
  expect(thread.metadata.assistant).toBe(assistant.agentName);
});
