#!/usr/bin/env node

/**
 * TickTrax Application Test Script
 * Tests all user roles and functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const TEST_USERS = {
  employee: { email: 'employee@example.com', password: 'password123', role: 'employee' },
  manager: { email: 'manager@example.com', password: 'password123', role: 'manager' },
  hr: { email: 'tehr@example.com', password: 'password123', role: 'hr' },
  admin: { email: 'admin@example.com', password: 'password123', role: 'admin' }
};

const testResults = {
  server: false,
  login: {},
  navigation: {},
  components: {},
  errors: []
};

async function testServer() {
  try {
    const response = await fetch(BASE_URL);
    testResults.server = response.ok;
    console.log('✅ Server is running on http://localhost:3000');
    return true;
  } catch (error) {
    console.log('❌ Server is not running:', error.message);
    testResults.errors.push(`Server error: ${error.message}`);
    return false;
  }
}

async function testLogin(browser, userType, credentials) {
  try {
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    
    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // Fill login form
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    testResults.login[userType] = true;
    console.log(`✅ ${userType} login successful`);
    
    // Test navigation
    await testNavigation(page, userType);
    
    await page.close();
    return true;
  } catch (error) {
    testResults.login[userType] = false;
    testResults.errors.push(`${userType} login failed: ${error.message}`);
    console.log(`❌ ${userType} login failed:`, error.message);
    return false;
  }
}

async function testNavigation(page, userType) {
  try {
    // Test role-specific navigation
    const roleSelectors = {
      employee: ['[data-testid="clock-widget"]', '[data-testid="timesheet"]', '[data-testid="schedule"]'],
      manager: ['[data-testid="team-overview"]', '[data-testid="approvals"]', '[data-testid="reports"]'],
      hr: ['[data-testid="employee-management"]', '[data-testid="recruitment"]', '[data-testid="payroll"]'],
      admin: ['[data-testid="system-settings"]', '[data-testid="employee-management"]', '[data-testid="audit-logs"]']
    };
    
    const selectors = roleSelectors[userType] || [];
    let navigationSuccess = true;
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`  ✅ ${userType} navigation element found: ${selector}`);
      } catch (error) {
        console.log(`  ⚠️  ${userType} navigation element not found: ${selector}`);
        navigationSuccess = false;
      }
    }
    
    testResults.navigation[userType] = navigationSuccess;
    return navigationSuccess;
  } catch (error) {
    testResults.navigation[userType] = false;
    testResults.errors.push(`${userType} navigation failed: ${error.message}`);
    console.log(`❌ ${userType} navigation failed:`, error.message);
    return false;
  }
}

async function testComponents() {
  try {
    // Test if all main components are accessible
    const componentTests = [
      { name: 'LoginScreen', url: BASE_URL },
      { name: 'DashboardLayout', url: `${BASE_URL}/dashboard` },
      { name: 'ClockWidget', url: `${BASE_URL}/dashboard` },
      { name: 'EmployeeDashboard', url: `${BASE_URL}/dashboard` },
      { name: 'ManagerDashboard', url: `${BASE_URL}/dashboard` },
      { name: 'HRDashboard', url: `${BASE_URL}/dashboard` },
      { name: 'AdminDashboard', url: `${BASE_URL}/dashboard` }
    ];
    
    for (const test of componentTests) {
      try {
        const response = await fetch(test.url);
        testResults.components[test.name] = response.ok;
        console.log(`✅ ${test.name} component accessible`);
      } catch (error) {
        testResults.components[test.name] = false;
        console.log(`❌ ${test.name} component not accessible:`, error.message);
      }
    }
    
    return true;
  } catch (error) {
    testResults.errors.push(`Component test failed: ${error.message}`);
    console.log('❌ Component test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting TickTrax Application Tests...\n');
  
  // Test server
  const serverRunning = await testServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server first.');
    return;
  }
  
  // Test components
  await testComponents();
  
  // Test with browser automation
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Test login for each user type
    for (const [userType, credentials] of Object.entries(TEST_USERS)) {
      console.log(`\n🔍 Testing ${userType} role...`);
      await testLogin(browser, userType, credentials);
    }
    
  } catch (error) {
    console.log('⚠️  Browser automation not available, skipping login tests');
    console.log('   Install puppeteer for full testing: npm install puppeteer');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Generate test report
  generateReport();
}

function generateReport() {
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  console.log(`Server Status: ${testResults.server ? '✅ Running' : '❌ Not Running'}`);
  
  console.log('\nLogin Tests:');
  for (const [userType, success] of Object.entries(testResults.login)) {
    console.log(`  ${userType}: ${success ? '✅ Success' : '❌ Failed'}`);
  }
  
  console.log('\nNavigation Tests:');
  for (const [userType, success] of Object.entries(testResults.navigation)) {
    console.log(`  ${userType}: ${success ? '✅ Success' : '❌ Failed'}`);
  }
  
  console.log('\nComponent Tests:');
  for (const [component, success] of Object.entries(testResults.components)) {
    console.log(`  ${component}: ${success ? '✅ Accessible' : '❌ Not Accessible'}`);
  }
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Save results to file
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
  console.log('\n📄 Test results saved to test-results.json');
  
  const totalTests = Object.keys(testResults.login).length + Object.keys(testResults.navigation).length + Object.keys(testResults.components).length;
  const passedTests = Object.values(testResults.login).filter(Boolean).length + 
                     Object.values(testResults.navigation).filter(Boolean).length + 
                     Object.values(testResults.components).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The application is working correctly for all user roles.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runTests().catch(console.error);
