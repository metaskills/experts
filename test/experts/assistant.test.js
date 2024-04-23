import {
  helperThreadID,
  helperDeleteAllAssistants,
  helperFindAssistant,
} from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";

const NAME = "Experts.js (Test)";

beforeEach(async () => {
  await helperDeleteAllAssistants();
});

afterEach(async () => {
  await helperDeleteAllAssistants();
});

test("can ask the assistant a question using a thread id", async () => {
  const assistant = await Assistant.create(
    NAME,
    "echo",
    "echo the same text back to the user"
  );
  const threadID = await helperThreadID();
  const output = await assistant.ask("hello 123", threadID);
  expect(output).toBe("hello 123");
});

test("can override defaults such as temperature and top_p", async () => {
  const assistant = await Assistant.create(
    NAME,
    "test-description",
    "test-instructions",
    { temperature: 0.5, top_p: 0.5 }
  );
  expect(assistant.temperature).toBe(0.5);
  expect(assistant.top_p).toBe(0.5);
});

test("create new assistant using name, description, and instruction defaults", async () => {
  // None exists before creation.
  const assistantNone = await helperFindAssistant(NAME);
  expect(assistantNone).toBeUndefined();
  const assistant = await Assistant.create(
    NAME,
    "test-description",
    "test-instructions"
  );
  const backendAssistant = await helperFindAssistant(NAME);
  // Assistant
  expect(assistant.agentName).toBe(NAME);
  expect(assistant.description).toBe("test-description");
  expect(assistant.instructions).toBe("test-instructions");
  expect(assistant.llm).toBe(true);
  expect(assistant.model).toBe("gpt-4-turbo");
  expect(assistant.temperature).toBe(1.0);
  expect(assistant.id).toMatch(/^asst_/);
  expect(assistant.id).toBe(backendAssistant.id);
  // Backend
  expect(backendAssistant).toBeDefined();
  expect(backendAssistant.name).toBe(NAME);
  expect(backendAssistant.description).toBe("test-description");
  expect(backendAssistant.instructions).toBe("test-instructions");
  expect(backendAssistant.model).toBe("gpt-4-turbo");
  expect(backendAssistant.temperature).toBe(1.0);
  expect(backendAssistant.id).toMatch(/^asst_/);
});
