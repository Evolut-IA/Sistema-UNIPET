import puppeteer from 'puppeteer';

async function testChatImages() {
  let browser;
  try {
    console.log('🚀 Iniciando navegador...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to admin login page
    console.log('📍 Navegando para página de admin...');
    await page.goto('http://localhost:5000/admin/configuracoes');
    await page.waitForTimeout(2000);

    // Login
    console.log('🔐 Fazendo login...');
    await page.type('input[name="login"]', '1', { delay: 50 });
    await page.type('input[name="password"]', '1', { delay: 50 });
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(3000);

    // Check if we're on the settings page
    console.log('⚙️ Verificando página de configurações...');
    
    // Click on Chat tab using text selector
    console.log('💬 Clicando na aba Chat...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chatButton = buttons.find(btn => btn.textContent?.includes('Chat'));
      if (chatButton) {
        chatButton.click();
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot
    console.log('📸 Capturando screenshot da aba Chat...');
    await page.screenshot({ 
      path: 'chat-tab-screenshot.png',
      fullPage: true
    });
    console.log('✅ Screenshot salvo como chat-tab-screenshot.png');
    
    // Scroll to avatar section
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const avatarHeader = headers.find(h => h.textContent?.includes('Avatares'));
      if (avatarHeader) {
        avatarHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of avatar section
    console.log('📸 Capturando screenshot da seção de avatares...');
    await page.screenshot({ 
      path: 'chat-avatars-screenshot.png',
      fullPage: false
    });
    console.log('✅ Screenshot dos avatares salvo');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testChatImages();