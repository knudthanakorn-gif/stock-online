import fs from 'fs';

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
      result.push({
        employeeCode: row[0].replace(/^\uFEFF/, '').trim(),
        name: row[1].trim(),
        company: row[2].trim(),
        department: row[3].trim(),
        position: row[4].trim(),
      });
    }
  }
  return result;
}

const csv = fs.readFileSync('C:/Users/admin/Desktop/Employees_All_Companies_20260827_153806.csv', 'utf8');
const emps = parseCSV(csv);
console.log('Total parsed employees:', emps.length);

const compMap = new Map();
emps.forEach((e) => {
  compMap.set(e.company, (compMap.get(e.company) || 0) + 1);
});

console.log('Employees per company:');
for (const [comp, count] of compMap.entries()) {
  console.log(' -', comp, ':', count, 'people');
}

console.log('\nSample employee:', emps[0]);
