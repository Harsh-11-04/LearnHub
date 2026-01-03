/**
 * Enhanced File Validation Utilities
 * Provides strict file type checking and security validation
 */

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

// File type configurations with specific MIME types and size limits
export const FILE_CONFIGS = {
    // Documents
    pdf: {
        mimeTypes: ['application/pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        extensions: ['.pdf']
    },
    word: {
        mimeTypes: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        maxSize: 10 * 1024 * 1024, // 10MB
        extensions: ['.doc', '.docx']
    },
    powerpoint: {
        mimeTypes: [
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        maxSize: 20 * 1024 * 1024, // 20MB
        extensions: ['.ppt', '.pptx']
    },
    // Images
    images: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    // Archives
    archives: {
        mimeTypes: [
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed'
        ],
        maxSize: 50 * 1024 * 1024, // 50MB
        extensions: ['.zip', '.rar']
    },
    // Text
    text: {
        mimeTypes: ['text/plain'],
        maxSize: 1 * 1024 * 1024, // 1MB
        extensions: ['.txt']
    }
};

// Combined allowed MIME types
export const ALLOWED_MIME_TYPES = Object.values(FILE_CONFIGS)
    .flatMap(config => config.mimeTypes);

// Combined allowed extensions
export const ALLOWED_EXTENSIONS = Object.values(FILE_CONFIGS)
    .flatMap(config => config.extensions);

/**
 * Validate file type and size with detailed error messages
 */
export const validateFile = (file: File): FileValidationResult => {
    // Check if file exists
    if (!file) {
        return { isValid: false, error: 'No file provided' };
    }

    // Get file extension
    const extension = ('.' + file.name.split('.').pop()?.toLowerCase()) || '';

    // Check if extension is allowed
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            isValid: false,
            error: `File type "${extension}" is not allowed. Allowed types: PDF, Word, PowerPoint, Images, ZIP`
        };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: `Invalid file format. Expected ${extension} file but got ${file.type || 'unknown type'}`
        };
    }

    // Find matching config for size check
    const matchingConfig = Object.values(FILE_CONFIGS).find(config =>
        config.mimeTypes.includes(file.type) || config.extensions.includes(extension)
    );

    if (matchingConfig && file.size > matchingConfig.maxSize) {
        const maxSizeMB = Math.round(matchingConfig.maxSize / 1024 / 1024);
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        return {
            isValid: false,
            error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB for this file type`
        };
    }

    return { isValid: true };
};

/**
 * Get human-readable file size string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type category
 */
export const getFileCategory = (file: File): string => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.includes('pdf')) return 'PDF Document';
    if (file.type.includes('word') || file.type.includes('document')) return 'Word Document';
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'Presentation';
    if (file.type.includes('zip') || file.type.includes('rar')) return 'Archive';
    if (file.type === 'text/plain') return 'Text File';
    return 'Document';
};
