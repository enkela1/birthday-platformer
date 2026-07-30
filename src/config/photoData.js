// =====================================================
// EDIT THIS FILE to add your own photos and roast captions!
// =====================================================
// 
// Instructions:
// 1. Put your silly photos in public/images/photos/ (photo1.jpg through photo7.jpg)
// 2. Edit the captions below with your own inside jokes and roasts
// 3. The photos will appear as polaroid popups when Daors collects gift boxes
//

export const photos = [
  {
    image: 'images/photos/photo1.jpg',
    caption: "Me and bro since day 1",
  },
  {
    image: 'images/photos/photo2.jpg',
    caption: "Such nerds",
  },
  {
    image: 'images/photos/photo3.jpg',
    caption: "Two Cutie Pies",
  },
  {
    image: 'images/photos/photo4.jpg',
    caption: "Two Goats",
  },
  {
    image: 'images/photos/photo5.jpg',
    caption: "POV Im just trynna study",
  },
  {
    image: 'images/photos/photo6.jpg',
    caption: "When bro forces me to wrestle with him then loses",
  },
  {
    image: 'images/photos/photo7.jpg',
    caption: "What the hell...",
  },
];

// Avatar labels shown on the selection screen
export const avatarLabels = [
  'Cool Daors',
  'Spiky Daors',
  'Gangster Daors',
];

// Final birthday message on the win screen
export const birthdayMessage = "Happy birthday lil bro :) Stay silly,be happy and work hard(so u can buy me a car, two ships and a yacht) Love you <3 ";

// Score values
export const scoreConfig = {
  giftBox: 200,       // collecting a bro photo gift box
  mustache: 100,      // collecting the mustache
  cat: 75,            // collecting a cat
  enemyHit: -50,      // getting hit by candle/cake
  hackedTrap: -150,   // getting hacked by the laptop
};

// Score-based roast messages on the win screen
export const scoreRoasts = [
  { minScore: 0, message: "Daors... you literally just walked into every enemy. Respect for the commitment though." },
  { minScore: 200, message: "You tried. That's what matters. Not really, but we say that to make you feel better." },
  { minScore: 500, message: "Average. Just like your haircut." },
  { minScore: 800, message: "Not bad! Almost as good as me at everything." },
  { minScore: 1200, message: "OK fine, you're actually decent. Don't let it go to your head." },
  { minScore: 1500, message: "GOAT status. For a little brother, anyway." },
];

// Mustache photo (shown when collecting the mustache)
export const mustachePhoto = {
  image: 'images/photos/mustache.jpg',
  caption: "Yo who is this guy?",
};

// Cat photos (shown when collecting each cat)
export const catPhotos = [
  { image: 'images/photos/cat1.jpg', caption: "Congrats you just found a cat!" },
  { image: 'images/photos/cat2.jpg', caption: "You just sneaked a cat into the house. You might get in trouble" },
  { image: 'images/photos/cat3.jpg', caption: "You just found another cat! Don't bring this into the house " },
];

// Hacker photos (shown during "YOU'VE BEEN HACKED" trap for each laptop)
export const hackerPhotos = [
  { image: 'images/photos/hacker1.jpg', caption: "Mom we need Anonymous to help us.\n Mom: We got Anonymous at home.\n  Anonymous at home:" },
  { image: 'images/photos/hacker2.jpg', caption: "The FBI's most wanted." },
];

// Punch video path (shown before trophy)
export const punchVideo = 'images/videos/punch.mp4';
