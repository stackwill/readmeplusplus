# readmeplusplus export fixture

This fixture keeps export verification stable and independent from mutable product copy.

> A styled blockquote verifies that nested block content stays document-shaped.

## Coverage

- Heading rendering
- Paragraph rendering
- List rendering
- Inline `code`
- **Strong**, *emphasis*, and ~~deleted text~~
- [x] Completed task
- [ ] Open task

| Surface | Expected |
| --- | --- |
| Preview | Shared renderer |
| Export | Matching output |

## Command

```bash
bun run export scripts/fixtures/export-smoke.md export
```

<details>
  <summary>Raw HTML coverage</summary>
  <p>Keyboard input such as <kbd>Enter</kbd> remains styled.</p>
</details>
