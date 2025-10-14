const crypto = require('crypto');

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'wow-campus-salt');
    const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
    const password = 'lee2548121!';
    const correctHash = await hashPassword(password);
    console.log('Password:', password);
    console.log('Correct Hash with salt:', correctHash);
}

main().catch(console.error);
