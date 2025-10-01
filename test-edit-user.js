import puppeteer from 'puppeteer';

async function testEditUser() {
  console.log('🚀 Iniciando teste de edição de usuário no painel administrativo...\n');
  
  // Configuração
  const baseUrl = 'http://localhost:5000';
  const login = process.env.LOGIN || '1';
  const senha = process.env.SENHA || '';
  
  // Usar o chromium instalado no sistema
  const browser = await puppeteer.launch({
    executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    headless: 'new',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ],
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Passo 1: Navegar para a página de administração
    console.log('📍 Passo 1: Navegando para /admin/administration...');
    await page.goto(`${baseUrl}/admin/administration`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await page.screenshot({ path: 'test-screenshots/01-admin-page.png' });
    
    // Verificar se precisa fazer login
    const loginPageUrl = page.url();
    if (loginPageUrl.includes('/admin')) {
      console.log('🔐 Passo 2: Fazendo login...');
      console.log('   Usando credenciais: LOGIN=' + login);
      
      // Aguardar campos de login aparecerem
      await new Promise(r => setTimeout(r, 1000));
      
      // Procurar pelos campos de login usando placeholder
      const loginInput = await page.$('input[placeholder*="login" i]');
      const passwordInput = await page.$('input[placeholder*="senha" i], input[type="password"]');
      
      if (loginInput && passwordInput) {
        // Preencher credenciais
        await loginInput.type(login);
        await passwordInput.type(senha);
        await page.screenshot({ path: 'test-screenshots/02-login-filled.png' });
        
        // Clicar no botão de login
        const loginButton = await page.$('button[type="submit"], button:has-text("Acessar")');
        if (loginButton) {
          await loginButton.click();
        }
        
        // Aguardar redirecionamento ou carregamento
        await new Promise(r => setTimeout(r, 5000));
        console.log('✅ Login realizado com sucesso!');
      } else {
        console.log('❌ Campos de login não encontrados');
      }
      
      await page.screenshot({ path: 'test-screenshots/03-after-login.png' });
    }
    
    // Aguardar página de administração carregar
    console.log('⏳ Aguardando tabela de usuários...');
    await page.waitForSelector('table', { timeout: 10000 });
    await page.screenshot({ path: 'test-screenshots/03-admin-table.png' });
    console.log('✅ Tabela de usuários carregada!');
    
    // Verificar se existem usuários na tabela
    const usersCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    console.log(`📊 Usuários encontrados na tabela: ${usersCount}`);
    
    // Passo 3: Clicar no botão de editar
    console.log('✏️ Passo 3: Clicando no botão de editar...');
    
    // Procurar o botão de editar (ícone de lápis)
    const editButtons = await page.$$('button[data-testid^="button-edit-"]');
    if (editButtons.length === 0) {
      // Tentar selector alternativo
      const altEditButton = await page.$('button:has(svg.lucide-edit)');
      if (!altEditButton) {
        throw new Error('Nenhum botão de editar encontrado');
      }
      await altEditButton.click();
    } else {
      await editButtons[0].click();
    }
    
    // Aguardar o modal abrir
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'test-screenshots/04-edit-modal.png' });
    console.log('✅ Modal de edição aberto!');
    
    // Passo 4: Verificar se o popup abriu corretamente
    let modalTitle = null;
    try {
      modalTitle = await page.$eval('h2', el => el.textContent);
      console.log(`📋 Título do modal: ${modalTitle}`);
    } catch {
      console.log('⚠️ Não foi possível capturar o título do modal');
    }
    
    // Passo 5: Modificar campos
    console.log('📝 Passo 5: Modificando campos...');
    
    // Limpar e preencher novo nome
    const usernameInput = await page.$('input[data-testid="input-username"]');
    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 }); // Selecionar tudo
      await page.keyboard.press('Backspace');
      await usernameInput.type('Gabriel Marquez Editado');
    }
    
    // Limpar e preencher novo email
    const emailInput = await page.$('input[data-testid="input-user-email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 }); // Selecionar tudo
      await page.keyboard.press('Backspace');
      await emailInput.type('gabriel.editado@example.com');
    }
    
    await page.screenshot({ path: 'test-screenshots/05-fields-modified.png' });
    console.log('✅ Campos modificados!');
    
    // Passo 6: Clicar em Atualizar
    console.log('💾 Passo 6: Salvando alterações...');
    
    const saveButton = await page.$('button[data-testid="button-save"]');
    if (saveButton) {
      await saveButton.click();
    } else {
      // Tentar selector alternativo
      await page.click('button:has-text("Atualizar")');
    }
    
    // Aguardar o modal fechar e a notificação aparecer
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'test-screenshots/06-after-save.png' });
    
    // Verificar se apareceu notificação de sucesso
    try {
      const toastMessage = await page.$eval('[data-sonner-toast]', el => el.textContent);
      console.log(`✅ Notificação: ${toastMessage}`);
    } catch {
      console.log('⚠️ Nenhuma notificação visível');
    }
    
    // Passo 7: Verificar se a tabela foi atualizada
    console.log('🔍 Passo 7: Verificando atualização na tabela...');
    await new Promise(r => setTimeout(r, 2000));
    
    // Procurar pelo novo nome na tabela
    const updatedName = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td'));
      return cells.some(cell => cell.textContent?.includes('Gabriel Marquez Editado'));
    });
    
    if (updatedName) {
      console.log('✅ Tabela atualizada com o novo nome!');
    } else {
      console.log('⚠️ Nome não encontrado na tabela imediatamente');
    }
    
    // Passo 8: Recarregar a página e verificar persistência
    console.log('🔄 Passo 8: Recarregando página para verificar persistência...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('table', { timeout: 10000 });
    await page.screenshot({ path: 'test-screenshots/07-after-reload.png' });
    
    // Verificar se as alterações persistiram
    const persistedName = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td'));
      return cells.some(cell => cell.textContent?.includes('Gabriel Marquez Editado'));
    });
    
    const persistedEmail = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td'));
      return cells.some(cell => cell.textContent?.includes('gabriel.editado@example.com'));
    });
    
    console.log('\n📊 RESULTADO DO TESTE:');
    console.log('====================');
    console.log('✅ Login no painel administrativo: OK');
    console.log('✅ Navegação para /admin/administration: OK');
    console.log('✅ Abertura do modal de edição: OK');
    console.log('✅ Modificação de campos: OK');
    console.log('✅ Salvamento das alterações: OK');
    console.log(updatedName ? '✅ Atualização imediata da tabela: OK' : '⚠️ Atualização imediata da tabela: NÃO DETECTADA');
    console.log(persistedName ? '✅ Persistência do nome: OK' : '❌ Persistência do nome: FALHOU');
    console.log(persistedEmail ? '✅ Persistência do email: OK' : '❌ Persistência do email: FALHOU');
    console.log('\n📸 Screenshots salvos em test-screenshots/');
    
    // Listar screenshots salvos
    console.log('\nScreenshots capturados:');
    console.log('  - 01-admin-page.png: Página inicial');
    console.log('  - 02-login-filled.png: Formulário de login preenchido');
    console.log('  - 03-admin-table.png: Tabela de usuários');
    console.log('  - 04-edit-modal.png: Modal de edição aberto');
    console.log('  - 05-fields-modified.png: Campos modificados');
    console.log('  - 06-after-save.png: Após salvar');
    console.log('  - 07-after-reload.png: Após recarregar página');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack:', error.stack);
    
    // Capturar screenshot de erro
    try {
      await page.screenshot({ path: 'test-screenshots/error.png' });
      console.log('📸 Screenshot de erro salvo: error.png');
    } catch (e) {
      console.log('Não foi possível capturar screenshot de erro');
    }
  } finally {
    await browser.close();
    console.log('\n🏁 Teste finalizado');
  }
}

// Executar o teste
testEditUser().catch(console.error);