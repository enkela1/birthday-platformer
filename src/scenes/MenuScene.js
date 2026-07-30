import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Colorful gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x667eea, 0x764ba2, 0x667eea, 0x764ba2, 1);
    bg.fillRect(0, 0, width, height);

    // Floating balloons in background
    this.balloons = [];
    const balloonColors = [0xFF4081, 0x448AFF, 0xFFD740, 0x69F0AE, 0xE040FB];
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(height, height + 300);
      const color = balloonColors[i % balloonColors.length];
      const balloon = this.add.graphics();
      balloon.fillStyle(color, 0.7);
      balloon.fillCircle(0, 0, Phaser.Math.Between(12, 20));
      balloon.x = x;
      balloon.y = y;
      this.balloons.push({
        gfx: balloon,
        baseX: x,
        speed: Phaser.Math.FloatBetween(0.3, 1.0),
        wobble: Phaser.Math.FloatBetween(0.3, 0.8),
        wobbleOffset: Phaser.Math.FloatBetween(0, Math.PI * 2),
      });
    }

    // Title text with shadow
    this.add.text(width / 2 + 3, 123, '🎂 HAPPY BIRTHDAY 🎂', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '38px',
      color: '#000000',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0.3);

    this.add.text(width / 2, 120, '🎂 HAPPY BIRTHDAY 🎂', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '38px',
      color: '#FFD700',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Name with bounce animation
    const nameText = this.add.text(width / 2, 185, 'DAORS!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '56px',
      color: '#FFFFFF',
      align: 'center',
      stroke: '#FF4081',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: nameText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Decorative stars
    const starPositions = [
      { x: 100, y: 80 }, { x: 700, y: 80 },
      { x: 60, y: 200 }, { x: 740, y: 200 },
      { x: 150, y: 300 }, { x: 650, y: 300 },
    ];
    starPositions.forEach((pos, i) => {
      const star = this.add.text(pos.x, pos.y, '⭐', {
        fontSize: '24px',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: star,
        alpha: 0.5,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        delay: i * 250,
        ease: 'Sine.easeInOut',
      });
    });

    // Subtitle
    this.add.text(width / 2, 280, 'A Platformer Adventure Just For You', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#E1BEE7',
      align: 'center',
    }).setOrigin(0.5);

    // Stickman preview
    const previewY = 380;
    // Body
    const stickPreview = this.add.graphics();
    stickPreview.lineStyle(3, 0xFFFFFF, 1);
    stickPreview.fillStyle(0xFFD740, 1);
    stickPreview.fillCircle(width / 2, previewY - 30, 15); // head
    stickPreview.strokeCircle(width / 2, previewY - 30, 15);
    stickPreview.lineBetween(width / 2, previewY - 15, width / 2, previewY + 15); // body
    stickPreview.lineBetween(width / 2 - 15, previewY, width / 2 + 15, previewY); // arms
    stickPreview.lineBetween(width / 2, previewY + 15, width / 2 - 12, previewY + 35); // left leg
    stickPreview.lineBetween(width / 2, previewY + 15, width / 2 + 12, previewY + 35); // right leg

    // Play button - bigger for mobile tap targets
    const btnW = 240;
    const btnH = 64;
    const btnX = width / 2 - btnW / 2;
    const btnTopY = 455;
    const btnCenterY = btnTopY + btnH / 2;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF4081, 1);
    btnBg.fillRoundedRect(btnX, btnTopY, btnW, btnH, 14);
    btnBg.lineStyle(3, 0xFFFFFF, 0.5);
    btnBg.strokeRoundedRect(btnX, btnTopY, btnW, btnH, 14);

    const playText = this.add.text(width / 2, btnCenterY, '▶  PLAY', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#FFFFFF',
      align: 'center',
    }).setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(width / 2, btnCenterY, btnW, btnH).setInteractive({ useHandCursor: true });

    // Button hover/press effect
    hitArea.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xE91E63, 1);
      btnBg.fillRoundedRect(btnX, btnTopY, btnW, btnH, 14);
      btnBg.lineStyle(3, 0xFFFFFF, 0.8);
      btnBg.strokeRoundedRect(btnX, btnTopY, btnW, btnH, 14);
    });

    hitArea.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xFF4081, 1);
      btnBg.fillRoundedRect(btnX, btnTopY, btnW, btnH, 14);
      btnBg.lineStyle(3, 0xFFFFFF, 0.5);
      btnBg.strokeRoundedRect(btnX, btnTopY, btnW, btnH, 14);
    });

    hitArea.on('pointerdown', () => {
      this.scene.start('AvatarScene');
    });

    // Also start on Enter key
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('AvatarScene');
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('AvatarScene');
    });

    // Bottom hint - adapt text for mobile
    const isMobile = this.sys.game.device.input.touch;
    this.add.text(width / 2, 550, isMobile ? 'Tap PLAY to start' : 'Press ENTER or click PLAY', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#B39DDB',
      align: 'center',
    }).setOrigin(0.5);

    // Confetti burst on load
    const confettiColors = [0xFF4081, 0xFFD740, 0x448AFF, 0x69F0AE, 0xE040FB, 0xFF6E40];
    this.time.delayedCall(200, () => {
      for (let i = 0; i < 18; i++) {
        const color = confettiColors[i % confettiColors.length];
        const cx = Phaser.Math.Between(100, width - 100);
        const confetti = this.add.graphics();
        confetti.fillStyle(color, 1);
        confetti.fillRect(0, 0, Phaser.Math.Between(4, 8), Phaser.Math.Between(4, 8));
        confetti.x = cx;
        confetti.y = -20;
        confetti.rotation = Phaser.Math.FloatBetween(0, Math.PI);

        this.tweens.add({
          targets: confetti,
          y: height + 20,
          x: cx + Phaser.Math.Between(-30, 30),
          rotation: confetti.rotation + Phaser.Math.FloatBetween(1, 3),
          alpha: 0,
          duration: Phaser.Math.Between(2500, 4500),
          delay: Phaser.Math.Between(0, 800),
          ease: 'Sine.easeIn',
          onComplete: () => confetti.destroy(),
        });
      }
    });
  }

  update(time, delta) {
    // delta is ms since last frame — normalize to 60fps baseline (16.67ms)
    const dt = delta / 16.667;

    this.balloons.forEach((b) => {
      b.gfx.y -= b.speed * dt;
      // Smooth sine wobble using absolute time; small amplitude avoids jitter
      b.gfx.x = b.baseX + Math.sin(time * 0.001 * b.wobble + b.wobbleOffset) * 20;
      if (b.gfx.y < -30) {
        b.gfx.y = this.cameras.main.height + 30;
        b.baseX = Phaser.Math.Between(50, this.cameras.main.width - 50);
        b.gfx.x = b.baseX;
      }
    });
  }
}
