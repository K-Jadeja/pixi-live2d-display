// Streaming TTS Integration Plugin for VtuberGame
// This module provides easy integration of streaming TTS and lip sync functionality

import { Live2DModel } from 'pixi-live2d-display';

// Re-export the streaming components from the main package
export { KokoroStreamingManager } from '../src/streaming/KokoroStreamingManager';
export { StreamingAudioSource } from '../src/streaming/StreamingAudioSource';

// Interface for VtuberGame compatibility
export interface VtuberGameTTSOptions {
    voice?: string;
    speed?: number;
    volume?: number;
    expression?: string;
    onStart?: () => void;
    onFinish?: () => void;
    onError?: (error: Error) => void;
}

// Enhanced Live2D Model interface for VtuberGame
export interface VtuberGameLive2DModel extends Live2DModel {
    speakText(text: string, options?: VtuberGameTTSOptions): Promise<void>;
    stopSpeaking(): void;
    hasTTSSupport: boolean;
    getAvailableVoices(): string[];
}

/**
 * Initialize streaming TTS support for a Live2D model
 * This is the main entry point for VtuberGame integration
 */
export function enableStreamingTTS(model: Live2DModel, kokoroWorkerPath = '/kokoro/worker.js'): VtuberGameLive2DModel {
    // Extend the model with TTS capabilities
    const enhancedModel = model as VtuberGameLive2DModel;
    
    // Add TTS support flag
    enhancedModel.hasTTSSupport = true;
    
    // Add speakText method that matches VtuberGame expectations
    enhancedModel.speakText = async function(text: string, options: VtuberGameTTSOptions = {}) {
        try {
            // Delegate to the motion manager's speakText method
            await this.motionManager.speakText(text, {
                voice: options.voice || 'af_heart',
                speed: options.speed || 1.0,
                volume: options.volume || 0.8,
                expression: options.expression,
                onStart: options.onStart,
                onFinish: options.onFinish
            });
        } catch (error) {
            if (options.onError) {
                options.onError(error as Error);
            } else {
                console.error('TTS Error:', error);
            }
        }
    };
    
    // Add stop speaking method
    enhancedModel.stopSpeaking = function() {
        if (this.motionManager.kokoroStreamingManager) {
            this.motionManager.kokoroStreamingManager.stop();
        }
    };
    
    // Add method to get available voices
    enhancedModel.getAvailableVoices = function() {
        if (this.motionManager.kokoroStreamingManager) {
            return Object.keys(this.motionManager.kokoroStreamingManager.getVoices());
        }
        return ['af_heart', 'am_Adam', 'am_michael', 'af_sarah'];
    };
    
    return enhancedModel;
}

/**
 * Quick setup function for VtuberGame
 * This replaces the existing TTS implementation with minimal code changes
 */
export async function setupVtuberGameTTS(model: Live2DModel, config: {
    kokoroWorkerPath?: string;
    defaultVoice?: string;
    defaultSpeed?: number;
    defaultVolume?: number;
} = {}): Promise<VtuberGameLive2DModel> {
    
    // Enable streaming TTS
    const enhancedModel = enableStreamingTTS(model, config.kokoroWorkerPath);
    
    // Create a simplified speak function that VtuberGame can use as a drop-in replacement
    (enhancedModel as any).speak = async function(text: string, voiceOrOptions?: string | VtuberGameTTSOptions) {
        const options: VtuberGameTTSOptions = typeof voiceOrOptions === 'string' 
            ? { voice: voiceOrOptions }
            : (voiceOrOptions || {});
        
        // Apply defaults from config
        if (!options.voice) options.voice = config.defaultVoice || 'af_heart';
        if (!options.speed) options.speed = config.defaultSpeed || 1.0;
        if (!options.volume) options.volume = config.defaultVolume || 0.8;
        
        return this.speakText(text, options);
    };
    
    return enhancedModel;
}

/**
 * Migration helper for existing VtuberGame TTS code
 * This allows gradual migration from file-based TTS to streaming TTS
 */
export class VtuberGameTTSMigrator {
    private model: VtuberGameLive2DModel;
    private useStreaming: boolean;
    
    constructor(model: VtuberGameLive2DModel, useStreaming = true) {
        this.model = model;
        this.useStreaming = useStreaming && model.hasTTSSupport;
    }
    
    async speak(text: string, options: VtuberGameTTSOptions = {}) {
        if (this.useStreaming) {
            return this.model.speakText(text, options);
        } else {
            // Fallback to original TTS implementation
            console.warn('Streaming TTS not available, using fallback');
            // Here you would call the original TTS method
            throw new Error('Fallback TTS not implemented - configure streaming TTS');
        }
    }
    
    stop() {
        if (this.useStreaming) {
            this.model.stopSpeaking();
        }
    }
    
    isStreamingAvailable(): boolean {
        return this.useStreaming;
    }
}

// Utility functions for VtuberGame integration
export const VtuberGameUtils = {
    /**
     * Check if browser supports streaming TTS
     */
    checkBrowserSupport(): { supported: boolean; missing: string[] } {
        const missing: string[] = [];
        
        if (!window.AudioContext && !(window as any).webkitAudioContext) {
            missing.push('WebAudio API');
        }
        
        if (!window.Worker) {
            missing.push('WebWorker');
        }
        
        return {
            supported: missing.length === 0,
            missing
        };
    },
    
    /**
     * Setup Kokoro worker files for VtuberGame
     */
    async setupKokoroAssets(publicPath = '/public'): Promise<void> {
        // This would copy the necessary Kokoro files to the public directory
        console.log('Setting up Kokoro assets in:', publicPath);
        // Implementation would depend on the build system
    },
    
    /**
     * Create a voice selector component for VtuberGame UI
     */
    createVoiceSelector(model: VtuberGameLive2DModel, containerId: string): HTMLSelectElement {
        const select = document.createElement('select');
        select.id = 'voice-selector';
        
        const voices = model.getAvailableVoices();
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice;
            option.textContent = voice.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            select.appendChild(option);
        });
        
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(select);
        }
        
        return select;
    }
};

// Default export for easy importing
export default {
    enableStreamingTTS,
    setupVtuberGameTTS,
    VtuberGameTTSMigrator,
    VtuberGameUtils
};