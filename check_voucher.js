// Simple script to check voucher in database
// Run with: node check_voucher.js VOUCHER1764075871784194

const voucher_code = process.argv[2] || 'VOUCHER1764075871784194';

console.log('Checking voucher:', voucher_code);
console.log('Code length:', voucher_code.length);
console.log('Trimmed code:', voucher_code.trim());
console.log('Trimmed length:', voucher_code.trim().length);
console.log('\nNOTE: You need to manually check the database.');
console.log('\nRun this SQL query in Supabase:');
console.log(`SELECT code, length(code) as code_length, customer_id, value, is_active, is_used FROM vouchers WHERE code LIKE '%${voucher_code.trim()}%';`);
console.log('\nOr check exact match:');
console.log(`SELECT * FROM vouchers WHERE code = '${voucher_code.trim()}';`);
