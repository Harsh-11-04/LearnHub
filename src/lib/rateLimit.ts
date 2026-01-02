/**
 * Rate Limiting Utility
 * Simple client-side rate limiting to prevent API abuse
 */

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RequestRecord {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private limits: Map<string, RequestRecord> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
    }

    /**
     * Check if request is allowed
     * @param key Unique identifier for the request (e.g., user ID, IP, endpoint)
     * @returns true if allowed, false if rate limit exceeded
     */
    public checkLimit(key: string): boolean {
        const now = Date.now();
        const record = this.limits.get(key);

        // No previous requests or window expired
        if (!record || now > record.resetTime) {
            this.limits.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs
            });
            return true;
        }

        // Within window, check count
        if (record.count < this.config.maxRequests) {
            record.count++;
            return true;
        }

        // Rate limit exceeded
        return false;
    }

    /**
     * Get remaining requests for a key
     */
    public getRemaining(key: string): number {
        const record = this.limits.get(key);
        if (!record || Date.now() > record.resetTime) {
            return this.config.maxRequests;
        }
        return Math.max(0, this.config.maxRequests - record.count);
    }

    /**
     * Get reset time for a key
     */
    public getResetTime(key: string): number | null {
        const record = this.limits.get(key);
        if (!record || Date.now() > record.resetTime) {
            return null;
        }
        return record.resetTime;
    }

    /**
     * Reset rate limit for a key
     */
    public reset(key: string): void {
        this.limits.delete(key);
    }

    /**
     * Clear all rate limits
     */
    public clearAll(): void {
        this.limits.clear();
    }
}

// Pre-configured rate limiters
export const apiRateLimiter = new RateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000 // 100 requests per minute
});

export const authRateLimiter = new RateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000 // 5 attempts per 15 minutes
});

export const searchRateLimiter = new RateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000 // 30 searches per minute
});

export const uploadRateLimiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 1000 // 10 uploads per minute
});

/**
 * Decorator function to add rate limiting to async functions
 */
export function rateLimit(limiter: RateLimiter, key: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            if (!limiter.checkLimit(key)) {
                const resetTime = limiter.getResetTime(key);
                const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 0;
                throw new Error(
                    `Rate limit exceeded. Please try again in ${waitTime} seconds.`
                );
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

export default RateLimiter;
