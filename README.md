# Shadow Bot Dashboard & Server

This branch provides a scaffold for a web dashboard (Next.js) and a small Express backend that integrates with the bot's database for settings management. It is an initial MVP based on the design you requested (Zeon-like dashboard). Deploy the backend with the bot (Render or VPS) and the frontend on Vercel (or together on one host if you prefer).

Structure:
- dashboard/  — Next.js frontend (simple MVP)
- server/     — Express backend with Discord OAuth2 and API endpoints
- database.js — shared database wrapper (better-sqlite3)

IMPORTANT: Fill in .env values (both server and dashboard) before running.

See README.md in each folder for run instructions.
