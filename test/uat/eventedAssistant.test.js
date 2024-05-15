import { helperThreadID } from "../helpers.js";
import { EventedAssistant } from "../fixtures.js";

test("testing that events emitted are capabile of async code and waited to complete", async () => {
  const assistant = await EventedAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask("hello", threadID);
  expect(output).toMatch(/hello/i);
  expect(assistant.myEvents).toStrictEqual([
    { textDone: "hello" },
    { textDoneAsync: "hello" },
  ]);
  const output2 = await assistant.ask("hi", threadID);
  expect(output2).toMatch(/hi/i);
  expect(assistant.myEvents).toStrictEqual([
    { textDone: "hello" },
    { textDoneAsync: "hello" },
    { textDone: "hi" },
    { textDoneAsync: "hi" },
  ]);
}, 20000);
