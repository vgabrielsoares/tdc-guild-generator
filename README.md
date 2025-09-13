# Gerador de Guildas - Tabuleiro do Caos RPG

[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-cyan.svg)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen.svg)](https://vgabrielsoares.github.io/tdc-guild-generator/)
[![Deploy Status](https://github.com/vgabrielsoares/tdc-guild-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/vgabrielsoares/tdc-guild-generator/actions/workflows/deploy.yml)

Um sistema completo para geração procedural de guildas de aventureiros para RPG de mesa. Baseado em regras e tabelas utilizando rolagem de dados, este gerador permite criar guildas completas com estrutura, contratos, serviços, membros e sistema de renome.

A base inicial das regras de geração procedural do projeto foi inspirada nas tabelas criadas por [Pato Papão](https://www.youtube.com/user/PatoPapao), seu conteúdo foi disponibilizado diretamente por ele. As tabelas foram expandidas e modificadas para incluir regras mais específicas e se adequar a gostos pessoais. Fica aqui meu agradecimento ao Pato Papão por sua contribuição para a comunidade de RPG.

Apesar dos resultados das gerações, no geral, serem genéricos o bastante para serem usados em qualquer cenário de RPG medieval, alguns detalhes do conteúdo foram feitos visando o sistema Tabuleiro do Caos RPG, de autoria própria. Então certifique-se de adaptar o que for necessário para o seu estilo de jogo.

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
  - [Frontend](#frontend)
  - [Utilitários e Qualidade](#utilitários-e-qualidade)
- [Desenvolvimento Local](#desenvolvimento-local)
  - [Pré-requisitos](#pré-requisitos)
  - [Clonando o Repositório](#clonando-o-repositório)
  - [Instalação das Dependências](#instalação-das-dependências)
  - [Configuração do Ambiente](#configuração-do-ambiente)
  - [Executando o Projeto](#executando-o-projeto)
  - [Executando Testes](#executando-testes)
  - [Comandos de Desenvolvimento](#comandos-de-desenvolvimento)
  - [Estrutura de Pastas para Desenvolvimento](#estrutura-de-pastas-para-desenvolvimento)
  - [Solução de Problemas de Desenvolvimento](#solução-de-problemas-de-desenvolvimento)
- [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
- [Métricas de Desenvolvimento](#métricas-de-desenvolvimento)
- [Obtendo Ajuda](#obtendo-ajuda)
- [Funcionalidades PWA](#funcionalidades-pwa)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
  - [O que é uma PWA?](#o-que-é-uma-pwa)
  - [Como Instalar](#como-instalar)
  - [Funcionalidades Offline](#funcionalidades-offline)
  - [Atualizações Automáticas](#atualizações-automáticas)
  - [Configurações Avançadas](#configurações-avançadas)
  - [Compatibilidade](#compatibilidade)
  - [Solução de Problemas](#solução-de-problemas)
  - [Dicas de Uso](#dicas-de-uso)
  - [Utilitários](#utilitários)
- [Arquitetura e Performance](#arquitetura-e-performance)
  - [Considerações de Performance](#considerações-de-performance)
  - [Segurança e Validação](#segurança-e-validação)
- [Sistema de Geração](#sistema-de-geração)
  - [Exemplo de Geração](#exemplo-de-geração)
- [Público-Alvo](#público-alvo)
- [Como Usar](#como-usar)
  - [Acesso Web](#acesso-web)
  - [Instalação como App](#instalação-como-app)

## Funcionalidades

### Geração de Guildas

- **Estrutura física**: Tamanho, características e localização da sede
- **Recursos financeiros**: De débito a abundantes, com modificadores
- **Relações**: Com governo local e população
- **Funcionários**: Tipos, experiência e características especiais
- **Frequentadores**: Movimentação e impacto nos recursos

### Sistema de Contratos

- **Geração automática**: Baseada no tamanho da sede e recursos
- **Valores dinâmicos**: Sistema de experiência e recompensas em ouro
- **Modificadores**: Distância, relações e dificuldade
- **Prazos**: De 1 dia a contratos sem prazo definido

### Serviços da Guilda

- **Tipos variados**: Treinar, recrutar, curar, negociar, construir
- **Contratantes**: Povo, instituições ou governo
- **Pagamentos alternativos**: Animais, terras, favores, mapas

### Membros Contratáveis

- **Níveis de experiência**: Novatos, Iniciados, Sentinelas, Veteranos, Mata-contratos
- **Características únicas**: Equipamentos, defeitos, façanhas
- **Livro de registros**: Sistema de disponibilidade local

### Mural de Avisos

- **Avisos diversos**: Execuções, procurados, eventos, comércio
- **Contratos benevolentes**: Com pagamentos alternativos
- **Divulgações**: Festivais, competições, apresentações

### Sistema de Renome

- **Progressão individual**: Baseada em contratos e serviços concluídos
- **Benefícios escalonados**: Acomodação, itens mágicos, privilégios
- **Títulos**: Novato → Iniciado → Sentinela → Veterano → Mata-contrato

## Stack Tecnológica

### Frontend

- **Framework**: Vue.js 3 com Composition API
- **Build Tool**: Vite para desenvolvimento e build otimizado
- **Linguagem**: TypeScript para tipagem forte
- **Styling**: Tailwind CSS + HeadlessUI para interface moderna
- **Estado**: Pinia para gerenciamento de estado reativo
- **Roteamento**: Vue Router para navegação SPA
- **Ícones**: Heroicons para iconografia consistente
- **Animações**: Vue Transition + CSS Animations

### Utilitários e Qualidade

- **Validação**: Zod para validação de tipos em runtime
- **Formatação**: Prettier para formatação consistente
- **Linting**: ESLint para qualidade de código
- **Testes**: Vitest + Vue Test Utils para testes unitários

## Desenvolvimento Local

### Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18.x ou superior) - [Download](https://nodejs.org/)
- **npm** (vem com Node.js) ou **yarn** (opcional)
- **Git** para controle de versão - [Download](https://git-scm.com/)

Para verificar se tudo está instalado corretamente:

```bash
node --version  # deve retornar v18.x.x ou superior
npm --version   # deve retornar versão do npm
git --version   # deve retornar versão do git
```

### Clonando o Repositório

```bash
# Clone o repositório
git clone https://github.com/vgabrielsoares/tdc-guild-generator.git

# Entre no diretório do projeto
cd tdc-guild-generator

# Mude para a branch de desenvolvimento
git checkout dev
```

### Instalação das Dependências

```bash
# Instalar todas as dependências
npm install

# Ou, se preferir usar yarn
yarn install
```

### Configuração do Ambiente

O projeto não requer variáveis de ambiente específicas para desenvolvimento local. Todas as configurações necessárias já estão incluídas nos arquivos de configuração.

**Arquivos de configuração importantes:**

- `vite.config.ts` - Configuração do Vite e PWA
- `tailwind.config.js` - Configuração do Tailwind CSS
- `tsconfig.json` - Configuração do TypeScript
- `vitest.config.ts` - Configuração dos testes

### Executando o Projeto

#### Desenvolvimento

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# O aplicativo estará disponível em:
# http://localhost:5173
```

O servidor de desenvolvimento oferece:

- ✅ **Hot Module Replacement (HMR)** - Recarregamento instantâneo
- ✅ **TypeScript** em tempo real
- ✅ **Tailwind CSS** com rebuild automático
- ✅ **PWA** funcional em desenvolvimento

#### Build de Produção

```bash
# Compila o projeto para produção
npm run build

# Visualiza o build de produção localmente
npm run preview
```

Os arquivos compilados estarão na pasta `dist/`.

### Executando Testes

```bash
# Executa todos os testes
npm run test

# Executa testes com interface visual
npm run test:ui

# Executa testes com relatório de cobertura
npm run test:coverage

# Executa testes em modo watch (reexecuta ao salvar)
npm run test -- --watch
```

### Comandos de Desenvolvimento

```bash
# Formatação de código
npm run format

# Linting (quando configurado)
npm run lint

# Análise de tipos TypeScript
npx vue-tsc --noEmit

# Análise do bundle de produção
npx vite-bundle-analyzer
```

### Estrutura de Pastas para Desenvolvimento

```
src/
├── components/        # Componentes Vue reutilizáveis
│   ├── common/       # Componentes comuns (dice, toast, etc.)
│   ├── contracts/    # Componentes de contratos
│   ├── guild/        # Componentes da guilda
│   └── ...
├── composables/      # Composables Vue (lógica reutilizável)
├── data/            # Dados estáticos e tabelas de RPG
├── stores/          # Stores Pinia (gerenciamento de estado)
├── types/           # Definições TypeScript
├── utils/           # Utilitários e helpers
├── views/           # Páginas/Views principais
└── tests/           # Testes unitários
```

### Solução de Problemas de Desenvolvimento

#### **Erro de dependências**

```bash
# Limpa cache do npm e reinstala
rm -rf node_modules package-lock.json
npm install
```

#### **Erro de TypeScript**

```bash
# Verifica tipos sem emitir arquivos
npx vue-tsc --noEmit --watch
```

#### **Problemas de PWA em desenvolvimento**

- A PWA funciona melhor após um build (`npm run build` + `npm run preview`)
- Service Workers podem ser limpos em DevTools → Application → Storage

### Workflow de Desenvolvimento

1. **Fork** o repositório (se contribuindo)
2. **Clone** localmente
3. **Crie uma branch** para sua feature: `git checkout -b feature/nova-funcionalidade`
4. **Desenvolva** com testes: `npm run test -- --watch`
5. **Formate** o código: `npm run format`
6. **Teste** a build: `npm run build`
7. **Commit** e **push** suas mudanças
8. **Abra um Pull Request**

### Métricas de Desenvolvimento

- **Bundle size**: Monitore com `npm run build`
- **Performance**: Lighthouse no DevTools
- **Testes**: Cobertura com `npm run test:coverage`
- **Types**: Verificação com `npx vue-tsc --noEmit`

### Obtendo Ajuda

- **Documentação Vue 3**: [vuejs.org](https://vuejs.org/)
- **Documentação Vite**: [vitejs.dev](https://vitejs.dev/)
- **Issues**: [GitHub Issues](https://github.com/vgabrielsoares/tdc-guild-generator/issues)

### Funcionalidades PWA

- **Instalável** em dispositivos móveis e desktop
- **Funcionamento offline** com Service Workers
- **Cache inteligente** de recursos
- **Atualizações automáticas** quando online
- **Acesso rápido** através de ícone na tela inicial

## Progressive Web App (PWA)

O Gerador de Guildas é uma **Progressive Web App**, oferecendo uma experiência nativa em qualquer dispositivo. Isso significa que você pode usar o aplicativo como se fosse um app nativo, com funcionamento offline e acesso rápido.

### O que é uma PWA?

Uma PWA combina o melhor da web com a experiência de aplicativos nativos:

- **Instalável**: Pode ser "instalada" em seu dispositivo sem precisar de app store
- **Offline**: Funciona mesmo sem conexão à internet
- **Rápida**: Carregamento instantâneo após a primeira visita
- **Responsiva**: Adapta-se perfeitamente a qualquer tamanho de tela
- **Atualizada**: Recebe atualizações automaticamente quando online

### Como Instalar

#### **No Desktop (Chrome, Edge, Firefox)**

1. Acesse o aplicativo no navegador
2. Procure pelo ícone de "Instalar" (➕) na barra de endereços
3. Clique em **"Instalar Gerador de Guildas"**
4. O aplicativo será adicionado ao menu Iniciar/Applications

**Ou use o prompt automático:**

- Um banner aparecerá automaticamente oferecendo a instalação
- Clique em **"Instalar"** quando aparecer

#### **No Android (Chrome, Samsung Internet)**

1. Abra o aplicativo no navegador
2. Toque no menu (⋮) e selecione **"Adicionar à tela inicial"**
3. Confirme tocando em **"Adicionar"**
4. O ícone aparecerá na sua tela inicial

**Ou use o prompt automático:**

- Um banner "Adicionar à tela inicial" aparecerá
- Toque em **"Adicionar"**

#### **No iOS (Safari)**

1. Abra o aplicativo no Safari
2. Toque no botão Compartilhar
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Toque em **"Adicionar"** para confirmar

### Funcionalidades Offline

Mesmo sem internet, você pode:

✅ **Visualizar guildas já geradas**  
✅ **Usar contratos salvos em cache**  
✅ **Consultar membros e dados já carregados**  
✅ **Acessar o sistema de renome**  
✅ **Navegar entre todas as seções**

**Indicador de Status**: Um indicador visual mostra quando você está offline

### Atualizações Automáticas

- **Detecção automática**: O app verifica por atualizações quando você vai online
- **Prompt de atualização**: Um aviso aparece quando há uma nova versão
- **Instalação simples**: Clique em "Atualizar" para instalar a nova versão
- **Sem perda de dados**: Seus dados locais são preservados

### Configurações Avançadas

#### **Gerenciamento de Cache**

O aplicativo armazena automaticamente:

- Recursos estáticos (CSS, JS, imagens)
- Dados de guildas geradas
- Configurações do usuário
- Tabelas de RPG

#### **Sincronização de Dados**

- Dados são sincronizados automaticamente quando online
- Mudanças offline são aplicadas na próxima conexão
- Backup automático no navegador

#### **Limpeza de Cache**

Para limpar todos os dados armazenados:

1. Vá em Configurações do navegador
2. Procure por "Dados do site" ou "Armazenamento"
3. Encontre "Gerador de Guildas" e limpe os dados

### Compatibilidade

| Dispositivo    | Navegador       | Instalação  | Offline |
| -------------- | --------------- | ----------- | ------- |
| 💻 **Desktop** | Chrome, Edge    | ✅          | ✅      |
| 💻 **Desktop** | Firefox         | ✅          | ✅      |
| 📱 **Android** | Chrome, Samsung | ✅          | ✅      |
| 🍎 **iOS**     | Safari          | ✅          | ✅      |
| 📱 **Mobile**  | Outros          | ⚠️ Limitado | ✅      |

### Solução de Problemas

#### **"Não consigo instalar o app"**

- Certifique-se de estar usando um navegador compatível
- Verifique se tem espaço suficiente no dispositivo
- Tente atualizar o navegador

#### **"O app não funciona offline"**

- Acesse o app online pelo menos uma vez
- Aguarde o download completo dos recursos
- Verifique se o Service Worker está ativo

#### **"Não recebo atualizações"**

- Conecte-se à internet
- Recarregue a página (F5 ou puxar para baixo)
- Limpe o cache se necessário

### Dicas de Uso

**Para melhor experiência:**

- Instale o app para acesso mais rápido
- Use offline durante sessões de RPG sem internet
- Configure atalhos da tela inicial para funções favoritas
- Mantenha o app atualizado para novos recursos

**Para RPG:**

- Gere guildas antes da sessão (funciona offline)
- Use os atalhos rápidos para acessar contratos e avisos
- Aproveite o modo offline durante jogos sem conexão
- Adeque os resultados às suas campanhas, personalizando as gerações

### Utilitários

- **Sistema de dados robusto** com validação Zod
- **Exportação** para CSV e PDF
- **Persistência IndexedDB** com fallback LocalStorage
- **Sistema de rolagens** simulando dados físicos

## Arquitetura e Performance

### Sistema de Persistência

O aplicativo utiliza uma **arquitetura híbrida de persistência** que garante confiabilidade e compatibilidade:

#### IndexedDB (Primário)

- **Banco de dados no navegador** com alta capacidade de armazenamento
- **Performance otimizada** para grandes volumes de dados
- **Consultas avançadas** e indexação eficiente
- **Transações ACID** garantindo integridade dos dados

#### LocalStorage (Fallback)

- **Compatibilidade universal** com navegadores antigos
- **Fallback automático** quando IndexedDB não está disponível
- **Configurações PWA** (dismissal de prompts) mantidas no LocalStorage

#### Adapters de Storage

- **Abstração unificada** para diferentes tipos de armazenamento
- **Detecção automática** da melhor opção disponível
- **Interface consistente** independente da tecnologia de storage
- **Testes automatizados** para garantir funcionamento em todos os ambientes

#### Serialização de Dados

- **Datas preservadas** com serialização/deserialização especializada
- **Tipos TypeScript** mantidos através de validação Zod
- **Backup automático** e recuperação de dados

### Considerações de Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Virtual Scrolling**: Para listas grandes de contratos/membros
- **Memoização**: Cache de resultados de gerações complexas
- **Web Workers**: Para gerações pesadas em background
- **Chunking**: Divisão do bundle para carregamento otimizado

### Segurança e Validação

- **Zod Schemas**: Validação de tipos em runtime
- **Input Sanitization**: Limpeza de inputs do usuário
- **CSP Headers**: Política de segurança de conteúdo
- **Error Boundaries**: Tratamento de erros em componentes

## Sistema de Geração

O gerador utiliza um sistema complexo de tabelas probabilísticas que considera:

- **Tamanho do assentamento**: Lugarejo → Metrópole
- **Relações sociais**: Impacto nas recompensas e disponibilidade
- **Recursos da guilda**: Modificadores em todas as gerações
- **Características especiais**: Eventos únicos e modificadores especiais

### Exemplo de Geração

1. **Sede**: Uma guilda com sede "Grande" (12m x 12m) em uma Cidadela
2. **Recursos**: Suficientes (+1 em várias tabelas)
3. **Relação com população**: Muito boa (+5 recompensa)
4. **Funcionários**: 1 explorador experiente (+1d4 contratos de exploração)
5. **Resultado**: 2d6+2 contratos e 2d4+1 serviços disponíveis

## Público-Alvo

- **Mestres de RPG** que querem guildas detalhadas rapidamente
- **Jogadores** interessados em sistemas de progressão
- **Criadores de conteúdo** para RPGs medievais
- **Desenvolvedores** interessados em geradores procedurais

## Como Usar

### Acesso Web

🌐 **Acesso Online**: [https://vgabrielsoares.github.io/tdc-guild-generator/](https://vgabrielsoares.github.io/tdc-guild-generator/)

O aplicativo está hospedado no GitHub Pages e funciona imediatamente em qualquer dispositivo! Nenhuma instalação necessária.

### Instalação como App

1. **Desktop**: Clique no ícone ➕ na barra de endereços
2. **Android**: Toque em "Adicionar à tela inicial" quando o banner aparecer
3. **iOS**: Safari → Compartilhar → "Adicionar à Tela de Início"
