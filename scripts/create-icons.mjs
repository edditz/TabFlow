import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a simple 1x1 blue PNG as base64, then we'll scale it conceptually
// These are minimal valid PNG files with solid colors

// Simple function to create a minimal PNG
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

  // Helper to create CRC32 lookup table
  function makeCRCTable() {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
      }
      table[i] = c
    }
    return table
  }

  const crcTable = makeCRCTable()

  function crc32(data) {
    let crc = 0xFFFFFFFF
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function createChunk(type, data) {
    const length = new Uint8Array(4)
    new DataView(length.buffer).setUint32(0, data.length, false)

    const typeBytes = new TextEncoder().encode(type)
    const crcData = new Uint8Array([...typeBytes, ...data])
    const crc = crc32(crcData)

    const crcBytes = new Uint8Array(4)
    new DataView(crcBytes.buffer).setUint32(0, crc, false)

    return new Uint8Array([...length, ...typeBytes, ...data, ...crcBytes])
  }

  // IHDR chunk
  const ihdrData = new Uint8Array(13)
  const view = new DataView(ihdrData.buffer)
  view.setUint32(0, width, false)
  view.setUint32(4, height, false)
  view.setUint8(8, 8) // bit depth
  view.setUint8(9, 2) // color type (RGB)
  view.setUint8(10, 0) // compression
  view.setUint8(11, 0) // filter
  view.setUint8(12, 0) // interlace
  const ihdr = createChunk('IHDR', ihdrData)

  // Create raw image data
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b)
    }
  }
  const rawBytes = new Uint8Array(rawData)

  // Compress with zlib (store mode - no actual compression)
  function adler32(data) {
    let a = 1, b = 0
    for (let i = 0; i < data.length; i++) {
      a = (a + data[i]) % 65521
      b = (b + a) % 65521
    }
    return ((b << 16) | a) >>> 0
  }

  const zlibHeader = new Uint8Array([0x78, 0x01])
  const adler = adler32(rawBytes)
  const adlerBytes = new Uint8Array(4)
  new DataView(adlerBytes.buffer).setUint32(0, adler, false)

  // Create stored deflate block
  const blocks = []
  let offset = 0
  const maxBlock = 65535
  while (offset < rawBytes.length) {
    const len = Math.min(rawBytes.length - offset, maxBlock)
    const isFinal = offset + len >= rawBytes.length
    const block = new Uint8Array(5 + len)
    block[0] = isFinal ? 1 : 0
    block[1] = len & 0xFF
    block[2] = (len >> 8) & 0xFF
    block[3] = (~len) & 0xFF
    block[4] = ((~len) >> 8) & 0xFF
    block.set(rawBytes.slice(offset, offset + len), 5)
    blocks.push(block)
    offset += len
  }

  const compressed = new Uint8Array([...zlibHeader, ...blocks.flatMap(b => [...b]), ...adlerBytes])
  const idat = createChunk('IDAT', compressed)

  // IEND chunk
  const iend = createChunk('IEND', new Uint8Array(0))

  return Buffer.from([...signature, ...ihdr, ...idat, ...iend])
}

// Create icons directory if needed
const iconsDir = join(__dirname, '..', 'icons')
try {
  mkdirSync(iconsDir, { recursive: true })
} catch (_e) {
  // ignore
}

// Blue color (#3B82F6)
const color = [59, 130, 246]

const sizes = [16, 32, 48, 128]
sizes.forEach(size => {
  const png = createPNG(size, size, ...color)
  const filepath = join(iconsDir, `icon${size}.png`)
  writeFileSync(filepath, png)
  console.log(`Created ${filepath}`)
})

console.log('Done!')
