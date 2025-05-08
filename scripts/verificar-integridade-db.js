#!/usr/bin/env node

/**
 * Script para verificar a integridade do banco de dados antes da implantação
 * Verifica se todas as tabelas existem e se os relacionamentos estão corretos
 */

require('dotenv').config();
const { Pool } = require('pg');

// Tabelas esperadas no banco de dados
const EXPECTED_TABLES = [
  'users',
  'companies',
  'services',
  'quotes',
  'quote_items',
  'session'
];

// Relacionamentos esperados
const EXPECTED_RELATIONSHIPS = [
  { table: 'services', foreignKey: 'company_id', referencesTable: 'companies', referencesColumn: 'id' },
  { table: 'quotes', foreignKey: 'company_id', referencesTable: 'companies', referencesColumn: 'id' },
  { table: 'quote_items', foreignKey: 'quote_id', referencesTable: 'quotes', referencesColumn: 'id' }
];

// Colunas obrigatórias por tabela
const REQUIRED_COLUMNS = {
  'users': ['id', 'username', 'password', 'name', 'created_at'],
  'companies': ['id', 'name', 'cnpj', 'created_at'],
  'services': ['id', 'art', 'description', 'company_id', 'created_at'],
  'quotes': ['id', 'quote_number', 'title', 'company_id', 'created_at'],
  'quote_items': ['id', 'quote_id', 'description', 'quantity', 'unit_price']
};

async function checkDatabaseIntegrity() {
  console.log('=== VERIFICAÇÃO DE INTEGRIDADE DO BANCO DE DADOS ===\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Conectando ao banco de dados...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso.\n');

    // Verificar se todas as tabelas existem
    console.log('Verificando tabelas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log(`Tabelas encontradas: ${existingTables.length}`);
    
    let missingTables = [];
    EXPECTED_TABLES.forEach(table => {
      if (!existingTables.includes(table)) {
        missingTables.push(table);
      }
    });
    
    if (missingTables.length > 0) {
      console.log(`❌ Tabelas ausentes: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ Todas as tabelas esperadas existem.');
    }
    
    // Verificar colunas obrigatórias
    console.log('\nVerificando colunas obrigatórias...');
    let missingColumns = [];
    
    for (const table in REQUIRED_COLUMNS) {
      if (existingTables.includes(table)) {
        const columnsResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
        `, [table]);
        
        const existingColumns = columnsResult.rows.map(row => row.column_name);
        
        REQUIRED_COLUMNS[table].forEach(column => {
          if (!existingColumns.includes(column)) {
            missingColumns.push(`${table}.${column}`);
          }
        });
      }
    }
    
    if (missingColumns.length > 0) {
      console.log(`❌ Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
    } else {
      console.log('✅ Todas as colunas obrigatórias estão presentes.');
    }
    
    // Verificar relações de chave estrangeira
    console.log('\nVerificando relações de chave estrangeira...');
    let missingRelationships = [];
    
    for (const rel of EXPECTED_RELATIONSHIPS) {
      const fkResult = await client.query(`
        SELECT COUNT(*) 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND kcu.table_name = $1
          AND kcu.column_name = $2
          AND ccu.table_name = $3
          AND ccu.column_name = $4
      `, [rel.table, rel.foreignKey, rel.referencesTable, rel.referencesColumn]);
      
      if (parseInt(fkResult.rows[0].count) === 0) {
        missingRelationships.push(`${rel.table}.${rel.foreignKey} -> ${rel.referencesTable}.${rel.referencesColumn}`);
      }
    }
    
    if (missingRelationships.length > 0) {
      console.log(`❌ Relações de chave estrangeira ausentes: ${missingRelationships.join(', ')}`);
    } else {
      console.log('✅ Todas as relações de chave estrangeira estão presentes.');
    }

    // Verificar dados de amostra básicos (admin user)
    console.log('\nVerificando dados básicos...');
    const adminResult = await client.query(`
      SELECT COUNT(*) FROM users WHERE username = 'admin'
    `);
    
    if (parseInt(adminResult.rows[0].count) === 0) {
      console.log('❌ Usuário admin não encontrado. O sistema pode não funcionar corretamente sem um usuário inicial.');
    } else {
      console.log('✅ Usuário admin encontrado.');
    }

    // Verificar índices para melhor performance
    console.log('\nVerificando índices para otimização de performance...');
    const recommendedIndices = [
      { table: 'companies', column: 'cnpj' },
      { table: 'services', column: 'company_id' },
      { table: 'services', column: 'art' },
      { table: 'quotes', column: 'company_id' },
      { table: 'quotes', column: 'quote_number' },
      { table: 'quote_items', column: 'quote_id' }
    ];
    
    let missingIndices = [];
    
    for (const idx of recommendedIndices) {
      const indexResult = await client.query(`
        SELECT COUNT(*) 
        FROM pg_indexes 
        WHERE tablename = $1 AND indexdef LIKE '%' || $2 || '%'
      `, [idx.table, idx.column]);
      
      if (parseInt(indexResult.rows[0].count) === 0) {
        missingIndices.push(`${idx.table}.${idx.column}`);
      }
    }
    
    if (missingIndices.length > 0) {
      console.log(`⚠️ Índices recomendados ausentes: ${missingIndices.join(', ')}`);
      console.log('   Considere adicionar estes índices para melhorar a performance.');
    } else {
      console.log('✅ Todos os índices recomendados estão presentes.');
    }

    // Resultado final
    console.log('\n=== RESULTADO DA VERIFICAÇÃO ===');
    
    if (missingTables.length === 0 && missingColumns.length === 0 && missingRelationships.length === 0) {
      console.log('✅ Banco de dados íntegro e pronto para produção!');
    } else {
      console.log('❌ Foram encontrados problemas que devem ser corrigidos antes de ir para produção.');
    }

    client.release();
  } catch (err) {
    console.error('Erro ao verificar integridade do banco de dados:', err);
  } finally {
    await pool.end();
  }
}

checkDatabaseIntegrity();