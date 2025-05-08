#!/bin/bash

# Script para backup do banco de dados PostgreSQL
# Cria um backup completo da base de dados e salva em um arquivo com a data atual

# Carregar variáveis de ambiente
source .env 2>/dev/null || echo "Arquivo .env não encontrado, usando variáveis padrão"

# Obter data atual para nome do arquivo
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/database_backup_${DATE}.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

echo "Iniciando backup do banco de dados..."

# Usar as variáveis de ambiente ou valores padrão
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres}
PGDATABASE=${PGDATABASE:-postgres}
PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}

# Executar o dump do banco de dados
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -F c -b -v -f "$BACKUP_FILE"

# Verificar se o backup foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "Backup concluído com sucesso: $BACKUP_FILE"
  echo "Tamanho do arquivo: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  echo "Erro ao criar o backup"
  exit 1
fi

# Limpar backups antigos (manter apenas os últimos 5)
cd $BACKUP_DIR
ls -tp | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {}
echo "Backups antigos removidos. Apenas os 5 mais recentes foram mantidos."