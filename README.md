# 🌐 Gateway Service

API Gateway para arquitetura de microservices com **autenticação JWT**, **comunicação RabbitMQ** e **internacionalização (i18n)**.

## 🎯 O que faz

- **Gateway HTTP** para microservices (Auth + Games)
- **Autenticação JWT** com validação via RabbitMQ
- **Rotas protegidas** com guards automáticos
- **Comunicação assíncrona** via RabbitMQ
- **Internacionalização** (pt-BR, en-US) com resolução automática
- **Docker** ready com hot reload

## ⚡ Quick Start

```bash
# 1. Clonar e instalar
git clone <repo>
cd gateway-service
npm install

# 2. Configurar .env
cp .env.example .env

# 3. Rodar com Docker
docker compose up

# 4. Testar
curl http://localhost:3000/health
```

## 📡 API Routes

### **🔓 Públicas (sem autenticação)**
```bash
POST /auth/login      # Login → JWT token
POST /auth/register   # Registro → JWT token  
POST /auth/validate   # Validar token
GET  /health          # Health check
```

### **🔒 Protegidas (requer JWT)**
```bash
GET    /users          # Listar usuários
GET    /users/profile  # Perfil do usuário logado
GET    /users/:id      # Buscar usuário por ID
PATCH  /users/:id      # Atualizar usuário
DELETE /users/:id      # Deletar usuário
```

### **🎮 Games**
```bash
GET  /games/:id        # Buscar jogo
POST /games            # Criar jogo
POST /games/:id/delete # Deletar jogo
```

## 🔑 Autenticação

**Header obrigatório para rotas protegidas:**
```
Authorization: Bearer <jwt-token>
```

**Exemplo de login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@email.com","password":"senha123"}'
```

## 🌍 Internacionalização (i18n)

**Idiomas suportados:**
- **Inglês (en-US)** - Padrão/Fallback
- **Português (pt-BR)**

**Como usar:**
```bash
# Padrão (inglês)
curl http://localhost:3000/

# Via query parameter
curl "http://localhost:3000/?lang=pt-BR"

# Via header Accept-Language
curl -H "Accept-Language: pt-BR" http://localhost:3000/

# Via header customizado
curl -H "x-lang: pt-BR" http://localhost:3000/
```

**Resolução automática:**
- Query parameter: `?lang=pt-BR`
- Header: `Accept-Language: pt-BR`
- Header customizado: `x-lang: pt-BR`
- Fallback: `en-US`

## 🧪 Postman Collection

**Arquivos:**
- `gateway-service.postman_collection.json` - Todos os endpoints
- `gateway-service.postman_environment.json` - Variáveis de ambiente

**Importar:**
1. Postman → Import → Selecionar arquivos
2. Configurar environment: `baseUrl = http://localhost:3000`
3. Testar endpoints

**Features:**
- ✅ Health check
- ✅ Auth (login, register, validate)
- ✅ Users (CRUD completo com JWT)
- ✅ Games (buscar, criar, deletar)
- ✅ **Auto-login**: Token JWT salvo automaticamente
- ✅ **Rotas autenticadas**: Token usado automaticamente
- ✅ **Testes automáticos** (response time, JSON validation)
- ✅ **Suporte i18n**: Headers de idioma configurados

## 🐳 Docker

```bash
# Rodar tudo
docker compose up

# Rebuild
docker compose up --build

# Logs
docker compose logs -f gateway-service
```

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🔌 Microservices

**Comunicação via RabbitMQ:**
- **Auth Service** → `auth_queue`
- **Games Service** → `games_queue`

**Padrão híbrido:**
- **Request-Response** → Rotas síncronas (GET, autenticação)
- **Event Pattern** → Rotas assíncronas (POST, eventos)

## 📋 Variáveis de Ambiente

```env
# Server
PORT=3000
NODE_ENV=development

# RabbitMQ
RABBITMQ_DEFAULT_USER=meu_usuario
RABBITMQ_DEFAULT_PASS=minha_senha
RABBITMQ_DEFAULT_PORT=5672
RABBITMQ_DEFAULT_UI_PORT=15672

# Services
AUTH_SERVICE_HOST=auth-service
AUTH_SERVICE_PORT=3001
GAMES_SERVICE_HOST=games-service
GAMES_SERVICE_PORT=3002
```

## 🏗️ Arquitetura

```
Cliente HTTP → Gateway → JWT Guard → Microservice (RabbitMQ) → Response
```

**Fluxo de autenticação:**
1. Cliente faz login → recebe JWT
2. Rotas protegidas → Gateway valida JWT via Auth Service
3. JWT válido → encaminha para microservice responsável
4. JWT inválido → retorna 401 Unauthorized

## 📚 Tech Stack

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem tipada
- **RabbitMQ** - Message broker
- **Docker** - Containerização
- **JWT** - Autenticação
- **ConfigService** - Configuração
- **nestjs-i18n** - Internacionalização

## 🔍 Troubleshooting

**Gateway não conecta no RabbitMQ:**
```bash
# Verificar se RabbitMQ está rodando
docker compose logs rabbitmq

# Verificar network
docker network ls | grep game-hub
```

**Erro 401 em rotas protegidas:**
- Verificar se token JWT está no header `Authorization: Bearer <token>`
- Verificar se Auth Service está respondendo

**Timeout em microservices:**
- Verificar se microservices estão na mesma network Docker
- Verificar logs dos containers

## 📄 License

MIT
