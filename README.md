# Gerador de Guildas - Tabuleiro do Caos RPG

[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-cyan.svg)](https://tailwindcss.com/)

Um sistema completo para geração procedural de guildas de aventureiros para RPG de mesa. Baseado em regras e tabelas utilizando rolagem de dados, este gerador permite criar guildas completas com estrutura, contratos, serviços, membros e sistema de renome.

A base inicial das regras de geração procedural do projeto foi inspirada nas tabelas criadas por [Pato Papão](https://www.youtube.com/user/PatoPapao), seu conteúdo foi disponibilizado diretamente por ele. As tabelas foram expandidas e modificadas para incluir regras mais específicas e se adequar a gostos pessoais. Fica aqui meu agradecimento ao Pato Papão por sua contribuição para a comunidade de RPG.

Apesar dos resultados das geraçõess, no geral, serem genéricos o bastante para serem usados em qualquer cenário de RPG medieval, alguns detalhes do conteúdo foram feitos visando o sistema Tabuleiro do Caos RPG, de autoria própria. Então certifique-se de adaptar o que for necessário para o seu estilo de jogo.

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
2. Toque no botão Compartilhar (📤)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Toque em **"Adicionar"** para confirmar

### 🔧 Funcionalidades Offline

Mesmo sem internet, você pode:

✅ **Visualizar guildas já geradas**  
✅ **Usar contratos salvos em cache**  
✅ **Consultar membros e dados já carregados**  
✅ **Acessar o sistema de renome**  
✅ **Navegar entre todas as seções**  

**📡 Indicador de Status**: Um indicador visual mostra quando você está offline

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

| Dispositivo | Navegador | Instalação | Offline |
|-------------|-----------|------------|---------|
| 💻 **Desktop** | Chrome, Edge | ✅ | ✅ |
| 💻 **Desktop** | Firefox | ✅ | ✅ |
| 📱 **Android** | Chrome, Samsung | ✅ | ✅ |
| 🍎 **iOS** | Safari | ✅ | ✅ |
| 📱 **Mobile** | Outros | ⚠️ Limitado | ✅ |

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
- **Armazenamento local** para persistência
- **Sistema de rolagens** simulando dados físicos

## Arquitetura e Performance

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

##  Público-Alvo

- **Mestres de RPG** que querem guildas detalhadas rapidamente
- **Jogadores** interessados em sistemas de progressão
- **Criadores de conteúdo** para RPGs medievais
- **Desenvolvedores** interessados em geradores procedurais

## Como Usar

### Acesso Web
Simplesmente acesse o aplicativo no seu navegador - funciona imediatamente em qualquer dispositivo!

### Instalação como App
1. **Desktop**: Clique no ícone ➕ na barra de endereços
2. **Android**: Toque em "Adicionar à tela inicial" quando o banner aparecer
3. **iOS**: Safari → Compartilhar → "Adicionar à Tela de Início"
