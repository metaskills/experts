import { helperThread, helperThreadID } from "../helpers.js";
import { RouterAssistant } from "../fixtures.js";

let assistant;

beforeAll(async () => {
  assistant = await RouterAssistant.create();
});

test("sends message to the echo tool", async () => {
  const threadID = await helperThreadID();
  const output = await assistant.ask("/hello", threadID);
  expect(output).toMatch(/unrouteable/);
  const output2 = await assistant.ask("/echo 123 hello", threadID);
  expect(output2).toMatch(/123 hello/);
});

test("each has own thread using metadata links", async () => {
  const threadID = await helperThreadID();
  await assistant.ask("/echo hello", threadID);
  const thread = await helperThread(threadID);
  expect(thread.metadata.echo).toMatch(/thread_/);
  const thread2 = await helperThread(thread.metadata.echo);
  expect(thread2.metadata.tool).toMatch(/Experts\.js \(EchoTool\)/);
});

test("commands can pass from tool to tool", async () => {
  const threadID = await helperThreadID();
  const output = await assistant.ask("/marco", threadID);
  expect(output).toMatch(/polo/);
});
