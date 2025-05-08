#!/usr/bin/env node

/**
 * Script para verificação manual de compatibilidade entre navegadores
 * Este script fornece uma lista de verificação para testar a aplicação em diferentes navegadores
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BROWSERS = [
  'Google Chrome (última versão)',
  'Mozilla Firefox (última versão)',
  'Microsoft Edge (última versão)',
  'Safari (última versão, se disponível)',
  'Chrome Mobile (Android)',
  'Safari Mobile (iOS, se disponível)'
];

const FEATURES_TO_TEST = [
  'Login e autenticação',
  'Dashboard e visualização de métricas',
  'Cadastro de empresas',
  'Cadastro de serviços',
  'Geração de orçamentos',
  'Visualização de relatórios',
  'Funcionalidades responsivas (sidebar colapsável, etc)',
  'Formulários e validações',
  'Toasts e mensagens de erro/sucesso',
  'Navegação entre páginas',
  'Performance geral da interface'
];

console.log('\n=== TESTE DE COMPATIBILIDADE ENTRE NAVEGADORES ===\n');
console.log('Este script irá guiá-lo por uma verificação manual de compatibilidade entre navegadores.');
console.log('Por favor, teste a aplicação em cada um dos navegadores listados e verifique as funcionalidades.\n');

let currentBrowserIndex = 0;
let currentFeatureIndex = 0;
let results = {};

function initializeBrowserResults() {
  BROWSERS.forEach(browser => {
    results[browser] = {};
    FEATURES_TO_TEST.forEach(feature => {
      results[browser][feature] = null;
    });
  });
}

function displayCurrentTest() {
  if (currentBrowserIndex >= BROWSERS.length) {
    showResults();
    return;
  }

  const browser = BROWSERS[currentBrowserIndex];
  const feature = FEATURES_TO_TEST[currentFeatureIndex];
  
  console.log(`\n===== Navegador: ${browser} =====`);
  console.log(`Teste: ${feature}`);
  console.log('\nA funcionalidade está funcionando corretamente? (s/n/p)');
  console.log('s - Sim, funciona corretamente');
  console.log('n - Não, há problemas');
  console.log('p - Pular este teste');
}

function processAnswer(answer) {
  const browser = BROWSERS[currentBrowserIndex];
  const feature = FEATURES_TO_TEST[currentFeatureIndex];
  
  if (answer.toLowerCase() === 's') {
    results[browser][feature] = true;
    console.log('✅ Marcado como funcionando corretamente');
  } else if (answer.toLowerCase() === 'n') {
    results[browser][feature] = false;
    console.log('❌ Marcado como não funcionando');
    
    rl.question('Descreva o problema encontrado: ', (description) => {
      results[browser][`${feature}_desc`] = description;
      nextTest();
    });
    return;
  } else if (answer.toLowerCase() === 'p') {
    results[browser][feature] = 'skipped';
    console.log('⏭️ Teste pulado');
  } else {
    console.log('Resposta inválida. Por favor, responda s, n ou p.');
    displayCurrentTest();
    return;
  }
  
  nextTest();
}

function nextTest() {
  currentFeatureIndex++;
  
  if (currentFeatureIndex >= FEATURES_TO_TEST.length) {
    currentFeatureIndex = 0;
    currentBrowserIndex++;
  }
  
  displayCurrentTest();
}

function showResults() {
  console.log('\n\n===== RESULTADOS DO TESTE DE COMPATIBILIDADE =====\n');
  
  BROWSERS.forEach(browser => {
    console.log(`\n>> ${browser}:`);
    
    let hasProblems = false;
    
    FEATURES_TO_TEST.forEach(feature => {
      const result = results[browser][feature];
      
      if (result === true) {
        console.log(`  ✅ ${feature}`);
      } else if (result === false) {
        console.log(`  ❌ ${feature} - ${results[browser][`${feature}_desc`] || 'Problema não especificado'}`);
        hasProblems = true;
      } else if (result === 'skipped') {
        console.log(`  ⏭️ ${feature} - Pulado`);
      } else {
        console.log(`  ❓ ${feature} - Não testado`);
      }
    });
    
    if (!hasProblems) {
      console.log('  ✨ Nenhum problema detectado neste navegador!');
    }
  });
  
  console.log('\n\n===== RESUMO =====');
  
  const problemBrowsers = BROWSERS.filter(browser => 
    Object.keys(results[browser]).some(key => 
      !key.includes('_desc') && results[browser][key] === false
    )
  );
  
  if (problemBrowsers.length === 0) {
    console.log('✅ Nenhum problema de compatibilidade entre navegadores detectado!');
  } else {
    console.log('❌ Problemas detectados nos seguintes navegadores:');
    problemBrowsers.forEach(browser => {
      console.log(`  - ${browser}`);
    });
  }
  
  console.log('\nTeste de compatibilidade concluído. Obrigado!');
  rl.close();
}

initializeBrowserResults();
displayCurrentTest();

rl.on('line', (answer) => {
  processAnswer(answer);
});

rl.on('close', () => {
  console.log('Teste de compatibilidade encerrado.');
  process.exit(0);
});