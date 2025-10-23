Crea un progetto React chiamato "TrendPulse" con il minimo indispensabile per una web app moderna che analizzi trend online.

🎯 Obiettivo
Generare una base _funzionante ma minimale_, da cui partire per sviluppare un'app che mostri trend in grafici e salvi ricerche su Supabase.

🧱 Struttura generale

- frontend React (Vite)
- integrazione con Supabase (auth + CRUD base)
- una sola pagina di ricerca con input e pulsante
- nessuna logica di trend ancora, solo struttura vuota

⚙️ Stack

- React + Vite + TailwindCSS + shadcn/ui
- Libreria per grafici già installata (Recharts o Chart.js)
- Supabase JS client configurato con variabili env (.env.local)
- Routing semplice (React Router)

📂 Cartelle richieste (occhio che devono essere ts)
trendpulse/
├── src/
│ ├── main.jsx
│ ├── App.jsx
│ ├── components/
│ │ ├── SearchBar.jsx
│ │ ├── TrendChart.jsx (vuoto con placeholder)
│ │ └── Navbar.jsx
│ └── lib/
│ └── supabaseClient.js
├── .env.example
├── package.json
└── tailwind.config.js

📜 Requisiti

- `SearchBar.jsx`: campo di input + pulsante "Analyze"
- `TrendChart.jsx`: div placeholder "Trend chart will appear here"
- `Navbar.jsx`: logo “TrendPulse” + pulsante "Login"
- `supabaseClient.js`: con `createClient()` pronto e key/env variabili da file .env
- `.env.example`: includi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

💄 UI

- Minimal, responsive, light mode
- Usa componenti shadcn/ui per pulsanti e input
- Aggiungi Tailwind preconfigurato

💬 Non aggiungere logica AI, API o 3D — solo struttura, import corretti e setup pronto all’uso.

🧩 Obiettivo finale
Alla fine voglio poter:

1. eseguire `npm install` e `npm run dev`
2. vedere una pagina base con navbar, campo ricerca e un box vuoto per il grafico
3. essere pronto ad aggiungere in seguito fetch dei dati e grafici reali
