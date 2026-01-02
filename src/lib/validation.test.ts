import { describe, it, expect } from 'vitest';
import { isValidEmail, validatePassword, validateFile, validateUsername } from './validation';

describe('Validation Utilities', () => {
    describe('isValidEmail', () => {
        it('should validate correct email addresses', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate strong passwords', () => {
            const result = validatePassword('StrongP@ss123');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject weak passwords', () => {
            const result = validatePassword('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('validateUsername', () => {
        it('should validate correct usernames', () => {
            expect(validateUsername('john_doe').isValid).toBe(true);
            expect(validateUsername('user123').isValid).toBe(true);
        });

        it('should reject invalid usernames', () => {
            expect(validateUsername('ab').isValid).toBe(false); // too short
            expect(validateUsername('user name').isValid).toBe(false); // has space
        });
    });

    describe('validateFile', () => {
        it('should validate file size', () => {
            const smallFile = new File(['content'], 'test.txt', { type: 'text/plain' });
            const result = validateFile(smallFile, { maxSize: 1024 });
            expect(result.isValid).toBe(true);
        });

        it('should reject oversized files', () => {
            const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
            const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
            const result = validateFile(largeFile, { maxSize: 5 * 1024 * 1024 });
            expect(result.isValid).toBe(false);
        });
    });
});
