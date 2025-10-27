#!/bin/bash

# 🔔 TrendPulse Alerts - Quick Setup Script
# Run this after configuring Resend API key

set -e

echo "🚀 Starting TrendPulse Alerts setup..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Supabase CLI
echo -e "${YELLOW}[1/5]${NC} Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi
echo -e "${GREEN}✓${NC} Supabase CLI ready"

# 2. Apply migrations
echo -e "${YELLOW}[2/5]${NC} Applying database migrations..."
cd "$(dirname "$0")"
supabase db push
echo -e "${GREEN}✓${NC} Migrations applied"

# 3. Deploy Edge Function
echo -e "${YELLOW}[3/5]${NC} Deploying Edge Function..."
supabase functions deploy check-trend-alerts
echo -e "${GREEN}✓${NC} Edge Function deployed"

# 4. Configure secrets
echo -e "${YELLOW}[4/5]${NC} Configuring secrets..."
echo "Enter your Resend API Key (starts with 're_'):"
read -r RESEND_KEY
supabase secrets set RESEND_API_KEY="$RESEND_KEY"
echo -e "${GREEN}✓${NC} Secrets configured"

# 5. Instructions for pg_cron
echo -e "${YELLOW}[5/5]${NC} Final step: Setup pg_cron"
echo ""
echo "Go to Supabase Dashboard → SQL Editor and run:"
echo ""
echo "-----------------------------------------------------------"
echo "SELECT cron.schedule("
echo "  'check-trend-alerts-daily',"
echo "  '0 8 * * *',"
echo "  \$\$"
echo "  SELECT net.http_post("
echo "    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-trend-alerts',"
echo "    headers := jsonb_build_object("
echo "      'Content-Type', 'application/json',"
echo "      'Authorization', 'Bearer YOUR_ANON_KEY'"
echo "    )"
echo "  ) AS request_id;"
echo "  \$\$"
echo ");"
echo "-----------------------------------------------------------"
echo ""
echo -e "${GREEN}✓${NC} Setup complete! Follow the SQL instruction above."
echo ""
echo "📚 Full documentation: backend/supabase/ALERTS_SETUP.md"
echo "🧪 Test with: supabase functions invoke check-trend-alerts"
