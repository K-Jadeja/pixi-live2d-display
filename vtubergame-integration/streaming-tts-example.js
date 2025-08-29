// VtuberGame Streaming TTS Integration Example
// This file shows how to replace your existing TTS implementation

import { setupVtuberGameTTS, VtuberGameUtils } from './tts-integration/index.js';

/**
 * Example: Complete VtuberGame character setup with streaming TTS
 */
class VtuberGameCharacter {
    constructor() {
        this.model = null;
        this.isInitialized = false;
        this.currentVoice = 'af_heart';
    }

    async initialize(modelPath) {
        try {
            // Check browser support first
            const support = VtuberGameUtils.checkBrowserSupport();
            if (!support.supported) {
                console.warn('Browser missing features:', support.missing);
                // You could show a warning or disable TTS features
            }

            // Load your Live2D model (existing VtuberGame code)
            this.model = await Live2DModel.from(modelPath);
            
            // Enable streaming TTS (NEW!)
            this.model = await setupVtuberGameTTS(this.model, {
                kokoroWorkerPath: '/kokoro/worker.js',
                defaultVoice: this.currentVoice,
                defaultSpeed: 1.0,
                defaultVolume: 0.8
            });

            this.isInitialized = true;
            console.log('✅ Character initialized with streaming TTS');
            
            return this.model;
            
        } catch (error) {
            console.error('❌ Character initialization failed:', error);
            throw error;
        }
    }

    /**
     * MIGRATION: Replace your existing speak method with this
     */
    async speak(text, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Character not initialized');
        }

        // OLD VtuberGame TTS code would be something like:
        // const audioFile = await this.generateTTSFile(text, voice);
        // await this.playAudioFile(audioFile);
        // this.updateLipSync(audioFile);

        // NEW streaming TTS code:
        try {
            await this.model.speakText(text, {
                voice: options.voice || this.currentVoice,
                speed: options.speed || 1.0,
                volume: options.volume || 0.8,
                expression: options.expression,
                onStart: () => {
                    console.log(`${this.name} started speaking: "${text}"`);
                    if (options.onStart) options.onStart();
                },
                onFinish: () => {
                    console.log(`${this.name} finished speaking`);
                    if (options.onFinish) options.onFinish();
                },
                onError: (error) => {
                    console.error(`${this.name} TTS error:`, error);
                    if (options.onError) options.onError(error);
                }
            });
        } catch (error) {
            console.error('Speech failed:', error);
            // You could implement fallback behavior here
            // like showing text bubbles instead of speech
        }
    }

    stop() {
        if (this.model && this.model.stopSpeaking) {
            this.model.stopSpeaking();
        }
    }

    setVoice(voice) {
        this.currentVoice = voice;
    }

    getAvailableVoices() {
        if (this.model && this.model.getAvailableVoices) {
            return this.model.getAvailableVoices();
        }
        return ['af_heart', 'am_Adam', 'am_michael', 'af_sarah'];
    }
}

/**
 * Example: VtuberGame scene with multiple characters
 */
class VtuberGameScene {
    constructor() {
        this.characters = new Map();
        this.currentSpeaker = null;
    }

    async addCharacter(name, modelPath, defaultVoice = 'af_heart') {
        const character = new VtuberGameCharacter();
        character.name = name;
        character.currentVoice = defaultVoice;
        
        const model = await character.initialize(modelPath);
        
        // Add to your PIXI stage (existing VtuberGame code)
        this.app.stage.addChild(model);
        
        this.characters.set(name, character);
        console.log(`✅ Added character: ${name}`);
        
        return character;
    }

    async characterSpeak(characterName, text, options = {}) {
        const character = this.characters.get(characterName);
        if (!character) {
            throw new Error(`Character ${characterName} not found`);
        }

        // Stop any current speaker
        if (this.currentSpeaker && this.currentSpeaker !== character) {
            this.currentSpeaker.stop();
        }

        this.currentSpeaker = character;
        
        await character.speak(text, {
            ...options,
            onFinish: () => {
                this.currentSpeaker = null;
                if (options.onFinish) options.onFinish();
            }
        });
    }

    stopAllSpeech() {
        this.characters.forEach(character => character.stop());
        this.currentSpeaker = null;
    }
}

/**
 * Example: VtuberGame dialogue system integration
 */
class VtuberGameDialogue {
    constructor(scene) {
        this.scene = scene;
        this.dialogueQueue = [];
        this.isProcessing = false;
    }

    async addDialogue(characterName, text, voice = null) {
        this.dialogueQueue.push({ characterName, text, voice });
        
        if (!this.isProcessing) {
            await this.processQueue();
        }
    }

    async processQueue() {
        this.isProcessing = true;
        
        while (this.dialogueQueue.length > 0) {
            const { characterName, text, voice } = this.dialogueQueue.shift();
            
            try {
                await this.scene.characterSpeak(characterName, text, {
                    voice: voice,
                    onStart: () => this.showDialogueBox(characterName, text),
                    onFinish: () => this.hideDialogueBox()
                });
                
                // Wait a bit between dialogues
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error('Dialogue failed:', error);
                // Continue with next dialogue even if one fails
            }
        }
        
        this.isProcessing = false;
    }

    showDialogueBox(characterName, text) {
        // Your existing VtuberGame UI code
        console.log(`[${characterName}]: ${text}`);
    }

    hideDialogueBox() {
        // Your existing VtuberGame UI code
    }
}

/**
 * Example: VtuberGame UI integration
 */
function setupVtuberGameUI(scene) {
    // Voice selector
    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect) {
        // Populate with available voices
        const character = scene.characters.values().next().value;
        if (character) {
            const voices = character.getAvailableVoices();
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice;
                option.textContent = voice.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                voiceSelect.appendChild(option);
            });
        }
    }

    // Speak button
    const speakBtn = document.getElementById('speak-button');
    const textInput = document.getElementById('text-input');
    const characterSelect = document.getElementById('character-select');
    
    if (speakBtn && textInput) {
        speakBtn.addEventListener('click', async () => {
            const text = textInput.value.trim();
            const selectedVoice = voiceSelect?.value;
            const selectedCharacter = characterSelect?.value || scene.characters.keys().next().value;
            
            if (text && selectedCharacter) {
                try {
                    await scene.characterSpeak(selectedCharacter, text, {
                        voice: selectedVoice
                    });
                } catch (error) {
                    console.error('Speech failed:', error);
                    alert('Speech failed. Please try again.');
                }
            }
        });
    }

    // Stop button
    const stopBtn = document.getElementById('stop-button');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            scene.stopAllSpeech();
        });
    }
}

/**
 * Example: Complete VtuberGame setup
 */
async function initializeVtuberGame() {
    try {
        // Create your PIXI application (existing VtuberGame code)
        const app = new PIXI.Application({
            width: 1920,
            height: 1080,
            backgroundColor: 0x1099bb
        });
        document.body.appendChild(app.view);

        // Create scene
        const scene = new VtuberGameScene();
        scene.app = app;

        // Add characters with different voices
        await scene.addCharacter('alice', 'models/alice.model3.json', 'af_heart');
        await scene.addCharacter('bob', 'models/bob.model3.json', 'am_Adam');
        await scene.addCharacter('eve', 'models/eve.model3.json', 'af_sarah');

        // Setup dialogue system
        const dialogue = new VtuberGameDialogue(scene);

        // Setup UI
        setupVtuberGameUI(scene);

        // Demo conversation
        await dialogue.addDialogue('alice', "Hello! Welcome to VtuberGame!");
        await dialogue.addDialogue('bob', "I'm excited to show you our new streaming TTS!");
        await dialogue.addDialogue('eve', "The lip sync is perfect now!");

        console.log('🎮 VtuberGame initialized with streaming TTS!');
        
        return { scene, dialogue };

    } catch (error) {
        console.error('❌ VtuberGame initialization failed:', error);
        throw error;
    }
}

/**
 * Example: Migration helper for existing VtuberGame TTS
 */
class LegacyTTSMigrator {
    constructor() {
        this.useStreamingTTS = true;
        this.fallbackEnabled = true;
    }

    // Replace your existing TTS calls with this method
    async speak(character, text, voice = 'af_heart') {
        if (this.useStreamingTTS && character.hasTTSSupport) {
            // Use new streaming TTS
            try {
                await character.speakText(text, { voice });
                return true;
            } catch (error) {
                console.warn('Streaming TTS failed, falling back:', error);
                if (!this.fallbackEnabled) throw error;
            }
        }

        // Fallback to your old TTS implementation
        console.log('Using legacy TTS fallback');
        // Your old TTS code here...
        throw new Error('Legacy TTS not implemented - please configure streaming TTS');
    }
}

// Export for use in your VtuberGame
export {
    VtuberGameCharacter,
    VtuberGameScene,
    VtuberGameDialogue,
    setupVtuberGameUI,
    initializeVtuberGame,
    LegacyTTSMigrator
};

// Auto-initialize if this is the main module
if (typeof window !== 'undefined') {
    window.VtuberGameStreamingTTS = {
        VtuberGameCharacter,
        VtuberGameScene,
        VtuberGameDialogue,
        setupVtuberGameUI,
        initializeVtuberGame,
        LegacyTTSMigrator
    };
    
    console.log('🎵 VtuberGame Streaming TTS loaded!');
    console.log('Use window.VtuberGameStreamingTTS to access the API');
}