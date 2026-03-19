/**
 * Generate pixel-art championship belt favicon
 * Retro 8-bit style matching LED scoreboard theme
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// Color palette - retro LED scoreboard colors
const COLORS = {
  background: '#0a0a0a', // Deep black
  beltDark: '#92400e', // Dark amber/bronze
  beltMain: '#f59e0b', // Bright amber (LED amber)
  beltLight: '#fbbf24', // Light amber highlight
  beltShine: '#fef3c7', // Brightest highlight
  plateDark: '#78716c', // Dark metal
  plateMetal: '#d6d3d1', // Metal gray
  plateShine: '#fafaf9', // Metal highlight
}

/**
 * Draw pixel-perfect belt at given size
 */
function drawBelt(ctx, size) {
  const s = size // shorthand

  // Fill background
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, s, s)

  // Different designs for different sizes
  if (s === 16) {
    // Ultra-simple 16x16 design
    // Belt strap (left)
    ctx.fillStyle = COLORS.beltDark
    ctx.fillRect(1, 6, 4, 4)
    ctx.fillStyle = COLORS.beltMain
    ctx.fillRect(1, 7, 4, 2)

    // Center plate
    ctx.fillStyle = COLORS.plateDark
    ctx.fillRect(5, 5, 6, 6)
    ctx.fillStyle = COLORS.plateMetal
    ctx.fillRect(6, 6, 4, 4)
    ctx.fillStyle = COLORS.plateShine
    ctx.fillRect(7, 7, 2, 1)

    // Belt strap (right)
    ctx.fillStyle = COLORS.beltDark
    ctx.fillRect(11, 6, 4, 4)
    ctx.fillStyle = COLORS.beltMain
    ctx.fillRect(11, 7, 4, 2)

    // Gold accent on belt
    ctx.fillStyle = COLORS.beltLight
    ctx.fillRect(2, 7, 2, 1)
    ctx.fillRect(12, 7, 2, 1)
  } else if (s === 32) {
    // More detailed 32x32 design

    // Left belt strap with depth
    ctx.fillStyle = COLORS.beltDark
    ctx.fillRect(2, 12, 8, 8)
    ctx.fillStyle = COLORS.beltMain
    ctx.fillRect(2, 13, 8, 6)
    ctx.fillStyle = COLORS.beltLight
    ctx.fillRect(3, 14, 6, 2)
    ctx.fillStyle = COLORS.beltShine
    ctx.fillRect(4, 14, 4, 1)

    // Center plate (larger, more detailed)
    ctx.fillStyle = COLORS.plateDark
    ctx.fillRect(10, 10, 12, 12)
    ctx.fillStyle = COLORS.plateMetal
    ctx.fillRect(11, 11, 10, 10)
    ctx.fillStyle = COLORS.plateShine
    ctx.fillRect(13, 13, 6, 3)
    ctx.fillRect(14, 16, 4, 1)

    // Right belt strap
    ctx.fillStyle = COLORS.beltDark
    ctx.fillRect(22, 12, 8, 8)
    ctx.fillStyle = COLORS.beltMain
    ctx.fillRect(22, 13, 8, 6)
    ctx.fillStyle = COLORS.beltLight
    ctx.fillRect(23, 14, 6, 2)
    ctx.fillStyle = COLORS.beltShine
    ctx.fillRect(24, 14, 4, 1)

    // Belt rivets/studs
    ctx.fillStyle = COLORS.beltShine
    ctx.fillRect(4, 13, 1, 1)
    ctx.fillRect(8, 13, 1, 1)
    ctx.fillRect(4, 18, 1, 1)
    ctx.fillRect(8, 18, 1, 1)
    ctx.fillRect(23, 13, 1, 1)
    ctx.fillRect(27, 13, 1, 1)
    ctx.fillRect(23, 18, 1, 1)
    ctx.fillRect(27, 18, 1, 1)
  } else {
    // High-res version (192x192, 512x512)
    const scale = s / 32 // Scale up from 32px design
    const px = Math.floor(scale) // Pixel size

    // Helper to draw scaled pixels
    const drawPixel = (x, y, color) => {
      ctx.fillStyle = color
      ctx.fillRect(x * px, y * px, px, px)
    }

    // Left strap
    for (let y = 12; y < 20; y++) {
      for (let x = 2; x < 10; x++) {
        if (y === 12 || y === 19) drawPixel(x, y, COLORS.beltDark)
        else if (y >= 14 && y <= 15 && x >= 3 && x <= 8) drawPixel(x, y, COLORS.beltLight)
        else if (y === 14 && x >= 4 && x <= 7) drawPixel(x, y, COLORS.beltShine)
        else drawPixel(x, y, COLORS.beltMain)
      }
    }

    // Center plate
    for (let y = 10; y < 22; y++) {
      for (let x = 10; x < 22; x++) {
        if (y === 10 || y === 21 || x === 10 || x === 21) {
          drawPixel(x, y, COLORS.plateDark)
        } else if (y >= 13 && y <= 15 && x >= 13 && x <= 18) {
          drawPixel(x, y, COLORS.plateShine)
        } else if (y === 16 && x >= 14 && x <= 17) {
          drawPixel(x, y, COLORS.plateShine)
        } else {
          drawPixel(x, y, COLORS.plateMetal)
        }
      }
    }

    // Right strap
    for (let y = 12; y < 20; y++) {
      for (let x = 22; x < 30; x++) {
        if (y === 12 || y === 19) drawPixel(x, y, COLORS.beltDark)
        else if (y >= 14 && y <= 15 && x >= 23 && x <= 28) drawPixel(x, y, COLORS.beltLight)
        else if (y === 14 && x >= 24 && x <= 27) drawPixel(x, y, COLORS.beltShine)
        else drawPixel(x, y, COLORS.beltMain)
      }
    }

    // Studs/rivets
    const studs = [
      [4, 13],
      [8, 13],
      [4, 18],
      [8, 18],
      [23, 13],
      [27, 13],
      [23, 18],
      [27, 18],
    ]
    studs.forEach(([x, y]) => drawPixel(x, y, COLORS.beltShine))
  }

  return ctx.canvas
}

/**
 * Generate all favicon sizes
 */
async function generateFavicons() {
  const outputDir = path.join(__dirname, 'public')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Generate different sizes
  const sizes = [16, 32, 192, 512]

  for (const size of sizes) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Disable image smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false

    drawBelt(ctx, size)

    // Save PNG
    const buffer = canvas.toBuffer('image/png')
    const filename = size <= 32 ? `favicon-${size}x${size}.png` : `icon-${size}x${size}.png`
    fs.writeFileSync(path.join(outputDir, filename), buffer)
    console.log(`✅ Generated ${filename}`)
  }

  // Also create apple-touch-icon
  const appleCanvas = createCanvas(180, 180)
  const appleCtx = appleCanvas.getContext('2d')
  appleCtx.imageSmoothingEnabled = false
  drawBelt(appleCtx, 180)
  const appleBuffer = appleCanvas.toBuffer('image/png')
  fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.png'), appleBuffer)
  console.log(`✅ Generated apple-touch-icon.png`)

  console.log('\n🏆 Championship belt favicons generated!')
  console.log('📁 Saved to:', outputDir)
  console.log('\n💡 Add these to your HTML <head>:')
  console.log(`
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png">
  `)
}

// Run it
generateFavicons().catch(console.error)
