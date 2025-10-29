# City Images Setup Guide

## 📁 Folder Structure

Create this folder in your project:
```
public/
  city-images/
    durham.jpg
    new-york.jpg
    tokyo.jpg
    accra.jpg
    lausanne.jpg
    santorini.jpg
    default.jpg (optional fallback)
```

## 🖼️ Image Requirements

### Recommended Specifications:
- **Format**: JPG or PNG
- **Dimensions**: 1200x800px (3:2 aspect ratio) or higher
- **File size**: Under 500KB for optimal loading
- **Quality**: High quality, but web-optimized

### Image Style:
- Iconic cityscape or landmark views
- Clear, bright, well-composed photos
- Landscape orientation
- Professional photography preferred

## 🌆 Suggested Images for Each City:

### Durham, USA
- Duke Chapel
- Downtown Durham skyline
- Durham Bull statue area

### New York, USA
- Manhattan skyline
- Brooklyn Bridge
- Times Square or Central Park

### Tokyo, Japan
- Tokyo Tower or Skytree
- Shibuya Crossing
- Mount Fuji with city view

### Accra, Ghana
- Independence Square
- Accra skyline with coastline
- Jamestown Lighthouse

### Lausanne, Switzerland
- Lake Geneva waterfront
- Olympic Museum area
- Cathedral of Notre Dame

### Santorini, Greece
- White buildings with blue domes
- Oia sunset views
- Caldera cliff views

## 🔍 Where to Find Images:

### Free Stock Photo Sites:
1. **Unsplash** (https://unsplash.com) - Best quality, completely free
2. **Pexels** (https://pexels.com) - Large selection, free
3. **Pixabay** (https://pixabay.com) - Free images

### Search Terms:
- "[City name] skyline"
- "[City name] landmark"
- "[City name] cityscape"
- "[City name] aerial view"

## ⚙️ How to Add Images:

1. Download your chosen images
2. Rename them to match the exact names above (lowercase, use hyphens)
3. Place them in `public/city-images/`
4. Restart your dev server if it's running

## 🎨 Image Optimization Tips:

- Use Next.js Image component (already implemented in CityPictureCard)
- Images will be automatically optimized by Next.js
- Consider using WebP format for even better performance
- Compress images before adding (use TinyPNG or similar)

## ✅ Verification:

After adding images, test by:
1. Running your dev server: `npm run dev`
2. Selecting different cities from the dropdown
3. Verifying images load correctly for each city
4. Checking mobile responsiveness

## 🚨 Troubleshooting:

**Image not showing?**
- Check filename matches exactly (case-sensitive on some systems)
- Ensure image is in `public/city-images/` folder
- Clear browser cache and restart dev server
- Check browser console for errors

**Image looks distorted?**
- Use 3:2 or 16:9 aspect ratio images
- Minimum 1200px width recommended
- The component will handle cropping via `object-cover`