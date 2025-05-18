let x;
let y;
let direction = 1;
let spacing = 30;
let waveAmplitude = 20;
let noiseSeedOffset = 0;
let speed = 4;
let detail = 1.5;
let lastX, lastY;
let progress = 0;
let lineLength;
let previousLine = [];
let minGap = 2;
let knots = [];
let allKnots = []; // store all knots across lines

function setup() {
  createCanvas(800, 600);
  background(255);
  strokeWeight(1);
  noFill();
  x = width;
  y = 0;
  lastX = getWaveX(x, y, noiseSeedOffset);
  lastY = y;
  lineLength = height / detail;
  knots = generateKnots(x);
  allKnots.push(...knots);
}

function draw() {
  for (let i = 0; i < speed; i++) {
    let rawX = getWaveX(x, y, noiseSeedOffset);
    let knotOffset = getKnotOffset(y, x); // x now used for neighbor ripples
    let waveX = rawX + knotOffset;

    // Prevent overlapping
    if (previousLine.length > 0 && y < height && y >= 0) {
      let prevX = previousLine[int(y)];
      if (prevX !== undefined) {
        let diff = waveX - prevX;
        if (abs(diff) < minGap) {
          waveX = prevX + (diff < 0 ? -minGap : minGap);
        }
      }
    }

    // Fade line in
    let alpha = map(progress, 0, lineLength, 0, 255);
    stroke(0, alpha);
    line(lastX, lastY, waveX, y);

    if (previousLine.length <= int(y)) {
      previousLine[int(y)] = waveX;
    }

    lastX = waveX;
    lastY = y;
    y += detail * direction;
    progress++;

    if (y >= height || y <= 0) {
      direction *= -1;
      x -= spacing;
      y = constrain(y, 0, height);
      noiseSeedOffset += 1000;
      lastX = getWaveX(x, y, noiseSeedOffset);
      lastY = y;
      progress = 0;
      knots = generateKnots(x);
      allKnots.push(...knots); // store all knots for ripple effects
      break;
    }

    if (x < 0) {
      noLoop();
      break;
    }
  }
}

function getWaveX(baseX, yPos, seed) {
  let n = noise(yPos * 0.01, seed);
  let wave = sin(yPos * 0.02 + seed) * waveAmplitude * n;
  return baseX + wave;
}

// Generate subtle knots for a given x
function generateKnots(xPos) {
  let knots = [];
  let numKnots = int(random(1, 3));
  for (let i = 0; i < numKnots; i++) {
    let yPos = random(80, height - 80);
    let radius = random(8, 14);
    let strength = random(2, 5);
    knots.push({ x: xPos, y: yPos, radius: radius, strength: strength });
  }
  return knots;
}

// Knot offset with ripple effect to neighbors
function getKnotOffset(currentY, currentX) {
  let offset = 0;
  for (let k of allKnots) {
    let yDist = abs(currentY - k.y);
    let xDist = abs(currentX - k.x);

    let yFalloff = yDist < k.radius ? sin((1 - yDist / k.radius) * PI) : 0;
    let xFalloff = xDist < 60 ? cos((xDist / 60) * (PI / 2)) : 0;

    if (yFalloff > 0 && xFalloff > 0) {
      let direction = (currentX < k.x) ? -1 : 1;
      offset += yFalloff * xFalloff * k.strength * direction;
    }
  }
  return offset;
}