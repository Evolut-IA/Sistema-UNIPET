import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple admin panel test
async function testAdminPanel() {
  console.log('Starting Admin Panel Test...\n');
  const results = {
    tests: [],
    screenshots: [],
    errors: []
  };
  
  // Ensure screenshots directory exists
  const screenshotsDir = 'test-screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  // First, test admin API endpoints directly
  console.log('=== TESTING API ENDPOINTS ===\n');
  
  // Test 1: Admin Login
  console.log('Test 1: Testing admin login...');
  try {
    const loginResponse = await axios.post('http://localhost:3000/admin/api/login', {
      login: '1',
      password: '1'
    }, { 
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      console.log('✓ Admin login successful');
      results.tests.push({ name: 'Admin Login API', status: 'success' });
    }
  } catch (error) {
    console.log('✗ Admin login failed:', error.message);
    results.tests.push({ name: 'Admin Login API', status: 'failed', error: error.message });
  }
  
  // Test 2: Dashboard Data (Revenue by Plan)
  console.log('\nTest 2: Testing dashboard data with revenue by plan...');
  try {
    const dashboardResponse = await axios.get('http://localhost:3000/admin/api/dashboard/all', {
      withCredentials: true
    });
    
    const data = dashboardResponse.data;
    console.log('Dashboard data received:');
    console.log('- Total Contracts:', data.stats?.totalContracts || 0);
    console.log('- Total Revenue:', data.stats?.totalRevenue || 0);
    
    if (data.planRevenue && Array.isArray(data.planRevenue)) {
      console.log('- Revenue by Plan:');
      data.planRevenue.forEach(plan => {
        console.log(`  • ${plan.planName}: R$ ${plan.totalRevenue}`);
      });
      results.tests.push({ 
        name: 'Dashboard Revenue by Plan', 
        status: 'success',
        details: data.planRevenue
      });
    } else {
      console.log('⚠ No revenue by plan data found');
      results.tests.push({ 
        name: 'Dashboard Revenue by Plan', 
        status: 'warning',
        details: 'No data available'
      });
    }
  } catch (error) {
    console.log('✗ Dashboard data fetch failed:', error.message);
    results.tests.push({ name: 'Dashboard Data', status: 'failed', error: error.message });
  }
  
  // Test 3: Chat Settings
  console.log('\nTest 3: Testing chat settings...');
  try {
    const chatResponse = await axios.get('http://localhost:3000/admin/api/settings/chat', {
      withCredentials: true
    });
    
    const chatData = chatResponse.data;
    console.log('Chat settings received:');
    console.log('- Chat Title:', chatData.chatTitle || 'Not set');
    console.log('- Welcome Message:', chatData.welcomeMessage || 'Not set');
    console.log('- Placeholder Text:', chatData.placeholderText || 'Not set');
    console.log('- Button Icon:', chatData.buttonIcon || 'Not set');
    console.log('- Chat Position:', chatData.chatPosition || 'Not set');
    console.log('- Chat Size:', chatData.chatSize || 'Not set');
    console.log('- Is Enabled:', chatData.isEnabled);
    
    results.tests.push({ 
      name: 'Chat Settings GET', 
      status: 'success',
      details: chatData
    });
  } catch (error) {
    console.log('✗ Chat settings fetch failed:', error.message);
    results.tests.push({ name: 'Chat Settings GET', status: 'failed', error: error.message });
  }
  
  // Test 4: Update Chat Settings
  console.log('\nTest 4: Testing chat settings update...');
  try {
    const updateData = {
      chatTitle: 'Test Chat Title',
      welcomeMessage: 'Test Welcome Message',
      placeholderText: 'Test Placeholder',
      buttonIcon: 'MessageCircle',
      chatPosition: 'bottom-right',
      chatSize: 'md',
      isEnabled: true
    };
    
    const updateResponse = await axios.put('http://localhost:3000/admin/api/settings/chat', 
      updateData, 
      { withCredentials: true }
    );
    
    if (updateResponse.status === 200) {
      console.log('✓ Chat settings update successful');
      results.tests.push({ 
        name: 'Chat Settings UPDATE', 
        status: 'success'
      });
    }
  } catch (error) {
    console.log('✗ Chat settings update failed:', error.message);
    results.tests.push({ name: 'Chat Settings UPDATE', status: 'failed', error: error.message });
  }
  
  // Now test with Puppeteer for UI validation and screenshots
  console.log('\n=== TESTING UI WITH PUPPETEER ===\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Step 1: Login Page
    console.log('Step 1: Capturing login page...');
    await page.goto('http://localhost:5000/admin/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.screenshot({ path: path.join(screenshotsDir, 'test-01-login-page.png') });
    results.screenshots.push('test-01-login-page.png');
    console.log('✓ Login page captured');
    
    // Step 2: Perform Login
    console.log('\nStep 2: Performing login...');
    await page.type('input[type="text"]', '1');
    await page.type('input[type="password"]', '1');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Step 3: Dashboard Page
    console.log('\nStep 3: Capturing dashboard page...');
    await page.screenshot({ path: path.join(screenshotsDir, 'test-02-dashboard.png'), fullPage: true });
    results.screenshots.push('test-02-dashboard.png');
    
    // Check for Revenue by Plan section
    const revenueSectionExists = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => 
        el.textContent && el.textContent.includes('Receita por Plano')
      );
    });
    
    if (revenueSectionExists) {
      console.log('✓ "Receita por Plano" section found on dashboard');
      results.tests.push({ 
        name: 'Dashboard UI - Revenue Section', 
        status: 'success'
      });
    } else {
      console.log('⚠ "Receita por Plano" section not found');
      results.tests.push({ 
        name: 'Dashboard UI - Revenue Section', 
        status: 'warning',
        details: 'Section not visible'
      });
    }
    
    // Step 4: Navigate to Settings
    console.log('\nStep 4: Navigating to Settings page...');
    
    // Try to click on Settings link
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const settingsLink = links.find(link => 
        link.textContent && link.textContent.includes('Configurações')
      );
      if (settingsLink) settingsLink.click();
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, 'test-03-settings.png'), fullPage: true });
    results.screenshots.push('test-03-settings.png');
    
    // Check for Chat tab
    const chatTabExists = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[role="tab"], button, div'));
      return elements.some(el => 
        el.textContent && el.textContent.trim() === 'Chat'
      );
    });
    
    if (chatTabExists) {
      console.log('✓ Chat tab found in Settings');
      results.tests.push({ 
        name: 'Settings UI - Chat Tab', 
        status: 'success'
      });
      
      // Click Chat tab
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
        const chatTab = tabs.find(tab => 
          tab.textContent && tab.textContent.trim() === 'Chat'
        );
        if (chatTab) chatTab.click();
      });
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, 'test-04-chat-settings.png'), fullPage: true });
      results.screenshots.push('test-04-chat-settings.png');
      
      // Check for form fields
      const formFieldsToCheck = [
        'Título do Chat',
        'Mensagem de Boas-vindas',
        'Texto do Placeholder',
        'Ícone do Botão',
        'Posição do Chat',
        'Tamanho do Chat',
        'Chat Ativo'
      ];
      
      console.log('\nChecking chat settings form fields:');
      for (const field of formFieldsToCheck) {
        const exists = await page.evaluate((fieldName) => {
          const elements = Array.from(document.querySelectorAll('label, span, div'));
          return elements.some(el => 
            el.textContent && el.textContent.includes(fieldName)
          );
        }, field);
        
        console.log(`  ${exists ? '✓' : '✗'} ${field}`);
        
        if (exists) {
          results.tests.push({ 
            name: `Chat Form Field - ${field}`, 
            status: 'success'
          });
        } else {
          results.tests.push({ 
            name: `Chat Form Field - ${field}`, 
            status: 'failed'
          });
        }
      }
      
    } else {
      console.log('✗ Chat tab not found in Settings');
      results.tests.push({ 
        name: 'Settings UI - Chat Tab', 
        status: 'failed',
        details: 'Tab not found'
      });
    }
    
  } catch (error) {
    console.error('Puppeteer test error:', error);
    results.errors.push(error.message);
  } finally {
    await browser.close();
  }
  
  // Generate Final Report
  console.log('\n=== FINAL TEST REPORT ===\n');
  
  const successCount = results.tests.filter(t => t.status === 'success').length;
  const failedCount = results.tests.filter(t => t.status === 'failed').length;
  const warningCount = results.tests.filter(t => t.status === 'warning').length;
  
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✓ Passed: ${successCount}`);
  console.log(`✗ Failed: ${failedCount}`);
  console.log(`⚠ Warnings: ${warningCount}`);
  
  console.log('\nDetailed Results:');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'success' ? '✓' : test.status === 'failed' ? '✗' : '⚠';
    console.log(`${index + 1}. ${icon} ${test.name}`);
    if (test.details) {
      if (typeof test.details === 'object') {
        console.log(`   Details: ${JSON.stringify(test.details, null, 2).split('\n').join('\n   ')}`);
      } else {
        console.log(`   Details: ${test.details}`);
      }
    }
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  if (results.screenshots.length > 0) {
    console.log('\nScreenshots saved:');
    results.screenshots.forEach(screenshot => {
      console.log(`  • ${path.join(screenshotsDir, screenshot)}`);
    });
  }
  
  // Save report
  const reportPath = path.join(screenshotsDir, 'test-report-simple.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  return results;
}

// Run test
testAdminPanel()
  .then(results => {
    const hasFailures = results.tests.some(t => t.status === 'failed');
    process.exit(hasFailures ? 1 : 0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });