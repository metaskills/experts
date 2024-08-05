import { helperThreadID } from "../helpers.js";
import { HtmlAssistant } from "../fixtures.js";

test("can attached buffered output to non-streaming output", async () => {
  const assistant = await HtmlAssistant.create();
  const dataTool = assistant.experts[0];
  const htmlTool = assistant.experts[1];
  expect(dataTool.toolCallCount).toBe(0);
  expect(htmlTool.toolCallCount).toBe(0);
  // Exercise.
  const threadID = await helperThreadID();
  const output = await assistant.ask("Show me cow data.", threadID);
  // Ensure each tool was called once.
  expect(dataTool.toolCallCount).toBe(1);
  expect(htmlTool.toolCallCount).toBe(1);
  // Ensure the output has HTML.
  expect(output).toMatch(/class="my-Component"/);
}, 20000);

test("can use streaming events to capture buffered output", async () => {
  const dones = [];
  const assistant = await HtmlAssistant.create();
  assistant.on("bufferedTextDoneAsync", (content) => {
    dones.push(content.value);
  });
  const threadID = await helperThreadID();
  await assistant.ask("Show me cow data.", threadID);
  expect(dones.length).toBe(2);
  expect(dones[0]).toMatch(/class="my-Component"/);
  expect(dones[0]).toMatch(/Bessie/i);
  expect(dones[1]).toMatch(/class="my-Component"/);
  expect(dones[1]).toMatch(/Gertie/i);
}, 20000);
