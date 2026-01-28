const crypto = require('crypto');

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
    const password = 'lee2548121!';
    const hash = await hashPassword(password);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // 저장된 해시와 비교
    const storedHash = '7c505969b3d534c213b2f5d1a14db640ec943e8a90c484bdb676841460b032f2';
    console.log('Stored Hash:', storedHash);
    console.log('Match:', hash === storedHash);
}

main().catch(console.error);
