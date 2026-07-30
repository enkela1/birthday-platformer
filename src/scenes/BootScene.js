import Phaser from 'phaser';
import { photos, mustachePhoto, catPhotos, hackerPhotos } from '../config/photoData.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xff6b9d, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Try to load real avatar images (will fail gracefully if missing)
    for (let i = 1; i <= 3; i++) {
      this.load.image(`avatar${i}`, `images/avatars/daors${i}.png`);
    }

    // Try to load real photo images
    photos.forEach((photo, index) => {
      this.load.image(`photo${index}`, photo.image);
    });

    // Load mustache photo
    this.load.image('mustachePhoto', mustachePhoto.image);

    // Load cat photos
    catPhotos.forEach((cp, i) => {
      this.load.image(`catPhoto${i}`, cp.image);
    });

    // Load hacker photos
    hackerPhotos.forEach((hp, i) => {
      this.load.image(`hackerPhoto${i}`, hp.image);
    });

    // Suppress load errors for missing files (placeholders will be generated)
    this.load.on('loaderror', (file) => {
      console.log(`Note: ${file.key} not found, using placeholder.`);
    });
  }

  create() {
    // Generate all game textures programmatically
    try {
      this.generateTextures();
    } catch (e) {
      console.error('Error generating textures:', e);
    }
    this.scene.start('MenuScene');
  }

  generateTextures() {
    // --- Platform texture ---
    const platGfx = this.add.graphics();
    platGfx.fillStyle(0x4CAF50, 1);
    platGfx.fillRoundedRect(0, 0, 120, 24, 6);
    platGfx.lineStyle(2, 0x388E3C, 1);
    platGfx.strokeRoundedRect(0, 0, 120, 24, 6);
    platGfx.fillStyle(0x66BB6A, 1);
    platGfx.fillRoundedRect(2, 0, 116, 8, 3);
    platGfx.generateTexture('platform', 120, 24);
    platGfx.destroy();

    // --- Ground texture ---
    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(0x8B4513, 1);
    groundGfx.fillRect(0, 0, 64, 40);
    groundGfx.fillStyle(0x228B22, 1);
    groundGfx.fillRect(0, 0, 64, 10);
    groundGfx.fillStyle(0x2E7D32, 1);
    for (let i = 0; i < 64; i += 8) {
      groundGfx.fillTriangle(i, 10, i + 4, 2, i + 8, 10);
    }
    groundGfx.generateTexture('ground', 64, 40);
    groundGfx.destroy();

    // --- Gift box texture ---
    const boxGfx = this.add.graphics();
    boxGfx.fillStyle(0xFF4081, 1);
    boxGfx.fillRoundedRect(2, 8, 32, 28, 4);
    boxGfx.lineStyle(2, 0xC2185B, 1);
    boxGfx.strokeRoundedRect(2, 8, 32, 28, 4);
    boxGfx.fillStyle(0xFFD700, 1);
    boxGfx.fillRect(15, 8, 6, 28);
    boxGfx.fillRect(2, 18, 32, 6);
    boxGfx.fillCircle(12, 8, 6);
    boxGfx.fillCircle(24, 8, 6);
    boxGfx.fillStyle(0xFF4081, 1);
    boxGfx.fillCircle(18, 8, 3);
    boxGfx.generateTexture('giftbox', 36, 36);
    boxGfx.destroy();

    // --- Trophy texture ---
    const trophyGfx = this.add.graphics();
    trophyGfx.fillStyle(0xFFD700, 1);
    trophyGfx.fillRoundedRect(8, 4, 32, 28, 4);
    trophyGfx.lineStyle(4, 0xFFD700, 1);
    trophyGfx.beginPath();
    trophyGfx.arc(8, 16, 8, -1.5, 1.5, false);
    trophyGfx.strokePath();
    trophyGfx.beginPath();
    trophyGfx.arc(40, 16, 8, 1.5, -1.5, false);
    trophyGfx.strokePath();
    trophyGfx.fillStyle(0xFFC107, 1);
    trophyGfx.fillRect(20, 32, 8, 8);
    trophyGfx.fillStyle(0x795548, 1);
    trophyGfx.fillRoundedRect(12, 40, 24, 6, 2);
    trophyGfx.fillStyle(0xFFFFFF, 1);
    trophyGfx.fillCircle(24, 16, 4);
    trophyGfx.generateTexture('trophy', 48, 48);
    trophyGfx.destroy();

    // --- Candle enemy texture ---
    const candleGfx = this.add.graphics();
    candleGfx.fillStyle(0xFF7043, 1);
    candleGfx.fillRoundedRect(6, 12, 16, 24, 3);
    candleGfx.lineStyle(1, 0xE64A19, 1);
    candleGfx.strokeRoundedRect(6, 12, 16, 24, 3);
    candleGfx.lineStyle(2, 0x333333, 1);
    candleGfx.lineBetween(14, 12, 14, 6);
    candleGfx.fillStyle(0xFFEB3B, 1);
    candleGfx.fillCircle(14, 4, 4);
    candleGfx.fillStyle(0xFF9800, 1);
    candleGfx.fillCircle(14, 3, 2);
    candleGfx.fillStyle(0x333333, 1);
    candleGfx.fillCircle(11, 20, 2);
    candleGfx.fillCircle(17, 20, 2);
    candleGfx.lineStyle(1, 0x333333, 1);
    candleGfx.beginPath();
    candleGfx.arc(14, 28, 3, 3.14, 6.28, false);
    candleGfx.strokePath();
    candleGfx.generateTexture('candle', 28, 36);
    candleGfx.destroy();

    // --- Cake slice enemy texture ---
    const cakeGfx = this.add.graphics();
    cakeGfx.fillStyle(0xFFCDD2, 1);
    cakeGfx.fillTriangle(16, 0, 0, 28, 32, 28);
    cakeGfx.fillStyle(0xF8BBD0, 1);
    cakeGfx.fillTriangle(16, 6, 4, 28, 28, 28);
    cakeGfx.lineStyle(2, 0xE91E63, 1);
    cakeGfx.lineBetween(6, 20, 26, 20);
    cakeGfx.fillStyle(0x333333, 1);
    cakeGfx.fillCircle(11, 16, 2);
    cakeGfx.fillCircle(21, 16, 2);
    cakeGfx.lineStyle(1, 0x333333, 1);
    cakeGfx.beginPath();
    cakeGfx.arc(16, 26, 3, 3.14, 6.28, false);
    cakeGfx.strokePath();
    cakeGfx.generateTexture('cake', 32, 28);
    cakeGfx.destroy();

    // --- Stickman body texture ---
    const stickGfx = this.add.graphics();
    stickGfx.lineStyle(3, 0x333333, 1);
    stickGfx.lineBetween(16, 8, 16, 30);
    stickGfx.lineBetween(4, 18, 28, 18);
    stickGfx.lineBetween(16, 30, 6, 44);
    stickGfx.lineBetween(16, 30, 26, 44);
    stickGfx.generateTexture('stickbody', 32, 46);
    stickGfx.destroy();

    // --- Placeholder avatars (higher res for better quality when displayed) ---
    const colors = [0x4FC3F7, 0xFF8A65, 0xAED581];
    const emojiLabels = ['1', '2', '3'];
    const avatarSize = 128;
    for (let i = 0; i < 3; i++) {
      const key = `avatar${i + 1}`;
      // Check if texture loaded properly (has more than 1 pixel)
      if (!this.textures.exists(key) || this.textures.get(key).key === '__MISSING') {
        // Remove broken texture first if it exists
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }
        const avatarGfx = this.add.graphics();
        const half = avatarSize / 2;
        avatarGfx.fillStyle(colors[i], 1);
        avatarGfx.fillCircle(half, half, half);
        avatarGfx.lineStyle(3, 0x333333, 1);
        avatarGfx.strokeCircle(half, half, half);
        // Add a number label
        avatarGfx.fillStyle(0xFFFFFF, 1);
        avatarGfx.fillCircle(half, half, half * 0.4);
        avatarGfx.generateTexture(key, avatarSize, avatarSize);
        avatarGfx.destroy();
      }
    }

    // --- Placeholder photo textures (64x64 - lightweight placeholders) ---
    const photoColors = [0xE3F2FD, 0xFCE4EC, 0xE8F5E9, 0xFFF3E0, 0xF3E5F5, 0xE0F7FA, 0xFFF9C4];
    const pSize = 64;
    for (let i = 0; i < 7; i++) {
      const key = `photo${i}`;
      if (!this.textures.exists(key) || this.textures.get(key).key === '__MISSING') {
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }
        const photoGfx = this.add.graphics();
        photoGfx.fillStyle(photoColors[i], 1);
        photoGfx.fillRect(0, 0, pSize, pSize);
        photoGfx.fillStyle(0x999999, 1);
        photoGfx.fillRect(pSize * 0.35, pSize * 0.3, pSize * 0.3, pSize * 0.3);
        photoGfx.fillTriangle(pSize * 0.35, pSize * 0.6, pSize * 0.5, pSize * 0.4, pSize * 0.65, pSize * 0.6);
        photoGfx.fillCircle(pSize * 0.575, pSize * 0.375, pSize * 0.06);
        photoGfx.fillStyle(0x666666, 1);
        photoGfx.fillRect(pSize * 0.25, pSize * 0.7, pSize * 0.5, pSize * 0.1);
        photoGfx.generateTexture(key, pSize, pSize);
        photoGfx.destroy();
      }
    }

    // --- Bouncy platform texture (spring pad) ---
    const bounceGfx = this.add.graphics();
    // Base
    bounceGfx.fillStyle(0xFF5722, 1);
    bounceGfx.fillRoundedRect(0, 10, 60, 14, 4);
    bounceGfx.lineStyle(2, 0xD84315, 1);
    bounceGfx.strokeRoundedRect(0, 10, 60, 14, 4);
    // Spring coil lines
    bounceGfx.lineStyle(2, 0xFFAB00, 1);
    bounceGfx.lineBetween(15, 10, 20, 3);
    bounceGfx.lineBetween(20, 3, 25, 10);
    bounceGfx.lineBetween(25, 10, 30, 3);
    bounceGfx.lineBetween(30, 3, 35, 10);
    bounceGfx.lineBetween(35, 10, 40, 3);
    bounceGfx.lineBetween(40, 3, 45, 10);
    // Top pad
    bounceGfx.fillStyle(0xFFAB00, 1);
    bounceGfx.fillRoundedRect(10, 0, 40, 6, 3);
    bounceGfx.generateTexture('bouncyPlatform', 60, 24);
    bounceGfx.destroy();

    // --- Moving platform texture (blue tint, arrows) ---
    const movGfx = this.add.graphics();
    movGfx.fillStyle(0x42A5F5, 1);
    movGfx.fillRoundedRect(0, 0, 100, 24, 6);
    movGfx.lineStyle(2, 0x1E88E5, 1);
    movGfx.strokeRoundedRect(0, 0, 100, 24, 6);
    // Left arrow
    movGfx.fillStyle(0xFFFFFF, 0.4);
    movGfx.fillTriangle(8, 12, 16, 6, 16, 18);
    // Right arrow
    movGfx.fillTriangle(92, 12, 84, 6, 84, 18);
    // Highlight stripe
    movGfx.fillStyle(0x64B5F6, 1);
    movGfx.fillRoundedRect(2, 0, 96, 8, 3);
    movGfx.generateTexture('movingPlatform', 100, 24);
    movGfx.destroy();

    // --- Cloud texture ---
    const cloudGfx = this.add.graphics();
    cloudGfx.fillStyle(0xFFFFFF, 0.8);
    cloudGfx.fillCircle(30, 30, 20);
    cloudGfx.fillCircle(50, 25, 25);
    cloudGfx.fillCircle(70, 30, 20);
    cloudGfx.fillCircle(45, 35, 18);
    cloudGfx.fillCircle(55, 35, 18);
    cloudGfx.generateTexture('cloud', 90, 55);
    cloudGfx.destroy();

    // --- Mustache collectible texture ---
    const mustGfx = this.add.graphics();
    // Thick curved mustache shape
    mustGfx.fillStyle(0x4E342E, 1);
    // Left side
    mustGfx.beginPath();
    mustGfx.arc(10, 10, 10, Math.PI, 0, false);
    mustGfx.fillPath();
    // Right side
    mustGfx.beginPath();
    mustGfx.arc(26, 10, 10, Math.PI, 0, false);
    mustGfx.fillPath();
    // Center bridge
    mustGfx.fillRect(10, 4, 16, 8);
    // Curled tips
    mustGfx.fillStyle(0x3E2723, 1);
    mustGfx.fillCircle(2, 8, 4);
    mustGfx.fillCircle(34, 8, 4);
    // Shine
    mustGfx.fillStyle(0x8D6E63, 0.5);
    mustGfx.fillRect(12, 4, 12, 3);
    mustGfx.generateTexture('mustache', 36, 20);
    mustGfx.destroy();

    // --- Cat collectible texture ---
    const catGfx = this.add.graphics();
    // Body
    catGfx.fillStyle(0xFF9800, 1);
    catGfx.fillRoundedRect(4, 12, 24, 16, 6);
    // Head
    catGfx.fillCircle(10, 10, 8);
    // Ears (triangles)
    catGfx.fillTriangle(4, 6, 7, 0, 10, 6);
    catGfx.fillTriangle(10, 6, 13, 0, 16, 6);
    // Inner ears
    catGfx.fillStyle(0xFFB74D, 1);
    catGfx.fillTriangle(5, 5, 7, 1, 9, 5);
    catGfx.fillTriangle(11, 5, 13, 1, 15, 5);
    // Eyes
    catGfx.fillStyle(0x333333, 1);
    catGfx.fillCircle(7, 10, 2);
    catGfx.fillCircle(13, 10, 2);
    // Eye shine
    catGfx.fillStyle(0xFFFFFF, 1);
    catGfx.fillCircle(8, 9, 1);
    catGfx.fillCircle(14, 9, 1);
    // Nose
    catGfx.fillStyle(0xF48FB1, 1);
    catGfx.fillTriangle(9, 12, 11, 12, 10, 14);
    // Tail
    catGfx.lineStyle(3, 0xFF9800, 1);
    catGfx.beginPath();
    catGfx.arc(30, 16, 8, -1.5, 0.5, false);
    catGfx.strokePath();
    // Stripes
    catGfx.lineStyle(1, 0xE65100, 0.5);
    catGfx.lineBetween(8, 14, 8, 26);
    catGfx.lineBetween(16, 14, 16, 26);
    catGfx.lineBetween(22, 14, 22, 26);
    // Legs
    catGfx.fillStyle(0xFF9800, 1);
    catGfx.fillRect(8, 26, 4, 6);
    catGfx.fillRect(20, 26, 4, 6);
    // Paws
    catGfx.fillStyle(0xFFCC80, 1);
    catGfx.fillCircle(10, 32, 3);
    catGfx.fillCircle(22, 32, 3);
    catGfx.generateTexture('cat', 38, 34);
    catGfx.destroy();

    // --- Laptop collectible texture ---
    const laptopGfx = this.add.graphics();
    // Screen
    laptopGfx.fillStyle(0x37474F, 1);
    laptopGfx.fillRoundedRect(2, 0, 32, 22, 3);
    // Screen inner (glowing green like hacker)
    laptopGfx.fillStyle(0x00E676, 1);
    laptopGfx.fillRect(5, 3, 26, 16);
    // "Code" lines on screen
    laptopGfx.fillStyle(0x004D40, 1);
    laptopGfx.fillRect(7, 5, 14, 2);
    laptopGfx.fillRect(7, 9, 20, 2);
    laptopGfx.fillRect(7, 13, 10, 2);
    // Skull on screen (hacker vibes)
    laptopGfx.fillStyle(0x00E676, 0.8);
    laptopGfx.fillCircle(24, 10, 3);
    // Keyboard base
    laptopGfx.fillStyle(0x546E7A, 1);
    laptopGfx.fillRoundedRect(0, 22, 36, 8, 2);
    // Keyboard line
    laptopGfx.fillStyle(0x455A64, 1);
    laptopGfx.fillRect(4, 24, 28, 1);
    laptopGfx.fillRect(4, 27, 28, 1);
    // Suspicious glow
    laptopGfx.lineStyle(1, 0x00E676, 0.4);
    laptopGfx.strokeRoundedRect(1, -1, 34, 32, 3);
    laptopGfx.generateTexture('laptop', 36, 32);
    laptopGfx.destroy();

    // --- Mustache photo placeholder ---
    this.generatePlaceholderIfMissing('mustachePhoto', 0x4E342E, 0x8D6E63, 'MUSTACHE');

    // --- Cat photo placeholders ---
    for (let i = 0; i < catPhotos.length; i++) {
      this.generatePlaceholderIfMissing(`catPhoto${i}`, 0xFF9800, 0xFFCC80, `CAT ${i + 1}`);
    }

    // --- Hacker photo placeholders ---
    for (let i = 0; i < hackerPhotos.length; i++) {
      this.generatePlaceholderIfMissing(`hackerPhoto${i}`, 0x1B5E20, 0x00E676, `HACKER ${i + 1}`);
    }
  }

  generatePlaceholderIfMissing(key, bgColor, fgColor, label) {
    const s = 64; // Lightweight placeholder
    if (!this.textures.exists(key) || this.textures.get(key).key === '__MISSING') {
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
      const gfx = this.add.graphics();
      gfx.fillStyle(bgColor, 1);
      gfx.fillRect(0, 0, s, s);
      // Icon area
      gfx.fillStyle(fgColor, 0.4);
      gfx.fillRect(s * 0.25, s * 0.2, s * 0.5, s * 0.4);
      // Label bar
      gfx.fillStyle(0x000000, 0.5);
      gfx.fillRect(s * 0.1, s * 0.7, s * 0.8, s * 0.15);
      gfx.fillStyle(fgColor, 1);
      gfx.fillRect(s * 0.2, s * 0.75, s * 0.6, s * 0.05);
      // Corner decoration
      gfx.fillStyle(fgColor, 0.2);
      gfx.fillCircle(s * 0.15, s * 0.15, s * 0.075);
      gfx.fillCircle(s * 0.85, s * 0.15, s * 0.075);
      gfx.generateTexture(key, s, s);
      gfx.destroy();
    }
  }
}
