# Schedule Orchestrator

Lambda worker for schedule events and chat requests.

## Local setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
```

## Melhorias futuras

- Concorrencia no consumo: o deploy de varias instancias do `scheduleOrchestrator` pode gerar disputa no processamento dos eventos.
- Ordem dos eventos: uma `EntryOccurrence` pode chegar antes da `Entry` pai, causando falha de persistencia e envio do evento para a `DLQ`.
- Publicacao confiavel de eventos: o ideal e o backend persistir os eventos no banco e um worker/background job publicar depois no `EventBridge` usando um padrao de outbox.
