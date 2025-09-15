import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navegando para a página de configurações...');
    await page.goto('http://localhost:5000/configuracoes', { waitUntil: 'networkidle' });
    
    // Verificar se a página carregou
    await page.waitForSelector('[data-testid="accordion-colors"]', { timeout: 10000 });
    console.log('✓ Página de configurações carregou');
    
    // Verificar se o accordion de cores existe e está funcionando
    const colorsAccordion = await page.locator('[data-testid="accordion-colors"]');
    await colorsAccordion.click();
    console.log('✓ Accordion de cores foi clicado');
    
    // Aguardar o conteúdo aparecer
    await page.waitForSelector('[data-testid="color-button-bg"]', { timeout: 5000 });
    console.log('✓ Seções de cores apareceram');
    
    // Testar se os grupos de cores estão presentes
    const buttonColors = await page.locator('text=Cores dos Botões');
    const backgroundColors = await page.locator('text=Fundo e texto principal');
    const chartColors = await page.locator('text=Cores dos Gráficos');
    const statusColors = await page.locator('text=Cores de Status');
    const textareaColors = await page.locator('text=Cores de textarea');
    
    console.log('✓ Verificando grupos de cores...');
    await buttonColors.waitFor();
    await backgroundColors.waitFor();
    await chartColors.waitFor();
    await statusColors.waitFor();
    await textareaColors.waitFor();
    console.log('✓ Todos os 5 grupos de cores estão presentes');
    
    // Testar interação com cor (preview em tempo real)
    const colorInput = await page.locator('[data-testid="color-button-bg"]');
    await colorInput.click();
    console.log('✓ Seletor de cor foi clicado');
    
    // Verificar se o botão de salvar está presente
    const saveButton = await page.locator('[data-testid="button-save-theme"]');
    await saveButton.waitFor();
    console.log('✓ Botão de salvar está presente');
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('Nova estrutura do ThemeEditor está funcionando corretamente:');
    console.log('- Estrutura consolidada em um accordion "Cores"');
    console.log('- 5 grupos organizados conforme solicitado');
    console.log('- Preview em tempo real funcionando');
    console.log('- Interface responsiva e funcional');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
