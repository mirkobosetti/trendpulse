# TrendPulse - Next Features to Implement

## Medium Features (3-5 hours each) 🛠️

### 7. **Trend Alerts** 🔔 ✅ IMPLEMENTED

**Value**: High - notify users when favorite trend changes
**Complexity**: High
**Status**: ✅ Backend completo, manca solo UI frontend

**What's done**:
- ✅ Database migration con colonne alert (alert_enabled, threshold, ecc.)
- ✅ Tabella alert_logs per storico notifiche
- ✅ Supabase Edge Function per check automatici
- ✅ Email HTML template con Resend
- ✅ RLS policies per sicurezza
- ✅ Documentazione completa setup

**Tech Stack**:
- ✅ Supabase Edge Functions (Deno/TypeScript)
- ✅ pg_cron per scheduler (free, incluso in Supabase)
- ✅ Resend per email (3k gratis/mese)
- ✅ Alert logs in PostgreSQL

**Setup**:
```bash
# Quick setup
cd backend/supabase
./ALERTS_QUICKSTART.sh

# Or manual (full guide in ALERTS_SETUP.md)
supabase db push
supabase functions deploy check-trend-alerts
supabase secrets set RESEND_API_KEY=re_your_key
```

**TODO Frontend** (1-2 ore):
- [ ] Aggiungere tab "Alerts" in Profile page
- [ ] Toggle per abilitare alert su ogni favorite
- [ ] Slider per threshold (default 20%)
- [ ] Dropdown per frequenza (daily/6h/hourly)
- [ ] Mostra ultimi alert ricevuti (da alert_logs)

**Costi**: $0/mese fino a 500+ utenti (tutto free tier) 🎉

---

### 8. **User Profile & Settings** ⚙️

**Value**: Medium - manage account preferences
**Complexity**: Medium
**What to build**:

- Profile page showing email, created date
- Settings: notification preferences, theme (dark mode)
- Change password functionality

---

### 9. **Share Trends** 📤

**Value**: Medium - share charts on social media
**Complexity**: Medium
**What to build**:

- "Share" button generates unique URL with search params
- Open Graph meta tags for preview
- Twitter/LinkedIn share buttons
- Optional: Generate image of chart for sharing

---

## Advanced Features (5+ hours) 🚀

### 10. **AI Trend Insights** 🤖

**Value**: Very High - differentiate from competitors
**Complexity**: High
**What to build**:

- Use OpenAI API to generate insights about trends
- "Why is this trending?" analysis
- Predictions for next 7-14 days
- Store in `trend_insights` table

**Tech Stack**:

- OpenAI API (GPT-4) for text insights
- TensorFlow.js for simple forecasting
- Display insights card below chart

**Cost**: ~$0.002 per insight with GPT-3.5

---

### 11. **Real-time Collaboration** 👥

**Value**: Medium - teams can share workspaces
**Complexity**: Very High
**What to build**:

- Create "workspaces" that multiple users can join
- Real-time updates when team member searches
- Comments on specific trends

**Tech Stack**:

- Supabase Realtime subscriptions
- WebSockets for live updates
- Shared workspace table in database

---

### 12. **Better Google Trends Integration** 🔌

**Value**: Critical - current API is unreliable
**Complexity**: Medium
**Options**:

**A) Switch to SerpAPI** (Recommended)

- **Cost**: $50/month for 5000 searches
- **Reliability**: 99.9% uptime, official Google partner
- **Implementation**: 1-2 hours (similar API structure)
- **Signup**: https://serpapi.com/

**B) Use Apify Google Trends Actor**

- **Cost**: Pay per request (~$0.001 per search)
- **Implementation**: 2-3 hours

**C) Build own scraper**

- **Cost**: Free but risky (can be blocked)
- **Maintenance**: High
- **Not recommended**

---
