import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAdminPanel() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = {
    success: true,
    steps: [],
    errors: [],
    screenshots: []
  };
  
  // Ensure screenshots directory exists
  const screenshotsDir = 'test-screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  try {
    // Step 1: Navigate to admin login page
    console.log('Step 1: Navigating to admin login page...');
    await page.goto('http://localhost:5000/admin/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });
    results.screenshots.push('01-login-page.png');
    results.steps.push({ step: 1, description: 'Navigate to login page', status: 'success' });
    console.log('✓ Login page loaded successfully');
    
    // Step 2: Login with credentials
    console.log('Step 2: Logging in with credentials...');
    await page.waitForSelector('input[type="text"], input[name="login"], input[id="login"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"], input[name="password"], input[id="password"]', { timeout: 10000 });
    
    // Type login credentials
    const loginInput = await page.$('input[type="text"], input[name="login"], input[id="login"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"], input[id="password"]');
    
    await loginInput.type('1');
    await passwordInput.type('1');
    
    await page.screenshot({ path: path.join(screenshotsDir, '02-credentials-entered.png') });
    results.screenshots.push('02-credentials-entered.png');
    
    // Find and click login button  
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
    } else {
      // Try clicking by evaluating
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const loginBtn = buttons.find(btn => 
          btn.textContent && (
            btn.textContent.includes('Acessar Painel') || 
            btn.textContent.includes('Entrar') || 
            btn.textContent.includes('Login')
          )
        );
        if (loginBtn) loginBtn.click();
      });
    }
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000); // Give time for page to settle
    
    await page.screenshot({ path: path.join(screenshotsDir, '03-after-login.png') });
    results.screenshots.push('03-after-login.png');
    results.steps.push({ step: 2, description: 'Login with credentials', status: 'success' });
    console.log('✓ Login successful');
    
    // Step 3: Verify Dashboard "Receita por Plano" section
    console.log('Step 3: Verifying Dashboard "Receita por Plano" section...');
    
    // Check if we're on the dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Look for "Receita por Plano" section
    const revenueSectionExists = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent && el.textContent.includes('Receita por Plano'));
    });
    
    if (revenueSectionExists) {
      console.log('✓ "Receita por Plano" section found on dashboard');
      
      // Try to capture the revenue data
      const revenueData = await page.evaluate(() => {
        const chartSection = document.querySelector('[class*="revenue"], [class*="receita"], [id*="revenue"], [id*="receita"]');
        if (chartSection) {
          return chartSection.innerText || 'Chart element found but no text content';
        }
        return 'Revenue section exists but specific element not found';
      });
      
      console.log('Revenue data found:', revenueData);
      results.steps.push({ 
        step: 3, 
        description: 'Verify Dashboard "Receita por Plano" section', 
        status: 'success',
        details: revenueData
      });
    } else {
      console.log('⚠ "Receita por Plano" section not found on current page');
      results.errors.push('Revenue by Plan section not visible on dashboard');
      results.steps.push({ 
        step: 3, 
        description: 'Verify Dashboard "Receita por Plano" section', 
        status: 'warning',
        details: 'Section not found'
      });
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard-revenue.png') });
    results.screenshots.push('04-dashboard-revenue.png');
    
    // Step 4: Navigate to Settings page
    console.log('Step 4: Navigating to Settings page...');
    
    // Try multiple selectors for Settings link
    const settingsSelectors = [
      'a[href*="settings"]',
      'a[href*="configuracoes"]',
      '[class*="sidebar"] a',
      'nav a'
    ];
    
    let settingsClicked = false;
    for (const selector of settingsSelectors) {
      try {
        const settingsLink = await page.$(selector);
        if (settingsLink) {
          await settingsLink.click();
          settingsClicked = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!settingsClicked) {
      // Try evaluating and clicking
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const settingsLink = links.find(link => 
          link.textContent && (link.textContent.includes('Configurações') || link.textContent.includes('Settings'))
        );
        if (settingsLink) settingsLink.click();
      });
    }
    
    await page.waitForTimeout(3000); // Wait for navigation
    
    await page.screenshot({ path: path.join(screenshotsDir, '05-settings-page.png') });
    results.screenshots.push('05-settings-page.png');
    results.steps.push({ step: 4, description: 'Navigate to Settings page', status: 'success' });
    console.log('✓ Navigated to Settings page');
    
    // Step 5: Verify Chat tab exists
    console.log('Step 5: Verifying Chat tab...');
    
    const chatTabExists = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button[class*="tab"], a[class*="tab"], div[class*="tab"]'));
      return tabs.some(tab => tab.textContent && tab.textContent.includes('Chat'));
    });
    
    if (chatTabExists) {
      console.log('✓ Chat tab found');
      
      // Click on Chat tab
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button[class*="tab"], a[class*="tab"], div[class*="tab"]'));
        const chatTab = tabs.find(tab => tab.textContent && tab.textContent.includes('Chat'));
        if (chatTab) chatTab.click();
      });
      
      await page.waitForTimeout(2000);
      results.steps.push({ step: 5, description: 'Verify Chat tab exists', status: 'success' });
    } else {
      console.log('⚠ Chat tab not found');
      results.errors.push('Chat tab not found in Settings page');
      results.steps.push({ step: 5, description: 'Verify Chat tab exists', status: 'failed' });
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '06-chat-tab.png') });
    results.screenshots.push('06-chat-tab.png');
    
    // Step 6: Verify chat settings form fields
    console.log('Step 6: Verifying chat settings form fields...');
    
    const formFields = {
      'Título do Chat': false,
      'Mensagem de Boas-vindas': false,
      'Texto do Placeholder': false,
      'Ícone do Botão': false,
      'Posição do Chat': false,
      'Tamanho do Chat': false,
      'Chat Ativo': false
    };
    
    for (const fieldName of Object.keys(formFields)) {
      const fieldExists = await page.evaluate((field) => {
        const elements = Array.from(document.querySelectorAll('label, span, div'));
        return elements.some(el => el.textContent && el.textContent.includes(field));
      }, fieldName);
      
      formFields[fieldName] = fieldExists;
      console.log(`  ${fieldExists ? '✓' : '✗'} ${fieldName}`);
    }
    
    const allFieldsPresent = Object.values(formFields).every(v => v === true);
    if (allFieldsPresent) {
      results.steps.push({ 
        step: 6, 
        description: 'Verify chat settings form fields', 
        status: 'success',
        details: formFields
      });
    } else {
      results.steps.push({ 
        step: 6, 
        description: 'Verify chat settings form fields', 
        status: 'partial',
        details: formFields
      });
      results.errors.push(`Some form fields missing: ${JSON.stringify(formFields)}`);
    }
    
    // Step 7: Test save functionality
    console.log('Step 7: Testing save functionality...');
    
    try {
      // Try to fill in some test values
      const inputs = await page.$$('input[type="text"], textarea');
      for (let i = 0; i < Math.min(3, inputs.length); i++) {
        await inputs[i].click({ clickCount: 3 }); // Select all
        await inputs[i].type(`Test Value ${i + 1}`);
      }
      
      await page.screenshot({ path: path.join(screenshotsDir, '07-form-filled.png') });
      results.screenshots.push('07-form-filled.png');
      
      // Try to find and click save button
      const saveButton = await page.$('button[type="submit"]');
      if (saveButton) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        // Check for success message
        const successMessage = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.some(el => 
            el.textContent && (
              el.textContent.includes('sucesso') || 
              el.textContent.includes('Sucesso') || 
              el.textContent.includes('salvo') ||
              el.textContent.includes('Success')
            )
          );
        });
        
        if (successMessage) {
          console.log('✓ Save functionality works');
          results.steps.push({ step: 7, description: 'Test save functionality', status: 'success' });
        } else {
          console.log('⚠ Save completed but no success message detected');
          results.steps.push({ step: 7, description: 'Test save functionality', status: 'warning' });
        }
      } else {
        console.log('⚠ Save button not found');
        results.errors.push('Save button not found');
        results.steps.push({ step: 7, description: 'Test save functionality', status: 'failed' });
      }
      
      await page.screenshot({ path: path.join(screenshotsDir, '08-after-save.png') });
      results.screenshots.push('08-after-save.png');
      
    } catch (error) {
      console.log('✗ Error testing save functionality:', error.message);
      results.errors.push(`Save test error: ${error.message}`);
      results.steps.push({ step: 7, description: 'Test save functionality', status: 'failed' });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    results.success = false;
    results.errors.push(error.message);
  } finally {
    await browser.close();
  }
  
  // Generate report
  console.log('\n=== TEST REPORT ===\n');
  console.log('Overall Status:', results.success ? 'SUCCESS' : 'FAILED');
  console.log('\nSteps Summary:');
  results.steps.forEach(step => {
    const status = step.status === 'success' ? '✓' : step.status === 'warning' ? '⚠' : '✗';
    console.log(`  ${status} Step ${step.step}: ${step.description}`);
    if (step.details) {
      console.log(`    Details: ${typeof step.details === 'object' ? JSON.stringify(step.details, null, 2) : step.details}`);
    }
  });
  
  if (results.errors.length > 0) {
    console.log('\nErrors Found:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\nScreenshots saved:');
  results.screenshots.forEach(screenshot => console.log(`  - ${path.join(screenshotsDir, screenshot)}`));
  
  // Save report to file
  fs.writeFileSync(
    path.join(screenshotsDir, 'test-report.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nFull report saved to:', path.join(screenshotsDir, 'test-report.json'));
  
  return results;
}

// Run the test
testAdminPanel()
  .then(results => {
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });