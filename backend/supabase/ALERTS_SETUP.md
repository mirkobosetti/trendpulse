# 🔔 Trend Alerts Setup Guide

Guida completa per configurare il sistema di alert automatici per TrendPulse.

---

## 📋 Prerequisites

1. **Supabase CLI** installato globalmente
2. **Resend Account** (opzionale, per email): https://resend.com/signup
3. Progetto Supabase già configurato

---

## 🚀 Step 1: Installa Supabase CLI

```bash
npm install -g supabase
```

Verifica installazione:
```bash
supabase --version
```

---

## 🗄️ Step 2: Applica Migrations al Database

```bash
# Dalla root del progetto
cd backend

# Login a Supabase (se non l'hai già fatto)
supabase login

# Link al tuo progetto (sostituisci con il tuo project ID)
supabase link --project-ref YOUR_PROJECT_REF

# Applica le migrations
supabase db push
```

Questo creerà:
- Colonne `alert_enabled`, `alert_threshold`, `last_check_score`, ecc. in `user_favorites`
- Tabella `alert_logs` per storico notifiche
- Policy RLS per sicurezza

---

## 📧 Step 3: Configura Resend (Email Service)

### 3.1 Crea account Resend
1. Vai su https://resend.com/signup
2. Verifica email
3. Piano FREE: 3,000 email/mese (più che sufficiente)

### 3.2 Ottieni API Key
1. Dashboard → API Keys → Create API Key
2. Nome: `TrendPulse Alerts`
3. Copia la chiave (inizia con `re_...`)

### 3.3 Configura dominio (opzionale ma raccomandato)
Per produzione, configura un dominio personalizzato:
1. Dashboard → Domains → Add Domain
2. Segui istruzioni per DNS records
3. Una volta verificato, puoi inviare da `alerts@tuodominio.com`

**Per sviluppo**: puoi usare `onboarding@resend.dev` (100 email/giorno)

---

## ⚙️ Step 4: Deploy Edge Function

```bash
# Dalla directory backend/supabase
cd supabase

# Deploy la function
supabase functions deploy check-trend-alerts

# Output:
# ✓ check-trend-alerts deployed successfully
# Function URL: https://YOUR_PROJECT.supabase.co/functions/v1/check-trend-alerts
```

---

## 🔐 Step 5: Configura Secrets

Le Edge Functions hanno bisogno di variabili ambiente. Configurale così:

```bash
# Resend API Key (per email)
supabase secrets set RESEND_API_KEY=re_YOUR_RESEND_API_KEY

# Verifica secrets configurati
supabase secrets list
```

**Note:**
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono già disponibili automaticamente
- Se non configuri `RESEND_API_KEY`, gli alert verranno loggati ma non inviate email

---

## ⏰ Step 6: Setup pg_cron (Scheduler)

pg_cron è già incluso in Supabase! Configuralo da SQL Editor:

### 6.1 Vai su Supabase Dashboard
1. Apri il tuo progetto
2. Vai su **SQL Editor** (nel menu laterale)
3. Clicca **New Query**

### 6.2 Crea il Cron Job

Copia e incolla questo SQL:

```sql
-- Enable pg_cron extension (se non già abilitato)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily alerts check at 8:00 AM UTC
SELECT cron.schedule(
  'check-trend-alerts-daily',     -- Nome del job
  '0 8 * * *',                    -- Cron expression: ogni giorno alle 8 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-trend-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    )
  ) AS request_id;
  $$
);
```

**⚠️ IMPORTANTE:**
- Sostituisci `YOUR_PROJECT_REF` con il tuo project ref (es. `abcdefghijklmnop`)
- Sostituisci `YOUR_ANON_KEY` con la tua anon key (trovalo in Settings → API)

### 6.3 Verifica il Cron Job

```sql
-- Mostra tutti i cron jobs attivi
SELECT * FROM cron.job;
```

Dovresti vedere una riga con `check-trend-alerts-daily`.

### 6.4 Testa Manualmente (opzionale)

Prima di aspettare 24h, testa subito:

```sql
-- Esegui immediatamente il job
SELECT cron.run_job('check-trend-alerts-daily');
```

Oppure usa `curl`:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-trend-alerts' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

## 📅 Cron Expressions Reference

Vuoi cambiare la frequenza? Modifica il cron expression:

| Frequenza | Expression | Descrizione |
|-----------|-----------|-------------|
| Ogni giorno alle 8 AM | `0 8 * * *` | Default raccomandato |
| Ogni 6 ore | `0 */6 * * *` | Alle 00:00, 06:00, 12:00, 18:00 |
| Ogni ora | `0 * * * *` | Ogni ora esatta |
| Ogni 30 minuti | `*/30 * * * *` | Per test (sconsigliato in prod) |
| Lunedì-Venerdì alle 9 AM | `0 9 * * 1-5` | Solo giorni lavorativi |

**Note:** Il timezone di pg_cron è UTC. Calcola offset per il tuo fuso orario.

---

## 🧪 Step 7: Test End-to-End

### 7.1 Crea un Alert di Test

1. Vai su TrendPulse frontend: http://localhost:5173
2. Login con un utente
3. Cerca un trend (es. "React")
4. Aggiungi ai favoriti ⭐
5. Vai su Profile → vai nella tab Favorites (da implementare nel frontend)
6. Abilita Alert toggle per "React"
7. Imposta threshold: 10% (basso per test)

### 7.2 Triggera Manualmente

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-trend-alerts' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 7.3 Verifica Logs

#### Nel Supabase Dashboard:
1. Vai su **Edge Functions** → `check-trend-alerts` → **Logs**
2. Dovresti vedere output tipo:
   ```
   🔔 Starting trend alerts check...
   📊 Checking 1 favorites...
   ✅ Checked 1 favorites, sent 0 alerts
   ```

#### Nel database:
```sql
-- Controlla se score è stato aggiornato
SELECT term, alert_enabled, last_check_score, last_check_at
FROM user_favorites
WHERE alert_enabled = true;

-- Controlla alert inviati
SELECT *
FROM alert_logs
ORDER BY sent_at DESC
LIMIT 10;
```

### 7.4 Forza un Alert

Per testare l'invio email, modifica manualmente lo score:

```sql
-- Imposta uno score basso
UPDATE user_favorites
SET last_check_score = 10
WHERE term = 'React' AND alert_enabled = true;

-- Ora ri-triggera la function (lo score reale sarà molto diverso)
```

Dovresti ricevere un'email! 📧

---

## 📊 Monitoring & Debugging

### Visualizza Logs Edge Function

```bash
# Real-time logs
supabase functions logs check-trend-alerts --tail

# Last 100 logs
supabase functions logs check-trend-alerts --limit 100
```

### Queries Utili

```sql
-- Quanti utenti hanno alert attivi?
SELECT COUNT(DISTINCT user_id)
FROM user_favorites
WHERE alert_enabled = true;

-- Top 10 trend più monitorati
SELECT term, COUNT(*) as watchers
FROM user_favorites
WHERE alert_enabled = true
GROUP BY term
ORDER BY watchers DESC
LIMIT 10;

-- Alert inviati oggi
SELECT COUNT(*) as alerts_today
FROM alert_logs
WHERE sent_at >= CURRENT_DATE;

-- Dettaglio ultimi alert
SELECT
  u.email,
  al.term,
  al.old_score,
  al.new_score,
  al.change_percent,
  al.sent_at
FROM alert_logs al
JOIN auth.users u ON u.id = al.user_id
ORDER BY al.sent_at DESC
LIMIT 20;
```

---

## 🛠️ Troubleshooting

### Problem: "Function not found"
**Soluzione:** Assicurati di aver fatto deploy:
```bash
supabase functions deploy check-trend-alerts
```

### Problem: "Unauthorized"
**Soluzione:** Controlla che l'Anon Key sia corretto in pg_cron

### Problem: Email non arrivano
**Soluzioni:**
1. Verifica `RESEND_API_KEY` configurato: `supabase secrets list`
2. Controlla logs Resend Dashboard → Logs
3. Verifica email mittente verificata in Resend
4. Controlla spam folder

### Problem: "Permission denied for table user_favorites"
**Soluzione:** RLS policies mancanti. Riesegui migration:
```bash
supabase db push --force
```

### Problem: Cron job non parte
**Soluzione:**
```sql
-- Verifica cron job esista
SELECT * FROM cron.job WHERE jobname = 'check-trend-alerts-daily';

-- Se non esiste, ricrea
SELECT cron.schedule(...);

-- Verifica pg_cron sia abilitato
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

---

## 💰 Costi Stimati (Free Tier)

| Servizio | Free Tier | Scenario (100 users) |
|----------|-----------|---------------------|
| **Supabase Edge Functions** | 500k invocazioni/mese | ~3k/mese (1 check/giorno) ✅ GRATIS |
| **Supabase Database** | 500 MB | ~10 MB per alert_logs ✅ GRATIS |
| **Resend Email** | 3,000 email/mese | ~100 email/mese ✅ GRATIS |
| **pg_cron** | Incluso in Supabase | N/A ✅ GRATIS |

**Totale: $0/mese** fino a 500+ utenti! 🎉

---

## 🚀 Scaling

Se cresci oltre il free tier:

### 1000+ utenti:
- Supabase Edge: $2 per 1M invocazioni extra
- Resend: $10 per 10k email extra
- **Costo stimato: ~$5-10/mese**

### 10,000+ utenti:
- Considera Supabase Pro ($25/mese, include più risorse)
- Batch email sends per ridurre chiamate
- **Costo stimato: ~$40-60/mese**

---

## ✅ Next Steps

Dopo il setup:
1. ✅ Applica migrations
2. ✅ Deploy Edge Function
3. ✅ Configura pg_cron
4. 🔜 Implementa UI nel frontend (Profile page)
5. 🔜 Testa con utenti reali
6. 🔜 Monitora logs per 1 settimana

---

**Domande?** Controlla logs con `supabase functions logs` o apri un issue! 🙌
