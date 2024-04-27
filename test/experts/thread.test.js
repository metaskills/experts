import {
  helperThreadID,
  helperDeleteAllAssistants,
  helperFindAssistant,
} from "../helpers.js";

import { Thread } from "../../src/experts/thread.js";

test("creates a thread", async () => {
  const thread = await Thread.create();
  expect(thread.id).toMatch(/^thread_/);
});

test("can add metadata for various tracking purposes", async () => {
  let thread = await Thread.create();
  await thread.addMetaData("somekey", "somevalue");
  thread = await Thread.find(thread.id);
  expect(thread.metadata).toStrictEqual({ somekey: "somevalue" });
  await thread.addMetaData("one", "two");
  thread = await Thread.find(thread.id);
  expect(thread.metadata).toStrictEqual({ somekey: "somevalue", one: "two" });
});
