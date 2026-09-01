import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function extractCleanUsername(fullName) {
  if (!fullName) return '';
  let clean = fullName.trim();
  clean = clean.replace(
    /^(mrs\.|mrs|miss|mr\.|mr|ms\.|ms|dr\.|dr|prof\.|prof|นางสาว|น\.ส\.|นาย|นาง|คุณ|ดร\.|ดร|ผศ\.|รศ\.|ศ\.|อาจารย์|นพ\.|พญ\.)\s*/i,
    ''
  );
  clean = clean.trim();
  const parts = clean.split(/\s+/);
  return parts[0] || clean;
}

async function seedUsers() {
  console.log('🔄 Fetching current requesters from Supabase...');
  const { data: requesters, error } = await supabase.from('requesters').select('*');
  if (error) {
    console.error('Error fetching requesters:', error.message);
    return;
  }

  console.log(`Found ${requesters.length} requesters. Preparing users table entries...`);

  // Admin user
  const adminUser = {
    id: 'usr-1',
    username: 'admin',
    password: '123',
    name: 'ผู้ดูแลระบบ (Admin)',
    role: 'admin',
    company: 'EXION (Thailand) Company Limited',
    department: 'Management',
    position: 'System Administrator',
    employee_code: 'EMP-ADMIN',
    email: 'admin@stockonline.co.th',
    phone: '081-111-2233',
    avatar: null,
    status: 'active',
    must_change_password: false,
  };

  // Requesters users
  const requesterUsers = requesters.map((r, idx) => {
    const rawName = (r.name || '').trim();
    const cleanUsername = extractCleanUsername(rawName) || r.employee_code || `user_${idx + 1}`;
    const empCode = r.employee_code || `EMP-${1001 + idx}`;
    return {
      id: `usr-req-${r.id || empCode}`,
      username: cleanUsername,
      password: '1234',
      name: rawName,
      role: 'user',
      company: r.company || 'EXION (Thailand) Company Limited',
      department: r.department || '',
      position: r.position || '',
      employee_code: empCode,
      email: r.email || '',
      phone: r.phone || '',
      avatar: r.avatar || null,
      status: 'active',
      must_change_password: true,
    };
  });

  const allUsers = [adminUser, ...requesterUsers];
  console.log(`Inserting ${allUsers.length} users into Supabase 'users' table...`);

  const chunk = 50;
  let ok = 0;
  for (let i = 0; i < allUsers.length; i += chunk) {
    const slice = allUsers.slice(i, i + chunk);
    const { error: upsertErr } = await supabase.from('users').upsert(slice);
    if (upsertErr) {
      console.error('Upsert chunk error:', upsertErr.message);
    } else {
      ok += slice.length;
    }
  }

  console.log(`🎉 Successfully seeded ${ok} / ${allUsers.length} users into Supabase!`);
}

seedUsers();
