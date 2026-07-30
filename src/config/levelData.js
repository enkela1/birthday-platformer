// Level configuration
// The level is ~5500px wide, player starts at x=100

export const LEVEL_WIDTH = 5500;
export const LEVEL_HEIGHT = 600;
export const GROUND_HEIGHT = 560;

// Platform positions: { x, y, width }
export const platforms = [
  // === Section 1: Starting area - ease into it ===
  { x: 300, y: 460, width: 120 },
  { x: 520, y: 400, width: 100 },
  { x: 740, y: 440, width: 100 },

  // === Section 2: Fun jumping, no collectibles here — just play ===
  { x: 960, y: 380, width: 110 },
  { x: 1140, y: 330, width: 100 },
  { x: 1330, y: 400, width: 120 },

  // (Trampoline here at ground level — ONLY way to reach the high sky platforms)

  // === Section 3: Sky platforms — high up, reached via trampoline ===
  { x: 1580, y: 240, width: 140 },   // First landing — wide and close to trampoline
  { x: 1800, y: 190, width: 120 },
  { x: 2020, y: 230, width: 130 },
  // Descend back down
  { x: 2200, y: 320, width: 110 },
  { x: 2380, y: 420, width: 120 },

  // (Big gap here — only way across is moving platform 1)

  // === Section 4: Mid level — mixed platforming ===
  { x: 2800, y: 380, width: 130 },
  { x: 3000, y: 310, width: 100 },
  { x: 3100, y: 370, width: 110 },
  { x: 3280, y: 430, width: 100 },

  // === Section 5: Tricky jumps — just platforming, enemies ===
  { x: 3480, y: 360, width: 100 },
  { x: 3650, y: 290, width: 110 },
  { x: 3820, y: 350, width: 100 },

  // (Trampoline here — ONLY way to reach final high section)

  // === Section 6: Final sky run — descends to trophy ===
  { x: 4050, y: 240, width: 140 },   // First landing — wide and close to trampoline
  { x: 4250, y: 200, width: 120 },
  { x: 4450, y: 280, width: 110 },
  { x: 4620, y: 350, width: 100 },   // Step down to trophy level

  // === Final platform (bigger, for the trophy) ===
  { x: 4800, y: 350, width: 250 },
];

// Bouncy platforms (spring pads): launch player extra high
// These are the ONLY way to reach certain high sections — normal jump can't get there
// { x, y, width }
export const bouncyPlatforms = [
  // Between section 2 and 3: on the ground, launches you up to sky platforms at y:200
  // Normal jump reaches ~y:160 from ground (560-400=160). These platforms are at y:200,
  // but there's no platform chain to get there — trampoline is the bridge.
  { x: 1480, y: 535, width: 70 },

  // Between section 5 and 6: on the ground, launches you to final sky run at y:190
  { x: 3950, y: 535, width: 70 },
];

// Moving platforms (horizontal slide)
// Each one covers a gap exactly — shuttles between left and right edges.
// { x, y, width, minX, maxX, speed } — minX/maxX are the CENTER bounds
export const movingPlatforms = [
  // Gap: ground missing x:2400 to x:2720 (320px). Platform is 110px wide (55 each side).
  // minX: 2560, maxX: 2645. Start in the middle of the range.
  { x: 2602, y: 480, width: 110, minX: 2560, maxX: 2645, speed: 40 },
];

// Gift box positions: { x, y, photoIndex }
// Well spaced — many sections have NO gifts, just pure platforming fun.
// Spread across all sections — every other section has a gift.
export const giftBoxes = [
  { x: 520, y: 360, photoIndex: 0 },      // Section 1
  { x: 1140, y: 290, photoIndex: 1 },     // Section 2: on the high platform
  { x: 1800, y: 150, photoIndex: 2 },     // Section 3: sky reward
  { x: 3000, y: 270, photoIndex: 3 },     // Section 4
  { x: 3650, y: 250, photoIndex: 4 },     // Section 5: on the high platform
  { x: 4250, y: 160, photoIndex: 5 },     // Section 6: sky platform
  { x: 4720, y: 310, photoIndex: 6 },     // Final platform: left side, away from trophy
];

// Enemy positions: { x, y, type, patrolDistance }
export const enemies = [
  { x: 520, y: 370, type: "candle", patrolDistance: 40 },     // Section 1: ON platform (x:520 y:400)
  { x: 1330, y: 530, type: "cake", patrolDistance: 120 },     // Section 2: ground patrol
  { x: 2020, y: 200, type: "candle", patrolDistance: 80 },    // Section 3: on sky platform!
  { x: 3000, y: 280, type: "cake", patrolDistance: 70 },      // Section 4: ON platform (x:3000 y:310)
  { x: 3280, y: 530, type: "candle", patrolDistance: 100 },   // Section 4: ground
  { x: 3650, y: 260, type: "cake", patrolDistance: 80 },      // Section 5: on platform
  { x: 3820, y: 530, type: "candle", patrolDistance: 90 },    // Section 5: ground
];

// Ground gaps (x position and width of gap)
// Two big gaps are only crossable via moving platforms
export const groundGaps = [
  { x: 850, width: 100 },       // Small gap, jumpable
  { x: 1900, width: 100 },      // Small gap in sky section area
  { x: 2400, width: 320 },      // BIG gap — moving platform
  { x: 3150, width: 100 },      // Small gap
];

// Trophy position
export const trophyPosition = { x: 4800, y: 310 };

// Mustache collectibles (1 total): { x, y }
export const mustachePickups = [
  { x: 1580, y: 200 },    // Section 3 sky — reward for making the trampoline jump
];

// Cat collectibles (3 total): { x, y }
// Spaced across different sections
export const catPickups = [
  { x: 960, y: 340 },       // Section 2: on a platform
  { x: 3100, y: 330 },      // Section 4: on a platform
  { x: 4250, y: 160 },      // Section 6: sky platform
];

// Laptop pickups - triggers "YOU'VE BEEN HACKED" trap (2 total): { x, y }
export const laptopPickups = [
  { x: 2380, y: 380 },      // End of section 3 descent — gotcha after the fun sky part
  { x: 3480, y: 320 },      // Section 5: right at the start
];

// Punch video trigger position (right before trophy)
// Covers full height so player can't jump over it
export const punchTriggerPosition = { x: 4700, y: 350 };
