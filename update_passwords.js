// Update password hashes for existing users
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'wow-campus-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const passwords = {
  'admin@wowcampus.com': 'password123',
  'hr@samsung.com': 'company123',
  'recruit@naver.com': 'company123',
  'jobs@kakao.com': 'company123',
  'john.doe@email.com': 'jobseeker123',
  'maria.garcia@email.com': 'jobseeker123',
  'tanaka.hiroshi@email.com': 'jobseeker123',
  'agent@globalrecruiters.com': 'agent123',
  'contact@asiabridge.com': 'agent123'
};

async function updatePasswords() {
  for (const [email, password] of Object.entries(passwords)) {
    const hash = await hashPassword(password);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${email}';`);
  }
}

updatePasswords();