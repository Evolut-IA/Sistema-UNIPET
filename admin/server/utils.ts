import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

// Database connection (reusing the same setup as storage.ts)
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/unipet";
const sql = postgres(databaseUrl, { 
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(sql, { schema });

/**
 * Generates a URL-friendly slug from a given text
 * 
 * @param text - The input text to convert to slug
 * @returns A clean, URL-friendly slug
 * 
 * @example
 * generateSlug("ANIMAL'S PETS") // returns "animalspets"
 * generateSlug("Centro Veterinário São José") // returns "centro-veterinario-sao-jose"
 * generateSlug("Clínica & Pets - Unidade Norte!") // returns "clinica-pets-unidade-norte"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents)
    .replace(/^(\w+)['']s\s+(\w+)$/g, '$1s$2') // Handle specific possessive cases like "animal's pets" -> "animalspets" (only full match)
    .replace(/[''`]/g, '') // Remove remaining apostrophes and similar characters
    .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace one or more spaces with a single hyphen
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
}

/**
 * Validates if a slug meets the basic requirements
 * 
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) return false
  
  // Should only contain lowercase letters, numbers, and hyphens
  const validPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return validPattern.test(slug)
}

/**
 * Generates a unique slug by checking the database and adding numeric suffixes if needed
 * 
 * @param text - The input text to convert to slug
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns A unique URL-friendly slug
 * 
 * @example
 * // If "animalspets" already exists, returns "animalspets-2"
 * // If "animalspets-2" also exists, returns "animalspets-3", etc.
 * generateUniqueSlug("ANIMAL'S PETS") // returns "animalspets" or "animalspets-2"
 */
export async function generateUniqueSlug(text: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(text)
  
  if (!isValidSlug(baseSlug)) {
    throw new Error(`Invalid slug generated from text: "${text}"`)
  }
  
  let uniqueSlug = baseSlug
  let counter = 1
  
  while (true) {
    // Check if the slug already exists in the database
    let query = db.select({ id: schema.networkUnits.id })
      .from(schema.networkUnits)
      .where(eq(schema.networkUnits.urlSlug, uniqueSlug))
    
    const existingUnits = await query
    
    // If no existing units found, or the only existing unit is the one we're updating
    if (existingUnits.length === 0 || 
        (existingUnits.length === 1 && excludeId && existingUnits[0].id === excludeId)) {
      return uniqueSlug
    }
    
    // If slug exists, try the next numbered variation
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }
}

/**
 * Validates if a slug is unique in the database
 * 
 * @param slug - The slug to check for uniqueness
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns True if the slug is unique, false otherwise
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  if (!isValidSlug(slug)) {
    return false
  }
  
  let query = db.select({ id: schema.networkUnits.id })
    .from(schema.networkUnits)
    .where(eq(schema.networkUnits.urlSlug, slug))
  
  const existingUnits = await query
  
  // If no existing units found, or the only existing unit is the one we're updating
  return existingUnits.length === 0 || 
         (existingUnits.length === 1 && excludeId !== undefined && existingUnits[0].id === excludeId)
}

/**
 * Suggests available slug variations if the original is taken
 * 
 * @param text - The input text to generate variations for
 * @param limit - Maximum number of suggestions to return
 * @returns Array of available slug suggestions
 */
export async function suggestAvailableSlugs(text: string, limit: number = 5): Promise<string[]> {
  const baseSlug = generateSlug(text)
  const suggestions: string[] = []
  
  if (!isValidSlug(baseSlug)) {
    return suggestions
  }
  
  // Add the base slug if it's available
  if (await isSlugUnique(baseSlug)) {
    suggestions.push(baseSlug)
  }
  
  // Generate numbered variations
  let counter = 2
  while (suggestions.length < limit && counter <= limit + 10) {
    const candidateSlug = `${baseSlug}-${counter}`
    if (await isSlugUnique(candidateSlug)) {
      suggestions.push(candidateSlug)
    }
    counter++
  }
  
  return suggestions
}