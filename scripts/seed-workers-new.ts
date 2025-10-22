import { createWorker, getEmployers } from "../server/db";
import * as fs from "fs";

async function seedWorkers() {
  try {
    console.log("Starting workers import...");

    // Get all employers first
    const employers = await getEmployers();
    console.log(`Found ${employers.length} employers in database`);

    // Create employer name to ID mapping
    const employerMap = new Map<string, number>();
    employers.forEach(emp => {
      employerMap.set(emp.companyName, emp.id);
    });

    // Read JSON file
    const jsonPath = "/home/ubuntu/foreign-worker-registration/scripts/workers-data.json";
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(jsonData);

    console.log(`Found ${data.length} workers in JSON file`);

    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        // Parse name (format: "FIRSTNAME LASTNAME")
        const fullName = (row["ชื่อ- สกุล"] || "").trim();
        
        if (!fullName) {
          console.log(`Skipping row with no name`);
          errorCount++;
          continue;
        }

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

        // Get employer ID
        const employerName = (row["นายจ้าง"] || "").trim();
        const employerId = employerName ? employerMap.get(employerName) : undefined;

        await createWorker({
          title: row["คำนำหน้า"] || undefined,
          fullName: fullName,
          nationality: nationality,
          passportNo: row["เลขพาส"] || "",
          dateOfBirth: dateOfBirth,
          employerId: employerId,
          employerName: employerName || undefined,
          workLocation: row["ที่อยู่สถานประกอบการ"] || undefined,
        });
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Imported ${successCount} workers...`);
        }
      } catch (error) {
        console.error(`Error importing worker:`, error);
        errorCount++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`- Success: ${successCount} workers`);
    console.log(`- Errors: ${errorCount} workers`);
    console.log(`- Total: ${data.length} rows`);

  } catch (error) {
    console.error("Error during workers import:", error);
    process.exit(1);
  }
}

seedWorkers()
  .then(() => {
    console.log("\nWorkers import finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

