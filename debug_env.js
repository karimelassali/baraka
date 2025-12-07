require('dotenv').config();

console.log('Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL is set (starts with):', process.env.DATABASE_URL.substring(0, 15));
} else {
    console.log('DATABASE_URL is NOT set');
}

if (process.env.POSTGRES_URL) {
    console.log('POSTGRES_URL is set (starts with):', process.env.POSTGRES_URL.substring(0, 15));
} else {
    console.log('POSTGRES_URL is NOT set');
}
