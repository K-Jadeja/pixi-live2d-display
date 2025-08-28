import { updateProgress } from "./updateProgress.js";

const SAMPLE_RATE = 24000;

export class StreamingLive2DAudioPlayer {
  constructor(worker, live2dModel) {
    this.worker = worker;
    this.live2dModel = live2dModel;
    this.audioChunks = [];
    this.isStreaming = false;
    this.totalAudioChunks = 0;
    this.processedAudioChunks = 0;
    this.audioContext = null;
    this.audioBuffer = null;
    this.sourceNode = null;
    this.isFirstChunk = true;
    this.startTime = 0;
    this.lipSyncEnabled = false;
  }

  setLive2DModel(model) {
    this.live2dModel = model;
  }

  setTotalChunks(totalChunks) {
    this.totalAudioChunks = totalChunks;
    this.processedAudioChunks = 0;
  }

  async initializeAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async queueAudio(audioData) {
    // Convert audio data to Float32Array if needed
    const audioData2 = new Float32Array(audioData);
    this.audioChunks.push(audioData2);
    
    // Update progress tracking
    this.processedAudioChunks++;
    const percent = Math.min((this.processedAudioChunks / this.totalAudioChunks) * 100, 99);
    updateProgress(percent, "Streaming audio chunks...");

    // Start streaming immediately on first chunk
    if (this.isFirstChunk && !this.isStreaming) {
      this.isFirstChunk = false;
      this.startStreamingPlayback();
    }

    // Notify worker that buffer has been processed
    this.worker.postMessage({ type: "buffer_processed" });
  }

  async startStreamingPlayback() {
    if (this.isStreaming) return;
    
    try {
      this.isStreaming = true;
      await this.initializeAudioContext();
      
      // Start lip sync immediately
      this.startLipSync();
      
      console.log("Started streaming audio playback");
      updateProgress(25, "Started streaming playback...");
      
      // Start playing the audio chunks as they arrive
      this.playCurrentChunks();
      
    } catch (error) {
      console.error("Error starting streaming playback:", error);
      this.isStreaming = false;
    }
  }

  async playCurrentChunks() {
    if (this.audioChunks.length === 0) return;

    try {
      // Combine current chunks
      const combinedAudio = this.combineChunks(this.audioChunks);
      
      // Create audio buffer
      const audioBuffer = this.audioContext.createBuffer(1, combinedAudio.length, SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(combinedAudio);
      
      // Stop previous audio if playing
      if (this.sourceNode) {
        this.sourceNode.stop();
      }
      
      // Create and start new audio source
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.connect(this.audioContext.destination);
      this.sourceNode.start();
      
      console.log(`Playing ${this.audioChunks.length} audio chunks`);
      
    } catch (error) {
      console.error("Error playing chunks:", error);
    }
  }

  combineChunks(chunks) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    return combined;
  }

  startLipSync() {
    if (!this.live2dModel || this.lipSyncEnabled) return;
    
    this.lipSyncEnabled = true;
    
    // Start a motion for speaking
    this.triggerSpeakingMotion();
    
    // Set expression for speaking
    this.setRandomExpression();
    
    console.log("Started Live2D lip sync");
  }

  async finalizeAudio() {
    if (this.audioChunks.length === 0) {
      throw new Error('No audio chunks to finalize');
    }

    console.log(`Finalizing ${this.audioChunks.length} audio chunks for Live2D`);

    // Final playback with all chunks combined
    await this.playCurrentChunks();
    
    // Continue lip sync for remaining duration
    const totalDuration = this.calculateTotalDuration();
    
    updateProgress(100, "Streaming playback completed");
    return true;
  }

  calculateTotalDuration() {
    const totalSamples = this.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    return totalSamples / SAMPLE_RATE; // Duration in seconds
  }

  triggerSpeakingMotion() {
    if (!this.live2dModel) return;

    const motionManager = this.live2dModel.internalModel.motionManager;
    if (!motionManager) return;

    // Try different motion names for speaking
    const speakingMotions = ["tap_body", "idle", "Idle", "talking", "speak"];
    
    for (const motionName of speakingMotions) {
      if (this.triggerRandomMotion(motionName)) {
        console.log(`Triggered speaking motion: ${motionName}`);
        break;
      }
    }
  }

  triggerRandomMotion(groupName) {
    if (!this.live2dModel) return false;

    const motionManager = this.live2dModel.internalModel.motionManager;
    if (!motionManager || !motionManager.definitions) return false;

    const group = motionManager.definitions[groupName];
    if (!group || group.length === 0) return false;

    const randomIndex = Math.floor(Math.random() * group.length);
    this.live2dModel.motion(groupName, randomIndex, 3); // Priority 3 for speech
    return true;
  }

  setRandomExpression() {
    if (!this.live2dModel || !this.live2dModel.internalModel.expressionManager) return;

    const expressions = this.live2dModel.internalModel.expressionManager.definitions || [];
    if (expressions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * expressions.length);
    this.live2dModel.expression(randomIndex);
    console.log(`Set random expression: ${randomIndex}`);
  }

  stop() {
    this.isStreaming = false;
    this.lipSyncEnabled = false;
    
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    
    if (this.live2dModel) {
      this.live2dModel.stopSpeaking && this.live2dModel.stopSpeaking();
      this.live2dModel.expression(); // Reset expression
    }
    
    console.log("Stopped streaming playback");
  }

  reset() {
    this.stop();
    this.audioChunks = [];
    this.processedAudioChunks = 0;
    this.isFirstChunk = true;
    console.log("Reset streaming audio player");
  }

  cleanup() {
    this.reset();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}