#!/usr/bin/env node

/**
 * Simple TickTrax Application Test
 * Tests basic functionality without browser automation
 */

import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log('✅ Server is running on http://localhost:3000');
      return true;
    } else {
      console.log('❌ Server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running:', error.message);
    return false;
  }
}

async function testEndpoints() {
  const endpoints = [
    { name: 'Home Page', url: BASE_URL },
    { name: 'Dashboard', url: `${BASE_URL}/dashboard` },
    { name: 'Login', url: `${BASE_URL}/login` }
  ];
  
  console.log('\n🔍 Testing endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: ${response.status}`);
      } else {
        console.log(`⚠️  ${endpoint.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

async function testBuildFiles() {
  console.log('\n🔍 Checking build files...');
  
  const buildFiles = [
    'www/index.html',
    'www/assets/index-EeZ-DjAY.js',
    'www/assets/index-B2we62gc.css'
  ];
  
  for (const file of buildFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
}

async function testUserRoles() {
  console.log('\n🔍 Testing user role configurations...');
  
  // Test if all role configurations exist
  const roleFiles = [
    'src/components/dashboards/EmployeeDashboard.vue',
    'src/components/dashboards/ManagerDashboard.vue', 
    'src/components/dashboards/HRDashboard.vue',
    'src/components/dashboards/AdminDashboard.vue'
  ];
  
  for (const file of roleFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
  
  // Test if mobile components are excluded
  const mobileFiles = [
    'src/components/mobile/Analytics.vue',
    'mobile/',
    'www/',
    'build/'
  ];
  
  console.log('\n🔍 Checking mobile components are excluded...');
  for (const file of mobileFiles) {
    if (!fs.existsSync(file)) {
      console.log(`✅ ${file} properly excluded`);
    } else {
      console.log(`⚠️  ${file} still exists (should be excluded)`);
    }
  }
}

async function testAPIs() {
  console.log('\n🔍 Testing API configuration...');
  
  const apiFiles = [
    'src/config/api.js',
    'src/services/apiService.js',
    'src/services/authService.js',
    'src/services/mockApiService.js'
  ];
  
  for (const file of apiFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
      
      // Check for console.log statements
      const content = fs.readFileSync(file, 'utf8');
      const consoleLogs = (content.match(/console\.log/g) || []).length;
      if (consoleLogs === 0) {
        console.log(`  ✅ No console.log statements found`);
      } else {
        console.log(`  ⚠️  ${consoleLogs} console.log statements found`);
      }
    } else {
      console.log(`❌ ${file} missing`);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting TickTrax Application Tests...\n');
  
  // Test server
  const serverRunning = await testServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server first.');
    console.log('   Run: npm run dev');
    return;
  }
  
  // Test endpoints
  await testEndpoints();
  
  // Test build files
  await testBuildFiles();
  
  // Test user roles
  await testUserRoles();
  
  // Test APIs
  await testAPIs();
  
  console.log('\n🎉 Basic tests completed!');
  console.log('\n📝 Manual Testing Instructions:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Test login with different user roles:');
  console.log('   - Employee: employee@example.com');
  console.log('   - Manager: manager@example.com'); 
  console.log('   - HR: tehr@example.com');
  console.log('   - Admin: admin@example.com');
  console.log('3. Verify role-specific dashboards and navigation');
  console.log('4. Test all major features for each role');
}

// Run tests
runTests().catch(console.error);
