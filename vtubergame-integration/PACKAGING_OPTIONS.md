# VtuberGame Integration: Packaging Options

This document outlines different ways to package and integrate the streaming TTS functionality into your VtuberGame project.

## 🎯 Recommended Approach

**Option 1: Direct Integration (Recommended for VtuberGame)**

This is the best approach for your specific use case since you mentioned the cubism folder is a submodule.

### Advantages:
- ✅ Full control over the code
- ✅ Easy to customize for VtuberGame specific needs
- ✅ No npm dependency management
- ✅ Works with your existing submodule setup
- ✅ Can modify Live2D package directly

### Setup:
```bash
# 1. Copy the streaming module to your Live2D package
cp -r src/streaming/ /path/to/your/vtubergame/live2d-package/src/

# 2. Copy the integration helper
cp -r vtubergame-integration/src/ /path/to/your/vtubergame/src/tts-integration/

# 3. Apply the documented Live2D modifications
# Follow LIVE2D_PACKAGE_MODIFICATIONS.md

# 4. Setup Kokoro assets
node vtubergame-integration/scripts/setup-kokoro.js /path/to/your/vtubergame
```

## 🔄 Alternative Approaches

### Option 2: NPM Package (Future-ready)

If you want to publish this as a reusable package:

```bash
cd vtubergame-integration
npm publish
```

Then in your VtuberGame:
```bash
npm install pixi-live2d-streaming-tts
```

### Option 3: Git Submodule

Add this repository as a submodule to your VtuberGame:

```bash
cd /path/to/your/vtubergame
git submodule add https://github.com/K-Jadeja/pixi-live2d-display.git live2d-streaming
git submodule update --init --recursive
```

### Option 4: Fork and Modify

Fork your existing pixi-live2d-display and merge these changes:

```bash
# In your Live2D package fork
git remote add streaming-tts https://github.com/K-Jadeja/pixi-live2d-display.git
git fetch streaming-tts
git merge streaming-tts/master
```

## 📦 Package Contents

The integration package includes:

```
vtubergame-integration/
├── src/
│   └── index.ts                   # Main integration API
├── scripts/
│   └── setup-kokoro.js           # Automated setup script
├── package.json                  # Package configuration
├── vite.config.ts                # Build configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Usage documentation
└── INTEGRATION_GUIDE.md          # Detailed integration guide
```

## 🚀 Quick Setup for VtuberGame

Here's the fastest way to get this working in your VtuberGame:

### Step 1: Copy Core Files

```bash
# Copy the streaming module
cp -r src/streaming/ /your/vtubergame/path/to/live2d/src/

# Copy integration helper
cp -r vtubergame-integration/src/index.ts /your/vtubergame/src/tts-integration.ts
```

### Step 2: Apply Live2D Modifications

Apply these changes to your Live2D package:

**MotionManager.ts** - Add the `speakText` method:
```typescript
// Add to your MotionManager class
async speakText(
    text: string,
    options: {
        voice?: string;
        speed?: number;
        volume?: number;
        expression?: string;
        onStart?: () => void;
        onFinish?: () => void;
    } = {},
): Promise<boolean> {
    // Implementation from LIVE2D_PACKAGE_MODIFICATIONS.md
}
```

**Live2DModel.ts** - Add public TTS API:
```typescript
// Add to your Live2DModel class
async speakText(text: string, options?: any): Promise<void> {
    return this.motionManager.speakText(text, options);
}
```

### Step 3: Setup Kokoro Assets

```bash
# Run the setup script
node vtubergame-integration/scripts/setup-kokoro.js /your/vtubergame/path
```

Or manually download to `public/kokoro/`:
- worker.js
- kokoro.js
- voices.js
- phonemize.js
- semantic-split.js

### Step 4: Use in VtuberGame

```typescript
import './tts-integration.ts';

// Your existing VtuberGame code
const model = await Live2DModel.from('character.model3.json');

// Enable streaming TTS
const character = await setupVtuberGameTTS(model);

// Replace your existing TTS calls
await character.speakText("Hello from VtuberGame!");
```

## 🎮 VtuberGame Specific Considerations

### Cubism Submodule Compatibility

Since your cubism folder is a submodule:

1. **Apply modifications to your fork** of the Live2D package
2. **Update your submodule** to point to your modified version
3. **Keep streaming files separate** from the submodule

### Integration with Existing VtuberGame Features

```typescript
// Character selection
const characters = [
    await setupVtuberGameTTS(model1, { defaultVoice: 'af_heart' }),
    await setupVtuberGameTTS(model2, { defaultVoice: 'am_Adam' })
];

// Game event integration
gameEvents.on('character_speak', async (characterId, text) => {
    await characters[characterId].speakText(text);
});

// UI integration
document.getElementById('speak-button').addEventListener('click', () => {
    const text = document.getElementById('dialogue-input').value;
    const activeCharacter = getActiveCharacter();
    activeCharacter.speakText(text);
});
```

### Performance Optimization for VtuberGame

```typescript
// Preload voices for faster response
await character.speakText("", { voice: 'af_heart' }); // Preload
await character.speakText("", { voice: 'am_Adam' });   // Preload

// Batch character setup
const characters = await Promise.all([
    setupVtuberGameTTS(model1),
    setupVtuberGameTTS(model2),
    setupVtuberGameTTS(model3)
]);
```

## 🔧 Build Configuration

If you want to build the integration package:

```bash
cd vtubergame-integration
npm install
npm run build
```

This creates:
- `dist/index.js` - CommonJS bundle
- `dist/index.es.js` - ES Module bundle
- `dist/index.d.ts` - TypeScript definitions

## 📋 Migration Checklist

For migrating your existing VtuberGame TTS:

- [ ] Copy streaming module to Live2D package
- [ ] Apply MotionManager modifications
- [ ] Apply Live2DModel modifications
- [ ] Setup Kokoro assets in public directory
- [ ] Copy integration helper
- [ ] Update VtuberGame TTS calls
- [ ] Test with one character first
- [ ] Migrate UI controls
- [ ] Test all voice options
- [ ] Add error handling
- [ ] Test in production environment

## 🎯 Final Recommendation

For your VtuberGame project, I recommend:

1. **Use Option 1 (Direct Integration)** - Copy files directly
2. **Modify your Live2D package fork** - Apply the documented changes
3. **Use the setup script** - Automates Kokoro asset setup
4. **Start with one character** - Test thoroughly before migrating all
5. **Keep documentation handy** - Reference the technical guides

This approach gives you the most control and flexibility for your VtuberGame while providing all the performance benefits of streaming TTS with perfect lip sync.

The setup script will handle most of the heavy lifting, and you'll have streaming TTS working in your VtuberGame in minutes rather than hours! 🚀