# Demo Datadog + AWS + Mongo (sem integração AWS)

Este template replica a arquitetura do cliente:

- React SPA (rotas 100% client-side)
- Frontend chama API Gateway direto
- Backend em AWS Lambda
- MongoDB (Atlas)
- Logs, métricas e traces enviados ao Datadog **via Lambda Extension** (sem integração AWS)

## Pré‑requisitos

- AWS CLI configurado (`aws configure`)
- AWS SAM CLI instalado
- Node.js 18+ (frontend)
- Python 3.12+ e pip (backend)
- Conta Datadog com API Key
- Conta MongoDB Atlas

---

# 1) MongoDB (Atlas)

1. Crie um projeto e um cluster **Shared M0** no MongoDB Atlas.
2. Crie um usuário:
   - user: `demo_user`
   - pass: `demo_pass`
3. Libere acesso em Network Access:
   - Para demo: `0.0.0.0/0`
4. Crie DB `demo` e coleção `products`.
5. Insira dados:
```json
{ "name": "Notebook", "price": 3200 }
{ "name": "Teclado", "price": 250 }
{ "name": "Mouse", "price": 120 }
```
6. Copie a connection string (driver Python na tela “Connect your application”):
```
mongodb+srv://demo_user:demo_pass@cluster0.xxx.mongodb.net/demo?retryWrites=true&w=majority
```

---

# 2) Datadog (sem integração AWS)

1. Crie uma **API Key** em `Organization Settings → API Keys`.
2. Guarde:
   - `DD_API_KEY`
   - `DD_SITE` (ex: `datadoghq.com`)
3. Pegue o **ARN da Datadog Lambda Extension** para sua região:
   - Datadog docs → “Lambda Extension Layer ARN”
4. Não instale a integração AWS (não usar Forwarder / CloudWatch integration).

---

# 2.1 MongoDB DBM (metricas e queries)

Para ver **DBM** (Database Monitoring) do Mongo, e necessario um **Datadog Agent**
rodando em uma maquina que consiga acessar o cluster. Em Atlas, use uma EC2
pequena na mesma regiao e libere o IP no Atlas.

Passo a passo resumido:
1. Crie uma EC2 Linux (t2.micro) na mesma regiao do Atlas.
2. Instale o Datadog Agent na EC2.
3. Configure o arquivo `conf.d/mongo.d/conf.yaml` com:
```
instances:
  - hosts:
      - "mongodb+srv://USER:PASS@clusteromie.xxxxx.mongodb.net/?appName=ClusterOmie"
    username: "USER"
    password: "PASS"
    dbm: true
```
4. No Atlas, crie um usuario com permissao `clusterMonitor` (ou `readAnyDatabase`).
5. Reinicie o Agent.

Isso habilita metricas de banco e queries no Datadog (DBM).

---

# 3) AWS (backend com SAM - Python)

## 3.1 Ajustar parâmetros do SAM

Edite `backend/template.yaml` e preencha:
- `DatadogExtensionLayerArn`
- `MongoUri`
- `MongoDbName`
- `DD_API_KEY` via `sam deploy --guided`

## 3.2 Dependências do backend (Python)

O `sam build` instala automaticamente as dependências a partir do
`backend/src/requirements.txt`.

## 3.3 Build e deploy com SAM (publica as Lambdas na AWS)

```bash
cd backend
sam build
sam deploy --guided
```

Durante o `--guided`, informe:
- `Stack Name` (ex: `dd-demo`)
- `Region` (ex: `us-east-1`)
- `DatadogExtensionLayerArn`
- `MongoUri`
- `MongoDbName`
- `DD_API_KEY`

No final, o output traz a URL do API Gateway (as Lambdas ja estao publicadas e conectadas):
```
ApiUrl = https://xxxx.execute-api.us-east-1.amazonaws.com
```

---

# 4) Frontend (React SPA)

## 4.1 Instalar dependências
```bash
cd frontend
npm install
```

## 4.2 Configurar API base e RUM

Crie `.env`:
```
VITE_API_BASE_URL=https://xxxx.execute-api.us-east-1.amazonaws.com
VITE_DD_RUM_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_DD_RUM_CLIENT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_DD_SITE=datadoghq.com
VITE_DD_SERVICE=frontend-spa
VITE_DD_ENV=demo
VITE_DD_VERSION=1
VITE_DD_RUM_REPLAY=true
VITE_DD_RUM_REPLAY_SAMPLE_RATE=100
```

No Datadog:
1. `UX Monitoring → RUM Applications`
2. `New Application`
3. Tipo: `Browser`
4. Copie `Application ID` e `Client Token`
5. Cole no `.env` acima

Session Replay:
- Mantenha `VITE_DD_RUM_REPLAY=true` para habilitar.
- Ajuste `VITE_DD_RUM_REPLAY_SAMPLE_RATE` (0 a 100).

## 4.3 Rodar local
```bash
npm run dev
```

## 4.4 Build e deploy no S3 + CloudFront

```bash
npm run build
```

### S3
1. Crie bucket S3 (ex: `dd-demo-frontend`)
2. Habilite **Static Website Hosting**
3. Suba o build:
```bash
aws s3 sync dist s3://dd-demo-frontend
```

### CloudFront (opcional)
1. Crie uma distribuição apontando para o bucket
2. Configure “Default Root Object” = `index.html`
3. Configure erro 403/404 para retornar `index.html` (SPA)

---

# 5) O que aparece no Datadog

- Traces: Front → API Gateway → Lambda → MongoDB
- Spans do Mongo (find/insert)
- Logs das Lambdas enviados direto (sem integração AWS)
- Logs correlacionados com trace_id

---

# 6) Observações importantes (custo CloudWatch)

Mesmo sem integração, o CloudWatch continua recebendo logs da Lambda.
Para reduzir custo:

- Reduza retention (3–7 dias)
- Remova logs excessivos
- Evite duplicar pipelines (sem Forwarder)

