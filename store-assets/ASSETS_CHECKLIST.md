# Play Store Assets Checklist

## Required Assets for Play Store Submission

### App Icon
- [x] `assets/icon.png` - 1024x1024 PNG (exists, may need refinement)
- [x] `assets/adaptive-icon.png` - Foreground layer for Android adaptive icons
- [ ] Feature Graphic - 1024x500 PNG (REQUIRED for Play Store)

### Screenshots (Minimum 2, Maximum 8)
Required dimensions: Phone screenshots should be between 320px and 3840px

- [ ] Screenshot 1: Bible Reader - showing verse reading
- [ ] Screenshot 2: Sermon Generator - configuration screen
- [ ] Screenshot 3: Generated Sermon - viewing a sermon
- [ ] Screenshot 4: Search - Bible search functionality
- [ ] Screenshot 5: Bookmarks/Highlights - verse interactions
- [ ] Screenshot 6: Subscription Plans - pricing screen
- [ ] Screenshot 7: Profile - user settings
- [ ] Screenshot 8: Sermon List - saved sermons

### How to Capture Screenshots
1. Run the app in Android emulator (Pixel 5 recommended)
2. Navigate to each screen
3. Press Ctrl+S to capture screenshot
4. Save as PNG with dimensions 1080x1920 or 1080x2400

### Feature Graphic Template
Create a 1024x500 PNG that includes:
- App name: "Bible Sermon Assistant"
- Tagline: "AI-Powered Sermon Generation for Telugu Pastors"
- Key visuals: Bible, microphone, AI elements
- Brand colors: #1a365d (primary), #2563eb (accent)

### App Icon Guidelines
The current icon should represent:
- Bible/Scripture elements
- Professional/ministry feel
- Works well at small sizes (12x12 to 512x512)

## Store Listing Text

### Short Description (80 chars max)
"AI-powered sermon generator for pastors with Telugu Bible reader"

### Title (50 chars max)
"Bible Sermon Assistant"

## Content Rating
- Category: Books & Reference
- Content Rating: Everyone
- No objectionable content

## Pricing & Distribution
- Free with In-App Purchases
- Countries: All countries (focus on India)
- Contains ads: No

## In-App Products to Configure in Play Console

### Subscriptions
| SKU | Name | Price (INR) | Price (USD) |
|-----|------|-------------|-------------|
| basic_monthly | Basic Monthly | ₹99 | $1.49 |
| basic_yearly | Basic Yearly | ₹799 | $11.99 |
| standard_monthly | Standard Monthly | ₹199 | $2.99 |
| standard_yearly | Standard Yearly | ₹1599 | $23.99 |
| premium_monthly | Premium Monthly | ₹399 | $5.99 |
| premium_yearly | Premium Yearly | ₹3199 | $47.99 |

## Files to Generate/Obtain

1. **google-services.json** - From Firebase Console
   - Create project at https://console.firebase.google.com
   - Add Android app with package: com.biblesermonassistant.app
   - Download google-services.json

2. **google-play-service-account.json** - For automated deployments
   - Create in Google Cloud Console
   - Grant access in Play Console

## Quick Commands

```bash
# Generate app icon variations (if you have ImageMagick)
convert icon.png -resize 48x48 icon-48.png
convert icon.png -resize 72x72 icon-72.png
convert icon.png -resize 96x96 icon-96.png
convert icon.png -resize 144x144 icon-144.png
convert icon.png -resize 192x192 icon-192.png
convert icon.png -resize 512x512 icon-512.png

# Build preview APK for testing
eas build --profile preview --platform android

# Build production AAB
eas build --profile production --platform android
```
