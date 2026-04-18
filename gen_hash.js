import bcrypt from 'bcrypt';

const hash1 = await bcrypt.hash('password123', 10);
const hash2 = await bcrypt.hash('admin2024', 10);

const v1 = await bcrypt.compare('password123', hash1);
const v2 = await bcrypt.compare('admin2024', hash2);

console.log('HASH_PASSWORD123=' + hash1);
console.log('VERIFY_PASSWORD123=' + v1);
console.log('HASH_ADMIN2024=' + hash2);
console.log('VERIFY_ADMIN2024=' + v2);
