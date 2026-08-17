import { EventEmitter } from "node:events";
import { jest } from "@jest/globals";
import { Assistant } from "../../src/index.js";

test("endAsync listeners run after the stream ends", async () => {
  const assistant = new Assistant({ name: "Async Event Test" });
  const stream = new EventEmitter();
  const onEnd = jest.fn();
  const onEndAsync = jest.fn(async () => {});

  assistant.on("end", onEnd);
  assistant.on("endAsync", onEndAsync);
  assistant.stream = stream;

  stream.emit("end");
  await assistant.waitForAsyncEvents();

  expect(onEnd).toHaveBeenCalledTimes(1);
  expect(onEndAsync).toHaveBeenCalledTimes(1);
  expect(onEndAsync.mock.calls[0][0].stream).toBe(stream);
});
