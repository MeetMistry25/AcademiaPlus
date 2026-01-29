# Deploying Backend to Render.com

This workflow guides you through deploying the .NET Backend to Render, which is the easiest way to host a persistent containerized service.

## Prerequisites
- A GitHub account.
- A [Render](https://render.com) account.
- A [Supabase](https://supabase.com) account (or any PostgreSQL provider) for the database.

## Prepare the Database (Supabase)
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Note down the **Connection String** (URI format) from the Database settings. It usually looks like: `postgres://postgres:password@db.supabase.co:5432/postgres`

## Deployment Steps

1. **Push to GitHub**:
   Ensure your latest code (including the Dockerfile I created) is pushed to your GitHub repository.

2. **Create Web Service on Render**:
   - Go to the [Render Dashboard](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - **Important Settings**:
     - **Name**: `academia-plus-backend` (or similar)
     - **Runtime**: `Docker`
     - **Root Directory**: `Backend` (This is critical!)
     - **Region**: Choose one close to you.
     - **Instance Type**: Free

3. **Configure Environment Variables**:
   In the Render setup (or under the "Environment" tab later), add the following environment variable:
   - Key: `DATABASE_URL`
   - Value: (Paste your Supabase connection string here)

4. **Deploy**:
   - Click **Create Web Service**.
   - Render will build your Docker image and start the app.
   - It will automatically detect the `DATABASE_URL` and switch to using PostgreSQL instead of SQLite.

## Final Step: Connect Frontend
1. Once deployed, Render will give you a URL (e.g., `https://academia-plus-backend.onrender.com`).
2. Go back to your local code, open `Frontend/src/environments/environment.prod.ts`.
3. Update specific line: `apiUrl: 'https://academia-plus-backend.onrender.com/api'`
4. Re-deploy the frontend:
   ```powershell
   cd Frontend
   ng build --configuration production
   firebase deploy
   ```
