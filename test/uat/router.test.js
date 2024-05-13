import { helperThread, helperThreadID } from "../helpers.js";
import { RouterAssistant } from "../fixtures.js";

test("using an assistant as router to the echo tool", async () => {
  const assistant = await RouterAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask("i need sales help", threadID);
  expect(output).toMatch(/unrouteable/);
  const output2 = await assistant.ask("/echo 123 hello", threadID);
  expect(output2).toMatch(/123 hello/);
  // Ensure each has own tread using metadata links.
  const thread = await helperThread(threadID);
  expect(thread.metadata.echo).toMatch(/thread_/);
  const thread2 = await helperThread(thread.metadata.echo);
  expect(thread2.metadata.tool).toMatch(/Experts\.js \(EchoTool\)/);
});
