#!/bin/bash

# Script para restaurar um backup do banco de dados PostgreSQL

# Carregar variáveis de ambiente
source .env 2>/dev/null || echo "Arquivo .env não encontrado, usando variáveis padrão"

# Diretório de backups
BACKUP_DIR="./backups"

# Verificar se o diretório de backups existe
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Erro: Diretório de backups não encontrado ($BACKUP_DIR)"
  exit 1
fi

# Listar backups disponíveis
echo "Backups disponíveis:"
ls -lh "$BACKUP_DIR" | grep -v '^d' | awk '{print NR".", $9, "("$5")", $6, $7, $8}'

# Verificar se existem backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
if [ "$BACKUP_COUNT" -eq 0 ]; then
  echo "Nenhum backup encontrado no diretório $BACKUP_DIR"
  exit 1
fi

# Solicitar ao usuário para escolher um backup
echo -n "Digite o número do backup que deseja restaurar: "
read BACKUP_NUMBER

# Verificar se o número é válido
if ! [[ "$BACKUP_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "Erro: Por favor, insira um número válido"
  exit 1
fi

# Obter o nome do arquivo de backup
BACKUP_FILE=$(ls -1 "$BACKUP_DIR" | sed -n "${BACKUP_NUMBER}p")
if [ -z "$BACKUP_FILE" ]; then
  echo "Erro: Número de backup inválido"
  exit 1
fi

FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Confirmar a restauração
echo "Você está prestes a restaurar o backup: $BACKUP_FILE"
echo "ATENÇÃO: Isto substituirá todos os dados no banco de dados atual!"
echo -n "Deseja continuar? (s/N): "
read CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo "Operação cancelada pelo usuário"
  exit 0
fi

# Usar as variáveis de ambiente ou valores padrão
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres}
PGDATABASE=${PGDATABASE:-postgres}
PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}

echo "Restaurando backup..."

# Executar a restauração
pg_restore -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c -v "$FULL_BACKUP_PATH"

# Verificar se a restauração foi bem-sucedida
if [ $? -eq 0 ]; then
  echo "Backup restaurado com sucesso!"
else
  echo "Erro ao restaurar o backup"
  exit 1
fi