/**
 * Generates a DiceBear avatar URL based on a seed (e.g., email, username, or ID).
 * This provides a single source of truth for avatar generation across the application.
 * 
 * @param {string} seed - The seed string to generate the avatar from (e.g. email, name)
 * @param {string} style - The DiceBear style to use (default: 'avataaars')
 * @returns {string} The complete avatar URL
 */
export const getAvatarUrl = (seed, style = 'avataaars') => {
    // Use a fallback if no seed is provided
    const safeSeed = seed ? encodeURIComponent(seed) : 'default';

    // You can easily change the default style or API version here globally
    // Examples of other styles: 'bottts', 'initials', 'micah', 'notionists'
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}`;
};
