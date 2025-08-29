#!/usr/bin/env node

/**
 * Simple test to verify the VtuberGame integration package works
 */

import fs from 'fs';
import path from 'path';

function testPackageStructure() {
    console.log('🧪 Testing VtuberGame integration package structure...');
    
    const packageDir = './vtubergame-integration';
    const requiredFiles = [
        'package.json',
        'README.md',
        'INTEGRATION_GUIDE.md',
        'PACKAGING_OPTIONS.md',
        'src/index.ts',
        'scripts/setup-kokoro.js',
        'streaming-tts-example.js',
        'vite.config.ts',
        'tsconfig.json'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
        const filePath = path.join(packageDir, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    }
    
    return allFilesExist;
}

function testSetupScriptOutput() {
    console.log('\n🧪 Testing setup script created required directories...');
    
    const testDir = '/tmp/test-vtubergame';
    const expectedPaths = [
        'public/kokoro',
        'streaming-tts-example.js'
    ];
    
    let allPathsExist = true;
    
    for (const expectedPath of expectedPaths) {
        const fullPath = path.join(testDir, expectedPath);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${expectedPath}`);
        } else {
            console.log(`❌ ${expectedPath} - MISSING`);
            allPathsExist = false;
        }
    }
    
    return allPathsExist;
}

function testKokoroAssets() {
    console.log('\n🧪 Testing Kokoro assets were downloaded...');
    
    const kokoroDir = '/tmp/test-vtubergame/public/kokoro';
    const kokoroFiles = ['worker.js', 'kokoro.js', 'voices.js', 'phonemize.js', 'semantic-split.js'];
    
    let allAssetsExist = true;
    
    for (const file of kokoroFiles) {
        const filePath = path.join(kokoroDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`✅ ${file} (${stats.size} bytes)`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allAssetsExist = false;
        }
    }
    
    return allAssetsExist;
}

function main() {
    console.log('🎮 VtuberGame Integration Package Test Suite\n');
    
    const packageTest = testPackageStructure();
    const setupTest = testSetupScriptOutput();
    const assetsTest = testKokoroAssets();
    
    console.log('\n📊 Test Results:');
    console.log(`Package Structure: ${packageTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Setup Script: ${setupTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Kokoro Assets: ${assetsTest ? '✅ PASS' : '❌ FAIL'}`);
    
    const allTestsPassed = packageTest && setupTest && assetsTest;
    
    if (allTestsPassed) {
        console.log('\n🎉 All tests passed! VtuberGame integration package is ready to use.');
        console.log('\n📋 Ready for integration:');
        console.log('1. Copy vtubergame-integration/ to your VtuberGame project');
        console.log('2. Run the setup script');
        console.log('3. Apply Live2D modifications');
        console.log('4. Start using streaming TTS in your VtuberGame!');
    } else {
        console.log('\n❌ Some tests failed. Please check the package setup.');
        process.exit(1);
    }
}

main();