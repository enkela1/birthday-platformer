import Phaser from 'phaser';
import { photos, birthdayMessage } from '../config/photoData.js';

export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(data) {
    this.avatarIndex = data.avatarIndex || 1;
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a237e, 0x4a148c, 0x880e4f, 0x4a148c, 1);
    bg.fillRect(0, 0, width, height);

    this.cameras.main.fadeIn(800);

    // ===== PRE-GENERATE CONFETTI TEXTURES (once) =====
    const confettiColors = [0xFF4081, 0xFFD740, 0x448AFF, 0x69F0AE, 0xE040FB, 0xFF6E40, 0x00BCD4];
    confettiColors.forEach((color, i) => {
      const key = `confetti_${i}`;
      if (!this.textures.exists(key)) {
        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillRect(0, 0, 10, 10);
        g.generateTexture(key, 10, 10);
        g.destroy();
      }
    });

    // ===== CONFETTI POOL =====
    this.confettiPool = [];
    this.confettiActive = [];
    const POOL_SIZE = 80;
    for (let i = 0; i < POOL_SIZE; i++) {
      const key = `confetti_${i % confettiColors.length}`;
      const sprite = this.add.image(0, -50, key).setActive(false).setVisible(false);
      this.confettiPool.push(sprite);
    }
    this._confettiColors = confettiColors;

    // ===== CONTINUOUS CONFETTI =====
    this.confettiTimer = this.time.addEvent({
      delay: 100,
      callback: () => this.spawnConfetti(),
      loop: true,
    });

    // Initial burst
    for (let i = 0; i < 50; i++) {
      this.spawnConfetti(true);
    }

    // ===== TROPHY =====
    const trophy = this.add.image(width / 2, 100, 'trophy');
    trophy.setDisplaySize(72, 72);

    // Trophy spin-in animation
    trophy.setScale(0);
    this.tweens.add({
      targets: trophy,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 800,
      ease: 'Back.easeOut',
    });

    // Trophy glow
    const glow = this.add.graphics();
    glow.fillStyle(0xFFD700, 0.2);
    glow.fillCircle(width / 2, 100, 50);
    this.tweens.add({
      targets: glow,
      alpha: 0.05,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // ===== TITLE =====
    const title = this.add.text(width / 2, 170, 'HAPPY 16TH BIRTHDAY', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '36px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const nameText = this.add.text(width / 2, 215, 'DAORS!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: '#FFFFFF',
      stroke: '#FF4081',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Bounce animation on name
    this.tweens.add({
      targets: nameText,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ===== PHOTO GRID =====
    const gridStartY = 260;
    const photoSize = 80;
    const spacing = 10;
    const totalWidth = photos.length * (photoSize + spacing) - spacing;
    const gridStartX = (width - totalWidth) / 2;

    photos.forEach((photo, i) => {
      const px = gridStartX + i * (photoSize + spacing) + photoSize / 2;
      const py = gridStartY + photoSize / 2;

      // White border (polaroid style)
      const frame = this.add.graphics();
      frame.fillStyle(0xFFFFFF, 1);
      frame.fillRoundedRect(px - photoSize / 2 - 5, py - photoSize / 2 - 5, photoSize + 10, photoSize + 10, 5);

      // Photo - preserve aspect ratio within the square
      const img = this.add.image(px, py, `photo${i}`);
      const pTex = this.textures.get(`photo${i}`);
      const pSrc = pTex.getSourceImage();
      const pAspect = pSrc.width / pSrc.height;
      if (pAspect > 1) {
        img.setDisplaySize(photoSize, photoSize / pAspect);
      } else {
        img.setDisplaySize(photoSize * pAspect, photoSize);
      }

      // Animate in with delay
      frame.setAlpha(0);
      img.setAlpha(0);
      this.tweens.add({
        targets: [frame, img],
        alpha: 1,
        duration: 400,
        delay: 800 + i * 200,
        ease: 'Power2',
      });
    });

    // ===== SCORE DISPLAY =====
    const scoreLabel = this.add.text(width / 2, 365, `FINAL SCORE: ${this.finalScore}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#FFD740',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    scoreLabel.setAlpha(0);
    this.tweens.add({
      targets: scoreLabel,
      alpha: 1,
      duration: 600,
      delay: 1800,
    });

    // ===== BIRTHDAY MESSAGE =====
    const msgText = this.add.text(width / 2, 440, birthdayMessage, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#E1BEE7',
      align: 'center',
      wordWrap: { width: 500 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    msgText.setAlpha(0);
    this.tweens.add({
      targets: msgText,
      alpha: 1,
      duration: 1000,
      delay: 2800,
    });

    // ===== PLAY AGAIN BUTTON - bigger for mobile =====
    const btnY = 510;
    const rBtnW = 220;
    const rBtnH = 54;
    const rBtnX = width / 2 - rBtnW / 2;
    const rBtnTopY = btnY - rBtnH / 2;
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF4081, 1);
    btnBg.fillRoundedRect(rBtnX, rBtnTopY, rBtnW, rBtnH, 12);
    btnBg.lineStyle(2, 0xFFFFFF, 0.5);
    btnBg.strokeRoundedRect(rBtnX, rBtnTopY, rBtnW, rBtnH, 12);

    const btnText = this.add.text(width / 2, btnY, 'Play Again?', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    btnBg.setAlpha(0);
    btnText.setAlpha(0);

    this.tweens.add({
      targets: [btnBg, btnText],
      alpha: 1,
      duration: 500,
      delay: 4000,
    });

    const btnHit = this.add.rectangle(width / 2, btnY, rBtnW, rBtnH)
      .setInteractive({ useHandCursor: true }).setAlpha(0.01);

    btnHit.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xE91E63, 1);
      btnBg.fillRoundedRect(rBtnX, rBtnTopY, rBtnW, rBtnH, 12);
      btnBg.lineStyle(2, 0xFFFFFF, 0.8);
      btnBg.strokeRoundedRect(rBtnX, rBtnTopY, rBtnW, rBtnH, 12);
    });

    btnHit.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xFF4081, 1);
      btnBg.fillRoundedRect(rBtnX, rBtnTopY, rBtnW, rBtnH, 12);
      btnBg.lineStyle(2, 0xFFFFFF, 0.5);
      btnBg.strokeRoundedRect(rBtnX, rBtnTopY, rBtnW, rBtnH, 12);
    });

    btnHit.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene');
      });
    });

    // ===== FLOATING EMOJIS =====
    const emojis = ['🎂', '🎉', '🎈', '🎁', '⭐', '🎊', '🥳'];
    this.time.addEvent({
      delay: 600,
      callback: () => {
        const emoji = emojis[Phaser.Math.Between(0, emojis.length - 1)];
        const ex = Phaser.Math.Between(30, width - 30);
        const emojiText = this.add.text(ex, height + 20, emoji, {
          fontSize: `${Phaser.Math.Between(16, 28)}px`,
        });
        this.tweens.add({
          targets: emojiText,
          y: -30,
          x: ex + Phaser.Math.Between(-40, 40),
          alpha: 0,
          duration: Phaser.Math.Between(3000, 5000),
          onComplete: () => emojiText.destroy(),
        });
      },
      loop: true,
    });
  }

  getConfettiFromPool() {
    // Recycle from pool
    let sprite = this.confettiPool.pop();
    if (!sprite) {
      // All in use -- steal the oldest active one
      sprite = this.confettiActive.shift();
      if (sprite) {
        this.tweens.killTweensOf(sprite);
      }
    }
    if (sprite) {
      const colorIdx = Phaser.Math.Between(0, this._confettiColors.length - 1);
      sprite.setTexture(`confetti_${colorIdx}`);
      sprite.setActive(true).setVisible(true).setAlpha(1);
      this.confettiActive.push(sprite);
    }
    return sprite;
  }

  returnConfettiToPool(sprite) {
    sprite.setActive(false).setVisible(false);
    sprite.x = 0;
    sprite.y = -50;
    const idx = this.confettiActive.indexOf(sprite);
    if (idx !== -1) this.confettiActive.splice(idx, 1);
    this.confettiPool.push(sprite);
  }

  spawnConfetti(burst = false) {
    const { width } = this.cameras.main;
    const count = burst ? 1 : Phaser.Math.Between(1, 3);

    for (let i = 0; i < count; i++) {
      const confetti = this.getConfettiFromPool();
      if (!confetti) return;

      const w = Phaser.Math.FloatBetween(0.4, 1.0);
      const h = Phaser.Math.FloatBetween(0.4, 1.0);
      confetti.setScale(w, h);
      confetti.x = Phaser.Math.Between(0, width);
      confetti.y = burst ? Phaser.Math.Between(-50, 300) : -10;
      confetti.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

      this.tweens.add({
        targets: confetti,
        y: 650,
        x: confetti.x + Phaser.Math.Between(-80, 80),
        rotation: confetti.rotation + Phaser.Math.FloatBetween(3, 8),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: burst ? Phaser.Math.Between(0, 1500) : 0,
        onComplete: () => this.returnConfettiToPool(confetti),
      });
    }
  }
}
