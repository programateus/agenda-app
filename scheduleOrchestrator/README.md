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

##

Possíveis problemas:

Deploy de várias instancias do scheduleOrchestrator pode gerar problemas de concorrência no consumo dos eventos.
