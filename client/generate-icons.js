import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal PNG generator without external dependencies
function createPNG(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw Image data (filter type 0 per scanline + RGBA pixels)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = width * 0.42;
  const innerRadius = width * 0.22;
  const dotRadius = width * 0.09;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Dark background with rounded rect or dark canvas
      let pr = 7, pg = 11, pb = 20, pa = 255; // #070B14

      // Cyan accent circle outer ring
      if (dist <= outerRadius && dist >= outerRadius - (width * 0.035)) {
        pr = 56; pg = 189; pb = 248; pa = 255; // #38BDF8
      } else if (dist <= innerRadius && dist >= innerRadius - (width * 0.035)) {
        pr = 56; pg = 189; pb = 248; pa = 220;
      } else if (dist <= dotRadius) {
        pr = 56; pg = 189; pb = 248; pa = 255; // Center solid dot
      } else if (dist < outerRadius && dist > innerRadius) {
        // subtle glow
        pr = 15; pg = 35; pb = 60; pa = 255;
      }

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
      rawData[pixelOffset + 3] = pa;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(4 + 4 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crcData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcValue = calculateCRC(crcData);
  buffer.writeUInt32BE(crcValue, 8 + length);

  return buffer;
}

function calculateCRC(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c >>> 0;
}

const publicDir = path.join(__dirname, 'public');
const icon192 = createPNG(192, 192);
const icon512 = createPNG(512, 512);

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), icon512);
console.log('Successfully generated icon-192.png, icon-512.png, and icon-maskable-512.png');
