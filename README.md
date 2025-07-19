# Gerador de Guildas

Um sistema completo para geração procedural de guildas de aventureiros para RPG de mesa. Baseado nas regras e tabelas tradicionais de guildas medievais, este gerador permite criar guildas completas com estrutura, contratos, serviços, membros e sistema de renome.

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
- **Vue.js 3** com Composition API
- **TypeScript** para tipagem forte
- **Tailwind CSS** + HeadlessUI para interface
- **Vite** como ferramenta de build
- **Pinia** para gerenciamento de estado

### Funcionalidades PWA
- **Instalável** em dispositivos móveis
- **Funcionamento offline** com Service Workers
- **Cache inteligente** de recursos

### Utilitários
- **Sistema de dados robusto** com validação Zod
- **Exportação** para CSV e PDF
- **Armazenamento local** para persistência
- **Sistema de rolagens** simulando dados físicos

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