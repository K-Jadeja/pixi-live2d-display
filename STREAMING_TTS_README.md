# 🎭 Streaming Text-to-Speech Integration

## Overview

This repository now includes **streaming text-to-speech integration** powered by [KokoroJS](https://github.com/rhulha/StreamingKokoroJS), enabling Live2D models to speak any text with real-time lip synchronization. This revolutionary feature transforms static models into interactive, speaking characters.

## ✨ New Features

### 🗣️ Text-to-Speech with Lip Sync
```typescript
// Make your Live2D model speak any text!
await model.speakText("Hello! I can speak any text with perfect lip sync!");

// Customize voice, speed, and expressions
await model.speakText("This is amazing!", {
    voice: "af_heart",      // Voice style
    speed: 1.2,             // Speaking speed
    volume: 0.8,            // Audio volume  
    expression: "happy",    // Facial expression
    onFinish: () => console.log("Speech completed!")
});
```

### 🎵 Multiple Voice Styles
- **af** - American Female
- **af_heart** - American Female (Heart)
- **am** - American Male
- **bf** - British Female  
- **bm** - British Male

### ⚡ Real-Time Processing
- **Streaming Audio**: Audio generated and played in real-time
- **Low Latency**: Minimal delay between text input and speech
- **High Quality**: 24kHz sample rate for crisp audio
- **WebGPU Accelerated**: Faster processing when available

## 🚀 Quick Start

### Installation
```bash
npm install pixi-live2d-display-lipsyncpatch
```

### Basic Usage
```typescript
import { Live2DModel } from "pixi-live2d-display";
import { Application } from "@pixi/app";

// Set up PIXI application
const app = new Application({ 
    view: document.getElementById("canvas") 
});

// Load Live2D model
const model = await Live2DModel.from("path/to/model.json");
app.stage.addChild(model);

// Make the model speak!
await model.speakText("Hello! I'm a talking Live2D character!");
```

### Advanced Example
```typescript
// Interactive conversation
const conversation = [
    { text: "Welcome to my world!", voice: "af_heart", expression: "happy" },
    { text: "I can express emotions while speaking", voice: "af", expression: "excited" },  
    { text: "And switch between different voices", voice: "am", expression: "surprised" }
];

for (const line of conversation) {
    await model.speakText(line.text, {
        voice: line.voice,
        expression: line.expression,
        speed: 1.1,
        resetExpression: true
    });
    
    // Brief pause between lines
    await new Promise(resolve => setTimeout(resolve, 1000));
}
```

## 📖 API Reference

### Live2DModel.speakText()
Generates speech from text with synchronized lip movements.

**Parameters:**
- `text` (string): Text to convert to speech
- `options` (object, optional):
  - `voice` (string): Voice style ("af", "af_heart", "am", "bf", "bm")
  - `speed` (number): Speaking speed multiplier (0.5-2.0)
  - `volume` (number): Audio volume (0.0-1.0)
  - `expression` (string|number): Facial expression during speech
  - `resetExpression` (boolean): Reset expression after completion
  - `onFinish` (function): Callback when speech completes
  - `onError` (function): Callback when error occurs

**Returns:** Promise<boolean> - Success status

### Live2DModel.stopStreamingSpeech()
Stops current streaming speech and playback.

## 🎨 Demo & Examples

### Interactive Demo
Open `demo.html` in your browser to see the streaming TTS in action with:
- Real-time text input
- Voice style selection
- Expression control
- Speed adjustment
- Visual lip sync demonstration

### Code Examples
Check out `examples/streaming-speech.ts` for comprehensive usage examples including:
- Basic text-to-speech
- Multiple voice demonstrations
- Interactive UI integration
- Error handling patterns

## 🛠️ Technical Details

### Architecture
```
Text Input → Kokoro TTS → Audio Chunks → StreamingAudioSource → AnalyserNode → Lip Sync
```

### Key Components
- **StreamingAudioSource**: Handles real-time audio chunk playback
- **KokoroStreamingManager**: Coordinates TTS generation and streaming
- **Enhanced MotionManager**: Integrates streaming analysis with existing lip sync
- **Live2DModel Extensions**: Provides developer-friendly API

### Performance
- **Model Size**: ~300MB (cached after first load)
- **Sample Rate**: 24kHz high-quality audio
- **Latency**: Real-time streaming with minimal delay
- **Memory**: Efficient chunk-based processing

## 📊 Comparison: Traditional vs Streaming

| Feature | Traditional `speak()` | New `speakText()` |
|---------|---------------------|------------------|
| Input | Audio files | Text strings |
| Latency | File loading time | Real-time generation |
| Flexibility | Pre-recorded only | Dynamic text |
| File Size | Large audio files | No files needed |
| Voices | Single per file | Multiple styles |
| Languages | Limited recordings | Multi-language TTS |

## 🌐 Browser Compatibility

- **Recommended**: Chrome/Edge with WebGPU support
- **Compatible**: Modern browsers with Web Audio API
- **Mobile**: Supported on modern mobile browsers
- **Fallback**: WebAssembly when WebGPU unavailable

## 📚 Documentation

### Complete Guide
See [`docs/STREAMING_TTS_GUIDE.md`](docs/STREAMING_TTS_GUIDE.md) for:
- Comprehensive API documentation
- Usage examples and best practices
- Browser compatibility details
- Troubleshooting guide
- Performance optimization tips

### Implementation Details
See [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) for:
- Technical architecture overview
- Integration approach
- File structure and modifications
- Future enhancement roadmap

## 🧪 Testing

Run the streaming TTS tests:
```bash
npm test test/units/streaming.test.ts
```

Test coverage includes:
- StreamingAudioSource functionality
- KokoroStreamingManager integration
- Voice system validation
- Error handling scenarios

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Run `npm install`
3. Initialize submodules: `git submodule update --init`
4. Run setup: `npm run setup`

### Adding New Features
- **Voice Models**: Add new voices to `src/streaming-kokoro/voices.js`
- **TTS Engines**: Extend `KokoroStreamingManager` for new engines
- **Audio Processing**: Enhance `StreamingAudioSource` for new formats
- **UI Components**: Add examples to `examples/` directory

## 🔄 Migration Guide

### From File-Based Audio
```typescript
// Old approach - using audio files
await model.speak("path/to/audio.mp3", {
    expression: "happy",
    volume: 0.8
});

// New approach - using text
await model.speakText("Hello world!", {
    voice: "af_heart",
    expression: "happy", 
    volume: 0.8
});
```

### Backward Compatibility
- All existing `speak()` functionality remains unchanged
- New methods are additive, not replacing existing ones
- Existing projects continue to work without modification

## 🎯 Use Cases

### Gaming
- **NPCs**: Dynamic dialogue without pre-recorded audio
- **Narration**: Real-time story narration with character voices
- **Tutorials**: Interactive guidance with speaking characters

### Education
- **Language Learning**: Pronunciation practice with native voices
- **Interactive Lessons**: Speaking tutors and assistants
- **Accessibility**: Text-to-speech for learning materials

### Entertainment
- **Virtual Characters**: Streaming personalities with Live2D avatars
- **Interactive Stories**: Dynamic narrative experiences
- **Social Applications**: Speaking avatars for communication

### Business
- **Customer Service**: AI assistants with human-like presentation
- **Presentations**: Animated speakers for corporate content
- **Training**: Interactive training modules with speaking guides

## 🚀 Future Roadmap

### Planned Enhancements
- **Additional Languages**: Expand beyond English voices
- **Emotion Control**: Fine-grained emotional voice modulation
- **SSML Support**: Speech Synthesis Markup Language integration
- **Voice Cloning**: Custom voice training capabilities
- **Real-time Modulation**: Live voice effects and filters

### Performance Improvements
- **Model Optimization**: Smaller, faster TTS models
- **Streaming Efficiency**: Reduced latency and memory usage
- **Batch Processing**: Multiple text segments optimization
- **WebRTC Integration**: Real-time communication features

## 📄 License

This streaming TTS integration maintains the same MIT license as the base pixi-live2d-display library. KokoroJS components are licensed under Apache 2.0.

## 🙏 Acknowledgments

- **[KokoroJS](https://github.com/hexgrad/kokoro)**: Open-weight TTS model with 82M parameters
- **[StreamingKokoroJS](https://github.com/rhulha/StreamingKokoroJS)**: Browser-based streaming TTS implementation
- **[Hugging Face](https://huggingface.co/)**: Transformers.js framework for browser ML
- **[Live2D](https://www.live2d.com/)**: Live2D Cubism SDK for character animation

---

Transform your Live2D models from static displays into interactive, speaking characters with the power of real-time text-to-speech and synchronized lip movements! 🎭✨