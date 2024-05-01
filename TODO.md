* Create a beforeInit event/hook vs. an override.
* Can citations be removed from vector store QnA?
* Remove the Assistant#messages. Is even `Message` needed?
* TODO: Revisit this and assistantsToolsOutputs.
* Is `addAssistantTool` the right name now?


```javascript
stream.on("event", (e) => {
  if (e.event.startsWith("thread.run")) {
    aRun = e.data;
  }
});
```
