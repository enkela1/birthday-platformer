import Phaser from 'phaser';
import { avatarLabels } from '../config/photoData.js';

export class AvatarScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AvatarScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a237e, 0x283593, 0x1a237e, 0x283593, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 60, 'Choose Your Avatar', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 100, 'Pick the best version of yourself, Daors', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#B39DDB',
    }).setOrigin(0.5);

    // Avatar options
    const avatarSpacing = 200;
    const startX = width / 2 - avatarSpacing;
    const avatarY = 280;

    this.selectedAvatar = null;
    this.avatarContainers = [];
    this.selectionBorders = [];

    for (let i = 0; i < 3; i++) {
      const x = startX + i * avatarSpacing;

      // Selection highlight (hidden initially)
      const border = this.add.graphics();
      border.lineStyle(4, 0xFFD740, 1);
      border.strokeRoundedRect(x - 55, avatarY - 85, 110, 190, 12);
      border.setAlpha(0);
      this.selectionBorders.push(border);

      // Card background
      const card = this.add.graphics();
      card.fillStyle(0x3949AB, 0.6);
      card.fillRoundedRect(x - 50, avatarY - 80, 100, 180, 10);

      // Avatar face
      const avatar = this.add.image(x, avatarY - 30, `avatar${i + 1}`);
      avatar.setDisplaySize(72, 72);

      // Stickman body below the face
      const body = this.add.graphics();
      body.lineStyle(3, 0xFFFFFF, 1);
      // Neck to body
      body.lineBetween(x, avatarY + 4, x, avatarY + 35);
      // Arms
      body.lineBetween(x - 15, avatarY + 18, x + 15, avatarY + 18);
      // Left leg
      body.lineBetween(x, avatarY + 35, x - 12, avatarY + 55);
      // Right leg
      body.lineBetween(x, avatarY + 35, x + 12, avatarY + 55);

      // Label
      this.add.text(x, avatarY + 75, avatarLabels[i] || `Style ${i + 1}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#E8EAF6',
        align: 'center',
      }).setOrigin(0.5);

      // Interactive area - generous tap target for mobile
      const hitArea = this.add.rectangle(x, avatarY + 10, 120, 200)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        card.clear();
        card.fillStyle(0x5C6BC0, 0.8);
        card.fillRoundedRect(x - 50, avatarY - 80, 100, 180, 10);
      });

      hitArea.on('pointerout', () => {
        if (this.selectedAvatar !== i) {
          card.clear();
          card.fillStyle(0x3949AB, 0.6);
          card.fillRoundedRect(x - 50, avatarY - 80, 100, 180, 10);
        }
      });

      hitArea.on('pointerdown', () => {
        this.selectAvatar(i);
      });
    }

    // GO button (hidden until avatar selected) - bigger for mobile
    const goBtnW = 200;
    const goBtnH = 58;
    const goBtnX = width / 2 - goBtnW / 2;
    const goBtnTopY = 475;
    const goBtnCY = goBtnTopY + goBtnH / 2;

    this.goBtnBg = this.add.graphics();
    this.goBtnBg.fillStyle(0x69F0AE, 1);
    this.goBtnBg.fillRoundedRect(goBtnX, goBtnTopY, goBtnW, goBtnH, 12);
    this.goBtnBg.setAlpha(0);

    this.goText = this.add.text(width / 2, goBtnCY, 'GO!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '30px',
      color: '#1B5E20',
    }).setOrigin(0.5).setAlpha(0);

    this.goHitArea = this.add.rectangle(width / 2, goBtnCY, goBtnW, goBtnH)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    this.goHitArea.on('pointerover', () => {
      if (this.selectedAvatar !== null) {
        this.goBtnBg.clear();
        this.goBtnBg.fillStyle(0x00E676, 1);
        this.goBtnBg.fillRoundedRect(goBtnX, goBtnTopY, goBtnW, goBtnH, 12);
      }
    });

    this.goHitArea.on('pointerout', () => {
      if (this.selectedAvatar !== null) {
        this.goBtnBg.clear();
        this.goBtnBg.fillStyle(0x69F0AE, 1);
        this.goBtnBg.fillRoundedRect(goBtnX, goBtnTopY, goBtnW, goBtnH, 12);
      }
    });

    this.goHitArea.on('pointerdown', () => {
      if (this.selectedAvatar !== null) {
        this.startGame();
      }
    });

    // Keyboard support
    this.input.keyboard.on('keydown-ONE', () => this.selectAvatar(0));
    this.input.keyboard.on('keydown-TWO', () => this.selectAvatar(1));
    this.input.keyboard.on('keydown-THREE', () => this.selectAvatar(2));
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.selectedAvatar !== null) this.startGame();
    });
  }

  selectAvatar(index) {
    this.selectedAvatar = index;

    // Update selection borders
    this.selectionBorders.forEach((border, i) => {
      border.setAlpha(i === index ? 1 : 0);
    });

    // Show GO button
    this.goBtnBg.setAlpha(1);
    this.goText.setAlpha(1);
    this.goHitArea.setAlpha(1);

    // Bounce effect on GO button
    this.tweens.add({
      targets: [this.goBtnBg, this.goText],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
    });
  }

  startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene', { avatarIndex: this.selectedAvatar + 1 });
    });
  }
}
