# Supabase Setup Guide for ProFinance

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: `profinance` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click "Create new project" and wait for deployment (2-5 minutes)

## Step 2: Get API Credentials

1. After project is created, go to **Settings → API**
2. Copy and save these values:
   - **Project URL** - looks like `https://your-project.supabase.co`
   - **API Key (anon/public)** - the public key
   - **Service Role Key** - the secret key (keep this safe!)

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** on the left
2. Click "New Query"
3. Copy the entire content from `supabase-schema.sql` in the backend folder
4. Paste it into the SQL editor
5. Click "Run" to execute
6. Verify all tables are created by checking the "Tables" section

## Step 4: Configure Environment Variables

Edit the `.env` file in your backend folder:

```
PORT=5000
JWT_SECRET=profinance_super_secret_key_change_me

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

**Replace:**
- `https://your-project.supabase.co` with your Project URL
- `your-anon-key-here` with your API Key (anon/public)
- `your-service-key-here` with your Service Role Key

## Step 5: Install Dependencies

Run in the backend folder:
```bash
npm install
```

## Step 6: Start the Server

```bash
npm start
```

You should see:
```
Connected to Supabase database
ProFinance Fullstack Server online on port 5000
```

## Step 7: Test the Connection

Try logging in or registering a new user through the frontend. Check the Supabase dashboard to verify data is being saved:

1. Go to **Table Editor**
2. Click on the `users` table
3. You should see your registered users

## Security Tips

1. **Never commit `.env` to git** - Add it to `.gitignore`
2. **Rotate your Service Key** periodically in Supabase settings
3. **Enable Row Level Security (RLS)** for production:
   - Go to **Authentication → Policies** in Supabase
   - Create policies to ensure users can only see their own data
4. **Change JWT_SECRET** to something unique in production

## Troubleshooting

### "Connection refused"
- Check SUPABASE_URL and SUPABASE_SERVICE_KEY are correct
- Verify project is running in Supabase dashboard

### "Email already registered" error on new user
- User may already exist in database
- Try logging in with existing credentials

### Tables not showing data
- Run the SQL schema again (supabase-schema.sql)
- Check that service key has proper permissions

### Still using SQLite?
- Make sure you removed references to sqlite3 in server.js
- Clear node_modules: `rm -rf node_modules && npm install`

## Migrating from SQLite

If you had existing SQLite data:

1. Export from SQLite (use a tool like DBeaver)
2. Import CSV data into Supabase tables
3. Ensure user IDs match between users and data tables

## Next Steps

1. **Enable Authentication**: Set up Supabase Auth for passwordless login
2. **Add Row Level Security**: Restrict data access by user
3. **Enable Real-time**: Get live updates with Supabase subscriptions
4. **Backups**: Enable automatic backups in Supabase settings
