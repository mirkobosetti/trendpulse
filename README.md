# TrendPulse

Una moderna applicazione web per analizzare e visualizzare trend online.

## Struttura Progetto

```
trendpulse/
├── frontend/          # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   └── README.md
│
├── backend/           # Node.js + Express API
│   ├── routes/
│   ├── services/
│   └── README.md
│
└── README.md         # Questo file
```

## Stack Tecnologico

### Frontend
- **React 19** + **TypeScript**
- **Vite** (Rolldown)
- **TailwindCSS v4** - Styling
- **React Router** - Routing
- **Recharts** - Data visualization
- **Supabase Client** - Database & Auth

### Backend
- **Node.js** + **Express**
- **Supabase** - Database & Auth
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables
- **nodemon** - Development hot reload

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Configura le variabili in .env.local
npm run dev
```

Frontend disponibile su: **http://localhost:5173**

Vedi [frontend/README.md](frontend/README.md) per dettagli.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura le variabili in .env
npm run dev
```

Backend disponibile su: **http://localhost:5001**

Vedi [backend/README.md](backend/README.md) per dettagli.

## Configurazione Supabase

Entrambi frontend e backend richiedono credenziali Supabase:

1. Crea un progetto su [Supabase](https://app.supabase.com)
2. Vai in Settings > API
3. Copia le credenziali:
   - **Frontend**: usa la `anon` key
   - **Backend**: usa la `service_role` key

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5001
```

## Endpoints API

### Backend REST API

```http
GET http://localhost:5001/
# Health check

GET http://localhost:5001/api/trends?term=React
# Get trend data for a keyword (mock data per ora)
```

## Features Attuali

- ✅ Frontend responsive con UI pulita
- ✅ Navbar con logo e bottone Login
- ✅ Barra di ricerca per analizzare trend
- ✅ Placeholder per grafici
- ✅ Backend API con endpoint trends
- ✅ Dati mock per testing
- ✅ Supabase configurato (pronto per uso)
- ✅ CORS abilitato per comunicazione frontend-backend

## Roadmap

### Fase 1 - MVP
- [ ] Integrare Google Trends API (o alternative)
- [ ] Visualizzare dati reali con Recharts
- [ ] Salvare ricerche in Supabase
- [ ] Implementare autenticazione utenti

### Fase 2 - Features Avanzate
- [ ] Dashboard personale
- [ ] Confronto tra più trend
- [ ] Esportazione dati (CSV, JSON)
- [ ] Notifiche per trend in crescita
- [ ] Caching per ottimizzare performance

### Fase 3 - Deploy
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Deploy backend (Railway/Render)
- [ ] CI/CD pipeline
- [ ] Monitoring e analytics

## Development

### Avviare entrambi i servizi

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

### Testing

Backend:
```bash
curl http://localhost:5001/api/trends?term=TypeScript
```

Frontend:
Apri http://localhost:5173 nel browser

## Scripts Disponibili

### Frontend
- `npm run dev` - Avvia dev server
- `npm run build` - Build per produzione
- `npm run preview` - Preview build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Avvia con nodemon
- `npm start` - Avvia in produzione

## Troubleshooting

**Porta già in uso:**
- Frontend usa 5173 (o 5174 se occupata)
- Backend usa 5001 (modifica PORT in .env se necessario)

**CORS errors:**
- Verifica che il backend sia avviato
- Controlla le porte configurate in `backend/server.js`

**Supabase errors:**
- Verifica le credenziali in `.env` files
- Assicurati di usare la key corretta (anon vs service_role)

## Contribuire

1. Fork il progetto
2. Crea un branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## License

Private project

## Autore

TrendPulse - Analizza i trend, guida le decisioni 📈
