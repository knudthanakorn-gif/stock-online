import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateCompleteMovements() {
  console.log('Generating complete stock movement transactions for all 77 products...');

  // 1. Fetch current products from Supabase
  const { data: products, error: pErr } = await supabase.from('products').select('*');
  if (pErr) {
    console.error('Error fetching products:', pErr);
    return;
  }

  // 2. Load backup co-stock transactions
  const backupData = JSON.parse(fs.readFileSync('C:/Users/admin/Downloads/backup co-stock.json', 'utf8'));
  const existingTxList = backupData.transactions || [];

  const txMap = new Map();

  // Add existing transactions
  existingTxList.forEach(t => {
    txMap.set(t.id, {
      id: t.id,
      product_id: t.productId || '',
      type: t.type || 'IN',
      quantity: Number(t.quantity || 0),
      timestamp: t.timestamp || t.date || new Date().toISOString(),
      requester_name: t.requesterName || '',
      department: t.department || '',
      approved_by: t.approvedBy || 'สมชาย มั่นคง',
      status: t.status || 'COMPLETED',
      note: t.note || '[รับเข้าอุปกรณ์]',
    });
  });

  // For every product, ensure there is an initial stock movement transaction
  products.forEach((p, idx) => {
    const initTxId = `tx-init-${p.id}`;
    if (!txMap.has(initTxId)) {
      txMap.set(initTxId, {
        id: initTxId,
        product_id: p.id,
        type: 'IN',
        quantity: Number(p.quantity || 0),
        timestamp: p.created_at || new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
        requester_name: '',
        department: '',
        approved_by: 'ผู้ดูแลระบบ (Admin)',
        status: 'COMPLETED',
        note: 'ยอดยกมา / สินค้าเริ่มต้น (Initial Stock Balance)',
      });
    }
  });

  const allTransactions = Array.from(txMap.values());
  console.log(`Total transactions to insert: ${allTransactions.length}`);

  // Insert in batches of 50
  const chunk = 50;
  let ok = 0;
  for (let i = 0; i < allTransactions.length; i += chunk) {
    const slice = allTransactions.slice(i, i + chunk);
    const { error } = await supabase.from('transactions').upsert(slice);
    if (error) console.error('Transaction batch error:', error.message);
    else ok += slice.length;
  }

  console.log(`🎉 Transactions populated: ${ok} / ${allTransactions.length} OK!`);
}

populateCompleteMovements();
