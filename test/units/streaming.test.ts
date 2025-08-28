import { describe, it, expect } from "vitest";
import { StreamingAudioSource } from "@/streaming/StreamingAudioSource";
import { KokoroStreamingManager } from "@/streaming/KokoroStreamingManager";

describe("Streaming Audio Integration", () => {
    describe("StreamingAudioSource", () => {
        it("should create an instance with default parameters", () => {
            const source = new StreamingAudioSource();
            expect(source).toBeDefined();
            expect(source.isAudioPlaying()).toBe(false);
            source.dispose();
        });

        it("should handle volume changes", () => {
            const source = new StreamingAudioSource();
            source.setVolume(0.8);
            // Volume should be clamped between 0 and 1
            source.setVolume(1.5);
            source.setVolume(-0.5);
            expect(() => source.setVolume(0.5)).not.toThrow();
            source.dispose();
        });

        it("should provide an analyser node", () => {
            const source = new StreamingAudioSource();
            const analyser = source.getAnalyser();
            expect(analyser).toBeDefined();
            expect(analyser).toBeInstanceOf(AnalyserNode);
            source.dispose();
        });
    });

    describe("KokoroStreamingManager", () => {
        it("should create an instance with default config", () => {
            const manager = new KokoroStreamingManager();
            expect(manager).toBeDefined();
            expect(manager.isSystemInitialized()).toBe(false);
            expect(manager.isCurrentlyGenerating()).toBe(false);
        });

        it("should initialize successfully", async () => {
            const manager = new KokoroStreamingManager();
            await manager.initialize();
            expect(manager.isSystemInitialized()).toBe(true);
            
            const voices = manager.getVoices();
            expect(voices).toBeDefined();
            expect(Object.keys(voices).length).toBeGreaterThan(0);
            
            manager.dispose();
        });

        it("should generate test speech", async () => {
            const manager = new KokoroStreamingManager();
            await manager.initialize();
            
            const result = await manager.generateSpeech("Hello world", {
                voice: "af",
                speed: 1,
                volume: 0.5
            });
            
            expect(result).toBe(true);
            
            // Should have an analyser available during generation
            const analyser = manager.getAnalyser();
            expect(analyser).toBeDefined();
            
            manager.dispose();
        });
    });
});