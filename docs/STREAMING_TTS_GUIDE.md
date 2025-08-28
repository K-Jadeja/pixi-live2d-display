# Streaming Text-to-Speech Integration with Live2D

This guide explains how to use the new streaming text-to-speech functionality in pixi-live2d-display, powered by KokoroJS TTS engine. This feature enables real-time speech generation from text with synchronized lip movements on Live2D models.

## Overview

The streaming TTS integration adds the following capabilities to your Live2D models:

- **Real-time text-to-speech generation** using the Kokoro TTS model
- **Streaming audio playback** with live lip sync
- **Multiple voice styles** and languages
- **Customizable speech parameters** (speed, volume, expressions)
- **Non-blocking operation** that works alongside existing features

## Quick Start

### Basic Usage

```typescript
import { Live2DModel } from "pixi-live2d-display";

// Load your Live2D model
const model = await Live2DModel.from("path/to/model.json");

// Speak text with default settings
await model.speakText("Hello! I can speak any text with lip sync!");

// Speak with custom options
await model.speakText("This is amazing!", {
    voice: "af_heart",      // Voice style
    speed: 1.2,             // Speaking speed
    volume: 0.8,            // Audio volume
    expression: "happy",    // Facial expression during speech
    onFinish: () => console.log("Speech completed!"),
    onError: (error) => console.error("Speech error:", error)
});
```

### Advanced Usage

```typescript
// Multiple expressions and voices
const conversations = [
    { text: "Hello there!", voice: "af", expression: "happy" },
    { text: "How are you today?", voice: "am", expression: "curious" },
    { text: "I'm doing great!", voice: "bf", expression: "excited" }
];

for (const conv of conversations) {
    await model.speakText(conv.text, {
        voice: conv.voice,
        expression: conv.expression,
        resetExpression: true
    });
    
    // Wait a moment between speeches
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// Stop speech if needed
model.stopStreamingSpeech();
```

## API Reference

### Live2DModel.speakText()

Generates speech from text using Kokoro TTS with real-time lip sync.

```typescript
model.speakText(text: string, options?: SpeakTextOptions): Promise<boolean>
```

#### Parameters

- **text** (string): The text to convert to speech
- **options** (SpeakTextOptions, optional): Configuration options

#### SpeakTextOptions

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `voice` | string | `"af"` | Voice style to use (see Available Voices) |
| `speed` | number | `1` | Speaking speed multiplier (0.5 - 2.0) |
| `volume` | number | `0.5` | Audio volume (0.0 - 1.0) |
| `expression` | number \\| string | `undefined` | Expression to apply during speech |
| `resetExpression` | boolean | `true` | Reset expression after speech completes |
| `onFinish` | function | `undefined` | Callback when speech completes |
| `onError` | function | `undefined` | Callback when error occurs |

#### Returns

Promise<boolean> - Resolves to `true` if speech started successfully, `false` otherwise.

### Live2DModel.stopStreamingSpeech()

Stops current streaming speech generation and playback.

```typescript
model.stopStreamingSpeech(): void
```

## Available Voices

The integration includes multiple voice styles:

| Voice ID | Description | Language | Gender |
|----------|-------------|----------|---------|
| `af` | American Female | American English | Female |
| `af_heart` | American Female (Heart) | American English | Female |
| `am` | American Male | American English | Male |
| `bf` | British Female | British English | Female |
| `bm` | British Male | British English | Male |

More voices may be available depending on the Kokoro model configuration.

## Technical Details

### Architecture

The streaming TTS system consists of several components:

1. **KokoroStreamingManager**: Coordinates TTS generation and audio streaming
2. **StreamingAudioSource**: Handles audio chunk playback and provides AnalyserNode for lip sync
3. **MotionManager Extensions**: Integrates streaming audio analysis with existing lip sync system
4. **Live2DModel Extensions**: Provides high-level API for easy usage

### Audio Processing

- **Sample Rate**: 24 kHz (high quality)
- **Format**: Float32Array audio chunks
- **Latency**: Low-latency streaming with real-time lip sync
- **Analysis**: Uses Web Audio API AnalyserNode for lip movement calculation

### Performance Considerations

- TTS model initialization may take a few seconds on first use
- Audio generation happens in real-time, streaming chunks as they're produced
- Memory usage scales with text length and audio buffer size
- WebGPU acceleration used when available for faster TTS generation

## Integration Examples

### Basic Web Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Live2D Streaming Speech Demo</title>
</head>
<body>
    <canvas id="canvas"></canvas>
    <div>
        <textarea id="textInput" placeholder="Enter text to speak..."></textarea>
        <button onclick="speakText()">Speak</button>
        <button onclick="stopSpeech()">Stop</button>
    </div>
    
    <script type="module">
        import { Live2DModel } from "pixi-live2d-display";
        import { Application } from "@pixi/app";
        
        const app = new Application({ view: document.getElementById("canvas") });
        const model = await Live2DModel.from("assets/model.json");
        app.stage.addChild(model);
        
        window.speakText = async () => {
            const text = document.getElementById("textInput").value;
            await model.speakText(text);
        };
        
        window.stopSpeech = () => {
            model.stopStreamingSpeech();
        };
    </script>
</body>
</html>
```

### React Component

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Live2DModel } from 'pixi-live2d-display';
import { Application } from '@pixi/app';

const Live2DSpeechDemo: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<Live2DModel | null>(null);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const initModel = async () => {
            if (!canvasRef.current) return;
            
            const app = new Application({ view: canvasRef.current });
            const loadedModel = await Live2DModel.from('assets/model.json');
            
            app.stage.addChild(loadedModel);
            setModel(loadedModel);
            setIsLoading(false);
        };
        
        initModel();
    }, []);

    const handleSpeak = async () => {
        if (!model || !text.trim()) return;
        
        setIsSpeaking(true);
        
        try {
            await model.speakText(text, {
                voice: 'af_heart',
                expression: 'happy',
                onFinish: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false)
            });
        } catch (error) {
            console.error('Speech error:', error);
            setIsSpeaking(false);
        }
    };

    const handleStop = () => {
        if (model) {
            model.stopStreamingSpeech();
            setIsSpeaking(false);
        }
    };

    return (
        <div>
            <canvas ref={canvasRef} />
            
            {!isLoading && (
                <div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to speak..."
                    />
                    <button onClick={handleSpeak} disabled={isSpeaking}>
                        {isSpeaking ? 'Speaking...' : 'Speak'}
                    </button>
                    <button onClick={handleStop} disabled={!isSpeaking}>
                        Stop
                    </button>
                </div>
            )}
        </div>
    );
};

export default Live2DSpeechDemo;
```

## Error Handling

Common errors and how to handle them:

```typescript
await model.speakText("Hello world", {
    onError: (error) => {
        switch (error.message) {
            case 'TTS system not initialized':
                console.log('Please wait for initialization to complete');
                break;
            case 'Already generating speech':
                console.log('Wait for current speech to finish or call stopStreamingSpeech()');
                break;
            case 'Voice not found':
                console.log('Check voice ID and available voices');
                break;
            default:
                console.error('Unexpected error:', error);
        }
    }
});
```

## Comparison with Traditional speak() Method

| Feature | Traditional speak() | New speakText() |
|---------|-------------------|-----------------|
| Input | Audio file URL/base64 | Text string |
| Latency | File load time | Real-time generation |
| Flexibility | Pre-recorded audio | Dynamic text-to-speech |
| File Size | Large audio files | No audio files needed |
| Voices | Single voice per file | Multiple voice styles |
| Languages | Limited by recordings | Multiple languages supported |

## Browser Compatibility

- **Recommended**: Chrome/Edge with WebGPU support for optimal performance
- **Compatible**: Any modern browser with Web Audio API support
- **WebGPU**: Automatic acceleration when available, fallback to WebAssembly
- **Mobile**: Supported on modern mobile browsers

## Troubleshooting

### Common Issues

1. **TTS initialization takes too long**
   - First load downloads the TTS model (~300MB)
   - Subsequent loads use cached model
   - Use progress callbacks to show loading status

2. **Audio doesn't play**
   - Check browser autoplay policies
   - Ensure user interaction before first speech
   - Verify audio context state

3. **Lip sync not working**
   - Ensure model has mouth parameters configured
   - Check that analyser node is properly connected
   - Verify audio is actually playing

4. **Memory issues with long text**
   - Break long text into smaller chunks
   - Use semantic splitting for natural breaks
   - Clear resources between speeches

### Performance Optimization

```typescript
// Pre-initialize for faster first speech
const manager = new KokoroStreamingManager();
await manager.initialize();

// Reuse manager across multiple speeches
model.internalModel.motionManager.kokoroStreamingManager = manager;

// Clean up when done
manager.dispose();
```

## Future Enhancements

Planned improvements for future versions:

- Additional voice models and languages
- Emotion-based voice variation
- SSML (Speech Synthesis Markup Language) support
- Voice cloning capabilities
- Real-time voice modulation
- Batch processing for multiple texts
- WebRTC integration for live streaming

## Contributing

To contribute to the streaming TTS integration:

1. Review the source code in `src/streaming/`
2. Test with various Live2D models and text inputs
3. Report issues and submit pull requests
4. Help improve documentation and examples

## License

This streaming TTS integration maintains the same license as the base pixi-live2d-display library. The Kokoro TTS model components are licensed under the Apache 2.0 License.