/**
 * Utilitário para sanitização de texto preservando quebras de linha
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    // Normalizar quebras de linha para \n
    let sanitized = text
        .replace(/\r\n/g, '\n') // Windows line breaks
        .replace(/\r/g, '\n'); // Mac line breaks
    // Remover scripts maliciosos mas preservar quebras
    sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    // Preservar quebras de linha e espaços múltiplos
    sanitized = sanitized
        .replace(/\n\s*\n/g, '\n\n') // Normalizar múltiplas quebras
        .replace(/[ \t]+/g, ' ') // Normalizar espaços múltiplos
        .trim();
    return sanitized;
}
export function validateTextLength(text, maxLength) {
    if (!text)
        return true;
    // Contar caracteres incluindo quebras de linha
    const normalizedText = text.replace(/\r\n|\r|\n/g, '\n');
    return normalizedText.length <= maxLength;
}
export function getTextStats(text) {
    if (!text) {
        return { characters: 0, lines: 0, words: 0 };
    }
    const normalizedText = text.replace(/\r\n|\r|\n/g, '\n');
    const lines = normalizedText.split('\n');
    return {
        characters: normalizedText.length,
        lines: lines.length,
        words: normalizedText.split(/\s+/).filter(word => word.length > 0).length
    };
}
