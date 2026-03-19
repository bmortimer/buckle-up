/**
 * Generate Open Graph image for social sharing
 * Retro LED scoreboard theme matching site design
 * Output: 1200x630 (standard OG image dimensions)
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// Color palette - matches site's LED scoreboard theme
const COLORS = {
  background: '#0a0a0a', // Deep black
  beltDark: '#92400e', // Dark amber/bronze
  beltMain: '#f59e0b', // Bright amber (LED amber)
  beltLight: '#fbbf24', // Light amber highlight
  beltShine: '#fef3c7', // Brightest highlight
  plateDark: '#78716c', // Dark metal
  plateMetal: '#d6d3d1', // Metal gray
  plateShine: '#fafaf9', // Metal highlight
  textPrimary: '#ffffff', // White text
  textAmber: '#fbbf24', // Amber text
  textMuted: '#a1a1aa', // Muted gray
  gridDot: 'rgba(245, 158, 11, 0.08)', // Subtle amber grid
}

/**
 * Draw pixel-art belt (scaled from favicon design)
 */
function drawBelt(ctx, centerX, centerY, scale) {
  const px = scale // Pixel size

  // Belt is designed on 32x8 grid, centered
  const offsetX = centerX - 16 * px
  const offsetY = centerY - 4 * px

  const drawPixel = (x, y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(offsetX + x * px, offsetY + y * px, px, px)
  }

  // Left strap (8 wide, 8 tall)
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (y === 0 || y === 7) drawPixel(x, y, COLORS.beltDark)
      else if (y >= 2 && y <= 3 && x >= 1 && x <= 6) drawPixel(x, y, COLORS.beltLight)
      else if (y === 2 && x >= 2 && x <= 5) drawPixel(x, y, COLORS.beltShine)
      else drawPixel(x, y, COLORS.beltMain)
    }
  }

  // Center plate (12 wide, 12 tall, centered vertically)
  const plateOffsetY = -2
  for (let y = 0; y < 12; y++) {
    for (let x = 8; x < 24; x++) {
      const py = y + plateOffsetY
      if (y === 0 || y === 11 || x === 8 || x === 23) {
        drawPixel(x, py, COLORS.plateDark)
      } else if (y >= 3 && y <= 5 && x >= 11 && x <= 20) {
        drawPixel(x, py, COLORS.plateShine)
      } else if (y === 6 && x >= 12 && x <= 19) {
        drawPixel(x, py, COLORS.plateShine)
      } else {
        drawPixel(x, py, COLORS.plateMetal)
      }
    }
  }

  // Right strap (8 wide, 8 tall)
  for (let y = 0; y < 8; y++) {
    for (let x = 24; x < 32; x++) {
      if (y === 0 || y === 7) drawPixel(x, y, COLORS.beltDark)
      else if (y >= 2 && y <= 3 && x >= 25 && x <= 30) drawPixel(x, y, COLORS.beltLight)
      else if (y === 2 && x >= 26 && x <= 29) drawPixel(x, y, COLORS.beltShine)
      else drawPixel(x, y, COLORS.beltMain)
    }
  }

  // Studs/rivets
  const studs = [
    [2, 1],
    [6, 1],
    [2, 6],
    [6, 6],
    [25, 1],
    [29, 1],
    [25, 6],
    [29, 6],
  ]
  studs.forEach(([x, y]) => drawPixel(x, y, COLORS.beltShine))
}

/**
 * Draw LED-style grid background
 */
function drawLEDGrid(ctx, width, height) {
  const spacing = 24
  const dotSize = 2

  ctx.fillStyle = COLORS.gridDot
  for (let y = spacing; y < height; y += spacing) {
    for (let x = spacing; x < width; x += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/**
 * Draw text with LED glow effect
 */
function drawGlowText(ctx, text, x, y, fontSize, color, glowColor) {
  ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '0.1em'

  // Glow layers
  const glowLayers = [
    { blur: 30, alpha: 0.3 },
    { blur: 20, alpha: 0.4 },
    { blur: 10, alpha: 0.5 },
  ]

  glowLayers.forEach(({ blur, alpha }) => {
    ctx.shadowColor = glowColor
    ctx.shadowBlur = blur
    ctx.globalAlpha = alpha
    ctx.fillStyle = glowColor
    ctx.fillText(text, x, y)
  })

  // Main text
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

/**
 * Generate the OG image
 */
async function generateOGImage() {
  const width = 1200
  const height = 630

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // LED grid pattern
  drawLEDGrid(ctx, width, height)

  // Radial gradient overlay for depth
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 500)
  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.05)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Border frame
  const borderWidth = 8
  ctx.strokeStyle = COLORS.beltMain
  ctx.lineWidth = borderWidth
  ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth)

  // Corner LED dots
  const cornerDots = [
    [24, 24],
    [width - 24, 24],
    [24, height - 24],
    [width - 24, height - 24],
  ]
  ctx.fillStyle = COLORS.beltLight
  cornerDots.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
  })

  // Top decorative label
  ctx.font = '14px "Arial", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.textMuted
  ctx.letterSpacing = '0.2em'
  ctx.fillText('◆ LINEAL CHAMPIONSHIP ◆', width / 2, 60)

  // Main title with glow
  drawGlowText(ctx, 'BELT TRACKER', width / 2, 150, 72, COLORS.textPrimary, COLORS.beltMain)

  // Belt graphic (centered, scaled up)
  drawBelt(ctx, width / 2, height / 2 + 20, 12)

  // Subtitle
  ctx.font = 'bold 28px "Arial", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.textAmber
  ctx.fillText('WNBA • 1997–PRESENT', width / 2, height - 100)

  // Bottom tagline
  ctx.font = '16px "Arial", sans-serif'
  ctx.fillStyle = COLORS.textMuted
  ctx.fillText('Every game is a title defense', width / 2, height - 60)

  // Save
  const outputDir = path.join(__dirname, 'public')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const buffer = canvas.toBuffer('image/png')
  const outputPath = path.join(outputDir, 'og-image.png')
  fs.writeFileSync(outputPath, buffer)

  const fileSizeKB = Math.round(buffer.length / 1024)
  console.log(`✅ Generated og-image.png (${width}x${height}, ${fileSizeKB}KB)`)
  console.log(`📁 Saved to: ${outputPath}`)
}

// Run it
generateOGImage().catch(console.error)
