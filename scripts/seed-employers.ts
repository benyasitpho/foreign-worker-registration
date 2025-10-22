import { createEmployer } from "../server/db";
import * as fs from "fs";

async function seedEmployers() {
  try {
    console.log("Starting employers import...");

    // Read JSON file
    const jsonPath = "/home/ubuntu/foreign-worker-registration/scripts/employers-data.json";
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(jsonData);

    console.log(`Found ${data.length} employers in JSON file`);

    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        // Generate a simple tax ID (in real scenario, this should be provided)
        const taxId = `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`;
        
        await createEmployer({
          employerType: row.employerType || "individual",
          companyName: row.companyName,
          taxId: taxId,
          address: row.address || undefined,
        });
        successCount++;
        console.log(`✓ Imported: ${row.companyName}`);
      } catch (error) {
        console.error(`✗ Error importing ${row.companyName}:`, error);
        errorCount++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`- Success: ${successCount} employers`);
    console.log(`- Errors: ${errorCount} employers`);
    console.log(`- Total: ${data.length} rows`);

  } catch (error) {
    console.error("Error during employers import:", error);
    process.exit(1);
  }
}

seedEmployers()
  .then(() => {
    console.log("\nEmployers import finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

