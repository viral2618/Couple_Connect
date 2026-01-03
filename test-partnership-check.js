// Test Partnership Check API
let fetch;

async function loadFetch() {
  if (!fetch) {
    const module = await import('node-fetch');
    fetch = module.default;
  }
  return fetch;
}

async function testPartnershipCheck() {
  await loadFetch();
  console.log('🧪 Testing Partnership Check API...\n');

  // Test data - replace with actual user IDs from your database
  const testCases = [
    {
      name: 'Test 1: Valid Partnership Check',
      partnerId: 'REPLACE_WITH_ACTUAL_PARTNER_ID', // Replace this
      expectedResult: true
    },
    {
      name: 'Test 2: Invalid Partner ID',
      partnerId: 'invalid_id_123',
      expectedResult: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`Partner ID: ${testCase.partnerId}`);
    
    try {
      const response = await fetch(`http://localhost:3000/api/partnership/check?partnerId=${testCase.partnerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add session cookie if needed
          'Cookie': 'your-session-cookie-here'
        }
      });

      const result = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(result, null, 2));
      
      if (result.canChat !== undefined) {
        console.log(`✅ Can Chat: ${result.canChat}`);
        if (result.reason) {
          console.log(`❌ Reason: ${result.reason}`);
        }
      } else {
        console.log(`❌ Unexpected response format`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
}

// Manual test function you can call with specific IDs
async function testSpecificPartnership(currentUserId, partnerId) {
  await loadFetch();
  console.log(`\n🎯 Testing specific partnership:`);
  console.log(`Current User: ${currentUserId}`);
  console.log(`Partner: ${partnerId}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/partnership/check?partnerId=${partnerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log(`\n📊 Result:`, JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Partnership Check Tests...\n');
  
  // Uncomment to run general tests
  // testPartnershipCheck();
  
  // Or test with specific IDs (replace with actual IDs)
  // testSpecificPartnership('your_user_id', 'partner_user_id');
  
  console.log('\n📝 Instructions:');
  console.log('1. Replace REPLACE_WITH_ACTUAL_PARTNER_ID with real user ID');
  console.log('2. Add session cookie if authentication is required');
  console.log('3. Run: node test-partnership-check.js');
  console.log('4. Check console output for results');
}

module.exports = { testPartnershipCheck, testSpecificPartnership };