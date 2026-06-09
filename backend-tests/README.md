# Backend Integration Test Suite

Complete test suite for the StudyVault Express backend, covering all major domains.

## Test Files

| File | Domain | Coverage |
|------|--------|----------|
| `auth.test.js` | Authentication | Signup, login, OTP, password reset, Google OAuth, logout, onboarding, JWT middleware |
| `books.test.js` | Books | CRUD, edition control, filtering, pagination, search |
| `topics.test.js` | Topics | Content blocks, version diffs, navigation, Quran validation |
| `quizzes.test.js` | Quizzes | Creation, attempts, scoring, history, statistics |
| `vault.test.js` | Vault | Save/load items, review tracking, spaced repetition |
| `progress.test.js` | Progress | Mastery calculation, XP, streaks, completion tracking |
| `ai.test.js` | AI | Explanations, flashcards, quiz generation, multi-provider, streaming |
| `search.test.js` | Search | Full-text search, filters, Quran search, relevance ranking |
| `ingestion.test.js` | Ingestion | Book pipeline, version control, diff detection, logging |

## Running Tests

### Prerequisites
- Node.js v20+

### Run All Tests
```bash
node --test /mnt/oss/qwen-workspace/audit-output/backend-tests/*.test.js
```

### Run Specific Test File
```bash
node --test /mnt/oss/qwen-workspace/audit-output/backend-tests/auth.test.js
```

### Run with Watch Mode (Node 21+)
```bash
node --test --watch /mnt/oss/qwen-workspace/audit-output/backend-tests/*.test.js
```

### Run with Coverage Report
```bash
node --test --experimental-test-coverage /mnt/oss/qwen-workspace/audit-output/backend-tests/*.test.js
```

## Test Structure

Each test file follows this pattern:
- **Happy path**: Normal successful operations
- **Edge cases**: Boundary conditions, empty data, etc.
- **Auth guards**: 401 responses for unauthenticated requests
- **Validation errors**: 400 responses for invalid input
- **Not found**: 404 responses for missing resources

## Mocking

Tests use mock objects for:
- Mongoose models (`findOne`, `find`, `create`)
- JWT operations (`sign`, `verify`)
- External services (AI providers, email)

## Adding New Tests

1. Create a new `.test.js` file in this directory
2. Use `describe()` for test suites
3. Use `it()` for individual tests
4. Use `assert` for assertions

Example:
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('My Module', () => {
  it('should do something', async () => {
    const result = await myFunction();
    assert.ok(result, 'Result should exist');
  });
});
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
test:
  script:
    - node --test audit-output/backend-tests/*.test.js
```

## Notes

- Tests are designed to run without a database (use mocks)
- For integration tests with real DB, set up test database connection
- All tests should complete in under 5 seconds each
