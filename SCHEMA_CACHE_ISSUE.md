# Supabase Schema Cache Issue (PGRST205)

## Problem
After applying database migrations, Supabase's PostgREST layer reports:
```
Could not find the table 'public.search_logs' in the schema cache
```

Error code: **PGRST205**

## Root Cause
- Tables **DO exist** in the PostgreSQL database
- PostgREST (Supabase's REST API layer) caches the database schema
- When new tables are added via migrations, PostgREST doesn't know about them until cache refresh
- PostgREST auto-refreshes schema every ~10 minutes, but we need it NOW

## Solutions

### Option 1: Wait (10 minutes) ⏰
PostgREST will automatically refresh the schema cache within 10 minutes.

### Option 2: Restart PostgREST via Supabase Dashboard 🔄
1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID
2. Go to "Settings" → "Database"
3. Find the "Restart Database" or "Restart API" button
4. Click to restart PostgREST service
5. Wait 30-60 seconds for restart
6. Test again

### Option 3: Use SQL Functions (Workaround) 🛠️
Instead of using `.from()` directly, create SQL functions that PostgREST can call.

### Option 4: Send NOTIFY signal (Advanced) 📡
If you have direct database access:
```sql
NOTIFY pgrst, 'reload schema';
```

## Recommended Action
**Go to Supabase Dashboard and restart the API/Database service**

This will immediately reload the schema cache and fix all "table not found in schema cache" errors.

## Verification
After restart, test with:
```bash
curl http://localhost:5001/api/trends/top-searches
```

Should return:
```json
{
  "topSearches": []
}
```

Instead of:
```json
{
  "error": "Failed to fetch top searches",
  "message": "Could not find the table 'public.search_logs' in the schema cache"
}
```
