const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. OfficeMate Quotation SO261002026 (36 items)
const ofmItems = [
  { no: 1, code: '1003541', name: 'ปากกาลูกลื่น 0.5มม. (10ด้าม) น้ำเงิน Faber-Castell RX5', qty: 5, unit: 'แพ็ค', listPrice: 145.79, discount: 0, netUnitPrice: 145.79, totalAmount: 728.95 },
  { no: 2, code: '1530880', name: 'เครื่องเหลาดินสอ ตราม้า H-620', qty: 2, unit: 'คร.', listPrice: 331.78, discount: 0, netUnitPrice: 331.78, totalAmount: 663.56 },
  { no: 3, code: '1120220', name: 'ชุดปากกาเขียนแผ่นใส ลบไม่ได้ (F) สเต็ดเล่อร์ 318-WP4', qty: 1, unit: 'ชุด', listPrice: 191.59, discount: 0, netUnitPrice: 191.59, totalAmount: 191.59 },
  { no: 4, code: '1007708', name: 'ปากกาเน้นข้อความ คละสี (แพ็ค4ด้าม) ONE AH636', qty: 1, unit: 'แพ็ค', listPrice: 84.11, discount: 0, netUnitPrice: 84.11, totalAmount: 84.11 },
  { no: 5, code: '5201830', name: 'แฟล็กซ์1.19x4.32ซม.24แ คละสีแพ็ค4สี โพสต์-อิท 684-Arrow', qty: 1, unit: 'แพ็ค', listPrice: 99.07, discount: 0, netUnitPrice: 99.07, totalAmount: 99.07 },
  { no: 6, code: '5201560', name: 'โน้ต นีออน 2x3" คละสี (12เล่ม) โพสต์-อิท 656-AN', qty: 2, unit: 'แพ็ค', listPrice: 406.54, discount: 0, netUnitPrice: 406.54, totalAmount: 813.08 },
  { no: 7, code: '5096723', name: 'กระดาษโน้ต 1.5"x 2" (แพ็ค12เล่ม) คละสี โพสต์-อิท 653AN', qty: 2, unit: 'แพ็ค', listPrice: 281.31, discount: 0, netUnitPrice: 281.31, totalAmount: 562.62 },
  { no: 8, code: '2080360', name: 'มีดคัตเตอร์ ทาจิม่า LC-303', qty: 4, unit: 'อัน', listPrice: 129.91, discount: 0, netUnitPrice: 129.91, totalAmount: 519.64 },
  { no: 9, code: '3001727', name: 'กาวยาง 8.2 กรัม ขาว (แพ็ค4แท่ง) UHU', qty: 2, unit: 'แพ็ค', listPrice: 188.79, discount: 0, netUnitPrice: 188.79, totalAmount: 377.58 },
  { no: 10, code: '3001728', name: 'กาวยาง 21 กรัม ขาว (แพ็ค4แท่ง) UHU', qty: 2, unit: 'แพ็ค', listPrice: 359.81, discount: 0, netUnitPrice: 359.81, totalAmount: 719.62 },
  { no: 11, code: '2000131', name: 'ลวดเย็บ (แพ็ค24กล่อง) แม็กซ์ 10-1M', qty: 1, unit: 'แพ็ค', listPrice: 264.49, discount: 0, netUnitPrice: 264.49, totalAmount: 264.49 },
  { no: 12, code: '2000136', name: 'ลวดเย็บ (แพ็ค24กล่อง) แม็กซ์ 35-1M', qty: 1, unit: 'แพ็ค', listPrice: 438.32, discount: 0, netUnitPrice: 438.32, totalAmount: 438.32 },
  { no: 13, code: '2021610', name: 'ลวดเย็บ (23/10) ตราม้า 1210', qty: 4, unit: 'กล่อง', listPrice: 51.40, discount: 0, netUnitPrice: 51.40, totalAmount: 205.60 },
  { no: 14, code: '2002092', name: 'เครื่องเย็บกระดาษ น้ำเงิน แม็กซ์ HD-50', qty: 2, unit: 'คร.', listPrice: 490.65, discount: 0, netUnitPrice: 490.65, totalAmount: 981.30 },
  { no: 15, code: '2004851', name: 'เครื่องเย็บ+ลวดเย็บเบอร์10 ตราช้าง EVO SPHERE', qty: 2, unit: 'คร.', listPrice: 70.09, discount: 0, netUnitPrice: 70.09, totalAmount: 140.18 },
  { no: 16, code: '2004432', name: 'ลวดเสียบกระดาษกลม 300ตัว/กล่อง เงิน ONE', qty: 5, unit: 'กล่อง', listPrice: 70.09, discount: 0, netUnitPrice: 70.09, totalAmount: 350.45 },
  { no: 17, code: '2061950', name: 'เครื่องเจาะ ตราช้าง DP-480G', qty: 3, unit: 'คร.', listPrice: 121.50, discount: 0, netUnitPrice: 121.50, totalAmount: 364.50 },
  { no: 18, code: '8002384', name: 'เครื่องคิดเลข สีเงิน คาสิโอ AX-120B', qty: 3, unit: 'คร.', listPrice: 428.97, discount: 0, netUnitPrice: 428.97, totalAmount: 1286.91 },
  { no: 19, code: '3121150', name: 'แท่นตัดเทป แกน 1 นิ้ว ตราม้า H-15', qty: 2, unit: 'แท่น', listPrice: 73.83, discount: 0, netUnitPrice: 73.83, totalAmount: 147.66 },
  { no: 20, code: '6121030', name: 'แฟ้มซอง F/C ใส (แพ็ค12เล่ม) โนวา 355', qty: 3, unit: 'แพ็ค', listPrice: 93.46, discount: 0, netUnitPrice: 93.46, totalAmount: 280.38 },
  { no: 21, code: '6003918', name: 'ซองถนอมเอกสาร 11 รู A4 (20 ซอง/แพ็ค) ONE', qty: 3, unit: 'แพ็ค', listPrice: 28.04, discount: 0, netUnitPrice: 28.04, totalAmount: 84.12 },
  { no: 22, code: '6003894', name: 'แฟ้มสันรูด A4 5มม. ขาว (แพ็ค12เล่ม) ONE', qty: 2, unit: 'แพ็ค', listPrice: 132.71, discount: 0, netUnitPrice: 132.71, totalAmount: 265.42 },
  { no: 23, code: '6091063', name: 'แฟ้มสันรูด A4 น้ำเงิน (แพ็ค5เล่ม) โคมิก HF287A', qty: 2, unit: 'แพ็ค', listPrice: 84.11, discount: 0, netUnitPrice: 84.11, totalAmount: 168.22 },
  { no: 24, code: '5280320', name: 'ซองจดหมายขาวฝาขนาน 9/125 (แพ็ค50ซอง) 555 สีขาว', qty: 10, unit: 'แพ็ค', listPrice: 67.29, discount: 0, netUnitPrice: 67.29, totalAmount: 672.90 },
  { no: 25, code: '6200560', name: 'ลิ้นแฟ้มเหล็ก เงิน (กล่อง50ชุด) เบนนอน BN1005', qty: 10, unit: 'กล่อง', listPrice: 63.55, discount: 0, netUnitPrice: 63.55, totalAmount: 635.50 },
  { no: 26, code: '3090254', name: 'เทปใส แกน1นิ้ว 3/4"X36หลา (แพ็คสุดคุ้ม10ม้วน) สกอตช์ 500c', qty: 4, unit: 'แพ็ค', listPrice: 298.13, discount: 0, netUnitPrice: 298.13, totalAmount: 1192.52 },
  { no: 27, code: '8031860', name: 'ถ่านกระดุมลิเธียม Panasonic CR-2032PT/1B', qty: 8, unit: 'ก้อน', listPrice: 64.49, discount: 0, netUnitPrice: 64.49, totalAmount: 515.92 },
  { no: 28, code: '8003414', name: 'ถ่านอัลคาไลน์ AA (20ก้อน/แพ็ค) Panasonic LR6T/20SL', qty: 2, unit: 'แพ็ค', listPrice: 383.18, discount: 0, netUnitPrice: 383.18, totalAmount: 766.36 },
  { no: 29, code: '8003835', name: 'ถ่านอัลคาไลน์ AAA (แพ็ค20ก้อน) Panasonic LR03T/20SL', qty: 2, unit: 'แพ็ค', listPrice: 383.18, discount: 0, netUnitPrice: 383.18, totalAmount: 766.36 },
  { no: 30, code: '8004003', name: 'รางปลั๊กไฟ (มอก.) 4ช่อง 3ม. DATA HM4496-3m', qty: 2, unit: 'อัน', listPrice: 335.51, discount: 0, netUnitPrice: 335.51, totalAmount: 671.02 },
  { no: 31, code: '8004004', name: 'รางปลั๊กไฟ (มอก.) 4ช่อง 5ม. DATA HM4496-5m', qty: 1, unit: 'อัน', listPrice: 372.90, discount: 0, netUnitPrice: 372.90, totalAmount: 372.90 },
  { no: 32, code: '7001892', name: 'พลาสติกเคลือบบัตร A4 หนา 100 ไมครอน', qty: 1, unit: 'แพ็ค', listPrice: 326.17, discount: 0, netUnitPrice: 326.17, totalAmount: 326.17 },
  { no: 33, code: '4140035', name: 'อิงค์แทงค์ T664100 ดำ 70cc (L100/L200) Epson', qty: 3, unit: 'ขวด', listPrice: 247.66, discount: 0, netUnitPrice: 247.66, totalAmount: 742.98 },
  { no: 34, code: '3090301', name: 'เทปโอพีพี 48มม.x40ม. (5แถม1) สีใส สกอตช์', qty: 5, unit: 'แพ็ค', listPrice: 285.98, discount: 0, netUnitPrice: 285.98, totalAmount: 1429.90 },
  { no: 35, code: '3090319', name: 'เทปโอพีพี 48มม.x40ม. (5แถม1) สีน้ำตาล สกอตช์', qty: 5, unit: 'แพ็ค', listPrice: 285.98, discount: 0, netUnitPrice: 285.98, totalAmount: 1429.90 },
  { no: 36, code: 'F010199', name: 'แถม-กระเป๋า เครื่องสำอางค์ คละสี 3เส้น', qty: 3, unit: 'ใบ', listPrice: 0.00, discount: 0, netUnitPrice: 0.00, totalAmount: 0.00 },
];

// 2. OSA Valve Services Purchase Order POTP260041 (10 items)
const osaItems = [
  { no: 1, code: '1004885', name: 'ปากกาเขียนแผ่นใสลบไม่ได้ 1.0 มม. แดง สเต็ดเล่อร์ 317-2', qty: 2.00, unit: 'ด้าม', unitPrice: 49.53, totalAmount: 99.06 },
  { no: 2, code: '1004887', name: 'ปากกาเขียนแผ่นใสลบไม่ได้ 1.0 มม. เขียว สเต็ดเล่อร์ 317-5', qty: 2.00, unit: 'ด้าม', unitPrice: 49.53, totalAmount: 99.06 },
  { no: 3, code: '0002758', name: 'ถุงซิปพลาสติก 9x12 ซม. (แพ็ค 0.5 กก.) ซอฟต์กร้า', qty: 3.00, unit: 'แพ็ค', unitPrice: 73.83, totalAmount: 221.49 },
  { no: 4, code: '0009769', name: 'ถุงซิป 12x17ซม. (แพ็ค1กก.)', qty: 2.00, unit: 'แพ็ค', unitPrice: 205.61, totalAmount: 411.22 },
  { no: 5, code: '0009770', name: 'ถุงซิป 15x23ซม. (แพ็ค1กก.)', qty: 2.00, unit: 'แพ็ค', unitPrice: 205.61, totalAmount: 411.22 },
  { no: 6, code: '0002761', name: 'ถุงซิปพลาสติก 20x28 ซม. (แพ็ค 0.5 กก.) ซอฟต์กร้า', qty: 2.00, unit: 'แพ็ค', unitPrice: 73.83, totalAmount: 147.66 },
  { no: 7, code: '0002756', name: 'ถุงซิปพลาสติก 23x33 ซม. (แพ็ค 0.5 กก.) ซอฟต์กร้า', qty: 2.00, unit: 'แพ็ค', unitPrice: 73.83, totalAmount: 147.66 },
  { no: 8, code: '5293160', name: 'สติกเกอร์กระดาษขาวมัน A4 80แกรม (แพ็ค100แผ่น) บอส', qty: 1.00, unit: 'แพ็ค', unitPrice: 338.32, totalAmount: 338.32 },
  { no: 9, code: '6160037', name: 'แฟ้มพับ F/C ส้ม โบโซ่', qty: 50.00, unit: 'เล่ม', unitPrice: 14.95, totalAmount: 747.50 },
  { no: 10, code: '6200510', name: 'ลิ้นแฟ้มเหล็กสีเงิน (กล่อง50ชุด) ตราม้า H-222', qty: 1.00, unit: 'กล่อง', unitPrice: 88.79, totalAmount: 88.79 },
];

// Helper to extract packaging details if any
function extractPackInfo(name, unit) {
  const match = name.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return unit;
}

// Build Workbook
const wb = XLSX.utils.book_new();

// SHEET 1: OfficeMate Quotation (SO261002026)
const ofmRows = [
  ['ใบเสนอราคา / Quotation - บริษัท ออฟฟิศเมท (ไทย) จำกัด (OfficeMate)'],
  ['เลขที่เอกสาร:', 'SO261002026', '', 'วันที่:', '05-10-2026'],
  ['รหัสลูกค้า:', '207887', '', 'ชื่อลูกค้า:', 'บริษัท เอ็กซีออน (ประเทศไทย) จำกัด'],
  ['ผู้ติดต่อ:', 'คุณ พัทธ์ณัชฐา (025783547 - 422)', '', 'วันที่จัดส่ง:', '07-10-2026'],
  [],
  ['ลำดับ', 'รหัสสินค้า', 'รายการสินค้า', 'จำนวน', 'หน่วย', 'ราคาเต็มต่อหน่วย (บาท)', 'ส่วนลด (%)', 'ราคาสุทธิ/หน่วย (บาท)', 'จำนวนเงินสุทธิ (บาท)']
];

ofmItems.forEach(item => {
  ofmRows.push([
    item.no,
    item.code,
    item.name,
    item.qty,
    item.unit,
    item.listPrice,
    item.discount,
    item.netUnitPrice,
    item.totalAmount
  ]);
});

ofmRows.push([]);
ofmRows.push(['', '', '', '', '', '', '', 'รวมมูลค่าสินค้าก่อนภาษี:', 19259.80]);
ofmRows.push(['', '', '', '', '', '', '', 'ภาษีมูลค่าเพิ่ม 7.00%:', 1348.19]);
ofmRows.push(['', '', '', '', '', '', '', 'จำนวนเงินรวมทั้งสิ้น:', 20607.99]);

const wsOfm = XLSX.utils.aoa_to_sheet(ofmRows);
wsOfm['!cols'] = [
  { wch: 8 },  // ลำดับ
  { wch: 14 }, // รหัสสินค้า
  { wch: 55 }, // รายการสินค้า
  { wch: 10 }, // จำนวน
  { wch: 10 }, // หน่วย
  { wch: 22 }, // ราคาเต็มต่อหน่วย
  { wch: 12 }, // ส่วนลด
  { wch: 22 }, // ราคาสุทธิ/หน่วย
  { wch: 20 }, // จำนวนเงินสุทธิ
];
XLSX.utils.book_append_sheet(wb, wsOfm, 'OfficeMate_SO261002026');

// SHEET 2: OSA Valve Services PO (POTP260041)
const osaRows = [
  ['PURCHASE ORDER - OSA Valve Services (Thailand) Co., Ltd.'],
  ['Purchase Order No.:', 'POTP260041', '', 'Order Date:', '05/10/2026'],
  ['To:', 'OFFICEMATE (THAI) LIMITED', '', 'Supplier Ref:', 'SO2609152974'],
  ['Purchaser:', 'PHATNATTHA PHONGPHENPHAN', '', 'Delivery Date:', '09/10/2026'],
  [],
  ['ลำดับ', 'รหัสสินค้า', 'รายการสินค้า (Description)', 'จำนวน (Qty)', 'หน่วย (Unit)', 'ราคาต่อหน่วย (Unit Price)', 'จำนวนเงินรวม (Amount)']
];

osaItems.forEach(item => {
  osaRows.push([
    item.no,
    item.code,
    item.name,
    item.qty,
    item.unit,
    item.unitPrice,
    item.totalAmount
  ]);
});

osaRows.push([]);
osaRows.push(['', '', '', '', '', 'ยอดรวม (Sub Total):', 2711.98]);
osaRows.push(['', '', '', '', '', 'ยอดรวมสุทธิ (Total):', 2711.98]);

const wsOsa = XLSX.utils.aoa_to_sheet(osaRows);
wsOsa['!cols'] = [
  { wch: 8 },  // ลำดับ
  { wch: 14 }, // รหัสสินค้า
  { wch: 55 }, // รายการสินค้า
  { wch: 14 }, // จำนวน
  { wch: 12 }, // หน่วย
  { wch: 22 }, // ราคาต่อหน่วย
  { wch: 20 }, // จำนวนเงินรวม
];
XLSX.utils.book_append_sheet(wb, wsOsa, 'OSA_PO_POTP260041');

// SHEET 3: รวมรายการทั้งหมด (All Items Master List)
const allRows = [
  ['ตารางสรุปรายการสินค้าทั้งหมดจากเอกสารทั้ง 2 ชุด (รวม 46 รายการ)'],
  ['จัดทำเมื่อ:', new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH')],
  [],
  ['ลำดับรวม', 'เอกสารอ้างอิง', 'รหัสสินค้า', 'รายการสินค้า', 'ข้อมูลการบรรจุ / รายละเอียด', 'จำนวน', 'หน่วย', 'ราคาต่อหน่วย (บาท)', 'มูลค่ารวม (บาท)']
];

let globalNo = 1;
ofmItems.forEach(item => {
  allRows.push([
    globalNo++,
    'OfficeMate SO261002026',
    item.code,
    item.name,
    extractPackInfo(item.name, item.unit),
    item.qty,
    item.unit,
    item.netUnitPrice,
    item.totalAmount
  ]);
});

osaItems.forEach(item => {
  allRows.push([
    globalNo++,
    'OSA PO POTP260041',
    item.code,
    item.name,
    extractPackInfo(item.name, item.unit),
    item.qty,
    item.unit,
    item.unitPrice,
    item.totalAmount
  ]);
});

allRows.push([]);
allRows.push(['', '', '', '', '', '', '', 'ยอดรวมทั้งสิ้น (ก่อนภาษี):', 21971.78]);

const wsAll = XLSX.utils.aoa_to_sheet(allRows);
wsAll['!cols'] = [
  { wch: 10 }, // ลำดับรวม
  { wch: 24 }, // เอกสารอ้างอิง
  { wch: 14 }, // รหัสสินค้า
  { wch: 55 }, // รายการสินค้า
  { wch: 28 }, // ข้อมูลการบรรจุ
  { wch: 10 }, // จำนวน
  { wch: 10 }, // หน่วย
  { wch: 20 }, // ราคาต่อหน่วย
  { wch: 20 }, // มูลค่ารวม
];
XLSX.utils.book_append_sheet(wb, wsAll, 'รวมรายการทั้งหมด_46รายการ');

// Write out to files
const outPathRoot = path.join(__dirname, '..', 'รายการสินค้า_OfficeMate_และ_OSA_PO.xlsx');
const outPathPublic = path.join(__dirname, '..', 'public', 'รายการสินค้า_OfficeMate_และ_OSA_PO.xlsx');

XLSX.writeFile(wb, outPathRoot);
XLSX.writeFile(wb, outPathPublic);

console.log('✅ Generated Excel at:', outPathRoot);
console.log('✅ Generated Excel at:', outPathPublic);
