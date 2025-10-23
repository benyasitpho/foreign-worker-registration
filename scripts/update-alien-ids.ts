import XLSX from 'xlsx';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { workers } from '../drizzle/schema';
import * as dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const db = drizzle(process.env.DATABASE_URL);

async function updateAlienIds() {
  console.log('Starting Alien ID update process...\n');

  // อ่านไฟล์ Excel
  const filePath = '/home/ubuntu/upload/ข้อมูลใส่เวป.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Found ${data.length} rows in Excel file\n`);

  // ดึงข้อมูลลูกจ้างทั้งหมดจากฐานข้อมูล
  const allWorkers = await db.select().from(workers);
  console.log(`Found ${allWorkers.length} workers in database\n`);

  let updateCount = 0;
  let notFoundCount = 0;
  const notFoundWorkers: string[] = [];

  // วนลูปอัพเดตข้อมูล
  for (const row of data as any[]) {
    const excelName = row['ชื่อ- สกุล'];
    const alienId = row['เลขประจำตัวคนต่างด้าว'];

    if (!excelName || !alienId) {
      continue;
    }

    // ค้นหาลูกจ้างในฐานข้อมูลโดยเทียบชื่อ
    const worker = allWorkers.find(w => 
      w.fullName?.trim().toUpperCase() === excelName.trim().toUpperCase()
    );

    if (worker) {
      // อัพเดต Alien ID
      await db.update(workers)
        .set({ alienId: alienId.toString() })
        .where(eq(workers.id, worker.id));
      
      updateCount++;
      console.log(`✓ Updated: ${excelName} -> ${alienId}`);
    } else {
      notFoundCount++;
      notFoundWorkers.push(excelName);
      console.log(`✗ Not found in DB: ${excelName}`);
    }
  }

  console.log('\n=== Update Summary ===');
  console.log(`Total rows in Excel: ${data.length}`);
  console.log(`Successfully updated: ${updateCount}`);
  console.log(`Not found in database: ${notFoundCount}`);

  if (notFoundWorkers.length > 0) {
    console.log('\nWorkers not found in database:');
    notFoundWorkers.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }

  console.log('\n✅ Alien ID update process completed!');
}

updateAlienIds().catch(error => {
  console.error('Error updating Alien IDs:', error);
  process.exit(1);
});

