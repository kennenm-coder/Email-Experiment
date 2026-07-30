# Inbox Command Center

A private, read-only web application that acts as a workflow and triage layer on top of Microsoft Outlook.

**This is not an email client.** It reads your inbox through Microsoft Graph, displays messages in a custom dashboard, and lets you organize them with custom workflow states. All email operations (reply, send, delete, move) stay in Outlook.

## Current Status: Phase 0 — Permission Proof

Proves that Microsoft authentication works and the app can read inbox messages.

## Prerequisites

- Node.js 18+
- A Microsoft 365 work account
- Access to register an app in [Microsoft Entra](https://entra.microsoft.com) (or IT approval)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Email-Experiment
npm install
```

### 2. Register a Microsoft Entra app

Follow the step-by-step guide in [docs/microsoft-setup.md](docs/microsoft-setup.md).

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. Generate the auth secret:

```bash
npx auth secret
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Microsoft work account.

## Permissions

This app requests **only**:

| Permission | Type | Purpose |
|---|---|---|
| `openid` | Delegated | Sign-in |
| `profile` | Delegated | Display name |
| `email` | Delegated | Email address |
| `offline_access` | Delegated | Token refresh |
| `User.Read` | Delegated | User profile |
| `Mail.Read` | Delegated | Read inbox messages |

**Not requested:** `Mail.ReadWrite`, `Mail.Send`, or any Application-level permissions.

## Tests

```bash
npm test
```

## Architecture

- **Next.js 16** — App Router with TypeScript strict mode
- **Auth.js v5** — Microsoft Entra ID provider (authorization-code flow)
- **Microsoft Graph v1.0** — Server-side only, with immutable IDs
- **Tailwind CSS** — Styling

All Graph API calls happen server-side. No access tokens reach the browser.
