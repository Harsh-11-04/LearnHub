# Testing Guide

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

Tests are located next to the files they test with a `.test.ts` or `.test.tsx` extension.

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFile';

describe('MyFunction', () => {
    it('should do something', () => {
        expect(myFunction()).toBe(expected);
    });
});
```

### Testing React Components

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
    it('renders correctly', () => {
        render(<MyComponent />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });
});
```

## Coverage Goals

- Aim for 80%+ code coverage
- Focus on critical business logic
- Test error handling paths
- Test edge cases

## Best Practices

1. **Keep tests focused** - One assertion per test when possible
2. **Use descriptive names** - Test names should explain what they test
3. **Avoid testing implementation details** - Test behavior, not internals
4. **Mock external dependencies** - Database, API calls, etc.
5. **Keep tests fast** - Use mocks to avoid slow operations
