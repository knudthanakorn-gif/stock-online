import fs from 'fs';
import path from 'path';

function snappyDecompress(buf) {
  let pos = 0;
  let uncompressedLen = 0;
  let shift = 0;
  while (pos < buf.length) {
    const b = buf[pos++];
    uncompressedLen |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }

  if (uncompressedLen <= 0 || uncompressedLen > 10000000) return null;

  const out = Buffer.alloc(uncompressedLen);
  let outPos = 0;

  while (pos < buf.length && outPos < uncompressedLen) {
    const tag = buf[pos++];
    const element = tag & 0x03;

    if (element === 0) {
      let len = (tag >> 2) + 1;
      if (len > 60) {
        const extraBytes = len - 60;
        if (extraBytes > 4 || pos + extraBytes > buf.length) break;
        len = 0;
        for (let i = 0; i < extraBytes; i++) {
          len |= buf[pos++] << (i * 8);
        }
        len += 1;
      }
      if (len <= 0 || pos + len > buf.length || outPos + len > uncompressedLen) break;
      buf.copy(out, outPos, pos, pos + len);
      pos += len;
      outPos += len;
    } else if (element === 1) {
      const len = ((tag >> 2) & 0x07) + 4;
      if (pos >= buf.length) break;
      const offset = ((tag & 0xe0) << 3) | buf[pos++];
      if (offset <= 0 || offset > outPos || outPos + len > uncompressedLen) break;
      for (let i = 0; i < len; i++) {
        out[outPos] = out[outPos - offset];
        outPos++;
      }
    } else if (element === 2) {
      const len = (tag >> 2) + 1;
      if (pos + 2 > buf.length) break;
      const offset = buf.readUInt16LE(pos);
      pos += 2;
      if (offset <= 0 || offset > outPos || outPos + len > uncompressedLen) break;
      for (let i = 0; i < len; i++) {
        out[outPos] = out[outPos - offset];
        outPos++;
      }
    } else if (element === 3) {
      const len = (tag >> 2) + 1;
      if (pos + 4 > buf.length) break;
      const offset = buf.readUInt32LE(pos);
      pos += 4;
      if (offset <= 0 || offset > outPos || outPos + len > uncompressedLen) break;
      for (let i = 0; i < len; i++) {
        out[outPos] = out[outPos - offset];
        outPos++;
      }
    }
  }
  return outPos === uncompressedLen ? out : null;
}

const dir = 'C:/Users/admin/AppData/Local/Microsoft/Edge/User Data/Default/Local Storage/leveldb';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ldb') || f.endsWith('.log'));

const recovered = {
  products: null,
  requests: null,
  requesters: null,
  categories: null,
  recentLogins: null,
};

files.forEach((f) => {
  const buf = fs.readFileSync(path.join(dir, f));
  console.log('Scanning file:', f, 'size:', buf.length);

  for (let off = 0; off < buf.length - 16; off++) {
    const decomp = snappyDecompress(buf.slice(off));
    if (decomp) {
      // Check both UTF-8 and UTF-16LE
      [decomp.toString('utf8'), decomp.toString('utf16le')].forEach((str) => {
        if (str.startsWith('[{"') || str.startsWith('{"')) {
          try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const first = parsed[0];
              if (first.sku || first.minThreshold !== undefined) {
                console.log(`🎉 Found ${parsed.length} Products in ${f} at offset ${off}!`);
                if (!recovered.products || parsed.length >= recovered.products.length) {
                  recovered.products = parsed;
                }
              } else if (first.refNo && (first.items || first.requesterName)) {
                console.log(`🎉 Found ${parsed.length} Requests in ${f} at offset ${off}!`);
                if (!recovered.requests || parsed.length >= recovered.requests.length) {
                  recovered.requests = parsed;
                }
              } else if (first.employeeCode || (first.company && first.department)) {
                console.log(`🎉 Found ${parsed.length} Requesters in ${f} at offset ${off}!`);
                if (!recovered.requesters || parsed.length >= recovered.requesters.length) {
                  recovered.requesters = parsed;
                }
              } else if (first.icon || (first.name && first.id?.startsWith('cat-'))) {
                console.log(`🎉 Found ${parsed.length} Categories in ${f} at offset ${off}!`);
                if (!recovered.categories || parsed.length >= recovered.categories.length) {
                  recovered.categories = parsed;
                }
              }
            }
          } catch (e) {}
        }
      });
    }
  }
});

console.log('=== RECOVERY RESULTS ===');
console.log('Products:', recovered.products?.length);
console.log('Requests:', recovered.requests?.length);
console.log('Requesters:', recovered.requesters?.length);
console.log('Categories:', recovered.categories?.length);

fs.writeFileSync('d:/stock online/scripts/fully_recovered_data.json', JSON.stringify(recovered, null, 2), 'utf8');
