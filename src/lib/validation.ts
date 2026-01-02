/**
 * Input Validation Utilities
 * Provides common validation functions for forms and user input
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

// URL validation
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Password strength validation
export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// File validation
export const validateFile = (
    file: File,
    options: {
        maxSize?: number; // in bytes
        allowedTypes?: string[];
    } = {}
): { isValid: boolean; error?: string } => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // Default 5MB

    if (maxSize && file.size > maxSize) {
        return {
            isValid: false,
            error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
        };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type must be one of: ${allowedTypes.join(', ')}`
        };
    }

    return { isValid: true };
};

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

// Validate username
export const validateUsername = (username: string): {
    isValid: boolean;
    error?: string;
} => {
    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 20) {
        return { isValid: false, error: 'Username must be less than 20 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return {
            isValid: false,
            error: 'Username can only contain letters, numbers, hyphens, and underscores'
        };
    }

    return { isValid: true };
};

// Validate required fields
export const validateRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

// Validate array of values
export const validateAll = (
    validators: Array<() => boolean>
): boolean => {
    return validators.every(validator => validator());
};

// Character limit validation
export const validateLength = (
    value: string,
    min: number = 0,
    max: number = Infinity
): { isValid: boolean; error?: string } => {
    const length = value.trim().length;

    if (length < min) {
        return { isValid: false, error: `Must be at least ${min} characters` };
    }

    if (length > max) {
        return { isValid: false, error: `Must be no more than ${max} characters` };
    }

    return { isValid: true };
};
