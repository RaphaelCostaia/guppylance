# GuppyLance — MVP navegável (frontend com mock data)

Plataforma de leilões de Guppys. Estrutura: **Leilão → vários lotes → vários lances**, cada lote com disputa independente.

> Esta etapa é **somente frontend**: sem backend, banco, autenticação, realtime, upload, pagamentos ou APIs externas. Tudo roda com mock data + estado local (recarregar a página volta ao estado inicial).

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

Deploy na Vercel: importar o repositório (framework Vite detectado automaticamente). O `vercel.json` redireciona todas as rotas para `index.html` (SPA). Nenhuma variável de ambiente é necessária.

## Rotas

| Rota | Página |
|---|---|
| `/` | Início (destaques, encerrando em breve, novos) |
| `/leiloes` | Listagem com filtros, busca e ordenação |
| `/leiloes/:id` | Leilão + cards dos lotes |
| `/leiloes/:leilaoId/lotes/:loteId` | Lote: galeria, info, painel de lance, histórico |
| `/meus-lances` | Lotes em que o usuário participa |
| `/leiloes-ganhos` | Lotes arrematados |
| `/perfil` | Perfil (edição local) |
| `/vendedor` | Dashboard do vendedor |
| `/vendedor/meus-leiloes` | Leilões do vendedor |
| `/vendedor/novo-leilao` | Cadastro em 3 etapas (dados → lotes → revisão) |

## Onde está cada coisa

- `src/mocks/` — **todo o mock data** (leilões, lotes, lances, vendedores, usuário demo). Datas são relativas ao carregamento da página.
- `src/types/auction.ts` — modelo de domínio (espelha o futuro backend).
- `src/services/` — camada de dados. **Ponto de troca para o backend**:
  - `auctionService.ts` — leituras (leilões, lotes, histórico, meus lances, ganhos);
  - `bidService.ts` — `simulatePlaceBid` (substituir por `POST /lots/:id/bids`);
  - `sellerService.ts` — estatísticas e `simulatePublishAuction`.
- `src/state/MockDbProvider.tsx` — "banco" em memória + ação de lance simulado.
- `src/lib/time.ts`, `src/hooks/useCountdown.ts` — contador **apenas visual**.
- `src/lib/lotRules.ts` — rótulos de status, próximo lance mínimo e documentação das regras futuras (incl. anti-sniping, ainda em aberto).

## Regras para a arquitetura futura (não implementadas aqui)

- O **servidor** é a autoridade de horário, valida cada lance, define o vencedor e processa lances simultâneos com segurança.
- O navegador apenas exibe o tempo restante; nenhuma regra crítica depende do relógio local.
- Vendedor não pode dar lance no próprio lote; lance respeita o mínimo; sem lances após o encerramento oficial.
- Lote sem lances → `sem_lances`; com lance válido → `vendido`; no máximo um vencedor por lote.
- Decisões em aberto (anti-sniping, encerramento sequencial, proxy bid, reserva, pagamento, frete etc.) **não** foram transformadas em regra.

## Usuário de demonstração

"Rafael Martins" — aparece nos lances como **Participante 08** e é dono da loja **Rafa Guppys** (por isso não pode dar lance nos lotes dela; o painel do vendedor mostra os dados dessa loja).
