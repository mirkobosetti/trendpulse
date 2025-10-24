# TrendPulse Backend

Backend Node.js + Express per TrendPulse, che fornisce API REST per l'analisi dei trend online.

## Stack Tecnologico

- **Node.js** + **Express** - Server HTTP e routing
- **Supabase** - Database e autenticazione
- **CORS** - Abilitato per frontend locale
- **dotenv** - Gestione variabili ambiente
- **nodemon** - Hot reload in sviluppo

## Struttura Progetto

```
backend/
├── server.js              # Entry point - configura Express e middleware
├── routes/
│   └── trends.js         # Endpoint per i trend (GET /api/trends)
├── services/
│   └── supabaseClient.js # Client Supabase configurato
├── .env.example          # Template variabili ambiente
├── package.json          # Dipendenze e scripts
└── README.md            # Questa documentazione
```

## Setup Iniziale

### 1. Installare le dipendenze

```bash
npm install
```

### 2. Configurare le variabili ambiente

Copia il file `.env.example` in `.env`:

```bash
cp .env.example .env
```

Modifica `.env` con le tue credenziali Supabase:

```env
PORT=5001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Dove trovare le credenziali:**
1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Settings > API
4. Copia `URL` e `service_role key` (⚠️ NON la anon key!)

### 3. Avviare il server

**Sviluppo** (con hot reload):
```bash
npm run dev
```

**Produzione**:
```bash
npm start
```

Il server sarà disponibile su: **http://localhost:5001**

## API Endpoints

### Health Check

```http
GET /
```

Verifica che il server sia attivo.

**Response:**
```json
{
  "message": "TrendPulse API - Backend attivo",
  "version": "1.0.0",
  "endpoints": {
    "trends": "/api/trends?term=keyword"
  }
}
```

### Get Trends

```http
GET /api/trends?term=React
```

Restituisce dati di trend per una keyword.

**Query Parameters:**
- `term` (required) - La keyword da analizzare

**Response Example:**
```json
{
  "term": "React",
  "interest": [
    { "date": "2025-10-01", "score": 78 },
    { "date": "2025-10-02", "score": 82 },
    ...
  ]
}
```

**Note:**
- Al momento restituisce dati **mock** per testing
- I dati coprono gli ultimi 30 giorni
- Score è un valore tra 50-100

## Testing

Testa l'API con curl o nel browser:

```bash
# Health check
curl http://localhost:5001/

# Get trends
curl http://localhost:5001/api/trends?term=React
```

O apri nel browser:
- http://localhost:5001
- http://localhost:5001/api/trends?term=TypeScript

## Prossimi Step

- [ ] Integrare Google Trends API o alternative
- [ ] Salvare dati trend in Supabase
- [ ] Aggiungere autenticazione utenti
- [ ] Implementare caching per ridurre chiamate API
- [ ] Aggiungere rate limiting
- [ ] Deploy su piattaforma cloud (Railway, Render, etc.)

## Scripts Disponibili

- `npm run dev` - Avvia con nodemon (hot reload)
- `npm start` - Avvia in modalità produzione

## Note di Sicurezza

⚠️ **IMPORTANTE:**
- NON committare mai il file `.env`
- La `SERVICE_ROLE_KEY` bypassa le RLS policies
- Usala solo nel backend, mai nel frontend
- Aggiungi `.env` al `.gitignore`

## Troubleshooting

**Il server non si avvia:**
- Verifica che la porta 5001 sia libera: `lsof -i :5001`
- Controlla che le variabili `.env` siano configurate

**Errori Supabase:**
- Verifica le credenziali in `.env`
- Controlla che il progetto Supabase sia attivo

**CORS errors dal frontend:**
- Verifica che il frontend sia su `localhost:5173` o `5174`
- Aggiungi altre porte in `server.js` se necessario
