import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase Query Error:', error.message, error.details || '', error.hint || '');
    } else {
      console.log('Successfully connected to Supabase! Product count query returned without error.');
    }
  } catch (err) {
    console.error('Exception connecting to Supabase:', err);
  }
}

testConnection();
