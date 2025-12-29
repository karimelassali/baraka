 // Test script for phone-utils.js
// Run with: node lib/test-phone-utils.js

import { getPhoneVariants } from './phone-utils.js';

const testCases = [
    // Case 1: User's Italian number stored as +393534670058
    { input: '+393534670058', expected: ['+393534670058', '+3534670058'], description: 'Italian number with 353 prefix' },

    // Case 2: User selects Italy (+39) and types 3534670058 -> Component sends +393534670058
    { input: '+393534670058', expected: ['+3534670058'], description: 'Italian 353 -> should also try Irish +353' },

    // Case 3: User selects Ireland (+353) and types 4670058 -> Component sends +3534670058
    { input: '+3534670058', expected: ['+393534670058'], description: 'Irish +353 -> should also try Italian +39353' },

    // Case 4: User types raw number without +
    { input: '3534670058', expected: ['+3534670058', '+393534670058'], description: 'Raw number -> should try both +353 and +39353' },

    // Case 5: Standard Italian mobile
    { input: '+393331234567', expected: ['+393331234567'], description: 'Standard Italian mobile' },
];

console.log('Testing getPhoneVariants...\n');

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input}`);

    const variants = getPhoneVariants(testCase.input);
    console.log(`  Generated Variants: ${variants.join(', ')}`);

    const allExpectedFound = testCase.expected.every(exp => variants.includes(exp));
    console.log(`  Expected: ${testCase.expected.join(', ')}`);
    console.log(`  Result: ${allExpectedFound ? '✅ PASS' : '❌ FAIL (missing some expected variants)'}`);
    console.log('');
});

console.log('Done.');
