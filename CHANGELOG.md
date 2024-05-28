# Keep A Changelog!

See this http://keepachangelog.com link for information on how we want this documented formatted.

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

- Assistant init updates configs after find by name or id.

## v1.0.0

### Added

- Initial Release
