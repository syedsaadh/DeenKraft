// lib/api.ts
export async function login() {
  const res = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
  });

  return res.json();
}
