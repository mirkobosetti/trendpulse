# TrendPulse Database Management

Sistema completo di gestione database per TrendPulse usando Supabase CLI.

## Prerequisiti

1. **Supabase CLI installato** (già incluso come dev dependency)
2. **Account Supabase** e progetto creato
3. **Autenticazione** effettuata

## Setup Iniziale

### 1. Login a Supabase

```bash
npm run supabase:login
```

Questo aprirà il browser per autenticarti con Supabase.

### 2. Link al Progetto

```bash
npm run supabase:link
```

Questo collega la tua directory locale al progetto Supabase remoto.

**Nota:** Il project-ref è già configurato in `package.json` (`eynsjarxevdieopcaoir`).

## Comandi Disponibili

### 🔄 Gestione Migrazioni

#### Creare una nuova migrazione

```bash
npm run db:migrate:new <nome_migrazione>
```

Esempio:
```bash
npm run db:migrate:new add_users_table
```

Questo creerà un file in `supabase/migrations/` con timestamp.

#### Applicare le migrazioni

```bash
npm run db:push
```

Applica tutte le migrazioni pendenti al database remoto.

#### Vedere lo stato delle migrazioni

```bash
npm run db:status
```

Mostra quali migrazioni sono state applicate e quali sono pendenti.

### 🔃 Reset Database

```bash
npm run db:reset
```

**⚠️ ATTENZIONE:** Questo comando:
1. Droppa TUTTE le tabelle
2. Riapplica TUTTE le migrazioni dall'inizio
3. Esegue automaticamente `supabase/seed.sql` se presente

Usa solo in sviluppo!

### 📊 Generare TypeScript Types

```bash
npm run supabase:types
```

Genera automaticamente i types TypeScript dal tuo schema database e li salva in `database/types.ts`.

Esegui questo comando ogni volta che:
- Aggiungi/modifichi tabelle
- Cambi colonne
- Aggiungi relazioni

## Struttura File

```
backend/
├── database/
│   ├── types.ts              # Types TypeScript generati automaticamente
│   └── README.md            # Questa documentazione
│
├── supabase/
│   ├── migrations/
│   │   └── YYYYMMDDHHMMSS_nome.sql  # Migrazioni SQL
│   ├── seed.sql              # Dati di seed
│   ├── config.toml          # Configurazione Supabase
│   └── .gitignore           # Gitignore per Supabase
│
└── package.json             # Scripts npm
```

## Workflow Tipico

### 1. Setup Progetto (prima volta)

```bash
# Login (una volta sola)
npm run supabase:login

# Link al progetto (una volta sola)
npm run supabase:link
```

### 2. Sviluppo Database

```bash
# 1. Crea nuova migrazione
npm run db:migrate:new add_feature_x

# 2. Modifica il file SQL creato in supabase/migrations/

# 3. Applica al database remoto
npm run db:push

# 4. Genera TypeScript types aggiornati
npm run supabase:types
```

### 3. Reset Database (sviluppo)

```bash
# Resetta completamente il DB e riapplica tutto
npm run db:reset
```

## Migrazioni Esistenti

### `20250124000001_create_trends_table.sql`

Crea la tabella `trends` con:

**Columns:**
- `id` (UUID, PK) - Identificatore unico
- `term` (VARCHAR) - Keyword tracciata
- `search_date` (DATE) - Data del dato trend
- `interest_score` (INTEGER) - Score 0-100
- `created_at` (TIMESTAMP) - Data creazione
- `updated_at` (TIMESTAMP) - Data ultimo update

**Features:**
- Indexes per performance (term, search_date, combinati)
- Row Level Security (RLS) abilitato
- Policies per read pubblico, write autenticato
- Trigger automatico per `updated_at`

## Seed Data

Il file `supabase/seed.sql` popola il database con:

- **30 giorni** di dati trend per "React"
- **30 giorni** di dati trend per "TypeScript"
- **15 giorni** di dati trend per "Vue"

Viene eseguito automaticamente con `npm run db:reset`.

## Database Types

Il file `database/types.ts` contiene i types TypeScript del database.

**Uso nei servizi:**

```typescript
import { Database } from './database/types'

type Trend = Database['public']['Tables']['trends']['Row']
type TrendInsert = Database['public']['Tables']['trends']['Insert']
type TrendUpdate = Database['public']['Tables']['trends']['Update']
```

**IMPORTANTE:** Non modificare `types.ts` manualmente - viene rigenerato da `supabase:types`.

## Troubleshooting

### "Project not linked"

```bash
npm run supabase:link
```

### "Unauthorized"

```bash
npm run supabase:login
```

### Vedere le migrazioni applicate

```bash
npm run db:status
```

### Reset completo in caso di problemi

```bash
# ⚠️ Questo cancella TUTTO
npm run db:reset
```

## Best Practices

1. **Sempre creare migrazioni** - Mai modificare il DB manualmente dal portale
2. **Mai cancellare migrazioni** - Crea nuove migrazioni per modifiche
3. **Testare le migrazioni** - Usa `db:reset` in locale prima di pushare
4. **Generare types** - Dopo ogni modifica schema, rigenera i types
5. **Commit migrazioni** - Le migrazioni vanno in Git, non il seed

## Riferimenti

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Migrations Guide](https://supabase.com/docs/guides/cli/local-development)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
