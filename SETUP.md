# 🚀 DR DSLR - Quick Start Guide

✅ **Dependencies installed!** The project is ready to configure.

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created, then go to **Settings → API**
3. Copy these values into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Paste your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Paste your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → Paste your service role key (keep this secret!)

4. Go to the **SQL Editor** and run these migrations in order:
   - Open: `supabase/migrations/0001_init_schema.sql` → Copy & paste into SQL Editor → Execute
   - Open: `supabase/migrations/0002_rls_policies.sql` → Copy & paste into SQL Editor → Execute  
   - Open: `supabase/migrations/0003_seed_homepage_sections.sql` → Copy & paste into SQL Editor → Execute

5. Create an admin user in Supabase:
   - Go to **Authentication → Users → Add user** (email + password)
   - Copy the new user's UUID
   - Go to **SQL Editor** and run:
     ```sql
     insert into admin_profile (id, display_name)
     values ('<paste_user_uuid_here>', 'Your Name');
     ```

## Step 2: Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Go to your **Dashboard**
3. Copy these values into `.env.local`:
   - `CLOUDINARY_CLOUD_NAME` → Your Cloud name
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → Same cloud name
   - `CLOUDINARY_API_KEY` → Your API key
   - `CLOUDINARY_API_SECRET` → Your API secret

## Step 3: Run the Project

Once you've filled in all values in `.env.local`, run:

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

- **Public site:** http://localhost:3000
- **Admin CMS:** http://localhost:3000/admin/login

## 📋 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

Once all are filled, you're ready to start developing! 🎉
