# ⚡ Quick Start Guide

Get your premium QR code system running in **5 minutes**!

## 🚀 Fast Track Setup

### 1. Set Up Supabase Database (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for database initialization
4. Go to **Settings → Database → Connection String**
5. Copy the **URI** connection string

### 2. Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

**Required variables:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT.supabase.co:5432/postgres"
NEXTAUTH_SECRET="generate_with_command_below"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate secret:**
```bash
openssl rand -base64 32
```

Copy the output and paste as `NEXTAUTH_SECRET`

### 3. Initialize Database (1 minute)

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server (30 seconds)

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## ✅ Verify Setup

### Test 1: Public Generator Works
1. Go to `http://localhost:3000`
2. Create a QR code
3. Download it
4. ✅ If you can download, basic app works!

### Test 2: Authentication Works
1. Go to `http://localhost:3000/auth/signup`
2. Create account with:
   - Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
3. ✅ If you're redirected to dashboard, auth works!

### Test 3: Dashboard Works
1. Should see dashboard at `http://localhost:3000/dashboard`
2. See stats (all zeros initially)
3. ✅ If dashboard loads, database is connected!

## 🎯 Create Your First Dynamic QR

### Method 1: Through API (Quick Test)

Create a test dynamic QR with this curl command:

```bash
# First, get your session token by signing in through browser
# Then use this endpoint:

curl -X POST http://localhost:3000/api/qr \
  -H "Content-Type: application/json" \
  -d '{
    "type": "URL",
    "content": "https://example.com",
    "description": "Test QR Code",
    "color": "#f5576c",
    "isDynamic": true,
    "destinationUrl": "https://example.com"
  }'
```

### Method 2: Through Dashboard (Recommended)

**Coming Soon**: We'll add a QR creation form in the dashboard in the next iteration.

For now, you can:
1. Use the public generator at `/`
2. Manually save to database via API
3. Or use Prisma Studio to create directly

### Using Prisma Studio

```bash
npx prisma studio
```

This opens a database GUI where you can:
1. Create QR codes manually
2. View all your data
3. Edit records
4. See scan analytics

## 🧪 Testing Dynamic QR Flow

### Create a Test QR Code

Using Prisma Studio or API, create a QR code with:
- `shortId`: "test123"
- `type`: "URL"
- `content`: "https://google.com"
- `isDynamic`: true
- `destinationUrl`: "https://google.com"
- `userId`: (your user ID from database)

### Test the Redirect

Visit: `http://localhost:3000/r/test123`

You should:
1. Be redirected to Google
2. See a scan record in database (check Prisma Studio → Scan table)

### View Analytics

Make API call:
```bash
curl http://localhost:3000/api/qr/YOUR_QR_ID/analytics?days=7
```

Should return analytics JSON with your scan data!

## 📝 Next Steps

Now that everything works:

### For Your Gallery Exhibition

1. **Create Campaign**
   ```bash
   # Through API or Prisma Studio
   Campaign: "Winter Exhibition 2024"
   ```

2. **Create QR for Each Artwork**
   - Use public generator or API
   - Save to database with campaign ID
   - Set as dynamic with artwork detail URL

3. **Generate QR Images**
   - Use public generator to create visual QR
   - The QR should point to: `your-domain.com/r/[shortId]`
   - Download as PNG or SVG

4. **Print & Place**
   - Print QR codes
   - Place next to artworks
   - Include text: "Scan for artwork details"

5. **Monitor Analytics**
   - Check dashboard daily
   - See which artworks get most scans
   - Analyze visitor patterns

### Recommended Workflow

```
For each artwork:
1. Create entry in database (QR code record)
2. Note the shortId (e.g., "abc123")
3. Generate QR image pointing to: your-domain.com/r/abc123
4. Print and place by artwork
5. Monitor scans in dashboard
```

## 🐛 Common Issues

### Database connection error
```
❌ Error: Can't reach database server
```
**Solution**: Check your DATABASE_URL is correct in `.env`

### Prisma client error
```
❌ Error: @prisma/client did not initialize yet
```
**Solution**: Run `npx prisma generate`

### Auth redirect loop
```
❌ Keeps redirecting between signin and dashboard
```
**Solution**: Check NEXTAUTH_SECRET is set in `.env`

### Can't create user
```
❌ User with this email already exists
```
**Solution**: Use different email or check existing users in Prisma Studio

## 💡 Pro Tips

### 1. Test Locally First
Before deploying, test all features locally:
- Create QR codes
- Scan them
- View analytics
- Test different QR types

### 2. Use Descriptive Names
```
Good: "Sunset Dreams by Jane Doe - Winter Exhibit"
Bad: "QR 1"
```

### 3. Plan Your Campaigns
```
Campaign structure:
├── Winter Exhibition 2024
│   ├── Artwork 1 QR
│   ├── Artwork 2 QR
│   └── Artwork 3 QR
├── Spring Exhibition 2024
│   └── ...
```

### 4. Backup Your Data
Export database regularly:
```bash
npx prisma db pull
```

### 5. Monitor Performance
Check Supabase dashboard for:
- Database size
- Connection count
- Query performance

## 📱 Mobile Testing

Test QR codes on actual phones:

1. **Expose Local Server**
   ```bash
   # Install ngrok or use your local IP
   # Or deploy to Vercel for testing
   ```

2. **Generate Test QR**
   - Point to your test URL
   - Print or display on screen
   - Scan with phone

3. **Verify**
   - Check redirect works
   - Check scan recorded in database
   - Check analytics appear

## 🚀 Deploy to Production

When ready to deploy:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add premium features"
   git push
   ```

2. **Deploy to Vercel**
   - Connect GitHub repo
   - Add environment variables
   - Deploy

3. **Update NEXTAUTH_URL**
   ```env
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```

4. **Test Production**
   - Sign up on production
   - Create test QR
   - Verify analytics work

## 🎉 You're Ready!

Your system is now:
- ✅ Running locally
- ✅ Connected to database
- ✅ Authentication working
- ✅ Ready to create dynamic QR codes
- ✅ Tracking analytics

Start creating QR codes for your gallery exhibition!

## 📞 Need Help?

- Check [SETUP.md](./SETUP.md) for detailed instructions
- Check [PREMIUM_FEATURES.md](./PREMIUM_FEATURES.md) for feature documentation
- Check database with `npx prisma studio`
- Check logs with `npm run dev` output

---

**Time to complete**: ~5 minutes
**Difficulty**: Easy
**Result**: Fully functional premium QR system! 🎉
