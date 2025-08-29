#!/usr/bin/env node

/**
 * Setup script for VtuberGame integration
 * This script automates the integration of streaming TTS into a VtuberGame project
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const KOKORO_FILES = [
    'worker.js',
    'kokoro.js', 
    'voices.js',
    'phonemize.js',
    'semantic-split.js'
];

const KOKORO_BASE_URL = 'https://raw.githubusercontent.com/rhulha/StreamingKokoroJS/main/public/';

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
            
            file.on('error', (err) => {
                fs.unlink(destPath, () => {}); // Delete the file on error
                reject(err);
            });
        }).on('error', reject);
    });
}

async function setupKokoroAssets(targetDir) {
    console.log('🎵 Setting up Kokoro TTS assets...');
    
    const kokoroDir = path.join(targetDir, 'public', 'kokoro');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(kokoroDir)) {
        fs.mkdirSync(kokoroDir, { recursive: true });
        console.log(`📁 Created directory: ${kokoroDir}`);
    }
    
    // Download Kokoro files
    for (const fileName of KOKORO_FILES) {
        const url = KOKORO_BASE_URL + fileName;
        const destPath = path.join(kokoroDir, fileName);
        
        try {
            console.log(`⬇️  Downloading ${fileName}...`);
            await downloadFile(url, destPath);
            console.log(`✅ Downloaded ${fileName}`);
        } catch (error) {
            console.error(`❌ Failed to download ${fileName}:`, error.message);
            console.log(`📝 You'll need to manually download from: ${url}`);
        }
    }
}

function copyStreamingModule(sourceDir, targetDir) {
    console.log('📦 Copying streaming module...');
    
    const sourcePath = path.join(sourceDir, 'src', 'streaming');
    const targetPath = path.join(targetDir, 'src', 'streaming');
    
    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Source streaming module not found at: ${sourcePath}`);
        return false;
    }
    
    // Create target directory
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
    
    // Copy files
    const files = fs.readdirSync(sourcePath);
    files.forEach(file => {
        const srcFile = path.join(sourcePath, file);
        const destFile = path.join(targetPath, file);
        
        if (fs.statSync(srcFile).isFile()) {
            fs.copyFileSync(srcFile, destFile);
            console.log(`✅ Copied ${file}`);
        }
    });
    
    return true;
}

function copyIntegrationModule(sourceDir, targetDir) {
    console.log('🔧 Copying VtuberGame integration module...');
    
    const sourcePath = path.join(sourceDir, 'vtubergame-integration');
    const targetPath = path.join(targetDir, 'tts-integration');
    
    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Integration module not found at: ${sourcePath}`);
        return false;
    }
    
    // Create target directory
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
    
    // Copy src files
    const srcDir = path.join(sourcePath, 'src');
    if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir);
        files.forEach(file => {
            const srcFile = path.join(srcDir, file);
            const destFile = path.join(targetPath, file);
            
            if (fs.statSync(srcFile).isFile()) {
                fs.copyFileSync(srcFile, destFile);
                console.log(`✅ Copied integration ${file}`);
            }
        });
    }
    
    return true;
}

function createExampleUsage(targetDir) {
    const exampleCode = `// VtuberGame Streaming TTS Integration Example
import { setupVtuberGameTTS, VtuberGameUtils } from './tts-integration/index.js';

// Check browser support
const support = VtuberGameUtils.checkBrowserSupport();
if (!support.supported) {
    console.warn('Browser missing features:', support.missing);
}

// Setup your Live2D model with streaming TTS
async function setupCharacter() {
    // Load your existing Live2D model
    const model = await Live2DModel.from('path/to/your/model.model3.json');
    
    // Enable streaming TTS
    const enhancedModel = await setupVtuberGameTTS(model, {
        kokoroWorkerPath: '/kokoro/worker.js',
        defaultVoice: 'af_heart',
        defaultSpeed: 1.0,
        defaultVolume: 0.8
    });
    
    // Add to your scene
    app.stage.addChild(enhancedModel);
    
    // Now you can use streaming TTS!
    return enhancedModel;
}

// Example usage
async function demoTTS() {
    const character = await setupCharacter();
    
    // Simple speech
    await character.speakText("Hello! I can speak with perfect lip sync!");
    
    // Advanced speech with options
    await character.speakText("Welcome to VtuberGame!", {
        voice: 'am_Adam',
        speed: 1.2,
        expression: 'happy',
        onStart: () => console.log('Character started speaking'),
        onFinish: () => console.log('Character finished speaking')
    });
    
    // Multiple sequential speeches
    await character.speakText("First message", { voice: 'af_heart' });
    await character.speakText("Second message", { voice: 'am_Adam' });
    
    // Error handling
    await character.speakText("Test with error handling", {
        onError: (error) => {
            console.error('Speech failed:', error);
            // Show text fallback or other error handling
        }
    });
}

// Export for use in your VtuberGame
export { setupCharacter, demoTTS };
`;

    const examplePath = path.join(targetDir, 'streaming-tts-example.js');
    fs.writeFileSync(examplePath, exampleCode);
    console.log(`✅ Created example usage file: ${examplePath}`);
}

function updatePackageJson(targetDir) {
    const packageJsonPath = path.join(targetDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        console.log('⚠️  No package.json found, skipping dependency update');
        return;
    }
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add recommended dependencies
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        
        // Note: These would be the dependencies needed
        console.log('📝 Consider adding these dependencies to your package.json:');
        console.log('   - pixi.js (>=7.0.0)');
        console.log('   - pixi-live2d-display (>=0.4.0)');
        
        // Create backup
        fs.writeFileSync(packageJsonPath + '.backup', JSON.stringify(packageJson, null, 2));
        console.log(`💾 Created backup: ${packageJsonPath}.backup`);
        
    } catch (error) {
        console.error('❌ Error updating package.json:', error.message);
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🎮 VtuberGame Streaming TTS Setup');
        console.log('');
        console.log('Usage: node setup-kokoro.js <target-directory>');
        console.log('');
        console.log('Example:');
        console.log('  node setup-kokoro.js /path/to/your/vtubergame');
        console.log('');
        process.exit(1);
    }
    
    const targetDir = path.resolve(args[0]);
    const sourceDir = path.dirname(__dirname); // vtubergame-integration parent
    
    console.log('🚀 Starting VtuberGame TTS Integration Setup');
    console.log(`📁 Target directory: ${targetDir}`);
    console.log(`📁 Source directory: ${sourceDir}`);
    console.log('');
    
    if (!fs.existsSync(targetDir)) {
        console.error(`❌ Target directory does not exist: ${targetDir}`);
        process.exit(1);
    }
    
    try {
        // 1. Setup Kokoro assets
        await setupKokoroAssets(targetDir);
        console.log('');
        
        // 2. Copy streaming module
        copyStreamingModule(sourceDir, targetDir);
        console.log('');
        
        // 3. Copy integration module
        copyIntegrationModule(sourceDir, targetDir);
        console.log('');
        
        // 4. Create example usage
        createExampleUsage(targetDir);
        console.log('');
        
        // 5. Update package.json
        updatePackageJson(targetDir);
        console.log('');
        
        console.log('🎉 Setup completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Review the integration guide: INTEGRATION_GUIDE.md');
        console.log('2. Check the example usage: streaming-tts-example.js');
        console.log('3. Apply the Live2D modifications documented in LIVE2D_PACKAGE_MODIFICATIONS.md');
        console.log('4. Test with your VtuberGame models');
        console.log('');
        console.log('For support, check the documentation or open an issue.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    setupKokoroAssets,
    copyStreamingModule,
    copyIntegrationModule,
    createExampleUsage,
    updatePackageJson
};