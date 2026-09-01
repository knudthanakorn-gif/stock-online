import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const simulatedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/simulatedData500.json'), 'utf8')
);

async function runSeed() {
  console.log('Seeding initial data into Supabase...');

  // 1. Categories
  if (simulatedData.categories?.length) {
    const cats = simulatedData.categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      icon: c.icon || '',
    }));
    const { error } = await supabase.from('categories').upsert(cats);
    console.log('Categories:', error ? error.message : `${cats.length} records OK`);
  }

  // 2. Suppliers
  if (simulatedData.suppliers?.length) {
    const sups = simulatedData.suppliers.map(s => ({
      id: s.id,
      name: s.name,
      contact_person: s.contactPerson || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
    }));
    const { error } = await supabase.from('suppliers').upsert(sups);
    console.log('Suppliers:', error ? error.message : `${sups.length} records OK`);
  }

  // 3. Requesters
  if (simulatedData.requestersList?.length) {
    const reqs = simulatedData.requestersList.map(r => ({
      id: r.id,
      name: r.name,
      department: r.department || '',
      position: r.position || '',
      email: r.email || '',
      phone: r.phone || '',
      avatar: r.avatar || null,
    }));
    const { error } = await supabase.from('requesters').upsert(reqs);
    console.log('Requesters:', error ? error.message : `${reqs.length} records OK`);
  }

  // 4. Products (batch in chunks of 50)
  if (simulatedData.products?.length) {
    const prods = simulatedData.products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku || '',
      barcode: p.barcode || '',
      category: p.category || '',
      cost_price: p.costPrice || 0,
      selling_price: p.sellingPrice || 0,
      quantity: p.quantity || 0,
      min_threshold: p.minThreshold || 0,
      unit: p.unit || 'ชิ้น',
      supplier_id: p.supplierId || null,
      image: p.image || '',
      description: p.description || '',
    }));
    const chunk = 50;
    let ok = 0;
    for (let i = 0; i < prods.length; i += chunk) {
      const slice = prods.slice(i, i + chunk);
      const { error } = await supabase.from('products').upsert(slice);
      if (error) console.error('Product batch error:', error.message);
      else ok += slice.length;
    }
    console.log(`Products: ${ok} / ${prods.length} OK`);
  }

  // 5. Requests
  if (simulatedData.requests?.length) {
    const requests = simulatedData.requests.map(r => ({
      id: r.id,
      requester_id: r.requesterId || '',
      requester_name: r.requesterName || '',
      department: r.department || '',
      items: r.items || [],
      status: r.status || 'PENDING',
      priority: r.priority || 'NORMAL',
      reason: r.reason || '',
    }));
    const { error } = await supabase.from('requests').upsert(requests);
    console.log('Requests:', error ? error.message : `${requests.length} records OK`);
  }

  // 6. Transactions (first 100 recent)
  if (simulatedData.transactions?.length) {
    const txs = simulatedData.transactions.slice(0, 100).map(t => ({
      id: t.id,
      product_id: t.productId || '',
      type: t.type,
      quantity: t.quantity,
      timestamp: t.timestamp || t.date || new Date().toISOString(),
      requester_name: t.requesterName || '',
      department: t.department || '',
      approved_by: t.approvedBy || '',
      status: t.status || 'COMPLETED',
      note: t.note || '',
    }));
    const { error } = await supabase.from('transactions').upsert(txs);
    console.log('Transactions:', error ? error.message : `${txs.length} records OK`);
  }

  // 7. Notifications
  if (simulatedData.notifications?.length) {
    const notifs = simulatedData.notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link_tab: n.linkTab || '',
      read: n.read || false,
    }));
    const { error } = await supabase.from('notifications').upsert(notifs);
    console.log('Notifications:', error ? error.message : `${notifs.length} records OK`);
  }

  console.log('🎉 Seeding completed successfully!');
}

runSeed();
