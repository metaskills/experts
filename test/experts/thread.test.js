import { helperThreadID, helperFindAssistant } from "../helpers.js";
import { TestAssistant } from "../fixtures.js";

import { Thread } from "../../src/index.js";

test("creates a thread", async () => {
  const thread = await Thread.create();
  expect(thread.id).toMatch(/^thread_/);
});

test("creates a thread with messages", async () => {
  const thread = await Thread.create({
    messages: [
      { role: "user", content: "My name is Ken" },
      { role: "user", content: "Oh, my last name is Collins" },
    ],
  });
  const assistant = await TestAssistant.create();
  const output = await assistant.ask("What is my full name?", thread.id);
  expect(output).toMatch(/Ken.*Collins/);
});

test("can add metadata for various tracking purposes", async () => {
  let thread = await Thread.create();
  await thread.addMetaData({ somekey: "somevalue" });
  thread = await Thread.find(thread.id);
  expect(thread.metadata).toStrictEqual({ somekey: "somevalue" });
  await thread.addMetaData({ one: "two" });
  thread = await Thread.find(thread.id);
  expect(thread.metadata).toStrictEqual({ somekey: "somevalue", one: "two" });
});
