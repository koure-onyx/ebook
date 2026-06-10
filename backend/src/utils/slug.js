import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { Topic } from '../models/Topic.js';

/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text) => {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '') // Remove special characters
    .replace(/[\\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug by checking for existing slugs and appending numbers if needed
 */
export const generateUniqueSlug = async (title, modelType, additionalFilters = {}) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  let Model;
  switch (modelType) {
    case 'Book':
      Model = Book;
      break;
    case 'Chapter':
      Model = Chapter;
      break;
    case 'Topic':
      Model = Topic;
      break;
    default:
      throw new Error(`Unknown model type: ${modelType}`);
  }

  // Keep incrementing until we find a unique slug
  while (true) {
    const query = { slug, ...additionalFilters };
    const existing = await Model.findOne(query);

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit to prevent infinite loops
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug) => {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

/**
 * Generates an explicit DeepSeek V2 compliant Quran slug
 * @param {number} surah 
 * @param {number} ayahStart 
 * @param {number|null} ayahEnd 
 */
export const generateQuranSlug = (surah, ayahStart, ayahEnd = null) => {
  return ayahEnd 
    ? `surah-${surah}-ayah-${ayahStart}-${ayahEnd}`
    : `surah-${surah}-ayah-${ayahStart}`;
};

export default { generateSlug, generateUniqueSlug, isValidSlug, generateQuranSlug };
