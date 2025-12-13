# 🚀 Quick Start Guide

Get your Weather App running in 3 minutes!

---

## ⚡ Instant Setup (No API Key Needed)

```bash
# 1. Navigate to the project
cd mapd-weather-app_class3

# 2. Install dependencies
npm install

# 3. Run the app
npm run dev
```

**That's it!** Open [http://localhost:3000](http://localhost:3000)

The app works perfectly without any API configuration - it will use local fallback images.

---

## 🌟 Enhanced Setup (With Unsplash Images)

Want dynamic city images? Add your free Unsplash API key:

### Step 1: Get Your Free API Key
1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Sign up (it's free!)
3. Create a new app
4. Copy your Access Key

### Step 2: Add to Your Project
```bash
# Copy the example file
copy .env.local.example .env.local
# (On Mac/Linux use: cp .env.local.example .env.local)
```

### Step 3: Edit `.env.local`
```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=paste_your_key_here
```

### Step 4: Restart Server
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

**Done!** Now you'll see beautiful, dynamic images for any city you search.

For detailed setup instructions, see [UNSPLASH_SETUP.md](UNSPLASH_SETUP.md)

---

## 📱 Using the App

### First Time:
1. You'll see **"Where are you?"**
2. Type your city (e.g., "Durham", "London", "Tokyo")
3. Click **"Set Location"**
4. Your weather appears!

### Searching:
1. Use the search bar at the top
2. Type any city name worldwide
3. Click **"Search"**
4. See instant weather + beautiful image

### Viewing Details:
- **Click/tap** the weather card
- Opens detailed 3-day forecast
- Swipe back to search again

### Customization:
- **Theme**: Click sun/moon icon (top right)
- **Units**: Click thermometer icon (°F ↔ °C)
- **Your preferences are saved!**

---

## 🎯 What You Get

✅ Search any city worldwide
✅ Real-time weather data
✅ Beautiful dynamic city images
✅ 3-day forecast
✅ Dark/Light themes
✅ Fahrenheit/Celsius toggle
✅ Responsive on all devices
✅ Your home location saved

---

## 🆘 Troubleshooting

**Images not showing?**
- App works without Unsplash - uses local images
- To enable Unsplash, add API key to `.env.local`
- Restart server after adding the key

**Can't find a city?**
- Try full city names: "New York" not "NYC"
- Check spelling
- Ensure internet connection is active

**"Where are you?" keeps appearing?**
- Check if your browser allows localStorage
- Try a different browser
- Disable private/incognito mode

---

## 📚 More Info

- Full setup guide: [UNSPLASH_SETUP.md](UNSPLASH_SETUP.md)
- Complete documentation: [README.md](README.md)
- Update details: [UPDATE_SUMMARY_DEC2025.md](UPDATE_SUMMARY_DEC2025.md)

---

## 🎉 You're Ready!

Your Weather App is now a powerful, everyday-use tool that works worldwide. Enjoy! ☀️🌧️❄️
