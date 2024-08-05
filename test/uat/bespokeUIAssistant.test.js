import { helperThreadID } from "../helpers.js";
import { HtmlAssistant } from "../fixtures.js";

test("can find an expert that has many tools", async () => {
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
