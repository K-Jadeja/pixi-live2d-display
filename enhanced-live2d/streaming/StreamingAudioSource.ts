import { logger } from "@/utils";

const TAG = "StreamingAudioSource";

/**
 * A streaming audio source that can accept audio chunks and provide analysis for lip sync.
 * This class bridges the gap between streaming audio generation (like Kokoro TTS) and 
 * the existing Live2D lip sync system.
 */
export class StreamingAudioSource {
    private audioContext: AudioContext;
    private audioQueue: AudioBuffer[] = [];
    private isPlaying: boolean = false;
    private currentSource: AudioBufferSourceNode | null = null;
    private analyserNode: AnalyserNode | null = null;
    private gainNode: GainNode | null = null;
    private volume: number = 0.5;
    private onFinish?: () => void;
    private onError?: (e: Error) => void;
    private sampleRate: number;
    
    constructor(sampleRate: number = 24000) {
        this.audioContext = new AudioContext();
        this.sampleRate = sampleRate;
        this.setupAudioNodes();
    }

    private setupAudioNodes(): void {
        // Create analyzer node for lip sync
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.analyserNode.minDecibels = -90;
        this.analyserNode.maxDecibels = -10;
        this.analyserNode.smoothingTimeConstant = 0.85;

        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;

        // Connect nodes: source -> gain -> analyzer -> destination
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
    }

    /**
     * Set volume for playback
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }

    /**
     * Set callbacks for finish and error events
     */
    setCallbacks(onFinish?: () => void, onError?: (e: Error) => void): void {
        this.onFinish = onFinish;
        this.onError = onError;
    }

    /**
     * Add an audio chunk to the playback queue
     * @param audioData - Float32Array containing audio samples
     */
    async queueAudioChunk(audioData: Float32Array): Promise<void> {
        try {
            // Create audio buffer from the chunk
            const audioBuffer = this.audioContext.createBuffer(1, audioData.length, this.sampleRate);
            audioBuffer.getChannelData(0).set(audioData);
            
            this.audioQueue.push(audioBuffer);
            
            // Start playback if not already playing
            this.playAudioQueue();
        } catch (error) {
            logger.warn(TAG, "Failed to queue audio chunk", error);
            this.onError?.(error as Error);
        }
    }

    /**
     * Process the audio queue and play buffers sequentially
     */
    private async playAudioQueue(): Promise<void> {
        if (this.isPlaying || this.audioQueue.length === 0) {
            return;
        }

        this.isPlaying = true;

        try {
            while (this.audioQueue.length > 0) {
                const buffer = this.audioQueue.shift()!;
                await this.playBuffer(buffer);
            }
        } catch (error) {
            logger.warn(TAG, "Error during audio playback", error);
            this.onError?.(error as Error);
        } finally {
            this.isPlaying = false;
            this.onFinish?.();
        }
    }

    /**
     * Play a single audio buffer
     */
    private async playBuffer(buffer: AudioBuffer): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Resume audio context if suspended
                if (this.audioContext.state === "suspended") {
                    this.audioContext.resume();
                }

                // Create buffer source
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                this.currentSource = source;

                // Connect to our audio chain
                source.connect(this.gainNode!);

                // Set up event handlers
                source.onended = () => {
                    this.currentSource = null;
                    resolve();
                };

                // Start playback
                source.start();
            } catch (error) {
                this.currentSource = null;
                reject(error);
            }
        });
    }

    /**
     * Stop current playback and clear queue
     */
    stop(): void {
        // Stop current source
        if (this.currentSource) {
            try {
                this.currentSource.stop();
                this.currentSource = null;
            } catch (error) {
                logger.warn(TAG, "Error stopping current source", error);
            }
        }

        // Clear queue
        this.audioQueue = [];
        this.isPlaying = false;
    }

    /**
     * Get the analyser node for lip sync analysis
     */
    getAnalyser(): AnalyserNode | null {
        return this.analyserNode;
    }

    /**
     * Get the audio context
     */
    getAudioContext(): AudioContext {
        return this.audioContext;
    }

    /**
     * Check if audio is currently playing
     */
    isAudioPlaying(): boolean {
        return this.isPlaying;
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.stop();
        
        if (this.analyserNode) {
            this.analyserNode.disconnect();
            this.analyserNode = null;
        }
        
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }

        if (this.audioContext && this.audioContext.state !== "closed") {
            this.audioContext.close();
        }
    }
}