import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const row = [];
    let inQuotes = false;
    let cur = '';
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        row.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    row.push(cur.trim());
    if (row.length >= 5) {
      const empCode = row[0].replace(/^\uFEFF/, '').replace(/"/g, '').trim();
      const name = row[1].replace(/"/g, '').trim();
      const company = row[2].replace(/"/g, '').trim();
      const department = row[3].replace(/"/g, '').trim();
      const position = row[4].replace(/"/g, '').trim();

      if (name) {
        result.push({
          id: `req-${empCode}`,
          employee_code: empCode,
          employeeCode: empCode,
          name,
          company,
          department,
          position,
          email: '',
          phone: '',
          avatar: null,
        });
      }
    }
  }
  return result;
}

async function reseedEmployees() {
  console.log('🔄 Parsing Employees_All_Companies CSV...');
  const csvPath = 'C:/Users/admin/Desktop/Employees_All_Companies_20260827_153806.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const employees = parseCSV(csvContent);

  console.log(`Found ${employees.length} employees across companies.`);

  // Deduplicate by id
  const empMap = new Map();
  employees.forEach((e, idx) => {
    const code = e.employee_code || `EMP-${1001 + idx}`;
    const id = `req-${code}`;
    empMap.set(id, {
      id,
      employee_code: code,
      name: e.name,
      company: e.company,
      department: e.department,
      position: e.position,
      email: e.email || '',
      phone: e.phone || '',
      avatar: e.avatar || null,
    });
  });

  const uniqueEmps = Array.from(empMap.values());
  console.log(`Total unique employees: ${uniqueEmps.length}`);

  // Clean old requesters
  console.log('Cleaning old requesters from Supabase...');
  await supabase.from('requesters').delete().neq('id', '___');

  // Insert in batches of 50
  const chunk = 50;
  let ok = 0;
  for (let i = 0; i < uniqueEmps.length; i += chunk) {
    const slice = uniqueEmps.slice(i, i + chunk);
    const { error } = await supabase.from('requesters').upsert(slice);
    if (error) {
      console.error('Batch error:', error.message);
    } else {
      ok += slice.length;
    }
  }

  console.log(`🎉 Reseeded ${ok} / ${uniqueEmps.length} employees into Supabase!`);
}

reseedEmployees();
