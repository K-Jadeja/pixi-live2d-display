import { Live2DModel } from "pixi-live2d-display";
import { Application } from "@pixi/app";

/**
 * Example demonstrating how to use the new streaming text-to-speech functionality
 * with Live2D models for real-time lip sync.
 */

// Create PIXI Application
const app = new Application({
    view: document.getElementById("canvas") as HTMLCanvasElement,
    autoStart: true,
});

async function setupStreamingSpeechExample() {
    try {
        // Load a Live2D model
        const model = await Live2DModel.from("path/to/your/model.json");
        
        // Add model to the stage
        app.stage.addChild(model);
        
        // Center the model
        model.x = app.screen.width / 2;
        model.y = app.screen.height / 2;
        
        console.log("Model loaded successfully!");
        
        // Example 1: Basic text-to-speech
        console.log("Starting basic speech example...");
        await model.speakText("Hello! I am a Live2D model with streaming speech capabilities!");
        
        // Wait a moment between examples
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Example 2: Speech with custom voice and expression
        console.log("Starting advanced speech example...");
        await model.speakText("This is amazing! I can speak any text with realistic lip sync!", {
            voice: "af", // American female voice
            speed: 1.1,
            volume: 0.8,
            expression: "happy", // Apply happy expression during speech
            resetExpression: true, // Reset expression after speech
            onFinish: () => {
                console.log("Speech completed!");
            },
            onError: (error) => {
                console.error("Speech error:", error);
            }
        });
        
        // Example 3: Multiple voices demonstration
        const voiceExamples = [
            { voice: "af", text: "This is the American female voice.", expression: "happy" },
            { voice: "am", text: "This is the American male voice.", expression: "surprised" },
            { voice: "bf", text: "This is the British female voice.", expression: "sad" },
            { voice: "bm", text: "This is the British male voice.", expression: "angry" }
        ];
        
        for (const example of voiceExamples) {
            console.log(`Playing example with voice: ${example.voice}`);
            await model.speakText(example.text, {
                voice: example.voice,
                expression: example.expression,
                volume: 0.7
            });
            
            // Wait between examples
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Example 4: Interactive speech
        setupInteractiveExample(model);
        
    } catch (error) {
        console.error("Failed to load model or initialize speech:", error);
    }
}

function setupInteractiveExample(model: Live2DModel) {
    // Create input elements for interactive testing
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "10px";
    container.style.left = "10px";
    container.style.zIndex = "1000";
    container.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    container.style.padding = "20px";
    container.style.borderRadius = "10px";
    container.style.fontFamily = "Arial, sans-serif";
    
    const title = document.createElement("h3");
    title.textContent = "Live2D Streaming Speech Demo";
    container.appendChild(title);
    
    const textInput = document.createElement("textarea");
    textInput.placeholder = "Enter text to speak...";
    textInput.style.width = "300px";
    textInput.style.height = "80px";
    textInput.style.marginBottom = "10px";
    textInput.style.display = "block";
    container.appendChild(textInput);
    
    const voiceSelect = document.createElement("select");
    voiceSelect.style.marginBottom = "10px";
    voiceSelect.style.marginRight = "10px";
    const voices = [
        { value: "af", label: "American Female" },
        { value: "am", label: "American Male" },
        { value: "bf", label: "British Female" },
        { value: "bm", label: "British Male" }
    ];
    voices.forEach(voice => {
        const option = document.createElement("option");
        option.value = voice.value;
        option.textContent = voice.label;
        voiceSelect.appendChild(option);
    });
    container.appendChild(voiceSelect);
    
    const expressionSelect = document.createElement("select");
    expressionSelect.style.marginBottom = "10px";
    expressionSelect.style.marginRight = "10px";
    const expressions = [
        { value: "", label: "No Expression" },
        { value: "happy", label: "Happy" },
        { value: "sad", label: "Sad" },
        { value: "surprised", label: "Surprised" },
        { value: "angry", label: "Angry" }
    ];
    expressions.forEach(expr => {
        const option = document.createElement("option");
        option.value = expr.value;
        option.textContent = expr.label;
        expressionSelect.appendChild(option);
    });
    container.appendChild(expressionSelect);
    
    const speedRange = document.createElement("input");
    speedRange.type = "range";
    speedRange.min = "0.5";
    speedRange.max = "2";
    speedRange.step = "0.1";
    speedRange.value = "1";
    speedRange.style.marginBottom = "10px";
    speedRange.style.marginRight = "10px";
    container.appendChild(speedRange);
    
    const speedLabel = document.createElement("label");
    speedLabel.textContent = "Speed: 1.0x";
    speedLabel.style.marginBottom = "10px";
    speedLabel.style.display = "block";
    container.appendChild(speedLabel);
    
    speedRange.addEventListener("input", () => {
        speedLabel.textContent = `Speed: ${speedRange.value}x`;
    });
    
    const speakButton = document.createElement("button");
    speakButton.textContent = "Speak";
    speakButton.style.marginRight = "10px";
    speakButton.style.padding = "8px 16px";
    speakButton.style.backgroundColor = "#4CAF50";
    speakButton.style.color = "white";
    speakButton.style.border = "none";
    speakButton.style.borderRadius = "4px";
    speakButton.style.cursor = "pointer";
    container.appendChild(speakButton);
    
    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.style.padding = "8px 16px";
    stopButton.style.backgroundColor = "#f44336";
    stopButton.style.color = "white";
    stopButton.style.border = "none";
    stopButton.style.borderRadius = "4px";
    stopButton.style.cursor = "pointer";
    container.appendChild(stopButton);
    
    const status = document.createElement("div");
    status.style.marginTop = "10px";
    status.style.fontSize = "14px";
    status.textContent = "Ready";
    container.appendChild(status);
    
    speakButton.addEventListener("click", async () => {
        const text = textInput.value.trim();
        if (!text) {
            status.textContent = "Please enter some text";
            return;
        }
        
        status.textContent = "Speaking...";
        speakButton.disabled = true;
        
        try {
            await model.speakText(text, {
                voice: voiceSelect.value,
                expression: expressionSelect.value || undefined,
                speed: parseFloat(speedRange.value),
                volume: 0.8,
                onFinish: () => {
                    status.textContent = "Speech completed";
                    speakButton.disabled = false;
                },
                onError: (error) => {
                    status.textContent = `Error: ${error.message}`;
                    speakButton.disabled = false;
                }
            });
        } catch (error) {
            status.textContent = `Error: ${error.message}`;
            speakButton.disabled = false;
        }
    });
    
    stopButton.addEventListener("click", () => {
        model.stopStreamingSpeech();
        status.textContent = "Speech stopped";
        speakButton.disabled = false;
    });
    
    document.body.appendChild(container);
}

// Initialize the example when the page loads
document.addEventListener("DOMContentLoaded", () => {
    setupStreamingSpeechExample();
});

export { setupStreamingSpeechExample, setupInteractiveExample };