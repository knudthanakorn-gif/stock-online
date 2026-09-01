import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      try {
        if (fs.statSync(full).isDirectory()) {
          results.push(...searchDir(full));
        } else if (f.endsWith('.ldb') || f.endsWith('.log')) {
          results.push(full);
        }
      } catch (e) {}
    }
  } catch (e) {}
  return results;
}

const allDbFiles = [
  ...searchDir('C:/Users/admin/AppData/Local/Microsoft/Edge/User Data/Default/Local Storage/leveldb'),
  ...searchDir('C:/Users/admin/AppData/Local/Google/Chrome/User Data/Default/Local Storage/leveldb'),
];

console.log('Total leveldb files found:', allDbFiles.length);

const allProducts = new Map();
const allRequests = new Map();
const allTransactions = new Map();
const allCategories = new Map();

allDbFiles.forEach((file) => {
  try {
    const buf = fs.readFileSync(file);
    // Try utf16le and utf8
    [buf.toString('utf16le'), buf.toString('utf8')].forEach((str) => {
      // Find JSON strings
      const jsonStartIndices = [];
      let pos = 0;
      while ((pos = str.indexOf('[{"', pos)) !== -1) {
        jsonStartIndices.push(pos);
        pos += 3;
      }

      jsonStartIndices.forEach((start) => {
        // Find closing bracket
        const end = str.indexOf('}]', start);
        if (end !== -1 && end - start < 2000000) {
          const slice = str.slice(start, end + 2);
          try {
            const parsed = JSON.parse(slice);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const first = parsed[0];
              if (first.sku || first.minThreshold !== undefined) {
                console.log(`Found ${parsed.length} products in ${path.basename(file)}`);
                parsed.forEach((p) => {
                  if (p.id || p.name) {
                    allProducts.set(p.id || p.name, p);
                  }
                });
              } else if (first.refNo && (first.items || first.purpose || first.requesterName)) {
                console.log(`Found ${parsed.length} requests in ${path.basename(file)}`);
                parsed.forEach((r) => {
                  if (r.id || r.refNo) {
                    allRequests.set(r.id || r.refNo, r);
                  }
                });
              } else if (first.productId || first.balanceAfter !== undefined || first.type === 'IN' || first.type === 'OUT') {
                console.log(`Found ${parsed.length} transactions in ${path.basename(file)}`);
                parsed.forEach((t) => {
                  if (t.id) {
                    allTransactions.set(t.id, t);
                  }
                });
              }
            }
          } catch (e) {}
        }
      });
    });
  } catch (e) {}
});

console.log('=== EXTRACTION SUMMARY ===');
console.log('Unique Products:', allProducts.size);
console.log('Unique Requests:', allRequests.size);
console.log('Unique Transactions:', allTransactions.size);

// Save extracted state to a json file
const combined = {
  extractedAt: new Date().toISOString(),
  products: Array.from(allProducts.values()),
  requests: Array.from(allRequests.values()),
  transactions: Array.from(allTransactions.values()),
};

fs.writeFileSync('d:/stock online/scripts/extracted_latest_data.json', JSON.stringify(combined, null, 2), 'utf8');
console.log('Saved to scripts/extracted_latest_data.json');
