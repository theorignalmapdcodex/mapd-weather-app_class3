# ✅ Testing Checklist - Weather App Updates

Use this checklist to verify all new features are working correctly.

---

## 🏠 Home Location Feature

- [ ] **First Visit Experience**
  - [ ] "Where are you?" prompt displays on first load
  - [ ] Input field accepts city name
  - [ ] "Set Location" button is clickable
  - [ ] Toast notification appears on submit
  - [ ] Weather loads for entered city
  - [ ] Prompt disappears after setting location

- [ ] **Persistence**
  - [ ] Refresh page - home location weather still displays
  - [ ] Close and reopen browser - location is remembered
  - [ ] No "Where are you?" prompt on return visits

- [ ] **Default Behavior**
  - [ ] Clear localStorage (DevTools > Application > Local Storage)
  - [ ] Refresh page
  - [ ] Confirm Durham, NC displays as default

---

## 🔍 Search Functionality

- [ ] **Search Interface**
  - [ ] Search input visible after setting home location
  - [ ] Search icon appears in input field
  - [ ] Placeholder text is clear
  - [ ] "Search" button is visible and styled correctly

- [ ] **Search Behavior**
  - [ ] Enter "London" → weather loads
  - [ ] Enter "Tokyo" → weather loads
  - [ ] Enter "Paris" → weather loads
  - [ ] Enter "Sydney" → weather loads
  - [ ] Enter "garbage123xyz" → error message appears
  - [ ] Empty search → validation message appears

- [ ] **Loading States**
  - [ ] Loading toast appears during search
  - [ ] Success toast appears after loading
  - [ ] Error toast appears for invalid cities

---

## 🖼️ Unsplash Image Integration

**Note:** These tests require Unsplash API key configured

- [ ] **With API Key**
  - [ ] `.env.local` file exists with valid key
  - [ ] Search "London" → London cityscape image appears
  - [ ] Search "Paris" → Paris cityscape image appears
  - [ ] Search "Tokyo" → Tokyo cityscape image appears
  - [ ] Images are high quality and properly sized
  - [ ] Loading animation shows while fetching image

- [ ] **Without API Key**
  - [ ] Remove or comment out API key in `.env.local`
  - [ ] Restart dev server
  - [ ] Search for cities → local fallback images appear
  - [ ] No console errors about missing images

- [ ] **Fallback System**
  - [ ] Test with invalid API key → fallback images work
  - [ ] Test predefined cities → local images appear

---

## 👆 Clickable Weather Cards

- [ ] **Card Interaction**
  - [ ] Cursor changes to pointer when hovering over card
  - [ ] Card scales slightly on hover (desktop)
  - [ ] Card scales on tap (mobile - test in DevTools responsive mode)
  - [ ] "Tap to view detailed forecast" text visible at bottom

- [ ] **Navigation**
  - [ ] Click weather card → navigates to detailed forecast page
  - [ ] URL changes to `/weather/[city-name]`
  - [ ] Detailed page loads correctly
  - [ ] Back button returns to home

- [ ] **Animation Quality**
  - [ ] Hover animation is smooth (not janky)
  - [ ] Click animation provides feedback
  - [ ] Transitions feel polished

---

## 🎨 Design & Responsiveness

- [ ] **Minimalistic Design Maintained**
  - [ ] Black/white/gray color scheme throughout
  - [ ] Font weight is light (300)
  - [ ] Rounded corners are consistent (rounded-3xl)
  - [ ] No jarring colors or heavy elements

- [ ] **Mobile (375px width)**
  - [ ] "Where are you?" form fits on screen
  - [ ] Search bar is easily tappable
  - [ ] Weather card displays correctly
  - [ ] All text is readable
  - [ ] Bottom navigation accessible

- [ ] **Tablet (768px width)**
  - [ ] Layout adjusts appropriately
  - [ ] Search form is single row
  - [ ] Weather card scales properly
  - [ ] Desktop nav appears (not bottom nav)

- [ ] **Desktop (1920px width)**
  - [ ] Content is centered with max-width
  - [ ] No excessive stretching
  - [ ] Hover states work on all interactive elements
  - [ ] Layout looks balanced

---

## 🌙 Theme & Settings

- [ ] **Dark/Light Theme**
  - [ ] Toggle button in top right corner
  - [ ] Click toggle → theme changes instantly
  - [ ] All components adapt to theme
  - [ ] Weather card readable in both themes
  - [ ] City image overlay maintains readability
  - [ ] Refresh page → theme preference saved

- [ ] **Temperature Units**
  - [ ] Toggle button in top right corner
  - [ ] Click toggle → °F ↔ °C
  - [ ] All temperatures update instantly
  - [ ] Refresh page → unit preference saved

---

## 📱 Navigation

- [ ] **Bottom Navigation (Mobile)**
  - [ ] Visible on mobile devices
  - [ ] Hidden on desktop
  - [ ] All 3 tabs work (Home, Search, Calendar)
  - [ ] Active tab is highlighted

- [ ] **Desktop Navigation**
  - [ ] Visible on desktop
  - [ ] Hidden on mobile
  - [ ] Links navigate correctly

---

## ⚡ Performance

- [ ] **Load Times**
  - [ ] Initial page load < 2 seconds
  - [ ] Weather search results < 2 seconds
  - [ ] Image loading doesn't block UI
  - [ ] No layout shifts during loading

- [ ] **API Rate Limits**
  - [ ] Multiple searches work without errors
  - [ ] Error handling for rate limit reached (if applicable)

---

## 🐛 Error Handling

- [ ] **Invalid Input**
  - [ ] Empty search → validation message
  - [ ] Invalid city name → error toast
  - [ ] Special characters → handled gracefully

- [ ] **Network Issues**
  - [ ] Disconnect internet → error message displays
  - [ ] Reconnect internet → search works again

- [ ] **Missing Data**
  - [ ] City without image → fallback image displays
  - [ ] API timeout → error message shown

---

## 🔐 Security & Privacy

- [ ] **Environment Variables**
  - [ ] `.env.local` not committed to git
  - [ ] `.env.local.example` exists in repo
  - [ ] API key not visible in browser source

- [ ] **localStorage**
  - [ ] Only non-sensitive data stored (city names)
  - [ ] No API keys in localStorage
  - [ ] Clear localStorage works (DevTools)

---

## 📚 Documentation

- [ ] **README.md**
  - [ ] Updated with new features
  - [ ] Installation steps are clear
  - [ ] Screenshots/examples make sense

- [ ] **UNSPLASH_SETUP.md**
  - [ ] Instructions are complete
  - [ ] Links work
  - [ ] Steps are easy to follow

- [ ] **QUICK_START.md**
  - [ ] Commands work as written
  - [ ] No broken links

---

## 🎯 User Experience

- [ ] **First-Time User**
  - [ ] Onboarding is intuitive
  - [ ] No confusion about what to do
  - [ ] Help text is clear

- [ ] **Returning User**
  - [ ] Quick access to weather
  - [ ] No repeated onboarding
  - [ ] Search is easily accessible

- [ ] **Everyday Use**
  - [ ] Fast to check weather
  - [ ] Minimal clicks needed
  - [ ] Works for all ages

---

## ✅ Final Sign-Off

- [ ] All core features working
- [ ] No console errors
- [ ] No broken links
- [ ] Design is polished
- [ ] Documentation is complete
- [ ] Ready for user testing

---

## 📝 Notes Section

Use this space to note any issues found during testing:

```
Issue #1:
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

Issue #2:
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
```

---

**Testing Date:** _______________
**Tested By:** _______________
**Browser(s):** _______________
**Device(s):** _______________
**Result:** ⭐ PASS / ❌ FAIL (with notes)
