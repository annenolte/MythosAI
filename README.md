# MythosAI

**Live site:** https://the-oracle-pi.vercel.app

Sign up and go to your email to confirm. It should be sent by **Supabase**.
---
# Stack
Supabase 
  1. Authentication — sign up, sign in, sign out (email/password via Supabase Auth)
  2. Conversations — stores each chat session (who started it, which character, title)
  3. Messages — stores every message sent/received in each conversation
  4. Journal entries — stores bookmarked wisdom from characters

Vercel
  Hosts the MythosAI React frontend. It auto-deploys from GitHub and serves the UI that users interact with,
  connecting to Render for AI responses and Supabase for auth and data storage.

Render
  Hosts the MythosAI Python/FastAPI backend. It handles chat requests by forwarding them to the Gemini API and
  provides text-to-speech via ElevenLabs, streaming responses back to the frontend in real time.

ElevenLabs
  Provides the text-to-speech API that gives each oracle character a unique voice. When a user clicks
  "Listen" on a chat message, the backend sends the text to ElevenLabs and streams back audio matched to that
  character's personality.

Claude Code
  The AI-powered development tool used to build and maintain MythosAI. It assisted with writing frontend
  and backend code, managing Git history, configuring Supabase integrations, and deploying changes — all through natural
   language conversation in the terminal.

Languages
  JavaScript (React/JSX) — frontend UI, components, and routing
  - CSS (Tailwind CSS) — styling and responsive design
  - Python — backend API server with FastAPI
  - SQL — Supabase database migrations and row-level security policies
  - HTML — base index page
---
Built in VS Code
