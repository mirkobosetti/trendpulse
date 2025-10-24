# TrendPulse - Complete Feature List

## Implemented Features

### 1. Authentication (Supabase Auth)
- **Sign Up / Sign In**: Modal-based authentication UI
- **Email/Password authentication**: Secure user registration and login
- **Session management**: Automatic session handling with Supabase
- **Protected routes**: Favorites page requires authentication
- **User display**: Show logged-in user email in navbar
- **Sign out**: One-click logout

### 2. User Favorites
- **Add to favorites**: Star icon on trend charts (authenticated users only)
- **Remove from favorites**: Toggle star to remove
- **Favorites page**: Dedicated page showing all saved searches
- **Quick search from favorites**: Click any favorite to search it again
- **Real-time status**: Check if current term is already favorited

**Backend Endpoints**:
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove favorite
- `GET /api/favorites/check/:term` - Check if favorited

### 3. Google Trends Integration
- **Real-time data**: Fetch live data from Google Trends API
- **Fallback to mock data**: Automatic fallback when API is unavailable
- **30-day trends**: Interest over time for the last 30 days
- **Geographic filtering**: Support for geo-specific searches (parameter ready)

### 4. Intelligent Caching System
- **24-hour cache**: Reduce API calls with smart caching
- **Cache indicator**: UI shows when data is from cache
- **Database storage**: Cached snapshots in `trend_snapshots` table
- **Automatic expiration**: Old cache entries are ignored

### 5. Recharts Visualization
- **Interactive line chart**: Beautiful trend visualization with Recharts
- **Hover tooltips**: See exact values on hover
- **Date formatting**: Clean date display on X-axis
- **Responsive design**: Chart adapts to screen size
- **Statistics cards**: Avg, Max, Min, and 7-day change

### 6. Dashboard with Analytics
- **Top 20 searches**: Most popular search terms across all users
- **Real-time rankings**: Updates as users search
- **Visual bars**: Progress bars showing relative popularity
- **Medal system**: Top 3 terms get special styling
- **Click to search**: Click any term to search it

### 7. Multi-Page Application
- **Home page**: Search and visualize trends
- **Dashboard**: View top searches
- **Favorites**: Manage saved searches (auth required)
- **React Router**: Client-side routing with active link highlighting
- **URL parameters**: Share searches via URL (`?search=React`)

### 8. Search Logging & Analytics
- **All searches logged**: Every search stored in `search_logs` table
- **User attribution**: Link searches to users when authenticated
- **Anonymous support**: Log searches even for non-authenticated users
- **Analytics ready**: Data ready for future insights

## Database Schema

### Tables Created:
1. **search_logs**: Track all user searches
2. **trend_snapshots**: Cache aggregated trend data
3. **trend_insights**: Ready for AI-generated insights (future)
4. **user_favorites**: User's saved searches

### Row Level Security (RLS):
- Enabled on all tables
- Users can only see/modify their own data
- Public data (trends, logs) readable by all

## Tech Stack

### Frontend:
- **React 19** + **TypeScript**
- **Vite (Rolldown)** for fast builds
- **TailwindCSS v4** for styling
- **Recharts** for data visualization
- **React Router DOM** for routing
- **Supabase Client** for auth and data
- **@supabase/supabase-js**

### Backend:
- **Node.js** + **Express**
- **Supabase** (PostgreSQL + Auth)
- **google-trends-api** for trend data
- **CORS** enabled for frontend
- **Nodemon** for hot reload

### Database:
- **Supabase (PostgreSQL)**
- **Row Level Security (RLS)**
- **Migrations** via Supabase CLI
- **TypeScript types** auto-generated

## API Endpoints

### Trends:
- `GET /api/trends?term=keyword&geo=US` - Get trend data
- `GET /api/trends/top-searches?limit=10` - Top searches

### Favorites (Auth Required):
- `GET /api/favorites` - List user favorites
- `POST /api/favorites { term }` - Add favorite
- `DELETE /api/favorites/:id` - Remove favorite
- `GET /api/favorites/check/:term` - Check if favorited

## Environment Variables

### Frontend (.env):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5001
```

### Backend (.env):
```
PORT=5001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Running the Application

```bash
# From root directory
npm run dev

# Frontend will be at: http://localhost:5173
# Backend will be at: http://localhost:5001
```

## Future Enhancements (Not Yet Implemented)

### AI Integration (Ready for):
- TensorFlow.js forecasting
- OpenAI trend summaries
- Store in `trend_insights` table

### Additional Features:
- Social sharing
- Export data (CSV, PDF)
- Comparison mode (multiple trends)
- Email notifications for trend changes
- Advanced filters (date range, geo)

## Notes

- **Google Trends API**: Unofficial API may have rate limits or blocks. Fallback to mock data is automatic.
- **Authentication**: Email confirmation required for sign-up (check spam folder).
- **Database migrations**: Use `npm run db:push` to apply schema changes.
- **Cache duration**: Currently set to 24 hours (configurable in `routes/trends.js`).
