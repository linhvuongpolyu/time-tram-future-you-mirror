# Time Tram – Future You Mirror

> 🌍 An interactive media art installation that uses AI to predict your future archetypes and generates personalized mirrors of your future self through webcam analysis and generative AI.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building for Production](#building-for-production)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## 🎨 Overview

**Time Tram – Future You Mirror** is an experimental interactive experience that blends technology with personal reflection. Users scan QR-encoded postcards representing life choices, which are analyzed using AI to determine their dominant future archetype. The system then generates a personalized AI portrait showing what their future self might look like.

### How It Works

1. **Postcard Selection** - Users scan 10 QR-coded postcards using their device camera
2. **Archetype Analysis** - The system computes dominant life archetypes based on selected choices:
   - **Career**: Professional ambition and work-focused decisions
   - **Relationship**: Personal connections and social bonds
   - **Rest**: Balance, wellness, and self-care choices
   - **Joy**: Happiness and enjoyment-oriented decisions
3. **AI Mirror Generation** - A webcam portrait is captured and processed with generative AI to visualize the predicted future self

## ✨ Features

- 📱 **Real-time QR Code Scanner** - Camera-based postcard recognition with manual fallback entry
- 🎭 **Archetype Computation** - Machine-learned probability distribution across four life dimensions
- 🤖 **AI Portrait Generation** - Uses Gemini 2.5 Flash or FLUX models for photorealistic future self generation
- 🎬 **Live Webcam Integration** - Real-time video capture and processing
- 🎨 **Responsive UI** - Beautiful, motion-enhanced interface built with React and Tailwind CSS
- 🔊 **Audio Branding** - Ambient music for each archetype journey
- ⚡ **Progress Tracking** - Real-time generation progress updates
- 🛡️ **Error Handling** - Graceful fallback mechanisms and user-friendly error messages

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first styling
- **Vite 6** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Framer Motion** - Smooth animations
- **jsQR** - QR code detection
- **Lucide React** - Icon library
- **Tone.js** - Audio synthesis

### Backend
- **Express.js** - Lightweight HTTP server
- **Google GenAI SDK** - Gemini model integration
- **OpenRouter API** - Multi-model AI inference
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### DevTools
- **TypeScript 5.8** - Static type checking
- **ESBuild** - Fast JavaScript bundler
- **Autoprefixer** - CSS vendor prefixing

## 📦 Prerequisites

- **Node.js** `v18.0.0` or higher
- **npm** `v9.0.0` or higher (or yarn/pnpm)
- **API Key** - Either:
  - **OpenRouter API Key** (`sk-or-*`) - Recommended for multi-model support
  - **Google AI Studio Key** - For direct Gemini access

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/time-tram-future-you-mirror.git
cd time-tram-future-you-mirror
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API credentials:

```env
# Required: API Key for model access
OPENROUTER_API_KEY=sk-or-your-actual-key-here

# Optional: Custom model list (comma-separated)
# OPENROUTER_MODELS="black-forest-labs/flux.2-pro,google/gemini-2.5-flash-image"

# Optional: Application URL (for production deployments)
# APP_URL=https://yourdomain.com
```

> **⚠️ Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## ⚙️ Configuration

### API Key Setup

#### Option 1: OpenRouter (Recommended)
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Navigate to "Keys" in settings
4. Create a new API key (starts with `sk-or-`)
5. Add to `.env.local`:
   ```env
   OPENROUTER_API_KEY=sk-or-your-key-here
   ```

#### Option 2: Google AI Studio
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. The backend will automatically detect and use this for Gemini models

### Model Configuration (Optional)

If specific models are unavailable in your region, customize the fallback list:

```env
OPENROUTER_MODELS="black-forest-labs/flux.2-pro,black-forest-labs/flux.2-flex,google/gemini-2.5-flash-image"
```

Available models:
- **Gemini 2.5 Flash Image** - Fast, high-quality generations
- **FLUX 2.0 Pro** - Premium quality photorealistic images
- **FLUX 2.0 Flex** - Balanced speed and quality

## 🎯 Getting Started

### Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` with hot module reloading (HMR).

The Express backend automatically runs on port `3000` and serves API endpoints.

### Quick Test Flow

1. Open browser to `http://localhost:5173`
2. Click **Scan QR Codes** mode
3. Enter postcard codes manually (e.g., `C1`, `C2`, etc.) if camera isn't available
4. Select 10 postcards total
5. Click "See Your Future" button
6. Allow webcam access
7. Click "Capture & Generate" to create your AI future portrait

## 📁 Project Structure

```
time-tram-future-you-mirror/
├── src/
│   ├── components/
│   │   ├── QRScanner.tsx          # QR code scanning interface
│   │   ├── MagicMirror.tsx        # AI generation screen
│   │   └── ResultsDisplay.tsx     # Results presentation
│   ├── context/
│   │   └── AppContext.tsx         # Global state management
│   ├── data/
│   │   └── cards.ts               # Postcard definitions & archetype logic
│   ├── utils/
│   │   ├── audioPlayer.ts         # Audio playback
│   │   └── audioSynthesis.ts      # Audio synthesis
│   ├── App.tsx                    # Main app router
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── public/
│   ├── audio/                     # Ambient music tracks
│   │   ├── dominant/              # Archetype-specific audio
│   │   └── goodbye/               # Farewell/transition audio
│   └── index.html                 # HTML template
├── server.ts                      # Express backend server
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies & scripts
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── kill-ports.js                  # Port cleanup utility
└── README.md                      # This file
```

## 💻 Development

### Available Scripts

```bash
# Start development server (auto-kills port 3000 if in use)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm preview

# Type checking
npm run lint

# Clean build artifacts
npm run clean
```

### Code Structure

- **QRScanner.tsx** - Handles camera input, QR decoding, and postcard selection
- **MagicMirror.tsx** - Captures webcam frame and triggers AI generation
- **ResultsDisplay.tsx** - Shows generated portrait and archetype analysis
- **cards.ts** - Contains all 32 postcard definitions with weights for each archetype
- **AppContext.tsx** - Manages selected cards, results, and navigation state
- **server.ts** - Backend API endpoints for image generation and face analysis

### API Endpoints

#### `GET /api/progress`
Returns current generation progress
```json
{
  "progress": 50,
  "step": "Generating image 2/4: Career Archetype",
  "currentArchetype": 2,
  "totalArchetypes": 4
}
```

#### `POST /api/generate-futures`
Generates AI portraits for each archetype
```json
{
  "imageData": "data:image/png;base64,...",
  "selectedCardIds": ["C1", "C2", "C3", ...],
  "genderDetected": "male" | "female" | "neutral"
}
```

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy to Cloud

The app is optimized for deployment to Google Cloud Run or similar platforms:

```bash
# Using Google Cloud CLI
gcloud run deploy time-tram \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENROUTER_API_KEY=sk-or-your-key
```

## 📖 API Documentation

### Backend Server

The Express server handles:
- **Image Generation** - Converts prompts to images using Gemini/FLUX
- **Face Detection** - Analyzes webcam image for gender/expression context
- **Progress Tracking** - Streams generation progress to frontend
- **Fallback Logic** - Automatically tries alternative models if one fails

### Model Fallback Strategy

1. Tries primary model from `OPENROUTER_MODELS` list
2. If model unavailable (region-blocked), tries next in list
3. If all fail, attempts direct Gemini API (if key available)
4. Returns error if all methods exhausted

## 🐛 Troubleshooting

### Camera Not Detected

**Problem**: "Camera access denied" error

**Solutions**:
- Check browser permissions for camera access
- Try in Chrome/Chromium browser (best support)
- In incognito mode, ensure camera permission is granted
- Reset browser camera permissions in settings

### QR Code Not Scanning

**Problem**: Camera active but QR codes not recognized

**Solutions**:
- Ensure good lighting on QR code
- Hold code 6-12 inches from camera
- Use manual entry mode (click "Type Code")
- Check QR code format matches app expectations (C1, C2, etc.)

### Image Generation Fails

**Problem**: "Failed to generate futures" error

**Solutions**:
1. Verify API key is correct and active
2. Check API key quota/rate limits
3. Try different model via `OPENROUTER_MODELS`
4. Check console for detailed error messages:
   ```bash
   # Check backend logs
   npm run dev  # See terminal output
   ```

### Port Already in Use

**Problem**: "EADDRINUSE: address already in use :::3000"

**Solution**: Script auto-kills port 3000, but you can manually:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Vite HMR Issues

**Problem**: Hot reload not working in development

**Solution**: The app detects `DISABLE_HMR=true` environment variable and disables it automatically. For local dev, ensure it's not set:
```bash
$env:DISABLE_HMR=$null  # PowerShell
unset DISABLE_HMR       # Bash
```

## 🔒 Security Considerations

- API keys are server-side only (never exposed to frontend)
- CORS is configured to prevent unauthorized requests
- Webcam streams are processed locally, not stored
- Generated images may be stored temporarily for processing
- `.env.local` must be in `.gitignore` (never commit secrets)

## 📄 License

[Add your license here - MIT, Apache 2.0, etc.]

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check troubleshooting section above
- Review backend logs: `npm run dev`

## ✅ Checklist for First-Time Users

- [ ] Install Node.js v18+
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Get API key (OpenRouter or Google)
- [ ] Create `.env.local` with your key
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:5173`
- [ ] Allow camera/microphone permissions
- [ ] Test with manual code entry first
- [ ] Enjoy your AI future!
