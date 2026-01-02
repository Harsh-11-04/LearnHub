# Rate Limiting Documentation

## Overview

Rate limiting prevents API abuse by restricting the number of requests a user can make within a specific time window.

## Usage

### Pre-configured Limiters

```typescript
import { apiRateLimiter, authRateLimiter, searchRateLimiter, uploadRateLimiter } from '@/lib/rateLimit';

// Check if request is allowed
if (!apiRateLimiter.checkLimit(userId)) {
    throw new Error('Rate limit exceeded');
}

// Make API call
await makeApiCall();
```

### Available Limiters

| Limiter | Max Requests | Window | Use Case |
|---------|-------------|---------|----------|
| `apiRateLimiter` | 100 | 1 minute | General API calls |
| `authRateLimiter` | 5 | 15 minutes | Login attempts |
| `searchRateLimiter` | 30 | 1 minute | Search queries |
| `uploadRateLimiter` | 10 | 1 minute | File uploads |

### Custom Rate Limiter

```typescript
import RateLimiter from '@/lib/rateLimit';

const customLimiter = new RateLimiter({
    maxRequests: 50,
    windowMs: 60 * 1000 // 50 requests per minute
});

// Use it
if (!customLimiter.checkLimit('unique-key')) {
    // Handle rate limit exceeded
}
```

### Example: Protecting Login

```typescript
import { authRateLimiter } from '@/lib/rateLimit';

async function handleLogin(email: string, password: string) {
    // Use email as rate limit key
    if (!authRateLimiter.checkLimit(email)) {
        const resetTime = authRateLimiter.getResetTime(email);
        const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 0;
        throw new Error(`Too many login attempts. Try again in ${waitTime} seconds.`);
    }

    // Proceed with login
    await login(email, password);
}
```

### Example: Protecting Search

```typescript
import { searchRateLimiter } from '@/lib/rateLimit';

async function performSearch(query: string, userId: string) {
    if (!searchRateLimiter.checkLimit(userId)) {
        throw new Error('Search rate limit exceeded. Please wait before searching again.');
    }

    return await searchAPI(query);
}
```

## Utility Methods

```typescript
// Get remaining requests
const remaining = limiter.getRemaining(key);

// Get reset time (timestamp)
const resetTime = limiter.getResetTime(key);

// Reset a specific key
limiter.reset(key);

// Clear all limits
limiter.clearAll();
```

## Server-Side Rate Limiting

For production, implement server-side rate limiting:

1. **Express.js**: Use `express-rate-limit`
2. **Nginx**: Use `limit_req` directive
3. **Cloudflare**: Use rate limiting rules
4. **Supabase**: Use PostgREST rate limiting

## Best Practices

1. **Use appropriate keys**: User ID, IP address, or API key
2. **Different limits for different operations**: Auth vs general API
3. **Inform users**: Show remaining requests in UI
4. **Implement retry logic**: With exponential backoff
5. **Server-side enforcement**: Client-side is just UX improvement
