# 📸 Unsplash API Setup Guide

This weather app uses the **Unsplash API** to dynamically fetch beautiful city images for any location you search. Follow these simple steps to set up your free API access.

---

## 🚀 Why Unsplash?

- **Free API access** with generous rate limits (50 requests/hour for development)
- **High-quality images** from professional photographers worldwide
- **Automatic fallback** to local images if API is unavailable
- **No credit card required** for the free tier

---

## 📋 Setup Instructions

### Step 1: Create an Unsplash Developer Account

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Click **"Register as a Developer"** (or **"Log in"** if you already have an account)
3. Sign up using your email or social login (GitHub, Google, etc.)

### Step 2: Create a New Application

1. Once logged in, click **"Your apps"** in the top navigation
2. Click the **"New Application"** button
3. Read and accept the **API Use and Guidelines**
4. Fill in the application details:
   - **Application name**: `Weather App` (or any name you prefer)
   - **Description**: `Personal weather app that displays city images`
5. Click **"Create Application"**

### Step 3: Get Your Access Key

1. After creating the app, you'll be taken to your app's dashboard
2. Find the section labeled **"Keys"**
3. Copy your **"Access Key"** (it looks like: `abc123xyz456...`)
   - ⚠️ **Important**: Keep this key private! Don't share it publicly

### Step 4: Add the Key to Your Project

1. In the root of your project folder (`mapd-weather-app_class3`), create a new file called **`.env.local`**

   ```bash
   # You can copy the example file:
   # On Windows PowerShell:
   copy .env.local.example .env.local

   # On macOS/Linux:
   # cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Access Key:

   ```env
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
   ```

3. Replace `your_actual_access_key_here` with the Access Key you copied from Unsplash

4. **Save the file**

### Step 5: Restart Your Development Server

After adding the API key, restart your development server for the changes to take effect:

```bash
# Stop the current server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

---

## ✅ Testing Your Setup

1. Open your browser and go to [http://localhost:3000](http://localhost:3000)
2. Search for any city (e.g., "Paris", "London", "Sydney")
3. You should see a beautiful, high-quality image of that city loaded from Unsplash!

---

## 🔄 Fallback System

Don't have an API key yet? **No problem!**

The app has a smart fallback system:

1. **With API key**: Fetches dynamic images from Unsplash for any city
2. **Without API key**: Uses local images from `/public/city-images/` folder
3. **If Unsplash fails**: Automatically falls back to local images

This means your app works perfectly even without the API configured!

---

## 📊 API Rate Limits

**Free Tier Limits:**
- 50 requests per hour (demo/development)
- Enough for testing and personal use

**Production Tier:**
- 5,000 requests per hour (requires application)
- Submit your app for review on the Unsplash dashboard

For most personal projects, the free tier is more than sufficient!

---

## 🛡️ Security Best Practices

✅ **DO:**
- Keep your `.env.local` file private
- Add `.env.local` to your `.gitignore` (already done in this project)
- Use `NEXT_PUBLIC_` prefix for client-side environment variables

❌ **DON'T:**
- Commit `.env.local` to Git
- Share your Access Key publicly
- Use the same key across multiple public projects

---

## 🐛 Troubleshooting

### Images not loading?

1. **Check your API key:**
   - Make sure `.env.local` exists in the project root
   - Verify the key starts with `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=`
   - Ensure there are no extra spaces around the key

2. **Check the console:**
   - Open browser DevTools (F12)
   - Look for any error messages in the Console tab

3. **Verify server restart:**
   - Changes to `.env.local` require a server restart
   - Stop (`Ctrl+C`) and run `npm run dev` again

4. **Check API quota:**
   - Free tier: 50 requests/hour
   - Check your [Unsplash dashboard](https://unsplash.com/oauth/applications) for usage stats

### Still having issues?

- Check the [Unsplash API Documentation](https://unsplash.com/documentation)
- Verify your app is active in the Unsplash dashboard
- Try using a different browser or clearing cache

---

## 📚 Additional Resources

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🎉 You're All Set!

Your weather app now has access to millions of beautiful, high-quality city images. Happy coding! 🌍✨
