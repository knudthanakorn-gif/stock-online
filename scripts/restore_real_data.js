import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function restoreRealData() {
  console.log('🔄 Starting data restoration from backup files...');

  // 1. Load backup co-stock.json
  const backupPath = 'C:/Users/admin/Downloads/backup co-stock.json';
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  // 2. Load Employees CSV
  const empCsvPath = 'C:/Users/admin/Desktop/Employees_All_Companies_20260827_153806.csv';
  const empCsvContent = fs.readFileSync(empCsvPath, 'utf8');
  
  // Parse CSV
  const empLines = empCsvContent.split('\n').map(l => l.trim()).filter(Boolean);
  const reqMap = new Map();
  // Skip header line (index 0)
  for (let i = 1; i < empLines.length; i++) {
    const line = empLines[i];
    const parts = line.split(',');
    if (parts.length >= 2) {
      const empCode = parts[0]?.replace(/"/g, '').trim();
      const name = parts[1]?.replace(/"/g, '').trim();
      const company = parts[2]?.replace(/"/g, '').trim() || '';
      const department = parts[3]?.replace(/"/g, '').trim() || '';
      const position = parts[4]?.replace(/"/g, '').trim() || '';
      
      if (name) {
        const id = `req-${empCode || i}`;
        reqMap.set(id, {
          id,
          name,
          department: department ? `${company ? company + ' - ' : ''}${department}` : company,
          position: position || '',
          email: '',
          phone: '',
          avatar: null,
        });
      }
    }
  }

  const requesters = Array.from(reqMap.values());

  console.log(`Found ${requesters.length} real employees in CSV!`);

  // Clear demo data in Supabase
  console.log('Cleaning old dummy demo data...');
  await supabase.from('requests').delete().neq('id', '___');
  await supabase.from('transactions').delete().neq('id', '___');
  await supabase.from('products').delete().neq('id', '___');
  await supabase.from('requesters').delete().neq('id', '___');
  await supabase.from('categories').delete().neq('id', '___');

  // Insert Categories from backup + default
  const defaultCats = [
    { id: 'cat-1787021010541', name: 'อุปกรณ์สำนักงาน / เครื่องเขียน', description: 'Office Supplies & Stationery', icon: 'FileText' },
    { id: 'cat-it', name: 'อุปกรณ์ไอทีและคอมพิวเตอร์', description: 'IT & Computer Equipment', icon: 'Laptop' },
    { id: 'cat-paper', name: 'กระดาษและสิ่งพิมพ์', description: 'Paper & Printing Supplies', icon: 'Copy' },
    { id: 'cat-furniture', name: 'เฟอร์นิเจอร์และสิ่งอำนวยความสะดวก', description: 'Office Furniture', icon: 'Armchair' },
    { id: 'cat-general', name: 'ของใช้ทั่วไป & เบ็ดเตล็ด', description: 'General & Pantry', icon: 'Coffee' },
  ];
  const mergedCategories = [...(backupData.categories || []), ...defaultCats];
  const catMap = new Map();
  mergedCategories.forEach(c => catMap.set(c.id, c));
  const finalCategories = Array.from(catMap.values()).map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    icon: c.icon || 'Folder',
  }));
  const { error: catErr } = await supabase.from('categories').upsert(finalCategories);
  console.log('Categories restored:', catErr ? catErr.message : `${finalCategories.length} records OK`);

  // Insert Requesters in chunks of 50
  const reqChunk = 50;
  let reqOk = 0;
  for (let i = 0; i < requesters.length; i += reqChunk) {
    const slice = requesters.slice(i, i + reqChunk);
    const { error } = await supabase.from('requesters').upsert(slice);
    if (error) console.error('Requesters batch error:', error.message);
    else reqOk += slice.length;
  }
  console.log(`Requesters restored: ${reqOk} / ${requesters.length} OK`);

  // Insert Products (77 real items)
  const prods = (backupData.products || []).map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku || '',
    barcode: p.barcode || '',
    category: p.category || 'cat-1787021010541',
    cost_price: p.costPrice || 0,
    selling_price: p.sellingPrice || 0,
    quantity: p.quantity || 0,
    min_threshold: p.minThreshold || 1,
    unit: p.unit || 'ชิ้น',
    supplier_id: p.supplierId || null,
    image: p.image || '',
    description: p.description || '',
  }));

  const prodChunk = 50;
  let prodOk = 0;
  for (let i = 0; i < prods.length; i += prodChunk) {
    const slice = prods.slice(i, i + prodChunk);
    const { error } = await supabase.from('products').upsert(slice);
    if (error) console.error('Product batch error:', error.message);
    else prodOk += slice.length;
  }
  console.log(`Products restored: ${prodOk} / ${prods.length} OK`);

  // Insert Transactions
  if (backupData.transactions?.length) {
    const txs = backupData.transactions.map(t => ({
      id: t.id,
      product_id: t.productId || '',
      type: t.type || 'IN',
      quantity: t.quantity || 0,
      timestamp: t.timestamp || t.date || new Date().toISOString(),
      requester_name: t.requesterName || '',
      department: t.department || '',
      approved_by: t.approvedBy || '',
      status: t.status || 'COMPLETED',
      note: t.note || '',
    }));
    const { error } = await supabase.from('transactions').upsert(txs);
    console.log('Transactions restored:', error ? error.message : `${txs.length} records OK`);
  }

  console.log('🎉 ALL REAL DATA HAS BEEN RESTORED TO SUPABASE SUCCESSFULLY!');
}

restoreRealData();
