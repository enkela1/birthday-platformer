import Phaser from 'phaser';
import {
  LEVEL_WIDTH, LEVEL_HEIGHT, GROUND_HEIGHT,
  platforms as platformData,
  bouncyPlatforms as bouncyData,
  movingPlatforms as movingData,
  giftBoxes as giftBoxData,
  enemies as enemyData,
  groundGaps,
  trophyPosition,
  mustachePickups as mustacheData,
  catPickups as catData,
  laptopPickups as laptopData,
  punchTriggerPosition,
} from '../config/levelData.js';
import { photos, scoreConfig, scoreRoasts, punchVideo, mustachePhoto, catPhotos, hackerPhotos } from '../config/photoData.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.avatarIndex = data.avatarIndex || 1;
    this.collectedBoxes = 0;
    this.totalBoxes = giftBoxData.length;
    this.isPaused = false;
    this.isKnockedBack = false;
    this.isTouchingLeft = false;
    this.isTouchingRight = false;
    this.isTouchingJump = false;
    this._touchJumpUsed = false;
    this.trophyHintShown = false;
    this.score = 0;
    this.isHacked = false;
    this.punchTriggered = false;
    this.ridingPlatform = null;
  }

  create() {
    const { width, height } = this.cameras.main;

    // ===== BACKGROUND =====
    this.createBackground(width, height);

    // ===== GROUND =====
    this.groundGroup = this.physics.add.staticGroup();
    this.createGround();

    // ===== PLATFORMS =====
    this.platformGroup = this.physics.add.staticGroup();
    this.createPlatforms();

    // ===== BOUNCY PLATFORMS =====
    this.bouncyGroup = this.physics.add.staticGroup();
    this.createBouncyPlatforms();

    // ===== MOVING PLATFORMS =====
    this.movingPlatformGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.createMovingPlatforms();

    // ===== PLAYER =====
    this.createPlayer();

    // ===== GIFT BOXES =====
    this.boxGroup = this.physics.add.staticGroup();
    this.createGiftBoxes();

    // ===== ENEMIES =====
    this.enemyGroup = this.physics.add.group();
    this.createEnemies();

    // ===== TROPHY =====
    this.createTrophy();

    // ===== NEW COLLECTIBLES =====
    this.mustacheGroup = this.physics.add.staticGroup();
    this.catGroup = this.physics.add.staticGroup();
    this.laptopGroup = this.physics.add.staticGroup();
    this.createMustaches();
    this.createCats();
    this.createLaptops();

    // ===== PUNCH VIDEO TRIGGER =====
    this.createPunchTrigger();

    // ===== COLLISIONS =====
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup);
    this.physics.add.collider(this.player, this.bouncyGroup, this.hitBouncy, null, this);
    this.physics.add.collider(this.player, this.movingPlatformGroup, this.onMovingPlatform, null, this);
    this.physics.add.collider(this.enemyGroup, this.groundGroup);
    this.physics.add.collider(this.enemyGroup, this.platformGroup);
    this.physics.add.overlap(this.player, this.boxGroup, this.collectBox, null, this);
    this.physics.add.overlap(this.player, this.enemyGroup, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.trophyGroup, this.reachTrophy, null, this);
    this.physics.add.overlap(this.player, this.mustacheGroup, this.collectMustache, null, this);
    this.physics.add.overlap(this.player, this.catGroup, this.collectCat, null, this);
    this.physics.add.overlap(this.player, this.laptopGroup, this.collectLaptop, null, this);
    this.physics.add.overlap(this.player, this.punchTriggerGroup, this.triggerPunchVideo, null, this);

    // ===== CAMERA =====
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.fadeIn(500);

    // ===== CONTROLS =====
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // ===== UI (fixed to camera) =====
    this.createUI();

    // ===== MOBILE TOUCH CONTROLS =====
    this.createTouchControls();

    // ===== PRE-GENERATE PARTICLE TEXTURES =====
    const particleColors = [0xFFD700, 0xFF4081, 0x448AFF, 0x69F0AE];
    particleColors.forEach((color, i) => {
      const key = `particle_${i}`;
      if (!this.textures.exists(key)) {
        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillCircle(5, 5, 5);
        g.generateTexture(key, 10, 10);
        g.destroy();
      }
    });

    // ===== POLAROID OVERLAY (hidden) =====
    this.createPolaroidOverlay();

    // ===== DEBUG MODE =====
    // Press F1 to toggle debug overlay (shows coordinates, grid, labels)
    this.debugMode = false;
    this.debugGraphics = null;
    this.debugTexts = [];
    this.input.keyboard.on('keydown-F1', () => this.toggleDebug());


  }

  toggleDebug() {
    this.debugMode = !this.debugMode;

    if (this.debugMode) {
      // Draw debug overlay
      this.debugGraphics = this.add.graphics().setDepth(998);

      // Grid lines every 100px
      this.debugGraphics.lineStyle(1, 0xFFFFFF, 0.15);
      for (let x = 0; x <= LEVEL_WIDTH; x += 100) {
        this.debugGraphics.lineBetween(x, 0, x, LEVEL_HEIGHT);
      }
      for (let y = 0; y <= LEVEL_HEIGHT; y += 100) {
        this.debugGraphics.lineBetween(0, y, LEVEL_WIDTH, y);
      }

      // Label grid every 200px
      for (let x = 0; x <= LEVEL_WIDTH; x += 200) {
        const t = this.add.text(x + 2, 2, `x:${x}`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#FFFF00', backgroundColor: '#00000088',
        }).setDepth(999);
        this.debugTexts.push(t);
      }
      for (let y = 0; y <= LEVEL_HEIGHT; y += 100) {
        const t = this.add.text(2, y + 2, `y:${y}`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#FFFF00', backgroundColor: '#00000088',
        }).setDepth(999);
        this.debugTexts.push(t);
      }

      // Label all platforms
      platformData.forEach((p, i) => {
        const t = this.add.text(p.x, p.y - 14, `P${i} (${p.x},${p.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#00FF00', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(t);
      });

      // Label all gift boxes
      giftBoxData.forEach((b, i) => {
        const t = this.add.text(b.x, b.y - 24, `Box${i} (${b.x},${b.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#FF69B4', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(t);
      });

      // Label all enemies
      enemyData.forEach((e, i) => {
        const t = this.add.text(e.x, e.y - 30, `E${i}:${e.type} (${e.x},${e.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#FF4444', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(t);
      });

      // Ground height line
      this.debugGraphics.lineStyle(2, 0xFF0000, 0.5);
      this.debugGraphics.lineBetween(0, GROUND_HEIGHT, LEVEL_WIDTH, GROUND_HEIGHT);
      const gt = this.add.text(4, GROUND_HEIGHT - 14, `GROUND y:${GROUND_HEIGHT}`, {
        fontFamily: 'monospace', fontSize: '9px', color: '#FF4444', backgroundColor: '#00000088',
      }).setDepth(999);
      this.debugTexts.push(gt);

      // Trophy label
      const tt = this.add.text(trophyPosition.x, trophyPosition.y - 40, `TROPHY (${trophyPosition.x},${trophyPosition.y})`, {
        fontFamily: 'monospace', fontSize: '9px', color: '#FFD700', backgroundColor: '#00000088',
      }).setOrigin(0.5, 1).setDepth(999);
      this.debugTexts.push(tt);

      // Mustache labels
      mustacheData.forEach((m, i) => {
        const mt = this.add.text(m.x, m.y - 14, `MUSTACHE (${m.x},${m.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#8D6E63', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(mt);
      });

      // Cat labels
      catData.forEach((c, i) => {
        const ct = this.add.text(c.x, c.y - 14, `CAT${i} (${c.x},${c.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#FF9800', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(ct);
      });

      // Laptop labels
      laptopData.forEach((l, i) => {
        const lt = this.add.text(l.x, l.y - 14, `LAPTOP${i} (${l.x},${l.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#00E676', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(lt);
      });

      // Bouncy platform labels
      bouncyData.forEach((b, i) => {
        const bt = this.add.text(b.x, b.y - 14, `BOUNCY${i} (${b.x},${b.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#FF5722', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(bt);
      });

      // Moving platform labels
      movingData.forEach((m, i) => {
        const mt = this.add.text(m.x, m.y - 14, `MOVING${i} (${m.x},${m.y})`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#42A5F5', backgroundColor: '#00000088',
        }).setOrigin(0.5, 1).setDepth(999);
        this.debugTexts.push(mt);
      });

      // Punch trigger label
      const pt = this.add.text(punchTriggerPosition.x, punchTriggerPosition.y - 14, `PUNCH (${punchTriggerPosition.x},${punchTriggerPosition.y})`, {
        fontFamily: 'monospace', fontSize: '9px', color: '#FF5722', backgroundColor: '#00000088',
      }).setOrigin(0.5, 1).setDepth(999);
      this.debugTexts.push(pt);

    } else {
      // Remove debug overlay
      if (this.debugGraphics) {
        this.debugGraphics.destroy();
        this.debugGraphics = null;
      }
      this.debugTexts.forEach(t => t.destroy());
      this.debugTexts = [];
    }
  }

  // ==========================================
  // CREATION METHODS
  // ==========================================

  createBackground(width, height) {
    // Sky gradient (scrolls slower for parallax)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE8F5E9, 0xE8F5E9, 1);
    sky.fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    // Clouds (parallax - different scroll factors)
    for (let i = 0; i < 12; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(0, LEVEL_WIDTH),
        Phaser.Math.Between(30, 180),
        'cloud'
      );
      cloud.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
      cloud.setAlpha(Phaser.Math.FloatBetween(0.4, 0.8));
      cloud.setScrollFactor(0.3 + Math.random() * 0.3);
    }

    // Distant hills
    const hills = this.add.graphics();
    hills.setScrollFactor(0.4);
    hills.fillStyle(0xA5D6A7, 0.5);
    for (let i = 0; i < LEVEL_WIDTH / 200; i++) {
      const hx = i * 200 + 100;
      hills.fillCircle(hx, LEVEL_HEIGHT - 60, Phaser.Math.Between(80, 140));
    }
  }

  createGround() {
    // Build ground segments with gaps
    let currentX = 0;
    const sortedGaps = [...groundGaps].sort((a, b) => a.x - b.x);

    for (const gap of sortedGaps) {
      if (gap.x > currentX) {
        // Fill ground from currentX to gap start
        this.addGroundSegment(currentX, gap.x - currentX);
      }
      currentX = gap.x + gap.width;
    }
    // Fill remaining ground after last gap
    if (currentX < LEVEL_WIDTH) {
      this.addGroundSegment(currentX, LEVEL_WIDTH - currentX);
    }
  }

  addGroundSegment(startX, segmentWidth) {
    const tileWidth = 64;
    const numTiles = Math.ceil(segmentWidth / tileWidth);
    for (let i = 0; i < numTiles; i++) {
      const x = startX + i * tileWidth + tileWidth / 2;
      if (x < startX + segmentWidth) {
        const ground = this.groundGroup.create(x, GROUND_HEIGHT, 'ground');
        ground.setDisplaySize(tileWidth, 40);
        ground.refreshBody();
      }
    }
  }

  createPlatforms() {
    platformData.forEach((p) => {
      const plat = this.platformGroup.create(p.x, p.y, 'platform');
      plat.setDisplaySize(p.width, 24);
      plat.refreshBody();
    });
  }

  createBouncyPlatforms() {
    this._tweenedObjects = this._tweenedObjects || [];
    bouncyData.forEach((b) => {
      const bouncy = this.bouncyGroup.create(b.x, b.y, 'bouncyPlatform');
      bouncy.setDisplaySize(b.width, 24);
      bouncy.refreshBody();

      // Idle squish animation
      const squishTween = this.tweens.add({
        targets: bouncy,
        scaleY: 0.85,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this._tweenedObjects.push(
        { obj: bouncy, tween: squishTween, worldX: b.x }
      );
    });
  }

  createMovingPlatforms() {
    movingData.forEach((m) => {
      const plat = this.movingPlatformGroup.create(m.x, m.y, 'movingPlatform');
      plat.setDisplaySize(m.width, 24);
      plat.body.setSize(m.width, 24);
      plat.body.setAllowGravity(false);
      plat.body.setImmovable(true);

      // Store patrol bounds
      plat.minX = m.minX;
      plat.maxX = m.maxX;
      plat.moveSpeed = m.speed;
      plat.body.setVelocityX(m.speed);
    });
  }

  createPlayer() {
    // Create player as a container-like setup
    this.player = this.physics.add.sprite(100, GROUND_HEIGHT - 60, 'stickbody');
    this.player.setDisplaySize(38, 52);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(false);
    this.player.body.setSize(28, 50);
    this.player.body.setOffset(2, 2);

    // Avatar head follows the player (rendered on top)
    this.playerHead = this.add.image(100, 0, `avatar${this.avatarIndex}`);
    this.playerHead.setDisplaySize(48, 48);
    this.playerHead.setDepth(10);
  }

  createGiftBoxes() {
    this._tweenedObjects = this._tweenedObjects || [];
    giftBoxData.forEach((box, index) => {
      const giftBox = this.boxGroup.create(box.x, box.y, 'giftbox');
      giftBox.setDisplaySize(36, 36);
      giftBox.refreshBody();
      giftBox.photoIndex = box.photoIndex;
      giftBox.boxIndex = index;
      giftBox._worldX = box.x;

      // Floating animation
      const floatTween = this.tweens.add({
        targets: giftBox,
        y: box.y - 8,
        duration: 1000 + index * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Glow effect
      const glow = this.add.graphics();
      glow.fillStyle(0xFFD700, 0.2);
      glow.fillCircle(box.x, box.y, 25);
      glow._worldX = box.x;
      const glowTween = this.tweens.add({
        targets: glow,
        alpha: 0.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      this._tweenedObjects.push(
        { obj: giftBox, tween: floatTween, worldX: box.x },
        { obj: glow, tween: glowTween, worldX: box.x }
      );
    });
  }

  createEnemies() {
    enemyData.forEach((e) => {
      const enemy = this.enemyGroup.create(e.x, e.y - 20, e.type === 'candle' ? 'candle' : 'cake');
      enemy.setDisplaySize(e.type === 'candle' ? 28 : 32, e.type === 'candle' ? 36 : 28);
      enemy.setBounce(0);
      enemy.setCollideWorldBounds(false);
      enemy.body.setAllowGravity(true);

      // Patrol data
      enemy.patrolStart = e.x - e.patrolDistance / 2;
      enemy.patrolEnd = e.x + e.patrolDistance / 2;
      enemy.patrolSpeed = e.type === 'candle' ? 40 : 60;
      enemy.body.setVelocityX(enemy.patrolSpeed);
      enemy.enemyType = e.type;
    });
  }

  createTrophy() {
    this._tweenedObjects = this._tweenedObjects || [];
    this.trophyGroup = this.physics.add.staticGroup();
    this.trophy = this.trophyGroup.create(trophyPosition.x, trophyPosition.y, 'trophy');
    this.trophy.setDisplaySize(48, 48);
    this.trophy.refreshBody();

    // Trophy glow and bounce
    const trophyTween = this.tweens.add({
      targets: this.trophy,
      y: trophyPosition.y - 10,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Golden glow around trophy
    this.trophyGlow = this.add.graphics();
    this.trophyGlow.fillStyle(0xFFD700, 0.15);
    this.trophyGlow.fillCircle(trophyPosition.x, trophyPosition.y, 40);
    const trophyGlowTween = this.tweens.add({
      targets: this.trophyGlow,
      alpha: 0.05,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    this._tweenedObjects.push(
      { obj: this.trophy, tween: trophyTween, worldX: trophyPosition.x },
      { obj: this.trophyGlow, tween: trophyGlowTween, worldX: trophyPosition.x }
    );
  }

  createUI() {
    // Box counter
    this.boxCountText = this.add.text(16, 16, `Boxes: 0 / ${this.totalBoxes}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    // Small gift icon next to counter
    const miniBox = this.add.image(170, 26, 'giftbox');
    miniBox.setDisplaySize(20, 20);
    miniBox.setScrollFactor(0);
    miniBox.setDepth(100);

    // Score display
    this.scoreText = this.add.text(16, 42, `Score: 0`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);
  }

  createTouchControls() {
    if (!this.sys.game.device.input.touch) return;

    const { width, height } = this.cameras.main;

    // --- Button sizing: generous tap targets with clear spacing ---
    const btnW = 80;
    const btnH = 70;
    const gap = 16;
    const bottomPad = 10;
    const leftX = 20;
    const rightX = leftX + btnW + gap;
    const jumpX = width - btnW - 20;
    const btnY = height - btnH - bottomPad;

    // Helper: draw a rounded button
    const drawBtn = (gfx, x, y, w, h, pressed) => {
      gfx.clear();
      gfx.fillStyle(pressed ? 0xFFFFFF : 0x000000, pressed ? 0.35 : 0.3);
      gfx.fillRoundedRect(x, y, w, h, 14);
      gfx.lineStyle(2, 0xFFFFFF, pressed ? 0.6 : 0.25);
      gfx.strokeRoundedRect(x, y, w, h, 14);
    };

    // Left button
    this.touchLeftGfx = this.add.graphics().setScrollFactor(0).setDepth(100);
    drawBtn(this.touchLeftGfx, leftX, btnY, btnW, btnH, false);
    const leftText = this.add.text(leftX + btnW / 2, btnY + btnH / 2, '◀', {
      fontSize: '36px', color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0.8);

    // Right button
    this.touchRightGfx = this.add.graphics().setScrollFactor(0).setDepth(100);
    drawBtn(this.touchRightGfx, rightX, btnY, btnW, btnH, false);
    const rightText = this.add.text(rightX + btnW / 2, btnY + btnH / 2, '▶', {
      fontSize: '36px', color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0.8);

    // Jump button (larger)
    const jumpW = 90;
    const jumpH = 70;
    const jumpBtnX = width - jumpW - 20;
    this.touchJumpGfx = this.add.graphics().setScrollFactor(0).setDepth(100);
    drawBtn(this.touchJumpGfx, jumpBtnX, btnY, jumpW, jumpH, false);
    const jumpText = this.add.text(jumpBtnX + jumpW / 2, btnY + jumpH / 2, '▲', {
      fontSize: '36px', color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0.8);

    // --- Multi-touch via scene-level pointer tracking ---
    // Instead of per-zone events (which break multi-touch), track all active pointers
    this._touchBtns = [
      { x: leftX, y: btnY, w: btnW, h: btnH, key: 'left', gfx: this.touchLeftGfx },
      { x: rightX, y: btnY, w: btnW, h: btnH, key: 'right', gfx: this.touchRightGfx },
      { x: jumpBtnX, y: btnY, w: jumpW, h: jumpH, key: 'jump', gfx: this.touchJumpGfx },
    ];

    // Phaser needs multi-touch enabled
    this.input.addPointer(2); // support up to 3 simultaneous touches

    // We'll poll active pointers each frame in update() instead of using
    // per-zone events, which is more reliable for multi-touch.
    this._drawBtn = drawBtn;
  }

  // Call this from update() to poll touch buttons
  _updateTouchInput() {
    if (!this._touchBtns) return;

    const pointers = [this.input.pointer1, this.input.pointer2, this.input.pointer3];

    let left = false, right = false, jump = false;

    for (const ptr of pointers) {
      if (!ptr || !ptr.isDown) continue;
      // Phaser pointer.x/y are already in game coordinates (accounting for scale)
      const px = ptr.x;
      const py = ptr.y;

      for (const btn of this._touchBtns) {
        if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
          if (btn.key === 'left') left = true;
          if (btn.key === 'right') right = true;
          if (btn.key === 'jump') jump = true;
        }
      }
    }

    // Update visual feedback
    for (const btn of this._touchBtns) {
      const pressed = (btn.key === 'left' && left) || (btn.key === 'right' && right) || (btn.key === 'jump' && jump);
      this._drawBtn(btn.gfx, btn.x, btn.y, btn.w, btn.h, pressed);
    }

    this.isTouchingLeft = left;
    this.isTouchingRight = right;
    this.isTouchingJump = jump;
  }

  createPolaroidOverlay() {
    const { width, height } = this.cameras.main;

    // Dark overlay
    this.polaroidBg = this.add.graphics();
    this.polaroidBg.fillStyle(0x000000, 0.7);
    this.polaroidBg.fillRect(0, 0, width, height);
    this.polaroidBg.setScrollFactor(0).setDepth(200).setAlpha(0);

    // Polaroid frame
    this.polaroidFrame = this.add.graphics();
    this.polaroidFrame.setScrollFactor(0).setDepth(201).setAlpha(0);

    // Photo image
    this.polaroidPhoto = this.add.image(width / 2, height / 2 - 30, 'photo0');
    this.polaroidPhoto.setDisplaySize(200, 200);
    this.polaroidPhoto.setScrollFactor(0).setDepth(202).setAlpha(0);

    // Caption text
    this.polaroidCaption = this.add.text(width / 2, height / 2 + 130, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#333333',
      align: 'center',
      wordWrap: { width: 300 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

    // "Tap to continue" text - adaptive for mobile
    const isMobile = this.sys.game.device.input.touch;
    this.polaroidHint = this.add.text(width / 2, height / 2 + 180,
      isMobile ? 'Tap to continue' : 'Press any key to continue', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#AAAAAA',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

    // Dismiss handler
    this.polaroidDismissHandler = null;
  }

  createMustaches() {
    this._tweenedObjects = this._tweenedObjects || [];
    mustacheData.forEach((m, index) => {
      const mustache = this.mustacheGroup.create(m.x, m.y, 'mustache');
      mustache.setDisplaySize(36, 20);
      mustache.refreshBody();

      // Floating + spinning animation
      const floatTween = this.tweens.add({
        targets: mustache,
        y: m.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Sparkle effect
      const sparkle = this.add.graphics();
      sparkle.fillStyle(0xFFD700, 0.3);
      sparkle.fillCircle(m.x, m.y, 18);
      const sparkleTween = this.tweens.add({
        targets: sparkle,
        alpha: 0.1,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });

      this._tweenedObjects.push(
        { obj: mustache, tween: floatTween, worldX: m.x },
        { obj: sparkle, tween: sparkleTween, worldX: m.x }
      );
    });
  }

  createCats() {
    this._tweenedObjects = this._tweenedObjects || [];
    catData.forEach((c, index) => {
      const cat = this.catGroup.create(c.x, c.y, 'cat');
      cat.setDisplaySize(38, 34);
      cat.refreshBody();
      cat.catIndex = index;

      // Bouncy animation (cats are playful)
      const bounceTween = this.tweens.add({
        targets: cat,
        y: c.y - 10,
        duration: 600 + index * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Bounce.easeOut',
      });

      this._tweenedObjects.push(
        { obj: cat, tween: bounceTween, worldX: c.x }
      );
    });
  }

  createLaptops() {
    this._tweenedObjects = this._tweenedObjects || [];
    laptopData.forEach((l, index) => {
      const laptop = this.laptopGroup.create(l.x, l.y, 'laptop');
      laptop.setDisplaySize(36, 32);
      laptop.refreshBody();
      laptop.laptopIndex = index;

      // Suspicious glowing pulse
      const floatTween = this.tweens.add({
        targets: laptop,
        y: l.y - 5,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Green glow around it
      const glow = this.add.graphics();
      glow.fillStyle(0x00E676, 0.15);
      glow.fillCircle(l.x, l.y, 22);
      const glowTween = this.tweens.add({
        targets: glow,
        alpha: 0.05,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });

      this._tweenedObjects.push(
        { obj: laptop, tween: floatTween, worldX: l.x },
        { obj: glow, tween: glowTween, worldX: l.x }
      );
    });
  }

  createPunchTrigger() {
    this.punchTriggerGroup = this.physics.add.staticGroup();
    // Invisible trigger wall - tall enough that player can't jump over it
    if (!this.textures.exists('punchTrigger')) {
      const trigGfx = this.add.graphics();
      trigGfx.fillStyle(0xFFFFFF, 0.01);
      trigGfx.fillRect(0, 0, 80, 500);
      trigGfx.generateTexture('punchTrigger', 80, 500);
      trigGfx.destroy();
    }
    const trigger = this.punchTriggerGroup.create(punchTriggerPosition.x, punchTriggerPosition.y, 'punchTrigger');
    trigger.setAlpha(0.01);
    trigger.setDisplaySize(80, 500);
    trigger.refreshBody();
  }

  // ==========================================
  // GAME ACTIONS
  // ==========================================

  collectBox(player, box) {
    if (this.isPaused) return;

    const photoIndex = box.photoIndex;
    box.destroy();

    this.collectedBoxes++;
    this.addScore(scoreConfig.giftBox);
    this.boxCountText.setText(`Boxes: ${this.collectedBoxes} / ${this.totalBoxes}`);

    // Show collection particles
    this.spawnCollectParticles(player.x, player.y);

    // Show polaroid
    this.showPolaroid(photoIndex);
  }

  collectMustache(player, mustache) {
    if (this.isPaused) return;
    mustache.destroy();
    this.addScore(scoreConfig.mustache);
    this.spawnCollectParticles(player.x, player.y);

    // Freeze player during the flash
    this.isPaused = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    // Show "DISGUISE ACQUIRED!" flash first
    const { width, height } = this.cameras.main;
    const flash = this.add.text(width / 2, height / 2, 'DISGUISE ACQUIRED!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(250).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut',
      yoyo: true,
      hold: 800,
      onComplete: () => {
        flash.destroy();
        // Then show polaroid with mustache photo
        this.isPaused = false;
        this.player.body.setAllowGravity(true);
        this.showPolaroid('mustachePhoto', mustachePhoto.caption);
      },
    });
  }

  collectCat(player, cat) {
    if (this.isPaused) return;
    const catIdx = cat.catIndex || 0;
    cat.destroy();
    this.addScore(scoreConfig.cat);
    this.spawnCollectParticles(player.x, player.y);

    // Show polaroid with cat photo
    const catPhoto = catPhotos[catIdx] || catPhotos[0];
    this.showPolaroid(`catPhoto${catIdx}`, catPhoto.caption);
  }

  collectLaptop(player, laptop) {
    if (this.isPaused || this.isHacked) return;
    const laptopIdx = laptop.laptopIndex || 0;
    laptop.destroy();
    this.triggerHackedScreen(laptopIdx);
  }

  triggerHackedScreen(laptopIdx) {
    this.isHacked = true;
    this.isPaused = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const { width, height } = this.cameras.main;
    const hackerData = hackerPhotos[laptopIdx] || hackerPhotos[0];

    // Black overlay
    const hackBg = this.add.graphics();
    hackBg.fillStyle(0x000000, 0.95);
    hackBg.fillRect(0, 0, width, height);
    hackBg.setScrollFactor(0).setDepth(300).setAlpha(0);

    // "YOU'VE BEEN HACKED" text - glitchy green
    const hackTitle = this.add.text(width / 2, height / 2 - 40, 'YOU\'VE BEEN\nHACKED!', {
      fontFamily: 'Courier New, monospace',
      fontSize: '42px',
      color: '#00FF00',
      stroke: '#003300',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);

    // Score penalty text
    const penaltyText = this.add.text(width / 2, height / 2 + 50, `${scoreConfig.hackedTrap} POINTS`, {
      fontFamily: 'Courier New, monospace',
      fontSize: '24px',
      color: '#FF0000',
      stroke: '#330000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);

    // "Matrix rain" effect - falling green characters
    const matrixChars = [];
    for (let i = 0; i < 30; i++) {
      const ch = this.add.text(
        Phaser.Math.Between(10, width - 10),
        Phaser.Math.Between(-height, 0),
        String.fromCharCode(Phaser.Math.Between(33, 126)),
        {
          fontFamily: 'Courier New, monospace',
          fontSize: `${Phaser.Math.Between(10, 18)}px`,
          color: '#00FF00',
        }
      ).setScrollFactor(0).setDepth(300).setAlpha(0);
      matrixChars.push(ch);

      this.tweens.add({
        targets: ch,
        alpha: Phaser.Math.FloatBetween(0.2, 0.6),
        y: height + 20,
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 500),
      });
    }

    // Animate in
    const hackElements = [hackBg, hackTitle, penaltyText];
    hackElements.forEach((el, i) => {
      this.tweens.add({
        targets: el,
        alpha: 1,
        duration: 300,
        delay: i * 150,
      });
    });

    // Screen shake
    this.cameras.main.shake(500, 0.02);

    // Glitch effect on title
    this.time.addEvent({
      delay: 150,
      repeat: 8,
      callback: () => {
        hackTitle.x = width / 2 + Phaser.Math.Between(-5, 5);
        hackTitle.y = (height / 2 - 40) + Phaser.Math.Between(-3, 3);
      },
    });

    // Apply score penalty
    this.addScore(scoreConfig.hackedTrap);

    // Auto-dismiss hack screen after 2.5 seconds, then show polaroid with hacker photo
    this.time.delayedCall(2500, () => {
      hackElements.forEach(el => {
        this.tweens.add({
          targets: el,
          alpha: 0,
          duration: 400,
          onComplete: () => el.destroy(),
        });
      });
      matrixChars.forEach(ch => {
        this.tweens.add({
          targets: ch,
          alpha: 0,
          duration: 200,
          onComplete: () => ch.destroy(),
        });
      });

      // After hack screen fades, show the hacker photo as a polaroid
      this.time.delayedCall(500, () => {
        this.isHacked = false;
        // showPolaroid will set isPaused=true and handle gravity
        this.showPolaroid(`hackerPhoto${laptopIdx}`, hackerData.caption);
      });
    });
  }

  triggerPunchVideo(player, trigger) {
    if (this.isPaused || this.punchTriggered) return;
    this.punchTriggered = true;
    this.isPaused = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const { width, height } = this.cameras.main;

    // Create a DOM video element overlay
    const videoEl = document.createElement('video');
    videoEl.src = punchVideo;
    videoEl.style.position = 'fixed';
    videoEl.style.top = '50%';
    videoEl.style.left = '50%';
    videoEl.style.transform = 'translate(-50%, -50%)';
    videoEl.style.maxWidth = '80vw';
    videoEl.style.maxHeight = '70vh';
    videoEl.style.zIndex = '10000';
    videoEl.style.borderRadius = '12px';
    videoEl.style.border = '4px solid #FFD700';
    videoEl.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.5)';
    videoEl.style.opacity = '0';
    videoEl.style.transition = 'opacity 0.3s';
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    videoEl.muted = false;

    // Dark overlay behind video
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';

    // "Not so fast..." text on the overlay
    const textEl = document.createElement('div');
    textEl.textContent = 'Not so fast...';
    textEl.style.position = 'fixed';
    textEl.style.top = '12%';
    textEl.style.left = '50%';
    textEl.style.transform = 'translateX(-50%)';
    textEl.style.zIndex = '10001';
    textEl.style.fontFamily = 'Arial Black, Arial, sans-serif';
    textEl.style.fontSize = '36px';
    textEl.style.color = '#FFD700';
    textEl.style.textShadow = '0 0 20px rgba(255,215,0,0.6), 2px 2px 0 #000';
    textEl.style.opacity = '0';
    textEl.style.transition = 'opacity 0.3s';

    document.body.appendChild(overlay);
    document.body.appendChild(textEl);
    document.body.appendChild(videoEl);

    // Fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      textEl.style.opacity = '1';
      videoEl.style.opacity = '1';
    });

    // Screen shake during video
    this.cameras.main.shake(1000, 0.015);

    // When video ends (or after timeout for safety)
    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;

      videoEl.style.opacity = '0';
      textEl.style.opacity = '0';
      overlay.style.opacity = '0';
      setTimeout(() => {
        videoEl.remove();
        textEl.remove();
        overlay.remove();
      }, 300);

      // Knockback the player
      this.player.body.setAllowGravity(true);
      this.player.body.setVelocity(-300, -250);
      this.isKnockedBack = true;
      this.player.setTint(0xFFD700);
      this.playerHead.setTint(0xFFD700);

      // Show "You've just been PUNCHED!" text in-game
      const { width: w, height: h } = this.cameras.main;
      const punchText = this.add.text(w / 2, h / 2, "You've just been PUNCHED!", {
        fontFamily: 'Arial Black, Arial',
        fontSize: '28px',
        color: '#FF4444',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(250).setAlpha(0).setScale(0.5);

      this.tweens.add({
        targets: punchText,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
        yoyo: true,
        hold: 1200,
        onComplete: () => punchText.destroy(),
      });

      this.time.delayedCall(600, () => {
        this.player.clearTint();
        this.playerHead.clearTint();
        this.isKnockedBack = false;
        this.isPaused = false;
      });
    };

    videoEl.addEventListener('ended', cleanup);
    // Fallback: if video doesn't load or play, dismiss after 3 seconds
    videoEl.addEventListener('error', () => {
      this.time.delayedCall(500, cleanup);
    });
    this.time.delayedCall(5000, () => {
      if (document.body.contains(videoEl)) {
        cleanup();
      }
    });
  }

  addScore(points) {
    this.score += points;
    if (this.score < 0) this.score = 0;
    this.scoreText.setText(`Score: ${this.score}`);

    // Flash score text on change
    if (points > 0) {
      this.scoreText.setColor('#00FF00');
    } else {
      this.scoreText.setColor('#FF0000');
    }
    this.time.delayedCall(300, () => {
      this.scoreText.setColor('#FFFFFF');
    });
  }

  showFloatingScore(x, y, text, color) {
    const hexColor = `#${color.toString(16).padStart(6, '0')}`;
    const floatText = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: hexColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: floatText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatText.destroy(),
    });
  }

  showPickupFlash(message, color) {
    const { width } = this.cameras.main;
    const hexColor = `#${color.toString(16).padStart(6, '0')}`;
    const flash = this.add.text(width / 2, 80, message, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: hexColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(150).setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      y: 60,
      duration: 300,
      yoyo: true,
      hold: 600,
      onComplete: () => flash.destroy(),
    });
  }

  spawnCollectParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const particle = this.add.image(x, y, `particle_${i % 4}`);
      const s = Phaser.Math.FloatBetween(0.4, 1.0);
      particle.setScale(s).setDepth(50);

      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-60, 60),
        y: y + Phaser.Math.Between(-80, -20),
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: Phaser.Math.Between(400, 800),
        onComplete: () => particle.destroy(),
      });
    }
  }

  showPolaroid(photoIndexOrKey, captionOverride) {
    this.isPaused = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const { width, height } = this.cameras.main;

    // Support both old style (photoIndex number) and new style (texture key string)
    let textureKey, caption;
    if (typeof photoIndexOrKey === 'number') {
      const photo = photos[photoIndexOrKey] || { image: '', caption: 'No caption' };
      textureKey = `photo${photoIndexOrKey}`;
      caption = photo.caption;
    } else {
      textureKey = photoIndexOrKey;
      caption = captionOverride || '';
    }

    // Update photo - preserve aspect ratio, calculate size first to build frame around it
    this.polaroidPhoto.setTexture(textureKey);
    const tex = this.textures.get(textureKey);
    const src = tex.getSourceImage();
    const aspect = src.width / src.height;
    // Use most of the screen for the photo
    const maxW = width * 0.7, maxH = height * 0.65;
    let dispW, dispH;
    if (aspect > maxW / maxH) {
      dispW = maxW;
      dispH = maxW / aspect;
    } else {
      dispH = maxH;
      dispW = maxH * aspect;
    }
    this.polaroidPhoto.setDisplaySize(dispW, dispH);
    this.polaroidPhoto.setPosition(width / 2, height / 2 - 30);

    // Draw polaroid frame sized to fit the photo
    const padX = 20, padTop = 20, padBottom = 70;
    const frameW = dispW + padX * 2;
    const frameH = dispH + padTop + padBottom;
    const frameX = width / 2 - frameW / 2;
    const frameY = height / 2 - 30 - dispH / 2 - padTop;
    this.polaroidFrame.clear();
    // Shadow
    this.polaroidFrame.fillStyle(0x000000, 0.15);
    this.polaroidFrame.fillRoundedRect(frameX + 4, frameY + 4, frameW, frameH, 10);
    // White frame
    this.polaroidFrame.fillStyle(0xFFFFFF, 1);
    this.polaroidFrame.fillRoundedRect(frameX, frameY, frameW, frameH, 10);

    // Update caption - position below the photo inside the frame
    this.polaroidCaption.setText(caption);
    this.polaroidCaption.setPosition(width / 2, height / 2 - 30 + dispH / 2 + 22);
    this.polaroidCaption.setWordWrapWidth(dispW);

    // Update hint position below the frame
    this.polaroidHint.setPosition(width / 2, frameY + frameH + 16);

    // Slide in animation
    const elements = [this.polaroidBg, this.polaroidFrame, this.polaroidPhoto, this.polaroidCaption, this.polaroidHint];
    elements.forEach(el => {
      el.setAlpha(0);
      this.tweens.add({
        targets: el,
        alpha: 1,
        duration: 400,
        ease: 'Power2',
      });
    });

    // Slight rotation on polaroid for that casual look
    this.polaroidFrame.setRotation(Phaser.Math.FloatBetween(-0.05, 0.05));
    this.polaroidPhoto.setRotation(this.polaroidFrame.rotation);

    // Blinking hint text
    this.tweens.add({
      targets: this.polaroidHint,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Dismiss on any key or click (with small delay to prevent accidental dismiss)
    this.time.delayedCall(500, () => {
      this.polaroidDismissHandler = () => this.dismissPolaroid();
      this.input.keyboard.once('keydown', this.polaroidDismissHandler);
      this.input.once('pointerdown', this.polaroidDismissHandler);
    });
  }

  dismissPolaroid() {
    const elements = [this.polaroidBg, this.polaroidFrame, this.polaroidPhoto, this.polaroidCaption, this.polaroidHint];
    elements.forEach(el => {
      this.tweens.add({
        targets: el,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
      });
    });

    this.time.delayedCall(300, () => {
      this.isPaused = false;
      this.player.body.setAllowGravity(true);
      this.polaroidFrame.setRotation(0);
      this.polaroidPhoto.setRotation(0);
    });
  }

  onMovingPlatform(player, platform) {
    // Track which moving platform the player is standing on
    if (player.body.blocked.down || player.body.touching.down) {
      this.ridingPlatform = platform;
    }
  }

  hitBouncy(player, bouncy) {
    // Only bounce once — prevent re-triggering while standing on it
    if (player.body.blocked.down && !this._bounceCooldown) {
      this._bounceCooldown = true;
      player.body.setVelocityY(-700); // Big launch!

      // Squash animation on the pad
      this.tweens.add({
        targets: bouncy,
        scaleY: 0.5,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
      });

      // Show "BOING!" text
      this.showPickupFlash('BOING!', 0xFF5722);

      // Reset cooldown after player leaves the pad
      this.time.delayedCall(300, () => {
        this._bounceCooldown = false;
      });
    }
  }

  hitEnemy(player, enemy) {
    if (this.isPaused || this.isKnockedBack) return;

    this.isKnockedBack = true;

    // Deduct score
    this.addScore(scoreConfig.enemyHit);
    this.showFloatingScore(player.x, player.y - 30, `${scoreConfig.enemyHit}`, 0xFF0000);

    // Knockback direction (away from enemy)
    const knockDir = player.x < enemy.x ? -1 : 1;
    player.body.setVelocity(knockDir * 200, -200);

    // Flash red
    player.setTint(0xFF0000);
    this.playerHead.setTint(0xFF0000);

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    // Recover after delay
    this.time.delayedCall(500, () => {
      player.clearTint();
      this.playerHead.clearTint();
      this.isKnockedBack = false;
    });
  }

  reachTrophy(player, trophy) {
    if (this.isPaused) return;
    if (this.collectedBoxes < this.totalBoxes) {
      // Show hint that they need to collect all boxes
      if (!this.trophyHintShown) {
        this.trophyHintShown = true;
        const hint = this.add.text(
          trophyPosition.x, trophyPosition.y - 50,
          `Collect all ${this.totalBoxes} boxes first!`,
          {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
          }
        ).setOrigin(0.5).setDepth(50);

        this.tweens.add({
          targets: hint,
          y: trophyPosition.y - 80,
          alpha: 0,
          duration: 2000,
          onComplete: () => {
            hint.destroy();
            this.trophyHintShown = false;
          },
        });
      }
      return;
    }

    this.isPaused = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    // Victory celebration
    this.cameras.main.flash(500, 255, 215, 0);

    // Transition to win scene
    this.time.delayedCall(1000, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.start('WinScene', { avatarIndex: this.avatarIndex, score: this.score });
      });
    });
  }

  // ==========================================
  // UPDATE LOOP
  // ==========================================

  update() {
    // Poll touch buttons every frame (multi-touch safe)
    this._updateTouchInput();

    if (this.isPaused) return;

    // --- Player movement ---
    const speed = 200;
    const jumpForce = -400;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    let moveLeft = this.cursors.left.isDown || this.wasd.left.isDown || this.isTouchingLeft;
    let moveRight = this.cursors.right.isDown || this.wasd.right.isDown || this.isTouchingRight;
    let jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
               Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
               Phaser.Input.Keyboard.JustDown(this.wasd.up);

    // Check if player is still on a moving platform
    // Reset each frame — the collider callback will set it again if still touching
    const currentRidingPlatform = this.ridingPlatform;
    this.ridingPlatform = null;

    // Get platform velocity to add to player movement
    let platformVelX = 0;
    if (currentRidingPlatform && currentRidingPlatform.active && onGround) {
      platformVelX = currentRidingPlatform.body.velocity.x;
    }

    if (!this.isKnockedBack) {
      if (moveLeft) {
        this.player.body.setVelocityX(-speed + platformVelX);
        this.player.setFlipX(true);
      } else if (moveRight) {
        this.player.body.setVelocityX(speed + platformVelX);
        this.player.setFlipX(false);
      } else {
        this.player.body.setVelocityX(platformVelX);
      }

      // Touch jump (different handling since JustDown doesn't work for touch)
      if (this.isTouchingJump && onGround && !this._touchJumpUsed) {
        this.player.body.setVelocityY(jumpForce);
        this._touchJumpUsed = true;
      }
      if (!this.isTouchingJump) {
        this._touchJumpUsed = false;
      }

      if (jump && onGround) {
        this.player.body.setVelocityY(jumpForce);
      }
    }

    // --- Update head position to follow player ---
    this.playerHead.setPosition(this.player.x, this.player.y - 32);

    // --- Enemy patrol AI ---
    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy || !enemy.active) return;
      if (enemy.x <= enemy.patrolStart) {
        enemy.body.setVelocityX(enemy.patrolSpeed);
        enemy.setFlipX(false);
      } else if (enemy.x >= enemy.patrolEnd) {
        enemy.body.setVelocityX(-enemy.patrolSpeed);
        enemy.setFlipX(true);
      }
    });

    // --- Moving platform patrol (stays within gap bounds) ---
    this.movingPlatformGroup.getChildren().forEach((plat) => {
      if (!plat || !plat.active) return;
      if (plat.x <= plat.minX) {
        plat.body.setVelocityX(plat.moveSpeed);
      } else if (plat.x >= plat.maxX) {
        plat.body.setVelocityX(-plat.moveSpeed);
      }
    });

    // --- Cull off-screen tweens ---
    if (this._tweenedObjects) {
      const cam = this.cameras.main;
      const margin = 200;
      const camLeft = cam.scrollX - margin;
      const camRight = cam.scrollX + cam.width + margin;
      for (const entry of this._tweenedObjects) {
        if (!entry.obj || !entry.obj.active === undefined) continue;
        const inView = entry.worldX >= camLeft && entry.worldX <= camRight;
        if (inView && !entry.tween.isPlaying()) {
          entry.tween.resume();
        } else if (!inView && entry.tween.isPlaying()) {
          entry.tween.pause();
        }
      }
    }

    // --- Fall off screen check ---
    if (this.player.y > LEVEL_HEIGHT + 50) {
      // Respawn at last safe position
      this.player.setPosition(100, GROUND_HEIGHT - 60);
      this.player.body.setVelocity(0, 0);
      this.cameras.main.flash(300, 255, 0, 0);
    }
  }
}
