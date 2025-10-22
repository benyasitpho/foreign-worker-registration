import { createWorker, createEmployer } from "../server/db";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedData() {
  try {
    console.log("Starting data import...");

    // Read JSON file
    const jsonPath = "/home/ubuntu/foreign-worker-registration/scripts/workers-data.json";
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(jsonData);

    console.log(`Found ${data.length} rows in JSON file`);

    // Create employer first
    const employer = await createEmployer({
      employerType: "company",
      companyName: "บริษัทนำคนต่างด้าวเข้ามาทำงานในประเทศไทยนิยม 2022",
      taxId: "0000000000000",
      contactPerson: "เบญญสิทธิ์ ภูมิพันธ์",
      contactPosition: "พนักงานอาวุโส",
      phone: "02-XXX-XXXX",
      address: "กรุงเทพมหานคร",
      province: "กรุงเทพมหานคร",
      businessType: "นำเข้าแรงงานต่างด้าว",
    });

    console.log(`Created employer: ${employer.companyName}`);

    // Import workers from JSON
    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        // Parse name (format: "FIRSTNAME LASTNAME")
        const fullName = row["ชื่อ- สกุล"] || "";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Parse nationality
        let nationality = "Myanmar";
        if (row["สัญชาติ"] === "กัมพูชา") nationality = "Cambodia";
        else if (row["สัญชาติ"] === "ลาว") nationality = "Laos";
        else if (row["สัญชาติ"] === "เวียดนาม") nationality = "Vietnam";
        else if (row["สัญชาติ"] === "พม่า") nationality = "Myanmar";

        // Parse date of birth
        let dateOfBirth: Date | undefined;
        if (row["วดป/เกิด"]) {
          try {
            dateOfBirth = new Date(row["วดป/เกิด"]);
          } catch {
            dateOfBirth = undefined;
          }
        }

        await createWorker({
          titleEn: row["คำนำหน้า"] || undefined,
          firstNameTh: firstName,
          lastNameTh: lastName,
          firstNameEn: firstName,
          lastNameEn: lastName,
          nationality: nationality,
          passportNo: row["เลขพาส"] || "",
          dateOfBirth: dateOfBirth,
          employerId: employer.id,
          employerName: row["นายจ้าง"] || employer.companyName,
          workLocation: row["ที่อยู่สถานประกอบการ"] || undefined,
        });
        successCount++;
      } catch (error) {
        console.error(`Error importing row:`, error);
        errorCount++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`- Success: ${successCount} workers`);
    console.log(`- Errors: ${errorCount} workers`);
    console.log(`- Total: ${data.length} rows`);

  } catch (error) {
    console.error("Error during data import:", error);
    process.exit(1);
  }
}

seedData()
  .then(() => {
    console.log("\nData import finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

