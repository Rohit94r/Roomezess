# Local Setup Instructions

## ✅ Frontend - Running

The frontend is now running on **http://localhost:3000**

### Status:
- ✅ Dependencies installed
- ✅ Development server started
- ⚠️ Requires Supabase backend configuration

---

## Backend Setup Options

### Option 1: Use Cloud Supabase (Recommended for Quick Setup)

1. **Create a Supabase Project**:
   - Go to https://supabase.com
   - Sign up (free tier available)
   - Create a new project

2. **Get Your Credentials**:
   - Go to Settings → API
   - Copy Project URL and Anonymous Key

3. **Update Frontend Environment**:
   Edit `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Initialize Database**:
   - In Supabase Dashboard, go to SQL Editor
   - Run the SQL from `backend/supabase/schema.sql`

5. **Restart Frontend** (Ctrl+C and `npm run dev`)

---

### Option 2: Local Supabase with Docker

**Prerequisites**:
- Install Docker: https://docs.docker.com/get-docker/
- Install Supabase CLI: https://supabase.com/docs/guides/cli/getting-started

**Steps**:

1. **Install Docker (Windows)**:
   - Download Docker Desktop from https://www.docker.com/products/docker-desktop
   - Install and start Docker

2. **Install Supabase CLI** (using Winget or download):
   ```powershell
   winget install supabase.supabase-cli
   ```
   
   OR download from: https://github.com/supabase/cli/releases

3. **Start Local Supabase**:
   ```bash
   cd backend
   supabase start
   ```
   
   This will:
   - Start PostgreSQL on localhost:54322
   - Start Supabase API on localhost:54321
   - Start Studio on localhost:54323

4. **Get Local Credentials**:
   After `supabase start`, you'll see:
   ```
   API URL: http://localhost:54321
   ANON_KEY: eyJhbGc...
   SERVICE_ROLE_KEY: eyJhbGc...
   ```

5. **Update Frontend .env.local**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
   ```

6. **Access Supabase Studio**:
   - Open http://localhost:54323 in browser
   - Create test users for testing

---

## Test Credentials (after setup)

From `QUICK_START.md`:

| Role | Email | Password |
|------|-------|----------|
| Student | rohit@student.com | password123 |
| Owner | amit@owner.com | password123 |
| Admin | admin@roomezes.com | adminpass123 |

---

## Running Both Services

Once you've set up Supabase (cloud or local):

**Frontend**: Already running on http://localhost:3000

**Check Status**:
- Frontend: http://localhost:3000 (Next.js)
- Supabase Studio: http://localhost:54323 (if using local Supabase)

---

## Next Steps

1. Choose Option 1 or 2 above to set up your backend
2. Update frontend `.env.local` with your credentials
3. Test login with the credentials provided above
