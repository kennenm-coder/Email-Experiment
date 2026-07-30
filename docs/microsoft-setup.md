# Microsoft Entra App Registration Setup

## Step 1: Open the Entra Portal

Go to [https://entra.microsoft.com](https://entra.microsoft.com) and sign in with your work account.

## Step 2: Register a New Application

1. Navigate to **Identity** > **Applications** > **App registrations**
2. Click **+ New registration**
3. Fill in:
   - **Name**: `Inbox Command Center`
   - **Supported account types**: Select **"Accounts in this organizational directory only"** (single tenant)
   - **Redirect URI**: Select **Web**, enter `http://localhost:3000/api/auth/callback/microsoft-entra-id`
4. Click **Register**

## Step 3: Note the IDs

From the app's **Overview** page, copy:

- **Application (client) ID** → `AUTH_MICROSOFT_ENTRA_ID_ID`
- **Directory (tenant) ID** → `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` and `ALLOWED_TENANT_ID`

## Step 4: Create a Client Secret

1. Go to **Certificates & secrets** > **Client secrets**
2. Click **+ New client secret**
3. Set a description (e.g., "Dev secret") and expiration
4. Copy the **Value** (not the Secret ID) → `AUTH_MICROSOFT_ENTRA_ID_SECRET`

## Step 5: Configure API Permissions

1. Go to **API permissions**
2. Click **+ Add a permission** > **Microsoft Graph** > **Delegated permissions**
3. Add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `offline_access`
   - `User.Read`
   - `Mail.Read`
4. **Do NOT add** `Mail.ReadWrite`, `Mail.Send`, or any Application permissions
5. If your tenant requires it, click **Grant admin consent**

## Step 6: Find Your User Object ID

1. In the Entra portal, go to **Identity** > **Users**
2. Click your user profile
3. Copy the **Object ID** → `ALLOWED_USER_OBJECT_ID`

## Step 7: Add Production Redirect URI (when deploying)

1. Go back to **Authentication**
2. Under **Redirect URIs**, add: `https://YOUR_DOMAIN/api/auth/callback/microsoft-entra-id`

## Troubleshooting

### "Need admin approval" screen
Your tenant requires admin consent for Mail.Read. Ask IT to approve the app, providing:
- It's single-tenant and read-only
- It only requests delegated Mail.Read (not Mail.ReadWrite or Mail.Send)
- It cannot send, delete, or modify any email
- Access is restricted to one user by Object ID

### "AADSTS50020" error
Tenant mismatch. Check that `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` and `ALLOWED_TENANT_ID` match your organization's tenant ID.

### "AADSTS700016" error
The Application ID doesn't match a registered app. Verify `AUTH_MICROSOFT_ENTRA_ID_ID`.
