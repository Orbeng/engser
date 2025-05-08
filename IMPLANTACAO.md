# Guia de Implantação

Este guia descreve os passos necessários para implantar o sistema de gestão de serviços de engenharia em um ambiente de produção.

## Pré-requisitos

- Node.js v18 ou superior
- PostgreSQL 14 ou superior
- Servidor Linux (Ubuntu/Debian recomendado)

## 1. Preparação do Servidor

### Instalar Dependências

```bash
# Atualizar repositórios
sudo apt update
sudo apt upgrade -y

# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar ferramentas de build necessárias
sudo apt install -y build-essential

# Instalar PostgreSQL (se necessário)
sudo apt install -y postgresql postgresql-contrib
```

### Configurar Firewall

```bash
# Permitir SSH, HTTP e HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 2. Configuração do Banco de Dados

### Criar Usuário e Banco de Dados

```bash
sudo -u postgres psql

postgres=# CREATE USER nome_usuario WITH PASSWORD 'senha_segura';
postgres=# CREATE DATABASE nome_banco OWNER nome_usuario;
postgres=# \q
```

### Configurar Conexão Segura

Edite `/etc/postgresql/14/main/pg_hba.conf` para permitir apenas conexões autenticadas:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
```

## 3. Implantação da Aplicação

### Clonar o Repositório

```bash
git clone [URL_DO_REPOSITORIO] /var/www/app
cd /var/www/app
```

### Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
nano .env
```

Edite as variáveis para seu ambiente de produção:

```
# Configurações do Banco de Dados
DATABASE_URL=postgres://nome_usuario:senha_segura@localhost:5432/nome_banco
PGUSER=nome_usuario
PGPASSWORD=senha_segura
PGDATABASE=nome_banco
PGHOST=localhost
PGPORT=5432

# Configuração da Sessão
SESSION_SECRET=chave_secreta_longa_e_aleatoria

# Configurações do Servidor
PORT=5000
NODE_ENV=production

# Configurações de segurança
CORS_ORIGIN=https://seu-dominio.com.br
```

### Instalar Dependências e Compilar

```bash
npm install
npm run build
```

### Inicializar o Banco de Dados

```bash
# Aplicar migrações
npm run db:push
```

### Configurar o Serviço

Crie um arquivo de serviço systemd:

```bash
sudo nano /etc/systemd/system/gestao-engenharia.service
```

Conteúdo:

```
[Unit]
Description=Aplicação de Gestão de Serviços de Engenharia
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/app
ExecStart=/usr/bin/npm run start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Ative o serviço:

```bash
sudo systemctl enable gestao-engenharia
sudo systemctl start gestao-engenharia
```

## 4. Configuração do Proxy Reverso

### Instalar e Configurar Nginx

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

sudo nano /etc/nginx/sites-available/gestao-engenharia
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/gestao-engenharia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Configurar HTTPS com Let's Encrypt

```bash
sudo certbot --nginx -d seu-dominio.com.br
```

## 5. Backups e Manutenção

### Configurar Backup Automático

Adicione o script de backup ao crontab:

```bash
sudo crontab -e
```

Adicione a linha:

```
0 2 * * * cd /var/www/app && ./scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### Monitoramento e Logs

Visualizar logs da aplicação:

```bash
sudo journalctl -u gestao-engenharia -f
```

## 6. Verificações Pós-Implantação

1. Acesse a aplicação pelo navegador em `https://seu-dominio.com.br`
2. Verifique se o login e cadastro estão funcionando
3. Teste o fluxo de recuperação de senha
4. Certifique-se de que todas as páginas estão carregando corretamente
5. Verifique a responsividade em diferentes dispositivos

## 7. Atualização da Aplicação

Para atualizar a aplicação para novas versões:

```bash
cd /var/www/app
git pull
npm install
npm run build
sudo systemctl restart gestao-engenharia
```

## Solução de Problemas

### Problemas de Conexão com o Banco de Dados

Verifique se o PostgreSQL está em execução:

```bash
sudo systemctl status postgresql
```

Verifique as credenciais e as permissões:

```bash
sudo -u postgres psql -c "SELECT usename, usecreatedb, usesuper FROM pg_user"
```

### Erro 502 Bad Gateway

Verifique se a aplicação está em execução:

```bash
sudo systemctl status gestao-engenharia
```

Verifique os logs:

```bash
sudo journalctl -u gestao-engenharia -n 50
```

### Problemas de Permissão

Certifique-se de que o usuário do serviço tem permissões adequadas:

```bash
sudo chown -R www-data:www-data /var/www/app
sudo chmod -R 755 /var/www/app
```