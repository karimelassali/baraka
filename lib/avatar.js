/**
 * Generates a Boring Avatar URL based on a seed (e.g., email, username, or ID).
 * This provides a single source of truth for avatar generation across the application.
 * 
 * @param {string} seed - The seed string to generate the avatar from (e.g. email, name)
 * @param {string} style - The Boring Avatar variant to use (default: 'beam')
 * @returns {string} The complete avatar URL
 */
export const getAvatarUrl = (seed, style = 'beam') => {
    // Use a fallback if no seed is provided
    const safeSeed = seed ? encodeURIComponent(seed) : 'default';

    // Boring Avatars service URL
    // Default variant is 'beam' as requested
    // Colors: Red (#FF0000), White (#FFFFFF), Black (#000000)
    const colors = 'FF0000,FFFFFF,000000';

    // Check if the provided style is a valid Boring Avatar variant, otherwise default to 'beam'
    const validVariants = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];
    const variant = validVariants.includes(style) ? style : 'beam';

    return `https://source.boringavatars.com/${variant}/120/${safeSeed}?colors=${colors}`;
};
