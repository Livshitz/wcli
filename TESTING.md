# Testing Guide

## Overview

WCLI includes a comprehensive test suite using **Vitest** with 97 tests covering all major components.

## Test Coverage

### ✅ Path Utilities (17 tests)
- Path normalization
- Absolute and relative path resolution
- Directory name and basename extraction
- Path joining and relative path computation

### ✅ Stream I/O (11 tests)
- String input/output streams
- Pipe streams for command piping
- Empty stream handling
- Stream closing and error handling

### ✅ Command Parser (21 tests)
- Basic command parsing
- Argument and flag parsing (including `--flag=value`)
- Pipe operators (`|`, `&&`, `||`, `;`)
- Redirection operators (`>`, `>>`, `<`)
- Quote handling (single and double quotes)
- Glob pattern matching and expansion

### ✅ Virtual Filesystem (17 tests)
- Directory creation and listing
- File creation, reading, and writing
- File and directory deletion
- Path resolution (absolute, relative, `.`, `..`)
- Metadata (timestamps, permissions, size)
- Type checking (file vs directory)

### ✅ Command Executor (13 tests)
- Command registration and retrieval
- Simple command execution
- Command piping
- Operator handling (`&&`, `||`)
- File redirection (`>`, `>>`)
- Environment variable management
- Error handling

### ✅ Built-in Commands (18 tests)
- `ls` - Directory listing
- `cd` - Directory navigation
- `pwd` - Working directory
- `cat` - File reading (with stdin support)
- `echo` - Text output
- `grep` - Pattern searching (files and stdin)
- `mkdir` - Directory creation
- `touch` - File creation

## Running Tests

### Watch Mode (Development)
```bash
bun run test
```
Runs tests in watch mode - automatically reruns tests when files change.

### Single Run
```bash
bun run test:run
```
Runs all tests once and exits - perfect for CI/CD.

### Interactive UI
```bash
bun run test:ui
```
Opens a beautiful web UI to explore tests, see coverage, and debug failures.

### Coverage Report
```bash
bun run test:coverage
```
Generates a full code coverage report with HTML visualization.

## Test Structure

```
src/
├── utils/
│   ├── PathResolver.test.ts
│   └── Stream.test.ts
├── core/
│   ├── CommandParser.test.ts
│   ├── Filesystem.test.ts
│   └── CommandExecutor.test.ts
└── commands/
    └── commands.test.ts
```

## Test Results Summary

```
✓ Path Utilities     17/17 tests passing
✓ Stream I/O         11/11 tests passing  
✓ Command Parser     21/21 tests passing
✓ Virtual Filesystem 17/17 tests passing
✓ Command Executor   13/13 tests passing
✓ Built-in Commands  18/18 tests passing

Total: 97/97 tests passing ✅
```

## Notes

### IndexedDB Warnings
You may see warnings about `indexedDB is not defined` in test output. This is **expected** and **not an error**. The test environment (happy-dom) doesn't provide IndexedDB, but the filesystem gracefully handles this by catching the error and continuing without persistence.

The tests validate the core filesystem operations work correctly - persistence is tested indirectly through the API.

### Test Environment
- **Framework**: Vitest
- **DOM Environment**: happy-dom
- **Coverage Provider**: v8
- **Test Globals**: Enabled (no imports needed for `describe`, `it`, `expect`)

## Writing New Tests

Tests use Vitest's Jest-compatible API:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    expect(actual).toBe(expected);
  });

  it('should handle async operations', async () => {
    const result = await someAsyncFunction();
    expect(result).toBeDefined();
  });
});
```

## CI/CD Integration

For continuous integration, use:

```bash
bun run test:run
```

This runs all tests once and returns appropriate exit codes:
- `0` - All tests passed
- `1` - Some tests failed

## Performance

The full test suite runs in approximately **4 seconds**:
- Transform: ~500ms
- Collection: ~1.3s
- Execution: ~475ms
- Environment: ~11.6s (one-time setup)

## Best Practices

1. **Keep tests isolated** - Use `beforeEach` to create fresh instances
2. **Test behavior, not implementation** - Focus on public APIs
3. **Use descriptive test names** - Make failures easy to understand
4. **Mock external dependencies** - Keep tests fast and reliable
5. **Test edge cases** - Empty inputs, errors, boundaries

## Future Test Improvements

Potential additions for even better coverage:
- Integration tests for full command workflows
- Performance benchmarks
- Visual regression tests for the UI
- E2E tests with real browser automation
- Snapshot testing for output formatting

---

**Questions?** Check the test files for examples or run `bun run test:ui` to explore tests interactively!

