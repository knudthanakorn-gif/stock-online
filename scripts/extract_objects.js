import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/admin/AppData/Local/Microsoft/Edge/User Data/Default/Local Storage/leveldb';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

const foundProducts = new Map();
const foundRequests = new Map();
const foundTransactions = new Map();

files.forEach(f => {
  const buf = fs.readFileSync(path.join(dir, f));
  const str16 = buf.toString('utf16le');
  const str8 = buf.toString('utf8');

  [str16, str8].forEach(str => {
    // 1. Find requests
    let reqPos = 0;
    while ((reqPos = str.indexOf('"refNo":"REQ-', reqPos)) !== -1) {
      // search backwards for '{' and forwards for '}'
      const start = str.lastIndexOf('{', reqPos);
      const end = str.indexOf('}', reqPos);
      if (start !== -1 && end !== -1) {
        const jsonCandidate = str.slice(start, end + 1);
        try {
          const parsed = JSON.parse(jsonCandidate);
          if (parsed.refNo) {
            foundRequests.set(parsed.refNo, parsed);
          }
        } catch(e) {}
      }
      reqPos += 12;
    }

    // 2. Find transactions
    let txPos = 0;
    while ((txPos = str.indexOf('"id":"tx-', txPos)) !== -1) {
      const start = str.lastIndexOf('{', txPos);
      const end = str.indexOf('}', txPos);
      if (start !== -1 && end !== -1) {
        const jsonCandidate = str.slice(start, end + 1);
        try {
          const parsed = JSON.parse(jsonCandidate);
          if (parsed.id && (parsed.type === 'IN' || parsed.type === 'OUT' || parsed.productId)) {
            foundTransactions.set(parsed.id, parsed);
          }
        } catch(e) {}
      }
      txPos += 8;
    }

    // 3. Find products
    let prodPos = 0;
    while ((prodPos = str.indexOf('"sku":"AST-', prodPos)) !== -1) {
      const start = str.lastIndexOf('{', prodPos);
      const end = str.indexOf('}', prodPos);
      if (start !== -1 && end !== -1) {
        const jsonCandidate = str.slice(start, end + 1);
        try {
          const parsed = JSON.parse(jsonCandidate);
          if (parsed.sku && parsed.name) {
            foundProducts.set(parsed.sku, parsed);
          }
        } catch(e) {}
      }
      prodPos += 10;
    }
  });
});

console.log('=== EXTRACTED OBJECTS ===');
console.log('Requests count:', foundRequests.size);
Array.from(foundRequests.values()).forEach(r => console.log('Request:', r.refNo, r.requesterName, r.status, r.createdAt));

console.log('Transactions count:', foundTransactions.size);
Array.from(foundTransactions.values()).forEach(t => console.log('Transaction:', t.id, t.type, t.quantity, t.productName, t.note));

console.log('Products count:', foundProducts.size);
