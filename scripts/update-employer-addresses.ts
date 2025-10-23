import { getDb } from "../server/db";
import { employers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const addressMapping: Record<string, { address: string; subdistrict: string; district: string; province: string }> = {
  "นางสาว ประเมิน มีสายบัว": {
    address: "203 หมู่ 5",
    subdistrict: "ลำไทร",
    district: "วังน้อย",
    province: "พระนครศรีอยุทธยา"
  },
  "นาย สมชาย วรรณทอง": {
    address: "18/1 หมู่ 6",
    subdistrict: "คลองหนึ่ง",
    district: "คลองหลวง",
    province: "ปทุมธานี"
  },
  "นาย เสรี ฉิมพาลี": {
    address: "1/1 หมู่ 6",
    subdistrict: "คลองหนึ่ง",
    district: "คลองหลวง",
    province: "ปทุมธานี"
  },
  "นาย ทวีศักดิ์ แสงน้ำรัก": {
    address: "17/333 หมู่ 5",
    subdistrict: "ตำบล คลองห้า",
    district: "คลองหลวง",
    province: "ปททุมธานี"
  },
  "นางสาว ตาณตา อมรรัดนเมธากุล": {
    address: "374 หมู่ 5",
    subdistrict: "ศาลาลำดวน",
    district: "เมืองสระแก้ว",
    province: "สระแก้ว"
  },
  "บริษัท ทรัพย์พวงทอง เอ็นจิเนียริ่ง แอนด์เซอร์วิส จำกัด": {
    address: "160 หมู่ 30",
    subdistrict: "คูคต",
    district: "ลำลูกกา",
    province: "ปทุมธานี"
  },
  "นาย เอกกมล หอสุวรรณานนท์": {
    address: "22/หมู่ 11",
    subdistrict: "คลองสอง",
    district: "คลองหลวง",
    province: "ปทุมธานี"
  },
  "บริษัท สิริมา ฟู้ดส์ แอนด์ เบฟเวอเรจ จำกัด": {
    address: "79/69 หมู่ 2",
    subdistrict: "บางพลับ",
    district: "ปากเกร็ด",
    province: "นนทบุรี"
  },
  "นาย วิภพ กิตณรงค์": {
    address: "79/69 หมู่ 2",
    subdistrict: "คลองสาม",
    district: "คลองหลวง",
    province: "ปทุมธานี"
  },
  "นายเติมศักดิ์ พิมพากรณ์": {
    address: "79/69 หมู่ 2",
    subdistrict: "คลองหนึ่ง",
    district: "ตำบลคลองหนึ่ง",
    province: "ปทุมธานี"
  },
  "บริษัท เอ็น แอนด์ เอ็ม คอนสตรัคชั่น จำกัด": {
    address: "87/107 หมู่ 7",
    subdistrict: "ลำลูกกา",
    district: "ตำลลลำลูกกา",
    province: "ปทุมธานี"
  },
  "บริษัท นาลันทา เคมีคอล จำกัด": {
    address: "189/252 หมู่ 2",
    subdistrict: "ลำลูกกา",
    district: "ตำบลบางเดื่อ",
    province: "ปทุมธานี"
  },
  "ห้างหุ้นส่วนจำกัด วิคตอรี การ์เดนท์ แอนด์ เซอร์วิส": {
    address: "40/3 หมู่ 9",
    subdistrict: "หนองจอก",
    district: "แขวงหนอกจอก",
    province: "กรุงเทพมหานคร"
  },
  "ห้างหุ้นส่วนจำกัด พิเชษฐ์ กรีน": {
    address: "59/176 หมู่ที่ 3",
    subdistrict: "คลองสิบสอง",
    district: "คลองสิบสอง",
    province: "กรุงเทพมหานคร"
  }
};

async function updateEmployerAddresses() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
      process.exit(1);
    }
    const allEmployers = await db.select().from(employers);
    
    let updated = 0;
    for (const employer of allEmployers) {
      const addressData = addressMapping[employer.companyName];
      if (addressData) {
        await db.update(employers)
          .set({
            address: addressData.address,
            subdistrict: addressData.subdistrict,
            district: addressData.district,
            province: addressData.province
          })
          .where(eq(employers.id, employer.id));
        
        console.log(`อัพเดต: ${employer.companyName}`);
        updated++;
      }
    }
    
    console.log(`\nอัพเดตที่อยู่นายจ้างเรียบร้อย: ${updated} รายการ`);
    process.exit(0);
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    process.exit(1);
  }
}

updateEmployerAddresses();

