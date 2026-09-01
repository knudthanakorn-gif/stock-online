// Script to generate 500+ realistic enterprise simulation records
import fs from 'fs';
import path from 'path';

const DEPARTMENTS = [
  'แผนก IT / เทคโนโลยีสารสนเทศ',
  'แผนกบัญชีและการเงิน',
  'ฝ่ายขายและการตลาด',
  'ฝ่ายทรัพยากรบุคคล (HR)',
  'ฝ่ายจัดซื้อและคลังสินค้า',
  'ฝ่ายผลิตและปฏิบัติการ',
  'ฝ่ายบริหารและจัดการ',
  'ฝ่ายประชาสัมพันธ์และการตลาดดิจิทัล',
];

const EMPLOYEES = [
  { name: 'คุณสมชาย', dept: 'แผนก IT / เทคโนโลยีสารสนเทศ', pos: 'Senior System Engineer', code: 'EMP-1001' },
  { name: 'คุณวิภาวรรณ', dept: 'ฝ่ายขายและการตลาด', pos: 'Sales Manager', code: 'EMP-1002' },
  { name: 'คุณกิตติพงษ์', dept: 'แผนกบัญชีและการเงิน', pos: 'Accounting Officer', code: 'EMP-1003' },
  { name: 'คุณนภาวรรณ', dept: 'ฝ่ายทรัพยากรบุคคล (HR)', pos: 'HR Manager', code: 'EMP-1004' },
  { name: 'คุณธนพล', dept: 'ฝ่ายจัดซื้อและคลังสินค้า', pos: 'Procurement Specialist', code: 'EMP-1005' },
  { name: 'คุณกานต์', dept: 'ฝ่ายผลิตและปฏิบัติการ', pos: 'Production Lead', code: 'EMP-1006' },
  { name: 'คุณอนุชา', dept: 'แผนก IT / เทคโนโลยีสารสนเทศ', pos: 'Fullstack Developer', code: 'EMP-1007' },
  { name: 'คุณพิมพ์ใจ', dept: 'แผนกบัญชีและการเงิน', pos: 'Senior Accountant', code: 'EMP-1008' },
  { name: 'คุณภัทรพล', dept: 'ฝ่ายขายและการตลาด', pos: 'Account Executive', code: 'EMP-1009' },
  { name: 'คุณชลธิชา', dept: 'ฝ่ายประชาสัมพันธ์และการตลาดดิจิทัล', pos: 'Digital Marketing Lead', code: 'EMP-1010' },
  { name: 'คุณอิทธิพร', dept: 'ฝ่ายบริหารและจัดการ', pos: 'Operations Director', code: 'EMP-1011' },
  { name: 'คุณสุดารัตน์', dept: 'ฝ่ายทรัพยากรบุคคล (HR)', pos: 'Talent Acquisition', code: 'EMP-1012' },
  { name: 'คุณธีรเดช', dept: 'แผนก IT / เทคโนโลยีสารสนเทศ', pos: 'DevOps Engineer', code: 'EMP-1013' },
  { name: 'คุณมนัสวี', dept: 'ฝ่ายขายและการตลาด', pos: 'Business Development', code: 'EMP-1014' },
  { name: 'คุณศิริพร', dept: 'แผนกบัญชีและการเงิน', pos: 'Finance Analyst', code: 'EMP-1015' },
  { name: 'คุณวรเมธ', dept: 'ฝ่ายจัดซื้อและคลังสินค้า', pos: 'Inventory Controller', code: 'EMP-1016' },
  { name: 'คุณรังสรรค์', dept: 'ฝ่ายผลิตและปฏิบัติการ', pos: 'QA & Safety Officer', code: 'EMP-1017' },
  { name: 'คุณชญาดา', dept: 'ฝ่ายทรัพยากรบุคคล (HR)', pos: 'Employee Relations', code: 'EMP-1018' },
  { name: 'คุณพงศกร', dept: 'แผนก IT / เทคโนโลยีสารสนเทศ', pos: 'Cybersecurity Analyst', code: 'EMP-1019' },
  { name: 'คุณอริสา', dept: 'ฝ่ายขายและการตลาด', pos: 'Strategic Planner', code: 'EMP-1020' },
];

const CATEGORIES = [
  { id: 'cat-it', name: 'อุปกรณ์ไอที & คอมพิวเตอร์', nameTh: 'อุปกรณ์ไอที & คอมพิวเตอร์', description: 'โน้ตบุ๊ก จอมอนิเตอร์ เมาส์ คีย์บอร์ด อุปกรณ์ต่อพ่วง' },
  { id: 'cat-paper', name: 'กระดาษ & สิ่งพิมพ์', nameTh: 'กระดาษ & สิ่งพิมพ์', description: 'กระดาษ A4, A3, สมุดโน้ต, แฟ้มเอกสาร' },
  { id: 'cat-toner', name: 'หมึกพิมพ์ & วัสดุเครื่องพิมพ์', nameTh: 'หมึกพิมพ์ & วัสดุเครื่องพิมพ์', description: 'ตลับหมึกพิมพ์ HP, Canon, Brother, ผ้าหมึก' },
  { id: 'cat-stationery', name: 'เครื่องเขียน & อุปกรณ์สำนักงาน', nameTh: 'เครื่องเขียน & อุปกรณ์สำนักงาน', description: 'ปากกา ไฮไลท์ ลิควิด แม็ก เทปใส กรรไกร' },
  { id: 'cat-furniture', name: 'เฟอร์นิเจอร์สำนักงาน', nameTh: 'เฟอร์นิเจอร์สำนักงาน', description: 'โต๊ะทำงาน เก้าอี้เพื่อสุขภาพ ตู้เอกสาร ชั้นวาง' },
  { id: 'cat-hygiene', name: 'อุปกรณ์ทำความสะอาด & อนามัย', nameTh: 'อุปกรณ์ทำความสะอาด & อนามัย', description: 'เจลแอลกอฮอล์ ทิชชู่ หน้ากาก น้ำยาเช็ดจอ' },
  { id: 'cat-pantry', name: 'อาหารว่าง & สวัสดิการพนักงาน', nameTh: 'อาหารว่าง & สวัสดิการพนักงาน', description: 'เมล็ดกาแฟ ชาเขียว น้ำดื่ม แก้วเก็บความเย็น' },
];

const SUPPLIERS = [
  { id: 'sup-001', name: 'บริษัท ไอที โซลูชั่นส์ จำกัด', contactPerson: 'คุณสมชาย', phone: '02-123-4567', email: 'sales@itsolutions.co.th' },
  { id: 'sup-002', name: 'บมจ. ออฟฟิศเมท ซัพพลาย', contactPerson: 'คุณวรางคณา', phone: '02-777-8888', email: 'order@officemate.co.th' },
  { id: 'sup-003', name: 'บริษัท โมเดิร์นเฟอร์นิเจอร์ จำกัด', contactPerson: 'คุณกิตติศักดิ์', phone: '02-999-0000', email: 'contact@modernfurniture.co.th' },
  { id: 'sup-004', name: 'หจก. สยามเครื่องเขียนและบรรจุภัณฑ์', contactPerson: 'คุณประยุทธ์', phone: '02-555-1234', email: 'sales@siamstationery.co.th' },
  { id: 'sup-005', name: 'บริษัท คลีน แอนด์ แคร์ โซลูชั่นส์', contactPerson: 'คุณเพ็ญศรี', phone: '02-444-9988', email: 'info@cleancare.co.th' },
];

const PRODUCTS_MASTER = [
  { id: 'prod-001', name: 'โน้ตบุ๊กประมวลผล Dell Latitude 5440 (Intel i7/16GB)', sku: 'AST-NB-001', barcode: 'QR885901230001', category: 'cat-it', costPrice: 35900, sellingPrice: 35900, quantity: 18, minThreshold: 3, unit: 'เครื่อง', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80', description: 'โน้ตบุ๊กทำงานประจำตำแหน่งสำหรับพนักงานใหม่และไอที' },
  { id: 'prod-002', name: 'จอมอนิเตอร์ Dell UltraSharp 27 นิ้ว 4K (USB-C Hub)', sku: 'AST-MN-002', barcode: 'QR885901230002', category: 'cat-it', costPrice: 14500, sellingPrice: 14500, quantity: 12, minThreshold: 2, unit: 'เครื่อง', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80', description: 'จอมอนิเตอร์ความละเอียดสูงสำหรับงานออกแบบและวิศวกรรม' },
  { id: 'prod-003', name: 'กระดาษถ่ายเอกสาร A4 Double A (80 แกรม) แพ็ก 5 รีม', sku: 'AST-PP-003', barcode: 'QR885901230003', category: 'cat-paper', costPrice: 580, sellingPrice: 580, quantity: 85, minThreshold: 15, unit: 'กล่อง', supplierId: 'sup-002', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80', description: 'กระดาษ A4 เกรดพรีเมียมสำหรับพิมพ์เอกสารราชการและสำนักงาน' },
  { id: 'prod-004', name: 'ตลับหมึกพิมพ์เลเซอร์ HP LaserJet Pro 58A (Black)', sku: 'AST-TN-004', barcode: 'QR885901230004', category: 'cat-toner', costPrice: 2850, sellingPrice: 2850, quantity: 9, minThreshold: 4, unit: 'ตลับ', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=80', description: 'หมึกแท้ HP สำหรับเครื่องพิมพ์ขาวดำศูนย์กลาง' },
  { id: 'prod-005', name: 'เก้าอี้สำนักงานเพื่อสุขภาพ Ergonomic Mesh High-Back', sku: 'AST-CH-005', barcode: 'QR885901230005', category: 'cat-furniture', costPrice: 4900, sellingPrice: 4900, quantity: 24, minThreshold: 5, unit: 'ตัว', supplierId: 'sup-003', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=400&auto=format&fit=crop&q=80', description: 'เก้าอี้ทำงานพนักพิงตาข่ายระบายอากาศ ปรับเบาะและที่รองคอได้' },
  { id: 'prod-006', name: 'ชุดเมาส์และคีย์บอร์ดไร้สาย Logitech MK270r Silent', sku: 'AST-KB-006', barcode: 'QR885901230006', category: 'cat-it', costPrice: 890, sellingPrice: 890, quantity: 32, minThreshold: 6, unit: 'ชุด', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80', description: 'คีย์บอร์ดและเมาส์ไร้สายระยะ 10 เมตร แบตเตอรี่ทนทาน' },
  { id: 'prod-007', name: 'ปากกาหมึกเจล Pentel EnerGel 0.5 mm (หมึกน้ำเงิน)', sku: 'AST-ST-007', barcode: 'QR885901230007', category: 'cat-stationery', costPrice: 45, sellingPrice: 45, quantity: 150, minThreshold: 20, unit: 'ด้าม', supplierId: 'sup-004', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&auto=format&fit=crop&q=80', description: 'ปากกาเจลเขียนลื่นแห้งไว ไม่เลอะมือ ด้ามจับกระชับ' },
  { id: 'prod-008', name: 'กระดาษโน้ตดัชนี Post-it 3x3 นิ้ว คละ 5 สีนีออน', sku: 'AST-ST-008', barcode: 'QR885901230008', category: 'cat-paper', costPrice: 120, sellingPrice: 120, quantity: 60, minThreshold: 10, unit: 'แพ็ก', supplierId: 'sup-004', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80', description: 'กระดาษโน้ตมีกาวในตัว ลอกออกติดซ้ำได้หลายครั้ง' },
  { id: 'prod-009', name: 'เครื่องเย็บกระดาษ MAX HD-10D พร้อมลวดเย็บ 3 กล่อง', sku: 'AST-ST-009', barcode: 'QR885901230009', category: 'cat-stationery', costPrice: 185, sellingPrice: 185, quantity: 40, minThreshold: 8, unit: 'ชุด', supplierId: 'sup-004', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80', description: 'แม็กเย็บกระดาษแข็งแรง ทนทาน เย็บได้หนาสูงสุด 20 แผ่น' },
  { id: 'prod-010', name: 'สเปรย์แอลกอฮอล์ 75% ทำความสะอาด 500 ml พร้อมหัวฟ็อกกี้', sku: 'AST-HY-010', barcode: 'QR885901230010', category: 'cat-hygiene', costPrice: 95, sellingPrice: 95, quantity: 70, minThreshold: 12, unit: 'ขวด', supplierId: 'sup-005', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80', description: 'สเปรย์ฆ่าเชื้ออเนกประสงค์สำหรับโต๊ะทำงานและอุปกรณ์ไอที' },
  { id: 'prod-011', name: 'หูฟังบลูทูธสำหรับตัดเสียงรบกวน Jabra Evolve2 65 UC', sku: 'AST-IT-011', barcode: 'QR885901230011', category: 'cat-it', costPrice: 6900, sellingPrice: 6900, quantity: 14, minThreshold: 3, unit: 'กล่อง', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80', description: 'หูฟังประชุมออนไลน์ ไมโครโฟนตัดเสียงรอบข้างระดับมืออาชีพ' },
  { id: 'prod-012', name: 'สายแปลงสัญญาณ UGREEN USB-C to HDMI 4K (2 เมตร)', sku: 'AST-IT-012', barcode: 'QR885901230012', category: 'cat-it', costPrice: 450, sellingPrice: 450, quantity: 28, minThreshold: 5, unit: 'เส้น', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&auto=format&fit=crop&q=80', description: 'สายต่อภาพจากโน้ตบุ๊กขึ้นโปรเจกเตอร์หรือทีวีห้องประชุม' },
  { id: 'prod-013', name: 'เมล็ดกาแฟคั่วบดดอยช้าง พรีเมียม อาราบิก้า 500 กรัม', sku: 'AST-PT-013', barcode: 'QR885901230013', category: 'cat-pantry', costPrice: 280, sellingPrice: 280, quantity: 45, minThreshold: 10, unit: 'ถุง', supplierId: 'sup-002', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80', description: 'กาแฟคั่วกลางสวัสดิการห้องเบรกและพื้นที่พักผ่อนพนักงาน' },
  { id: 'prod-014', name: 'กล่องแฟ้มเอกสาร 2 ห่วง ตราช้าง 2101F (สีน้ำเงิน)', sku: 'AST-ST-014', barcode: 'QR885901230014', category: 'cat-stationery', costPrice: 75, sellingPrice: 75, quantity: 90, minThreshold: 15, unit: 'เล่ม', supplierId: 'sup-004', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80', description: 'แฟ้มจัดเก็บเอกสารสัญญาและรายงานบัญชีขนาด A4' },
  { id: 'prod-015', name: 'ปลั๊กพ่วงกันไฟกระชาก Toshino 5 ช่อง 5 สวิตช์ (3 เมตร)', sku: 'AST-IT-015', barcode: 'QR885901230015', category: 'cat-it', costPrice: 420, sellingPrice: 420, quantity: 25, minThreshold: 5, unit: 'อัน', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&auto=format&fit=crop&q=80', description: 'รางปลั๊กไฟมาตรฐาน มอก. รองรับไฟ 2300W ปลอดภัยสูง' },
  { id: 'prod-016', name: 'ปากกาเน้นข้อความ Stabilo Boss Original คละ 6 สี', sku: 'AST-ST-016', barcode: 'QR885901230016', category: 'cat-stationery', costPrice: 195, sellingPrice: 195, quantity: 55, minThreshold: 10, unit: 'แพ็ก', supplierId: 'sup-004', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&auto=format&fit=crop&q=80', description: 'ปากกาไฮไลท์สีสันสดใส หมึกแห้งเร็ว ไม่ซึมผ่านกระดาษ' },
  { id: 'prod-017', name: 'กระดาษความร้อน Thermal Paper 80x80 mm (แพ็ก 10 ม้วน)', sku: 'AST-PP-017', barcode: 'QR885901230017', category: 'cat-paper', costPrice: 260, sellingPrice: 260, quantity: 38, minThreshold: 8, unit: 'แพ็ก', supplierId: 'sup-002', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80', description: 'ม้วนสลิปใบเสร็จและใบเบิกคลังสินค้า พิมพ์คมชัด' },
  { id: 'prod-018', name: 'กรรไกรสแตนเลส Scotch 3M ขนาด 8 นิ้ว (ด้ามจับนุ่ม)', sku: 'AST-ST-018', barcode: 'QR885901230018', category: 'cat-stationery', costPrice: 110, sellingPrice: 110, quantity: 42, minThreshold: 6, unit: 'เล่ม', supplierId: 'sup-004', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80', description: 'กรรไกรตัดกระดาษและวัสดุบรรจุภัณฑ์ คมทนทาน' },
  { id: 'prod-019', name: 'หมึกพิมพ์แท้ Epson 003 สำหรับ EcoTank L3110/L3150 (Black)', sku: 'AST-TN-019', barcode: 'QR885901230019', category: 'cat-toner', costPrice: 250, sellingPrice: 250, quantity: 16, minThreshold: 4, unit: 'ขวด', supplierId: 'sup-001', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=80', description: 'ขวดหมึกดำแท้ พิมพ์ได้สูงถึง 4,500 แผ่น' },
  { id: 'prod-020', name: 'กระดานไวท์บอร์ดติดผนังแม่เหล็ก ขนาด 90x120 ซม.', sku: 'AST-FN-020', barcode: 'QR885901230020', category: 'cat-furniture', costPrice: 1250, sellingPrice: 1250, quantity: 8, minThreshold: 2, unit: 'แผ่น', supplierId: 'sup-003', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=400&auto=format&fit=crop&q=80', description: 'กระดานไวท์บอร์ดสำหรับห้องประชุมระดมสมองและวางแผนโครงการ' },
];

console.log('Generating 500+ realistic enterprise transactions and requests...');

const requests = [];
const transactions = [];
const notifications = [];

const now = Date.now();
const DAY_MS = 86400000;

let reqIndex = 1;
let txIndex = 1001;

// 1. Initial Restock Batches (IN transactions)
for (let p of PRODUCTS_MASTER) {
  const inDate = new Date(now - DAY_MS * 90 + (p.id.charCodeAt(5) * 1800000)).toISOString();
  transactions.push({
    id: `tx-${txIndex++}`,
    date: inDate,
    type: 'IN',
    productId: p.id,
    productName: p.name,
    quantity: Math.floor(p.quantity * 2.5) + 30,
    unitPrice: p.costPrice,
    supplierId: p.supplierId,
    supplierName: SUPPLIERS.find(s => s.id === p.supplierId)?.name || 'ซัพพลายเออร์มาตรฐาน',
    refNo: `PO-2026-Q1-${p.id.slice(-3)}`,
    note: `รับเข้าสต็อกอุปกรณ์สำนักงานและไอที ประจำไตรมาสแรก (Initial Stock Lot)`,
    createdBy: 'ผู้ดูแลระบบ (Admin)',
  });
}

// 2. Generate 260 Requisition Requests spread over 90 days
for (let d = 88; d >= 0; d--) {
  // 2-4 requests per day
  const reqsToday = Math.floor(Math.random() * 3) + 2; 

  for (let r = 0; r < reqsToday; r++) {
    const emp = EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)];
    const reqDate = new Date(now - (d * DAY_MS) + (Math.random() * 28800000)).toISOString();
    const refNo = `REQ-2026-${String(reqIndex).padStart(4, '0')}`;
    
    // 1-3 items per request
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProds = [];
    const usedProdIds = new Set();

    for (let i = 0; i < numItems; i++) {
      const p = PRODUCTS_MASTER[Math.floor(Math.random() * PRODUCTS_MASTER.length)];
      if (!usedProdIds.has(p.id)) {
        usedProdIds.add(p.id);
        const qty = p.costPrice > 5000 ? 1 : Math.floor(Math.random() * 3) + 1;
        selectedProds.push({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          quantity: qty,
          unit: p.unit,
          image: p.image,
        });
      }
    }

    const purposeOptions = ['DAILY', 'DAILY', 'ONBOARDING', 'PROJECT', 'REPLACEMENT'];
    const purpose = purposeOptions[Math.floor(Math.random() * purposeOptions.length)];
    
    let status = 'APPROVED';
    if (d <= 2) {
      status = Math.random() < 0.55 ? 'PENDING' : 'APPROVED';
    } else if (Math.random() < 0.1) {
      status = 'REJECTED';
    }

    let statusNote = '';
    let approvedBy = null;
    let approvedAt = null;

    if (status === 'APPROVED') {
      approvedBy = Math.random() < 0.5 ? 'สมชาย (Admin)' : 'วิภาวรรณ (Staff)';
      approvedAt = new Date(new Date(reqDate).getTime() + 1800000).toISOString();
      statusNote = 'อนุมัติเรียบร้อย เจ้าหน้าที่คลังส่งมอบอุปกรณ์ครบถ้วน';

      // Log OUT transactions for each item
      for (let it of selectedProds) {
        const pObj = PRODUCTS_MASTER.find(x => x.id === it.productId);
        transactions.push({
          id: `tx-${txIndex++}`,
          date: approvedAt,
          type: 'OUT',
          productId: it.productId,
          productName: it.name,
          quantity: it.quantity,
          unitPrice: pObj ? pObj.sellingPrice : 100,
          customer: `${emp.name} (บริษัท Hop - ${emp.dept} - ${emp.pos})`,
          requesterName: emp.name,
          requesterCompany: 'บริษัท Hop',
          requesterDept: emp.dept,
          requesterPosition: emp.pos,
          purpose: purpose,
          refNo: refNo,
          note: `[ใบเบิก ${refNo}] ${purpose === 'ONBOARDING' ? 'อุปกรณ์พนักงานใหม่' : purpose === 'PROJECT' ? 'โครงการพิเศษ' : 'ใช้งานประจำวัน'}`,
          createdBy: approvedBy,
        });
      }
    } else if (status === 'REJECTED') {
      approvedBy = 'สมชาย (Admin)';
      approvedAt = new Date(new Date(reqDate).getTime() + 3600000).toISOString();
      const reasons = [
        'อุปกรณ์รุ่นที่ระบุอยู่ระหว่างการจัดซื้อล็อตใหม่ กรุณาติดต่อคลังสัปดาห์หน้า',
        'เกินโควตาการเบิกประจำเดือนของแผนก กรุณาขออนุมัติจากผู้จัดการฝ่าย',
        'อุปกรณ์เดิมยังอยู่ในระยะรับประกันการใช้งาน แนะนำให้นำมาตรวจสอบซ่อมบำรุง',
      ];
      statusNote = reasons[Math.floor(Math.random() * reasons.length)];
    }

    requests.push({
      id: `req-${String(reqIndex).padStart(4, '0')}`,
      refNo: refNo,
      date: reqDate,
      requesterName: emp.name,
      requesterCompany: 'บริษัท Hop',
      requesterDept: emp.dept,
      requesterPosition: emp.pos,
      purpose: purpose,
      note: `ขอเบิกอุปกรณ์สำหรับ ${emp.dept}`,
      status: status,
      statusNote: statusNote,
      approvedBy: approvedBy,
      approvedAt: approvedAt,
      items: selectedProds,
    });

    reqIndex++;
  }
}

// 3. Add Mid-period restock & Stock Audit Adjustments
for (let d of [75, 60, 45, 30, 15, 5]) {
  for (let p of PRODUCTS_MASTER.slice(0, 10)) {
    transactions.push({
      id: `tx-${txIndex++}`,
      date: new Date(now - (d * DAY_MS)).toISOString(),
      type: 'IN',
      productId: p.id,
      productName: p.name,
      quantity: Math.floor(Math.random() * 25) + 15,
      unitPrice: p.costPrice,
      supplierId: p.supplierId,
      supplierName: SUPPLIERS.find(s => s.id === p.supplierId)?.name || 'ซัพพลายเออร์',
      refNo: `PO-2026-RESTOCK-D${d}`,
      note: `เติมสต็อกอุปกรณ์หมุนเวียนรอบ ${d} วันที่แล้ว`,
      createdBy: 'วิภาวรรณ (Staff)',
    });
  }

  // Stock Audit Adjustments
  const auditProd = PRODUCTS_MASTER[Math.floor(Math.random() * PRODUCTS_MASTER.length)];
  const diffQty = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
  if (diffQty !== 0) {
    transactions.push({
      id: `tx-${txIndex++}`,
      date: new Date(now - (d * DAY_MS) + 7200000).toISOString(),
      type: 'ADJUST',
      productId: auditProd.id,
      productName: auditProd.name,
      quantity: Math.abs(diffQty),
      unitPrice: auditProd.costPrice,
      refNo: `AUDIT-CYCLE-${d}`,
      note: `[ตรวจนับสต็อกประจำงวด ${d} วันที่แล้ว] ปรับยอด ${diffQty > 0 ? '+' : '-'}${Math.abs(diffQty)} ${auditProd.unit}`,
      createdBy: 'สมชาย (Admin)',
    });
  }
}

// 4. Generate Notifications
notifications.push(
  {
    id: 'notif-1',
    type: 'NEW_REQUEST',
    title: 'มีคำขอเบิกอุปกรณ์ใหม่',
    message: `${EMPLOYEES[0].name} ส่งคำขอเบิก "${PRODUCTS_MASTER[0].name}"`,
    linkTab: 'approvals',
    createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'LOW_STOCK',
    title: '⚠️ สินค้าใกล้หมดสต็อก',
    message: `${PRODUCTS_MASTER[5].name} เหลือ ${PRODUCTS_MASTER[5].quantity} ชุด (ต่ำกว่าเกณฑ์ขั้นต่ำ)`,
    linkTab: 'inventory',
    createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'APPROVED',
    title: 'คำขอเบิกได้รับการอนุมัติ',
    message: `คำขอเลขที่ REQ-2026-0245 ของ ${EMPLOYEES[1].name} ได้รับการอนุมัติและจ่ายพัสดุเรียบร้อย`,
    linkTab: 'request-qr',
    createdAt: new Date(now - 1000 * 60 * 240).toISOString(),
    read: true,
  },
  {
    id: 'notif-4',
    type: 'AUDIT',
    title: 'ผลการตรวจนับสต็อกประจำงวด',
    message: 'เจ้าหน้าที่เสร็จสิ้นการตรวจนับสต็อกรอบประจำสัปดาห์ ปรับปรุงยอดสมบูรณ์',
    linkTab: 'audit',
    createdAt: new Date(now - 1000 * 60 * 600).toISOString(),
    read: true,
  }
);

// Sort transactions & requests descending by date
transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
requests.sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`Summary of Simulated Enterprise Data:`);
console.log(`- Master Products: ${PRODUCTS_MASTER.length}`);
console.log(`- Requisition Requests: ${requests.length}`);
console.log(`- Transaction Movement Records: ${transactions.length}`);

// Output simulation file
const exportData = {
  version: '2.0.0',
  exportedAt: new Date().toISOString(),
  system: 'Hop Office Asset Requisition',
  products: PRODUCTS_MASTER,
  categories: CATEGORIES,
  suppliers: SUPPLIERS,
  requestersList: EMPLOYEES.map(e => ({
    id: `req-${e.code.toLowerCase()}`,
    employeeCode: e.code,
    name: e.name,
    company: 'บริษัท Hop',
    department: e.dept,
    position: e.pos,
    status: 'active',
  })),
  requests: requests,
  transactions: transactions,
  notifications: notifications,
};

fs.writeFileSync(
  path.resolve('./src/data/simulatedData500.json'),
  JSON.stringify(exportData, null, 2),
  'utf8'
);

console.log('Saved simulatedData500.json successfully!');
