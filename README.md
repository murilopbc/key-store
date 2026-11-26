# 🔑 Loja de Chaves — App do Vendedor

Aplicativo mobile (React Native + Expo SDK 57) de uso interno para gestão de uma loja de chaves:
produtos, estoque, vendas (PDV), histórico, relatórios, notificações e perfil.

**Stack:** Expo Router · NativeWind · expo-sqlite · Firebase Authentication · expo-camera ·
expo-local-authentication · expo-notifications · @expo/vector-icons (Ionicons) · BrasilAPI · TypeScript.

Segue a **mesma arquitetura do projeto piloto** (Aulas 1–6):

```
app/                  → TELAS: só desenham (Expo Router, 1 arquivo = 1 rota)
src/hooks/            → HOOKS: decidem (estado, filtros, loading, regras)
src/contexts/         → CONTEXT: estado compartilhado (Auth, Security)
src/database/         → REPOSITÓRIOS: único lugar que conhece SQL
src/services/         → SERVIÇOS: mundo externo (Firebase, biometria, push, arquivos)
src/components/       → COMPONENTES reutilizáveis com props tipadas (Card, Button, Icon...)
src/theme.ts          → CORES usadas fora do className (ícones, header, placeholders)
src/types/            → INTERFACES TypeScript (o "contrato" dos dados)
src/utils/            → funções puras (formatação, datas, buckets de relatório)
```

> **A tela desenha. O hook decide. O repositório persiste.**

## Como rodar

```bash
npm install --legacy-peer-deps
cp .env.example .env        # preencha com as chaves do Firebase (veja abaixo)
npx expo start -c           # -c sempre que mexer em .env, babel ou metro
```

Abra o **Expo Go** no celular e escaneie o QR Code (`--tunnel` se a rede bloquear; no Windows veja
"Problemas comuns" sobre o `@expo/ngrok`).
Use **aparelho físico**: câmera, biometria e notificações não funcionam direito em emulador.

### Configurar o Firebase (ETAPA 21)

1. https://console.firebase.google.com → **Adicionar projeto** (sem Analytics).
2. **Authentication → Vamos começar → Sign-in method → E-mail/senha → Ativar**.
3. **Configurações do projeto → Seus aplicativos → ícone `</>` (Web)** → registre e copie o `firebaseConfig`.
4. Cole os valores no `.env` (prefixo `EXPO_PUBLIC_` é obrigatório). **O `.env` não vai para o Git.**

### Primeiro teste rápido
1. Crie uma conta → entra direto na Home.
2. Ícone de **Perfil** (canto superior direito) → **Carregar produtos de exemplo**.
3. Perfil → **Dados da loja** → digite um CNPJ → **Buscar dados pelo CNPJ** → **Salvar perfil**.
4. Home → **Nova venda** → toque nos produtos da lista (a busca só filtra) → ajuste quantidades no
   carrinho fixo embaixo → **Finalizar venda** → veja o estoque baixar e o alerta de estoque baixo aparecer.
5. No detalhe da venda, **Compartilhar recibo**: o cabeçalho traz CNPJ, endereço e telefone da loja.

## Telas × requisitos do trabalho

| Tela (arquivo) | Requisito | Recurso nativo |
|---|---|---|
| `login.tsx`, `register.tsx` | 2.1 Login/cadastro (Firebase) | — |
| `lock.tsx` + `SecurityContext` | 2.1 Biometria + fallback por senha | **Biometria** |
| `index.tsx` | 2.2 Dashboard: Nova venda em destaque, vendido hoje, nº de vendas, estoque baixo, atalhos | Câmera (Escanear) |
| `produto-form.tsx` | 2.3 Cadastro/edição de produto | **Câmera** + **Leitor de código** |
| `produto.tsx` | 2.3/2.4 Detalhe, entrada/saída de estoque, excluir | — |
| `estoque.tsx` | 2.4 Lista com busca, filtros e entrada por código | **Leitor de código** |
| `venda.tsx` | 2.5 PDV: lista de produtos com estoque + busca/scan, carrinho fixo com quantidade, desconto, pagamento, baixa automática | **Leitor de código** |
| `venda-detalhe.tsx` | 2.5/2.6 Recibo (compartilhar), cancelar/estornar | **Share** (WhatsApp) |
| `historico.tsx` | 2.6 Vendas por período | — |
| `relatorios.tsx` | 2.7 Por dia/semana/mês, mais vendidos, lucro, gráfico | — |
| `notificacoes.tsx` | 2.8 Lista de alertas | **Notificações** |
| `profile.tsx` | 2.9 Dados, foto, biometria, trocar senha · dados da loja pelo CNPJ | Câmera frontal, Biometria, **API externa** |

### Integração com API externa: BrasilAPI (consulta de CNPJ)

No **Perfil → Dados da loja**, o vendedor digita o CNPJ e toca em **Buscar dados pelo CNPJ**. O app consulta
`GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}` (gratuita, sem chave) e preenche nome da loja, razão social,
endereço e telefone. Esses dados saem no cabeçalho do **recibo** compartilhado.

| Camada | Arquivo | Papel |
|---|---|---|
| Serviço | `src/services/brasilApi.ts` | Chamada HTTP, tempo limite de 10 s, tradução da resposta e dos erros (404, 400, 429, sem internet) |
| Hook | `src/hooks/useCnpjLookup.ts` | Valida o CNPJ antes de chamar a API; controla `loading` e `error` |
| Utilitário | `src/utils/cnpj.ts` | Limpar, validar dígitos verificadores e aplicar máscara |
| Banco | `src/database/database.ts` | Colunas `cnpj`, `legalName`, `address`, `phone` em `profile` (com `ALTER TABLE` para bancos antigos) |

- **Offline continua funcionando:** sem internet, aparece o aviso e os campos podem ser preenchidos à mão.
- **CNPJ inativo** (baixado, inapto...): os dados são preenchidos, mas o app avisa a situação na Receita.
- **User-Agent próprio:** a BrasilAPI fica atrás do Cloudflare, que recusa alguns User-Agents genéricos; o app se identifica como `LojaDeChaves/1.0`.

### Decisões que valem na defesa
- **Baixa de estoque transacional:** `createSale` grava venda, itens e baixa dentro de **uma transação**; se faltar estoque em qualquer item, nada é gravado (`UPDATE ... WHERE quantity >= ?`).
- **Lucro correto:** cada `sale_item` guarda `unitCost` e `productName` no momento da venda; editar ou excluir o produto depois não altera o histórico.
- **Estorno:** cancelar uma venda devolve os itens ao estoque (transação) e a tira dos relatórios.
- **Biometria só desbloqueia** uma sessão já autenticada no Firebase; não substitui o login. Fallback: "Entrar com senha". Re-trava após 30 s em segundo plano.
- **Permissões com 3 estados** (verificando / negada / liberada) na câmera e no scanner, com `Linking.openSettings()` quando negada em definitivo.
- **Foto permanente:** a foto da câmera é copiada do cache para `Paths.document` antes de salvar o `uri` no banco.
- **SQL seguro:** todas as consultas com valores usam `?` (sem SQL Injection).
- **Senha nunca no aparelho:** autenticação é 100% Firebase; o SQLite guarda só dados da loja.
- **Offline:** o app inteiro (produtos, vendas, relatórios) funciona sem internet, pois os dados estão no SQLite. Só login/cadastro e e-mail de senha precisam de rede (a sessão fica salva).

## Mapa das ETAPAS do professor

| Etapas | Onde está |
|---|---|
| 1–2 | Projeto criado com `create-expo-app ... blank-typescript@sdk-57` e dependências no `package.json` |
| 3–4 | `app.json` (`scheme`), `package.json` (`main`), `global.css`, `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `nativewind-env.d.ts` |
| 5–7 | `src/types/*`, `src/database/database.ts`, `src/database/*Repository.ts` |
| 8–11 | `src/hooks/*`, `src/components/*`, telas em `app/` |
| 12–19 | Câmera + arquivos: `CameraCapture`, `fileService`, perfil (`profile.tsx`) |
| 20–30 | Firebase: `.env`, `firebaseConfig.ts`, `useAuth`, `AuthContext`, proteção de rotas no `_layout.tsx`, `login`, `register`, logout |

## Interface

Paleta fixa clara: **latão** (`amber-700`, a cor de uma chave) sobre **ardósia** (`slate-800` no header,
login e bloqueio), com fundo `stone-100` para os cards brancos se destacarem.

| Componente | Papel |
|---|---|
| `Card` | Superfície padrão (borda + sombra leve). Cor por `tone`: `default`, `highlight`, `danger` |
| `Icon` | Ícones vetoriais Ionicons: iguais no Android e no iPhone (no lugar de emojis) |
| `IconButton` | Botão quadrado só com ícone (escanear, apagar), da altura dos campos |
| `Button` | Primário, secundário ou perigo, com ícone opcional |
| `FormField` | Rótulo + campo; borda âmbar com foco, vermelha com erro, cinza quando somente leitura |
| `SectionTitle` | Título de seção com texto auxiliar à direita |
| `StatCard`, `ProductItem`, `FilterBar`, `EmptyState`, `BarChart` | Blocos das telas |

- **Cores que competem no NativeWind:** duas classes do mesmo tipo (ex.: `bg-white` e `bg-amber-50`)
  no mesmo `className` não têm ordem garantida. Por isso o `Card` recebe a cor por `tone`, e não por classe extra.
- Cores usadas fora do `className` (ícones, header, `ActivityIndicator`) ficam em `src/theme.ts`.

## O que ficou de fora (opcionais do enunciado)

- **Impressão Bluetooth** e **GPS/clientes** (itens "opcional" 2.5 e 2.10). O recibo é compartilhado por texto (WhatsApp/e-mail).
- **Tema claro/escuro** (2.9): paleta fixa clara.
- **Push remoto real:** no Expo Go (Android) o push remoto não funciona desde o SDK 53. O app usa **notificações locais** (disparadas por estoque baixo) e já tem `registerForPushToken()` em `notificationService.ts`, que funciona num *development build* (`eas build --profile development`) com `projectId` do EAS.
- **Login com Google** (ETAPA 25/31 do piloto): o enunciado pede usuário e senha, então foi omitido.

## Problemas comuns

| Sintoma | Causa |
|---|---|
| `className` sem efeito | Faltou `import '../global.css'` (1ª linha do `_layout`) ou rodar `npx expo start -c` |
| `auth/invalid-api-key` | `.env` ausente/sem prefixo `EXPO_PUBLIC_` ou faltou reiniciar com `-c` |
| `Cannot find module 'react-native-reanimated/plugin'` | `npx expo install react-native-reanimated react-native-worklets` (já incluídos) |
| Tabela ou coluna nova não existe | O `CREATE TABLE IF NOT EXISTS` não migra tabela existente: colunas novas precisam de `ALTER TABLE` (veja `addMissingColumns` em `database.ts`); em último caso, desinstale o app do Expo Go |
| `Cannot find native module 'ExpoTopicSubscriptionModule'` | O Expo Go não traz o módulo de notificações. O app já carrega `expo-notifications` de forma segura e segue sem ele; para notificações do sistema use um development build |
| Loop de navegação | Usar `push` no lugar de `replace` nos redirecionamentos do `_layout` |
| Tela preta na câmera | Permissão negada: o componente já trata; confira os ajustes do aparelho |
| `--tunnel` no Windows: `CommandError: Install @expo/ngrok@^4.1.0 and try again` mesmo após instalar | O Expo procura pacotes globais em pastas de Linux/Mac. No PowerShell, rode `$env:NODE_PATH = "$env:APPDATA\npm\node_modules"` e depois `npx expo start -c --tunnel` |
| Ícones aparecem como quadrados ou o app fecha num build instalado | Faltou `expo-font` (dependência do `@expo/vector-icons`); `npx expo install expo-font` |
| Cor de um card não muda | Duas classes de cor concorrentes no mesmo `className`; use o `tone` do `Card` |
| Consulta de CNPJ dá erro 403/429 | A BrasilAPI (Cloudflare) recusou o User-Agent ou houve muitas consultas seguidas; o app envia `LojaDeChaves/1.0` — aguarde um minuto e tente de novo |

## Verificações já feitas
`npx tsc --noEmit` sem erros · `npx expo export --platform android` gera o bundle · `npx expo-doctor` 21/21 ·
lógica de relatórios e formatação testada · consulta de CNPJ testada contra a BrasilAPI real (CNPJ ativo, baixado,
inexistente e sem internet).
