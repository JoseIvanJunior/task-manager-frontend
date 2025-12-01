# 📋 Task Manager - Frontend

Aplicação web para gerenciamento de tarefas desenvolvida com Angular 21 e Angular Material.

## 🚀 Funcionalidades

- ✅ **Autenticação de usuários** (login/logout)
- ✅ **CRUD completo de tarefas**
  - Criar novas tarefas
  - Listar tarefas com filtros
  - Visualizar detalhes
  - Editar tarefas existentes
  - Excluir tarefas
- ✅ **Filtros avançados** por responsável, prioridade e situação
- ✅ **Interface responsiva** (mobile e desktop)
- ✅ **Validação de formulários**
- ✅ **Datepicker** para seleção de prazos
- ✅ **Feedback visual** com Angular Material

## 🛠️ Tecnologias

- **Angular 21** - Framework principal
- **TypeScript** - Superset JavaScript
- **Angular Material** - Componentes UI
- **SCSS/SASS** - Estilização
- **RxJS** - Programação reativa
- **Standalone Components** - Arquitetura moderna

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Angular CLI 17+

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd task-manager-frontend

# Instale as dependências
npm install
# ou
yarn install

# Inicie o servidor de desenvolvimento
ng serve

# Acesse no navegador
http://localhost:4200

# 📁 Estrutura do Projeto

src/
├── app/
│ ├── core/ # Serviços, guards, interceptors
│ │ ├── guards/
│ │ ├── interceptors/
│ │ └── services/
│ ├── modules/
│ │ ├── auth/ # Módulo de autenticação
│ │ └── task/ # Módulo de tarefas
│ └── shared/ # Componentes compartilhados
├── assets/ # Imagens, fonts
└── styles/ # Estilos globais

text

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Angular CLI 17+

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd task-manager-frontend

# Instale as dependências
npm install
# ou
yarn install
Desenvolvimento
bash
# Inicie o servidor de desenvolvimento
ng serve

# Acesse no navegador
http://localhost:4200
Build para Produção
bash
# Build para produção
ng build

# Os arquivos serão gerados em dist/
🔧 Configuração
Credenciais de Teste
Para testes, use qualquer combinação de:

Usuário: qualquer texto

Senha: qualquer texto

Ou clique em "Entrar como Usuário de Teste" para preenchimento automático.

Variáveis de Ambiente
Crie um arquivo environments/environment.ts:

typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081' // URL do seu backend
};
📱 Telas da Aplicação
Login
https://docs/login-screen.png

Design limpo com gradiente

Login simplificado para testes

Totalmente responsivo

Lista de Tarefas
https://docs/task-list.png

Tabela com filtros avançados

Badges coloridos por prioridade

Ações rápidas (editar, excluir, concluir)

Formulário de Tarefa
https://docs/task-form.png

Validação em tempo real

Datepicker integrado

Layout responsivo em grid

Detalhes da Tarefa
https://docs/task-detail.png

Visualização completa

Status visual

Ações rápidas

🎨 Design System
Cores
Primária: #3f51b5 (Indigo)

Secundária: #ff4081 (Pink)

Sucesso: #4caf50 (Green)

Alerta: #ff9800 (Orange)

Erro: #f44336 (Red)

Tipografia
Fonte Principal: Roboto

Tamanhos: Sistema escalonado com Material Design

Componentes
Todos os componentes seguem o Material Design

Animações suaves para transições

Feedback visual para todas as ações

🔌 Integração com Backend
Endpoints (prontos para implementação)
typescript
// Auth
POST   /api/auth/login
POST   /api/auth/logout

// Tasks
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/complete

Interceptor
A aplicação já possui um AuthInterceptor pronto para adicionar tokens JWT nas requisições.

📱 Responsividade
A aplicação é totalmente responsiva:

Desktop: Layout otimizado para telas grandes

Tablet: Ajustes no grid e espaçamentos

Mobile: Cards em vez de tabela, menu compacto

🧪 Testes
Executar testes
bash
# Testes unitários
ng test

# Testes end-to-end
ng e2e
Coverage
bash
ng test --code-coverage
🚀 Deploy
Build para produção
bash
ng build --configuration production
Servidores suportados
GitHub Pages: ng deploy --base-href=/repo-name/

Firebase: firebase deploy

Netlify/Vercel: Deploy automático

Servidor próprio: Copiar conteúdo de dist/

🤝 Contribuindo
Faça um Fork do projeto

Crie uma Branch (git checkout -b feature/nova-feature)

Commit suas mudanças (git commit -m 'feat: nova feature')

Push para a Branch (git push origin feature/nova-feature)

Abra um Pull Request

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👨‍💻 Autor
Seu Nome

GitHub: @seuusuario

LinkedIn: Seu Nome
