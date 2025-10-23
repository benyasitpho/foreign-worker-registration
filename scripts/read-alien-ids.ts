import XLSX from 'xlsx';
import * as fs from 'fs';

// อ่านไฟล์ Excel
const filePath = '/home/ubuntu/upload/ข้อมูลใส่เวป.xlsx';
const workbook = XLSX.readFile(filePath);

// อ่านข้อมูลจาก sheet ที่มีข้อมูลลูกจ้าง
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// แปลงเป็น JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('\nFirst 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

// ดูชื่อคอลัมน์ทั้งหมด
if (data.length > 0) {
  console.log('\nColumn names:');
  console.log(Object.keys(data[0]));
}

// กรองเฉพาะข้อมูลที่มี Alien ID
const workersWithAlienId = data.filter((row: any) => {
  // ตรวจสอบว่ามีชื่อและมี Alien ID
  const hasName = row['ชื่อ- สกุล'];
  const hasAlienId = row['เลขประจำตัวคนต่างด้าว'];
  return hasName && hasAlienId;
});

console.log('\n\nWorkers with Alien ID:', workersWithAlienId.length);

// แสดงตัวอย่าง 5 รายการแรก
console.log('\nSample workers with Alien ID:');
workersWithAlienId.slice(0, 5).forEach((worker: any, index: number) => {
  console.log(`\n${index + 1}.`);
  console.log('  Name:', worker['ชื่อ- สกุล']);
  console.log('  Alien ID:', worker['เลขประจำตัวคนต่างด้าว']);
  console.log('  Passport:', worker['พาสปอร์ต']);
  console.log('  Nationality:', worker['สัญชาติ']);
});

// บันทึกข้อมูลเป็นไฟล์ JSON เพื่อตรวจสอบ
const outputPath = '/home/ubuntu/foreign-worker-registration/scripts/alien-ids-data.json';
fs.writeFileSync(outputPath, JSON.stringify(workersWithAlienId, null, 2));
console.log(`\n\nData saved to: ${outputPath}`);

