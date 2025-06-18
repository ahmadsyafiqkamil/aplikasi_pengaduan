const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test users from database
const testUsers = [
  {
    username: 'admin1',
    password: 'adminpass',
    role: 'admin'
  },
  {
    username: 'super1', 
    password: 'superpass',
    role: 'supervisor'
  },
  {
    username: 'agent1',
    password: 'agentpass', 
    role: 'agent'
  },
  {
    username: 'manajer1',
    password: 'manpass',
    role: 'manajemen'
  }
];

async function testLogin() {
  console.log('🔐 Testing Login with Database Users\n');
  
  for (const user of testUsers) {
    try {
      console.log(`📝 Testing login for: ${user.username} (${user.role})`);
      
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username: user.username,
        password: user.password
      });
      
      if (response.data.success) {
        console.log('✅ Login SUCCESS');
        console.log(`   User: ${response.data.data.user.name}`);
        console.log(`   Role: ${response.data.data.user.role}`);
        console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
        
        // Test protected endpoint with token
        try {
          const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${response.data.data.token}`
            }
          });
          console.log('✅ Profile access SUCCESS');
        } catch (profileError) {
          console.log('❌ Profile access FAILED:', profileError.response?.data?.message || profileError.message);
        }
      } else {
        console.log('❌ Login FAILED:', response.data.message);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - Backend server not running');
        console.log('   Please start backend server with: npm run dev');
        break;
      } else {
        console.log('❌ Login FAILED:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('---');
  }
}

async function testHealthCheck() {
  try {
    console.log('🏥 Testing Health Check...');
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check SUCCESS:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check FAILED:', error.message);
    console.log('   Backend server is not running on port 3000');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Login Test...\n');
  
  // First check if server is running
  const isServerRunning = await testHealthCheck();
  
  if (!isServerRunning) {
    console.log('\n📋 To start backend server:');
    console.log('1. Make sure you have .env file with database config');
    console.log('2. Run: npm run dev');
    console.log('3. Then run this test again');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  await testLogin();
  
  console.log('\n🎉 Login test completed!');
}

main().catch(console.error); 