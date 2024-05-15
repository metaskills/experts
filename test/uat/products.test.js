import { helperThread, helperThreadID } from "../helpers.js";
import { ProductsAssistant } from "../fixtures.js";

test("a comprehensive opensearch assistant for product apparel catalog", async () => {
  const assistant = await ProductsAssistant.create();
  const threadID = await helperThreadID();
  // Can it query the OpenSearch DB for a simple aggregate count.
  const totalAnswer = await assistant.ask(
    "What is the total amount of products available?",
    threadID
  );
  expect(totalAnswer).toMatch(/(5,000|5000)/);
  // Can it use code interperter to genereate a bar chart image along with the answer?
  const totalChartAnswer = await assistant.ask(
    "Show me a bar chart image with totals of all top level categories.",
    threadID
  );
  expect(totalChartAnswer).toMatch(/i\.postimg\.cc/);
  // Ensure each has own tread using metadata links.
  const asstThread = await helperThread(threadID);
  expect(asstThread.metadata.assistant).toMatch(/ProductsAssistant/);
  expect(asstThread.metadata.products).toMatch(/thread_/);
  const toolThread = await helperThread(asstThread.metadata.products);
  expect(toolThread.metadata.tool).toMatch(/ProductsTool/);
  expect(toolThread.metadata.products_open_search).toMatch(/thread_/);
  const seachThread = await helperThread(
    toolThread.metadata.products_open_search
  );
  expect(seachThread.metadata.tool).toMatch(/ProductsOpenSearchTool/);
}, 180000);
