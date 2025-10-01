const puppeteer = require('puppeteer');

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
    
    // Click on Chat tab
    console.log('💬 Clicando na aba Chat...');
    const chatTab = await page.$('button[value="chat"]');
    if (chatTab) {
      await chatTab.click();
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
        const avatarSection = document.querySelector('h3:has-text("Avatares do Chat")');
        if (avatarSection) {
          avatarSection.scrollIntoView({ behavior: 'smooth' });
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
    } else {
      console.log('❌ Aba Chat não encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testChatImages();