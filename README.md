# 🌐 Gateway Service

API Gateway para arquitetura de microservices com **autenticação JWT**, **comunicação RabbitMQ** e **internacionalização (i18n)**.

## 🎯 O que faz

- **Gateway HTTP** para microservices (Auth + Games)
- **Autenticação JWT** com validação via RabbitMQ
- **Rotas protegidas** com guards automáticos
- **Comunicação assíncrona** via RabbitMQ
- **Internacionalização** (en, pt-BR) com resolução automática
- **Arquitetura Service Pattern** (Controller → Service → RabbitMQ)
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
- **Inglês (en)** - Padrão/Fallback
- **Português (pt-BR)**

**Como usar:**
```bash
# Padrão (inglês)
curl http://localhost:3000/auth/login -d '{"email":"john@example.com","password":"password123"}'

# Via query parameter
curl "http://localhost:3000/auth/login?lang=pt-BR" -d '{"email":"john@example.com","password":"password123"}'

# Via header Accept-Language
curl -H "Accept-Language: pt-BR" http://localhost:3000/auth/login -d '{"email":"john@example.com","password":"password123"}'

# Via header customizado
curl -H "x-lang: pt-BR" http://localhost:3000/auth/login -d '{"email":"john@example.com","password":"password123"}'
```

**Resolução automática:**
- Query parameter: `?lang=pt-BR`
- Header: `Accept-Language: pt-BR`
- Header customizado: `x-lang: pt-BR`
- Fallback: `en`

**Gateway → Microservice:**
O gateway automaticamente inclui `lang` em todos os payloads RabbitMQ para que microservices retornem mensagens traduzidas.

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

## 🏗️ Arquitetura

**Service Pattern:**
```
Controller → Service → RabbitMQ → Microservice
```

**AuthController → AuthService:**
- `login()`, `register()`, `validateToken()`
- `findAllUsers()`, `getUserProfile()`, `findUserById()`
- `updateUser()`, `deleteUser()`, `healthCheck()`

**GamesController → GamesService:**
- `getGameDetails()`, `createGame()`, `deleteGame()`

**Comunicação RabbitMQ:**
- **Auth Service** → `auth_queue` (durable: true)
- **Games Service** → `games_queue`

**Padrão híbrido:**
- **Request-Response** → Rotas síncronas (GET, autenticação)
- **Event Pattern** → Rotas assíncronas (POST, eventos)

**I18n Integration:**
Todos os payloads RabbitMQ incluem `lang: I18nContext.current()?.lang || 'en'`

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

## 🔧 Estrutura do Projeto

```
src/
├── auth/
│   ├── auth.controller.ts    # Rotas HTTP
│   ├── auth.service.ts       # Lógica RabbitMQ + I18n
│   ├── auth.module.ts        # DI + ClientsModule
│   └── jwt-auth.guard.ts     # JWT validation
├── games/
│   ├── games.controller.ts   # Rotas HTTP
│   ├── games.service.ts      # Lógica RabbitMQ + I18n
│   └── games.module.ts       # DI + ClientsModule
├── i18n/
│   ├── en-US/               # Traduções inglês
│   └── pt-BR/               # Traduções português
├── app.module.ts            # I18nModule + ConfigModule
└── main.ts                  # Bootstrap
```

## 🔄 Fluxos

**Autenticação:**
```
Cliente → Gateway → AuthService → RabbitMQ → Auth Microservice
                ↓
            JWT Token + Translated Message
```

**Rotas Protegidas:**
```
Cliente + JWT → JwtAuthGuard → AuthService → RabbitMQ → Auth Microservice
                    ↓              ↓
               Validation      Lang Context
```

**I18n Flow:**
```
HTTP Headers → I18nResolver → I18nContext → Service → RabbitMQ Payload
(Accept-Language)                                        {data, lang}
```

## 📚 Tech Stack

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem tipada
- **RabbitMQ** - Message broker (durable queues)
- **Docker** - Containerização
- **JWT** - Autenticação
- **ConfigService** - Configuração
- **nestjs-i18n** - Internacionalização
- **Service Pattern** - Arquitetura limpa

## 🚧 TODO: Paginação e Filtros

**Para implementar amanhã:**

### **Paginação:**
```bash
GET /users?page=1&limit=10&offset=0
```

### **Filtros:**
```bash
# Busca
GET /users?search=john

# Ordenação
GET /users?orderBy=name&order=asc

# Status/Role
GET /users?status=active&role=admin

# Combinado
GET /users?page=1&limit=5&search=john&orderBy=createdAt&order=desc&role=user
```

### **Implementação:**
1. ✅ DTOs criados (`QueryDto`, `PaginationDto`, `FilterDto`)
2. ⏳ Instalar `class-transformer` dependency
3. ⏳ Atualizar AuthController com `@Query()` 
4. ⏳ Atualizar AuthService para passar query params
5. ⏳ Atualizar GamesController/Service
6. ⏳ Microservices devem processar filtros/paginação
7. ⏳ Testes com Postman

### **Estrutura Query:**
```typescript
{
  // Paginação
  page?: number = 1,
  limit?: number = 10,
  offset?: number,
  
  // Filtros
  search?: string,
  orderBy?: string,
  order?: 'asc' | 'desc' = 'asc',
  status?: string,
  role?: string,
  category?: string
}
```

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
