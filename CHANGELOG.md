# Keep A Changelog!

See this http://keepachangelog.com link for information on how we want this document formatted.

## v1.5.8

### Changed

- Modified `debugEvent` function in `src/helpers.js` to remove instructions from event data when logging in DEBUG mode, preventing large instruction strings from cluttering debug output.

## v1.5.5, v1.5.6, v1.5.7

### Fixed

Dual package approach.

## v1.5.4

### Added

New `beforeAsk(message)` callback for assistant.

## v1.5.1, v1.5.2, v1.5.3

### Fixed

Dual package approach.

## v1.5.0

### Removed

Subpath imports. Please import or require only "experts".

### Added/Changed

Use dual package approach. Now supports both ES6 import syntax and CommonJS require statements.

## v1.4.3

### Added 

Added another lifecycle hook, `afterInit()` Example use case, write out newly created Assistants' IDs to an environment file.

```javascript
async afterInit() {
  // ...
}
```

## v1.4.2

### Added

Streaming support for buffered output added in v1.4.1.

## v1.4.1

### Added

New buffered output support for non-LLM tools. This allows a tool to add string data as part of the `ask()` response. However, this data is not submitted to tool outputs, hence is not seen by the parent. Useful for bespoke UI where an LLM assistant is formatting data for display.

See Bespoke UI Assistant test for a full example.

## v1.4.0

### Changed

Default to GPT-4o mini. Reminder, you can use `EXPERTS_DEFAULT_MODEL` environment variable to set the default model.

## v1.3.1

### Fixed

Allow Assistants or Assistants as Tools to have OpenAI `tools` that can be invoked on your Run's behalf. Prior, there was a heavy bias that all tool calls were experts and this is not the case.

## v1.3.0

### Fixed

Now `parentsTools` can have multiple functions present. This should have worked all along but was overlooked. See changes around `MyTool.toolName` below.

### Changed

No documented usage of `MyTool.toolName`. It is still used internally for a Tool's thread meta. The function is still available for use, but it is not recommended.

> [!CAUTION]
> It is critical that your tool's function name be unique across its parent's entire set of tool names.

## v1.2.0

### Changed

**Major Assistant & Tool Constructor Changes**

Both Assistant & Tool have removed their (name, description, instructions) ordinal parameters in favor of a single options object. Now, the constructor signature is:

```javascript
// Using Assistant.create() factory.
// 
assistant = new Assistant.craete({
  name: "My Assistant",
  instructions: "My Assistant Instructions",
  ...
});

// Or using ES6 Classes.
//
class MyAssistant extends Assistant {
  constructor() {
    super({
      name: "My Assistant",
      instructions: "My Assistant Instructions",
    });
  }
})
```

## Added

A new `skipUpdate` option to use for deployments such as staging where it might be desirable to use the Assistant's remote resource instructions or other properties.

## v1.1.0

### Changed

Names are no longer unique when assistants are created. This means the find/recreate by name is no longer needed. Recommend if deployments must track a fixed assistant to use the assistant id environment variable.

### Fixed

OpenAI now seems to validate the tool JSON when an Assistant is created. Fixed a bug in a test fixture where `required` was in the wrong place.

## v1.0.2

### Added

New Assistant `run_options` for all Runs created, ex: forcing a `tool_choice`. Alternatively, you can pass an options object to the `ask` method to be used for the current Run.

```javascript
await assistant.ask("...", "thread_abc123", {
  run: {
    tool_choice: { type: "function", function: { name: "..." } },
    additional_instructions: "...",
    additional_messages: [...],
  },
});
```

All Run create options are supported.

https://platform.openai.com/docs/api-reference/runs/createRun

However, not all make sense with Experts.js.

## v1.0.1

### Fixed

- Assistant init updates configs after finding by name or id.

## v1.0.0

### Added

- Initial Release

# Changelog

## [Unreleased]

### Changed
- Modified `debugEvent` function in `src/helpers.js` to remove instructions from event data when logging in DEBUG mode, preventing large instruction strings from cluttering debug output.
