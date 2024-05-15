# Experts

An opinionated panel of experts implementation using OpenAI's Assistants API


## Usage


```javascript
class MyAssistant extends Assistant {
  constructor() {
    const name = "My Assistant";
    const description = "...";
    const instructions = "..."
    super(name, description, instructions);
  }
}

const thread = Thread.create();
const assistant = await MyAssistant.create();
const output = assistant.ask("Hi, how are you?", thread.id);
```


## Threads

You can even create a thread with a few messages to start the conversation.

```javascript
const thread = await Thread.create({
  messages: [
    { role: "user", content: "My name is Ken" },
    { role: "user", content: "Oh, my last name is Collins" },
  ],
});
await assistant.ask("What is my full name?", thread.id);
```




## TODO

- Thread management and metadata.

- Test a few simple cases
  - "value" == A <-> B <-> C ("value")
  - POJO as Tool. Using LLM false.
  - Tool has a new thread per run. No shared state.

- Test a few events. Talk about async.

- Showing console streaming. See SDK readme.

  assistant.on("textDelta", (delta, _snapshot) => {
    res.write(delta.value);
  });

- Collecting metrics. Use this.on("runStepDone", (runStep) => env.onRunStepDone(runStep));

  onRunStepDone(runStep) {
    if (!runStep?.usage?.total_tokens) return;
    const iT = runStep.usage.prompt_tokens;
    const oT = runStep.usage.completion_tokens;
    const tT = runStep.usage.total_tokens;
    this.logTokens({ InTokens: iT, OutTokens: oT, TotalTokens: tT });
  }

## Setup

This project leverages [Dev Containers](https://containers.dev/) meaning you can open it in any supporting IDE to get started right away. This includes using [VS Code with Dev Containers](https://www.youtube.com/watch?v=b1RavPr_878) which is the recommended approach.

Once opened in your development container, create a `.env.development.local` file with your OpenAI API key and [postimage.org](https://postimages.org) API key:

```
OPENAI_API_KEY=sk-...
POST_IMAGES_API_KEY=...
```

Now you can run the following commands:

```bash
./bin/setup
./bin/test
```
