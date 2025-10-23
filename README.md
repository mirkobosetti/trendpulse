# TrendPulse

A modern web app to analyze and visualize online trends.

## Stack

- **React** + **TypeScript** + **Vite**
- **TailwindCSS** for styling
- **Recharts** for data visualization (ready to use)
- **Supabase** for authentication and database
- **React Router** for routing

## Project Structure

```
trendpulse/
├── src/
│   ├── main.tsx              # Entry point with React Router
│   ├── App.tsx               # Main app component
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar with logo and login button
│   │   ├── SearchBar.tsx     # Search input with analyze button
│   │   └── TrendChart.tsx    # Placeholder for trend visualization
│   └── lib/
│       └── supabaseClient.ts # Supabase client configuration
├── .env.example              # Environment variables template
└── tailwind.config.js        # TailwindCSS configuration
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy the example environment file and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project details:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Features

- Clean, responsive UI with light mode
- Search bar to enter topics for analysis
- Placeholder chart component ready for real data integration
- Supabase client configured and ready to use
- React Router configured for future multi-page support

## Next Steps

The app is now ready for you to:

1. Add API integrations to fetch real trend data
2. Implement charts using Recharts with real data
3. Set up Supabase authentication
4. Create database tables and CRUD operations
5. Add more pages and features as needed

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private project
