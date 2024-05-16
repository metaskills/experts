# 🤖🤖🤖 Multi AI Agent Systems <br>using OpenAI's Assistants API

Experts.js is the easiest way to create [OpenAI's Assistants](https://platform.openai.com/docs/assistants/how-it-works) and link them together as Tools to create a Panel of Experts system with expanded memory and attention to detail.

## Overview

...

## Installation



## Assistants


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

## Tools

...

## Threads

OpenAI's Assistants API introduces a new resource called [Threads](https://platform.openai.com/docs/assistants/how-it-works/managing-threads-and-messages) which messages & files are stored within. Essentially, threads are a managed context window or memory for your agent. Creating a new thread with Experts.js is as easy as:

```javascript
const thread = Thread.create();
console.log(thread.id) // thread_abc123
```

You can also create a thread with messages to start a conversation. We support OpenAI's threads/create request body outlined in their [Threads API Reference](https://platform.openai.com/docs/api-reference/threads) documentation. For example:

```javascript
const thread = await Thread.create({
  messages: [
    { role: "user", content: "My name is Ken" },
    { role: "user", content: "Oh, my last name is Collins" },
  ],
});
const output = await assistant.ask("What is my full name?", thread.id);
console.log(output) // Ken Collins
```

### Thread Management & Locks

By default, each [Tool](#tools) in Experts.js has its own thread & context. This avoids a potential [thread locking](https://platform.openai.com/docs/assistants/how-it-works/thread-locks) issue which happens if a  [Tool](#tools) were to share an [Assistant's](#assistant) thread which would still be waiting for tool outputs to be submitted. The following diagram illustrates how Experts.js manages threads on your behalf:

![Panel of Experts Thread Management](docs/images/panel-of-experts-thread-management.webp)

All questions to your experts require a thread ID. For chat applications, the ID would be stored on the client. Such as a URL path parameter. With Expert.js, no other client-side IDs are needed. As each [Assistant](#assistants) calls an LLM backed [Tool](#tools), it will find or create a thread for that tool as needed. Experts.js stores this parent -> child thread relationship for you using OpenAI's [thread metadata](https://platform.openai.com/docs/api-reference/threads/modifyThread). An Experts.js [Tool](#tools) configured as a simple function via the `llm` false configuration will not create or use a thread. 

## TODO

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

## Development Setup

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
