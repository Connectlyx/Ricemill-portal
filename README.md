# Connectlyx Portal — Rice Mill Management System

This is the working demo of the Rice Mill Management System, built with React + Vite.

## What works out of the box
- Owner and Operator login (demo access, top of login screen)
- Orders, Deliveries, Staff & Payroll, Clients, Payments, Reports, Business Tips
- Data is saved in the browser (per-device) using localStorage

## To enable the live AI Assistant
1. Get a free/paid API key from https://console.anthropic.com
2. In Vercel: Project Settings → Environment Variables → add `ANTHROPIC_API_KEY`
3. Redeploy — the Assistant tab will start working with real answers

## Next upgrade (Step 6 in our plan)
Replace localStorage with Supabase so all devices/logins share the same live data,
and each mill gets its own separate, secure account.
