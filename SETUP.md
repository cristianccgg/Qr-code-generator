# QR Generator Premium - Setup Guide

This guide will help you set up the QR Generator with premium features including analytics, dynamic QR codes, and admin dashboard.

## 🚀 Features Implemented

### ✅ Core Features
- **Dynamic QR Codes**: Change destination URLs without regenerating the QR
- **Analytics Tracking**: Track scans, devices, locations, browsers
- **Admin Dashboard**: Manage all your QR codes in one place
- **Campaign Management**: Organize QR codes into campaigns
- **Authentication**: Secure login with NextAuth.js
- **Multi-type QR Codes**: URL, Text, Email, Phone, SMS, WiFi, vCard

### 📊 Analytics Includes
- Total scans per QR code
- Scans by date (time series)
- Device breakdown (mobile/tablet/desktop)
- Browser statistics
- OS distribution
- Geographic data (country, city)
- Growth trends

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)
- Git

## 🛠️ Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# If not already done
cd qr-generator-nextjs
npm install
```

### 2. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be ready (2-3 minutes)
3. Go to **Settings > Database**
4. Find **Connection String** and copy the **URI** (Transaction mode)
5. It looks like: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# Required: Database connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Required: NextAuth secret (generate a random string)
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth (if you want "Sign in with Google")
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

This will create all the necessary tables in your Supabase database:

```bash
npx prisma migrate dev --name init
```

You should see tables created: `users`, `accounts`, `sessions`, `qr_codes`, `scans`, `campaigns`

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## 🎨 Usage Guide

### Creating Your First QR Code

#### Option A: Public Generator (No Login Required)
1. Go to `http://localhost:3000`
2. Choose QR type, customize design
3. Download your QR code
4. **Note**: These are static QR codes without analytics

#### Option B: Premium Dynamic QR (Login Required)
1. Create an account: `http://localhost:3000/auth/signup`
2. Sign in
3. Go to Dashboard: `http://localhost:3000/dashboard`
4. Create QR code through the dashboard
5. Your QR will redirect through `/r/{shortId}` for tracking

### Dynamic QR Code Flow

When you create a QR code in the dashboard:
1. Content is stored in database
2. A unique `shortId` is generated (e.g., "abc123")
3. The QR code points to: `https://your-domain.com/r/abc123`
4. When scanned:
   - Records device, location, time
   - Redirects to destination
   - All data visible in analytics

### Viewing Analytics

1. Go to Dashboard
2. Click on any QR code
3. View detailed analytics:
   - Total scans
   - Growth trends
   - Device breakdown
   - Geographic distribution
   - Recent scan activity

## 🗂️ Project Structure

```
qr-generator-nextjs/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── qr/            # QR CRUD operations
│   │   └── campaigns/     # Campaign management
│   ├── dashboard/         # Admin dashboard pages
│   ├── auth/              # Login/signup pages
│   ├── r/[shortId]/       # Dynamic redirect endpoint
│   └── view/[shortId]/    # View non-URL QR content
├── components/
│   └── qr/                # QR form and preview components
├── lib/
│   ├── prisma.ts          # Prisma client
│   └── auth.ts            # NextAuth configuration
├── prisma/
│   └── schema.prisma      # Database schema
└── types/
    ├── qr.ts              # QR type definitions
    └── next-auth.d.ts     # NextAuth type extensions
```

## 🔐 Setting Up Admin User

### Method 1: Sign Up (Easiest)
1. Go to `/auth/signup`
2. Create your account
3. You're automatically an admin!

### Method 2: Direct Database (For existing users)
```bash
npx prisma studio
```
1. Opens Prisma Studio in browser
2. Go to `User` table
3. Find your user
4. Change `role` from `USER` to `ADMIN`

## 📊 Database Schema Overview

### Main Tables

**users** - User accounts
- Handles authentication
- Stores user profile

**qr_codes** - QR code configurations
- Design settings (color, size, logo)
- Content and type
- Dynamic URL destination
- Links to campaigns and user

**scans** - Analytics data
- One record per scan
- Device, browser, OS info
- Geographic location
- Timestamp

**campaigns** - Organization
- Group QR codes by project/event
- For your gallery: one campaign per exhibition

## 🎯 Gallery Use Case Example

For your art gallery exhibition:

### Setup
1. Create a campaign: "Winter Exhibition 2024"
2. For each artwork, create a QR code:
   - Type: URL
   - Description: "Artwork: [Title]"
   - Destination: Link to artwork detail page
   - Campaign: Winter Exhibition 2024

### Benefits
- Track which artworks get most interest
- See visitor patterns (time of day, location)
- Change URLs if you update artwork pages
- Export analytics after exhibition

### Example QR Setup
```
Artwork: "Sunset Dreams"
URL: https://gallery.com/artworks/sunset-dreams
Description: Sunset Dreams by Artist Name
Campaign: Winter Exhibition 2024
```

When printed next to artwork, visitors scan and:
1. System records: scan time, device, location
2. Visitor sees artwork details
3. You see analytics in dashboard

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production URL)
   - (Optional) `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
5. Deploy!

**Important**: Update `NEXTAUTH_URL` to your production domain:
```env
NEXTAUTH_URL="https://your-app.vercel.app"
```

## 🐛 Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### Database connection error
- Check your `DATABASE_URL` is correct
- Ensure Supabase project is not paused (free tier pauses after inactivity)
- Try using the "Transaction" mode connection string, not "Session" mode

### NextAuth error
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your current domain

### Scans not recording
- Check your redirect URL in [app/r/[shortId]/route.ts](app/r/[shortId]/route.ts)
- Verify QR code has `isDynamic: true`
- Check database connection

## 📈 Next Steps

### Additional Features to Add
1. **QR Code Generation in Dashboard**: Currently uses public generator
2. **Analytics Visualization**: Add charts with Recharts
3. **Batch QR Creation**: Upload CSV of URLs
4. **PDF Export**: Download QR codes as PDF sheets
5. **Custom Domains**: Use your own domain for redirect
6. **Webhooks**: Get notified on scans
7. **A/B Testing**: Test multiple QR designs

### Recommended Enhancements
- Add QR code editing in dashboard
- Implement real-time analytics with websockets
- Add export functionality (CSV, PDF reports)
- Create QR code templates
- Add team collaboration features

## 💡 Tips

- Use campaigns to organize QR codes by project
- Check analytics regularly to understand patterns
- Dynamic QR codes can be updated anytime
- Keep descriptions clear for easy identification
- Test QR codes before printing

## 🆘 Support

- Check [Prisma docs](https://www.prisma.io/docs) for database issues
- Check [NextAuth docs](https://next-auth.js.org) for auth issues
- Check [Next.js docs](https://nextjs.org/docs) for framework issues

---

## 🎉 You're All Set!

Your premium QR code generator is ready to use. Start creating dynamic QR codes with analytics tracking!

For your gallery exhibition, this system will give you valuable insights into visitor engagement with your artworks.
