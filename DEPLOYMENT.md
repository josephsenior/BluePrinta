# Deployment Guide

This guide provides reference instructions for deploying BluePrinta in a self-managed environment.

## ✅ Before pushing to GitHub

- **Never commit `.env`** — it’s in `.gitignore`; use `.env.example` as a template.
- **No secrets in code** — API keys and `DATABASE_URL` must come from environment variables only.
- **Optional**: Delete the mistaken folder `prisma/prisma/` if it exists (DB should live at `prisma/local.db`).
- Run `pnpm db:push` after clone/deploy so the database and schema exist.

## 🚀 Deployment Options

### 1. Docker (Recommended)

The easiest way to deploy BluePrinta is using Docker.

#### Build the image
```bash
docker build -t metasop .
```

#### Run the container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/local.db" \
  -e GOOGLE_AI_API_KEY="your_api_key" \
  metasop
```

### 2. Vercel (Next.js)

BluePrinta is built with Next.js and can also be deployed to Vercel.

1. Connect your repository to Vercel.
2. Add the required environment variables in the Vercel dashboard.
3. Vercel will automatically detect the Next.js project and deploy it.

## ⚙️ Environment Variables

Ensure the following environment variables are set in your production environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database URL (SQLite for local) | `file:./prisma/local.db` |
| `GOOGLE_AI_API_KEY` | Gemini API Key | `AIza...` |
| `NODE_ENV` | Environment mode | `production` |

## 🗄️ Database Setup

Before running the application, you need to set up the database schema:

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push
```

## 🔐 Security Considerations

- Ensure your database file (if SQLite) is not exposed publicly.
- Use HTTPS for all communications in production.
- Keep `GOOGLE_AI_API_KEY` secret.
