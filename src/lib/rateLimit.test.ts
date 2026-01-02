import { describe, it, expect, beforeEach } from 'vitest';
import RateLimiter from './rateLimit';

describe('RateLimiter', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
        limiter = new RateLimiter({
            maxRequests: 3,
            windowMs: 1000 // 1 second window
        });
    });

    it('should allow requests within limit', () => {
        expect(limiter.checkLimit('user1')).toBe(true);
        expect(limiter.checkLimit('user1')).toBe(true);
        expect(limiter.checkLimit('user1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
        limiter.checkLimit('user1');
        limiter.checkLimit('user1');
        limiter.checkLimit('user1');
        expect(limiter.checkLimit('user1')).toBe(false);
    });

    it('should track different keys separately', () => {
        expect(limiter.checkLimit('user1')).toBe(true);
        expect(limiter.checkLimit('user2')).toBe(true);
        expect(limiter.getRemaining('user1')).toBe(2);
        expect(limiter.getRemaining('user2')).toBe(2);
    });

    it('should reset after window expires', async () => {
        limiter.checkLimit('user1');
        limiter.checkLimit('user1');
        limiter.checkLimit('user1');
        expect(limiter.checkLimit('user1')).toBe(false);

        // Wait for window to expire
        await new Promise(resolve => setTimeout(resolve, 1100));

        expect(limiter.checkLimit('user1')).toBe(true);
    });

    it('should correctly report remaining requests', () => {
        expect(limiter.getRemaining('user1')).toBe(3);
        limiter.checkLimit('user1');
        expect(limiter.getRemaining('user1')).toBe(2);
        limiter.checkLimit('user1');
        expect(limiter.getRemaining('user1')).toBe(1);
    });

    it('should reset specific key', () => {
        limiter.checkLimit('user1');
        limiter.checkLimit('user1');
        expect(limiter.getRemaining('user1')).toBe(1);

        limiter.reset('user1');
        expect(limiter.getRemaining('user1')).toBe(3);
    });
});
