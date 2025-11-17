// Quick Test Script for Admin Components
// Run this in browser console when on admin pages

// Test 1: Check if components are mounted
console.log('=== COMPONENT MOUNT TEST ===');
console.log('Current URL:', window.location.href);
console.log('Root element:', document.getElementById('root'));

// Test 2: Check for React
console.log('=== REACT TEST ===');
console.log('React available:', typeof React !== 'undefined' ? 'Yes' : 'No');

// Test 3: Test API endpoint directly
console.log('=== API TEST ===');

async function testTestimonialsAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/testimonials');
    const data = await response.json();
    console.log('Testimonials API Response:', data);
    return data;
  } catch (error) {
    console.error('Testimonials API Error:', error);
    return null;
  }
}

async function testEnquiriesAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/enquiries');
    const data = await response.json();
    console.log('Enquiries API Response:', data);
    return data;
  } catch (error) {
    console.error('Enquiries API Error:', error);
    return null;
  }
}

// Run tests
console.log('Running API tests...');
testTestimonialsAPI();
testEnquiriesAPI();

// Test 4: Check for errors in console
console.log('=== ERROR CHECK ===');
console.log('Check above for any red errors');

// Test 5: Network check
console.log('=== NETWORK CHECK ===');
console.log('Open Network tab (F12 > Network) and refresh page');
console.log('Look for:');
console.log('- testimonials request status');
console.log('- enquiries request status');
console.log('- Any failed requests (red)');

console.log('\n=== SUMMARY ===');
console.log('1. If API tests return data: Backend is working');
console.log('2. If API tests fail: Check if backend is running on port 5000');
console.log('3. If components not visible: Check React errors above');
console.log('4. If loading forever: Check Network tab for pending requests');
