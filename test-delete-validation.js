// Test script to validate password-protected delete functionality
import assert from 'assert';

async function testDeleteWithPassword() {
  console.log('🔧 Testing password-protected delete functionality');
  
  // Login first
  const loginResponse = await fetch('http://localhost:3000/admin/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: '1', password: '1' })
  });
  
  const loginData = await loginResponse.json();
  assert(loginData.success === true, 'Login failed');
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('✅ Login successful');
  
  // Test verify password endpoint
  const verifyResponse = await fetch('http://localhost:3000/admin/api/admin/verify-password', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({ password: '1' })
  });
  
  const verifyData = await verifyResponse.json();
  console.log('Verify response:', verifyData);
  assert(verifyData.valid === true, 'Password verification should return valid:true');
  console.log('✅ Password verification endpoint works correctly');
  
  // Test with wrong password
  const wrongPassResponse = await fetch('http://localhost:3000/admin/api/admin/verify-password', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({ password: 'wrong' })
  });
  
  const wrongPassData = await wrongPassResponse.json();
  console.log('Wrong password response:', wrongPassData);
  assert(wrongPassData.valid === false, 'Wrong password should return valid:false');
  console.log('✅ Wrong password correctly rejected');
  
  console.log('✨ All password verification tests passed!');
}

testDeleteWithPassword().catch(console.error);