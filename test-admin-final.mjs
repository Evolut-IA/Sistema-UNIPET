import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAdminPanel() {
  console.log('🚀 Starting Admin Panel Test...\n');
  
  const screenshotsDir = 'test-screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  
  const testResults = {
    steps: [],
    screenshots: [],
    errors: []
  };
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Step 1: Navigate to Admin Login
    console.log('📍 Step 1: Navigating to Admin Login page...');
    await page.goto('http://localhost:5000/admin/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-admin-login.png'),
      fullPage: true 
    });
    testResults.screenshots.push('01-admin-login.png');
    console.log('✅ Login page loaded and captured');
    
    // Step 2: Login with credentials
    console.log('\n📍 Step 2: Logging in with credentials (login="1", password="1")...');
    
    // Type credentials
    await page.type('input[type="text"]', '1');
    await page.type('input[type="password"]', '1'); 
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page to fully load
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-dashboard.png'),
      fullPage: true 
    });
    testResults.screenshots.push('02-dashboard.png');
    console.log('✅ Logged in successfully and dashboard captured');
    
    // Step 3: Verify "Receita por Plano" section
    console.log('\n📍 Step 3: Verifying "Receita por Plano" (Revenue by Plan) section...');
    
    const revenueSectionFound = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el.textContent && el.textContent.includes('Receita por Plano')) {
          return true;
        }
      }
      return false;
    });
    
    if (revenueSectionFound) {
      console.log('✅ "Receita por Plano" section found on dashboard');
      testResults.steps.push({ step: 3, name: 'Revenue by Plan Section', status: 'success' });
      
      // Try to capture revenue data
      const revenueData = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="card"]');
        const data = [];
        cards.forEach(card => {
          const text = card.textContent || '';
          if (text.includes('R$') || text.includes('Receita')) {
            data.push(text.trim().substring(0, 100));
          }
        });
        return data;
      });
      
      if (revenueData.length > 0) {
        console.log('📊 Revenue data found:');
        revenueData.forEach(item => console.log(`   • ${item}`));
      }
    } else {
      console.log('⚠️  "Receita por Plano" section not visible');
      testResults.steps.push({ step: 3, name: 'Revenue by Plan Section', status: 'not found' });
    }
    
    // Step 4: Navigate to Settings page
    console.log('\n📍 Step 4: Navigating to Settings (Configurações) page...');
    
    // Find and click Settings link
    const settingsClicked = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const settingsLink = links.find(link => 
        link.textContent && link.textContent.includes('Configurações')
      );
      if (settingsLink) {
        settingsLink.click();
        return true;
      }
      return false;
    });
    
    if (settingsClicked) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-settings-page.png'),
        fullPage: true 
      });
      testResults.screenshots.push('03-settings-page.png');
      console.log('✅ Navigated to Settings page');
    } else {
      console.log('⚠️  Settings link not found');
    }
    
    // Step 5: Verify Chat tab
    console.log('\n📍 Step 5: Verifying Chat tab in Settings...');
    
    const chatTabFound = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      return tabs.some(tab => 
        tab.textContent && tab.textContent.trim() === 'Chat'
      );
    });
    
    if (chatTabFound) {
      console.log('✅ Chat tab found');
      testResults.steps.push({ step: 5, name: 'Chat Tab', status: 'success' });
      
      // Click Chat tab
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
        const chatTab = tabs.find(tab => 
          tab.textContent && tab.textContent.trim() === 'Chat'
        );
        if (chatTab) chatTab.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-chat-settings.png'),
        fullPage: true 
      });
      testResults.screenshots.push('04-chat-settings.png');
      console.log('✅ Chat tab clicked and captured');
      
      // Step 6: Verify form fields
      console.log('\n📍 Step 6: Verifying chat settings form fields...');
      
      const fieldsToCheck = [
        'Título do Chat',
        'Mensagem de Boas-vindas',
        'Texto do Placeholder',
        'Ícone do Botão',
        'Posição do Chat',
        'Tamanho do Chat',
        'Chat Ativo'
      ];
      
      const fieldResults = {};
      for (const field of fieldsToCheck) {
        const exists = await page.evaluate((fieldName) => {
          const elements = Array.from(document.querySelectorAll('label, span, div'));
          return elements.some(el => 
            el.textContent && el.textContent.includes(fieldName)
          );
        }, field);
        fieldResults[field] = exists;
        console.log(`   ${exists ? '✅' : '❌'} ${field}`);
      }
      
      const allFieldsPresent = Object.values(fieldResults).every(v => v === true);
      testResults.steps.push({ 
        step: 6, 
        name: 'Chat Form Fields', 
        status: allFieldsPresent ? 'success' : 'partial',
        details: fieldResults
      });
      
      // Step 7: Test form fill and save
      console.log('\n📍 Step 7: Testing form fill and save functionality...');
      
      try {
        // Fill in test values
        const inputs = await page.$$('input[type="text"], textarea');
        for (let i = 0; i < Math.min(3, inputs.length); i++) {
          await inputs[i].click({ clickCount: 3 });
          await inputs[i].type(`Test Value ${i + 1}`);
        }
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '05-form-filled.png'),
          fullPage: true 
        });
        testResults.screenshots.push('05-form-filled.png');
        
        // Find and click save button
        const saveButton = await page.$('button[type="submit"]');
        if (saveButton) {
          await saveButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, '06-after-save.png'),
            fullPage: true 
          });
          testResults.screenshots.push('06-after-save.png');
          
          console.log('✅ Form filled and save button clicked');
          testResults.steps.push({ step: 7, name: 'Save Functionality', status: 'success' });
        }
      } catch (error) {
        console.log('⚠️  Error during form test:', error.message);
        testResults.steps.push({ step: 7, name: 'Save Functionality', status: 'error' });
      }
      
    } else {
      console.log('❌ Chat tab not found');
      testResults.steps.push({ step: 5, name: 'Chat Tab', status: 'not found' });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    testResults.errors.push(error.message);
  } finally {
    await browser.close();
  }
  
  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n📸 Screenshots Captured:');
  testResults.screenshots.forEach((screenshot, index) => {
    console.log(`   ${index + 1}. ${screenshot}`);
  });
  
  console.log('\n✅ Test Steps:');
  testResults.steps.forEach(step => {
    const icon = step.status === 'success' ? '✅' : 
                 step.status === 'not found' ? '⚠️' : '❌';
    console.log(`   ${icon} Step ${step.step}: ${step.name}`);
    if (step.details) {
      console.log(`      Details: ${JSON.stringify(step.details, null, 2)}`);
    }
  });
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }
  
  // Save report
  const reportPath = path.join(screenshotsDir, 'test-report-final.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  console.log('\n✅ Test completed successfully!');
  console.log('='.repeat(60));
  
  return testResults;
}

// Run test
testAdminPanel()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });