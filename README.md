# Schedule

Desde 2021 tive uma ideia de um projeto na época de usuários poderem ter um chat de assistente onde eles
podiam pedir para esse assistente interagir com eventos num calendário, mas na época o ChatGPT ainda um sonho e ferramentas como TensorFlow eram difícieis de configurar para algo mais flexível. Hoje, finalmente, consegui fazer esse projeto. Esse projeto serve de estudos para tirar a ferrugem e voltar a praticar com AWS, orquestracao de agentes e integracao entre as peças. A ideia aqui e mais experimentar, montar fluxo local e ir ajustando no caminho do que fazer algo super fechado.

## O que tem aqui

- `app`: frontend em React + Vite
- `Backend`: backend em .NET
- `scheduleOrchestrator`: worker/orquestrador em Node.js
- `localstack`: infra local para brincar com servicos da AWS

## Dependencias

- Node.js 24+
- npm 11.11+
- .NET SDK 10
- Docker / Docker Compose
- chave da OpenAI para a parte do orquestrador

## Como rodar

1. Suba a infra local:

```bash
cd localstack
cp .env.example .env
docker compose up -d
```

2. Suba o banco do orquestrador:

```bash
cd scheduleOrchestrator
cp .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

3. Suba o backend:

```bash
cd Backend
dotnet run --project Backend.Lambda
```

4. Suba o frontend:

```bash
cd app
cp .env.example .env.local
npm install
npm run dev
```

## Observacoes

- O frontend roda no link `http://localhost:5258`
- O worker usa Postgres local, LocalStack e variaveis do `.env`
- Se alguma coisa nao subir de primeira, pode ser devido a setup local ou variável faltando.
