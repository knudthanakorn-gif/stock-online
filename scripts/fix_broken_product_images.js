import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zdjnulgwvpeovbfhfoti.supabase.co';
const supabaseAnonKey = 'sb_publishable_M65r23EgjB-JcxMvEpUDzQ_Tb3v-edi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const imageFixes = [
  {
    name: 'กระดาษ A3',
    // High quality A3 copy paper box & ream
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'ถ่าน CR2032',
    // Panasonic CR2032 3V Lithium coin battery
    image: 'https://5.imimg.com/data5/SELLER/Default/2023/8/336336338/XU/XF/XN/3889178/panasonic-cr2032-battery-500x500.jpg',
  },
  {
    name: 'ใบสำคัญจ่าย',
    // Payment voucher receipt book
    image: 'https://down-th.img.susercontent.com/file/th-11134207-7r98o-lq499k3j4m1b8f',
  },
  {
    name: 'หมึกปากกาไวท์บอร์ด (สีแดง)',
    // Whiteboard ink refill bottle (Red)
    image: 'https://down-th.img.susercontent.com/file/th-11134207-7r98v-lm7b3p9n8w9f1a',
  },
];

async function fixImages() {
  console.log('🔄 Updating broken product images in Supabase...');
  for (const item of imageFixes) {
    const { data, error } = await supabase
      .from('products')
      .update({ image: item.image })
      .ilike('name', `%${item.name}%`)
      .select('id, name, image');

    if (error) {
      console.error(`❌ Error updating ${item.name}:`, error.message);
    } else {
      console.log(`✅ Updated ${item.name} (${data?.length} row) -> ${item.image}`);
    }
  }
  console.log('🎉 All image updates completed!');
}

fixImages();
