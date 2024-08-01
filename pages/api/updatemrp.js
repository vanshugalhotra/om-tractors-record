import mongoose from "mongoose";
import Product from "@/models/Product";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import connectDb from "@/db/connectionForUpdate";

// Function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { nameField, alternateNameField, mrpField, fileName, date } = req.body;

      // Load the Excel file from the public directory
      const filePath = path.join(
        process.cwd(),
        "public",
        "assets",
        "data",
        fileName
      );
      if (!fs.existsSync(filePath)) {
        console.log("File does not exist");
        return res.status(400).json({ error: "File does not exist" });
      }

      // Parse the Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      // Extract the relevant columns and convert part numbers to lowercase
      const updates = data
        .filter((row) => (row[nameField] || row[alternateNameField]) && row[mrpField]) // Ensure both fields exist
        .map((row) => ({
          partNumber: String(row[nameField] || row[alternateNameField]).toLowerCase(),
          amount: row[mrpField],
        }));

      console.log(`Parsed ${updates.length} records from Excel file`);

      // Fetch the existing part numbers from the database
      const existingProducts = await Product.find({}, "partNumber");
      const existingPartNumbers = new Set(
        existingProducts.map((p) => p.partNumber.toLowerCase())
      );

      // Filter updates to only include those with existing part numbers
      const filteredUpdates = updates.filter((update) =>
        existingPartNumbers.has(update.partNumber)
      );

      console.log(
        `Filtered down to ${filteredUpdates.length} relevant records`
      );

      // Define batch size
      const BATCH_SIZE = 25; // Adjust this value based on your needs
      let updateCount = 0;

      for (let i = 0; i < filteredUpdates.length; i += BATCH_SIZE) {
        const batch = filteredUpdates.slice(i, i + BATCH_SIZE);

        for (const update of batch) {
          const result = await Product.updateOne(
            {
              $expr: {
                $eq: [{ $toLower: "$partNumber" }, update.partNumber],
              },
            },
            [
              {
                $set: {
                  oldMRP: "$amount",
                  amount: update.amount,
                  lastUpdated: date,
                },
              },
            ]
          );
          if (result.matchedCount > 0) {
            updateCount++;
          }
        }

        console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);

        // Introduce a delay after processing each batch
        if (i + BATCH_SIZE < filteredUpdates.length) {
          await delay(1000); // 1 second delay
        }
      }

      console.log(`Total updated records: ${updateCount}`);
      res.status(200).json({ success: true, updatedCount: updateCount });
    } catch (error) {
      console.error("Error during update process:", error);
      res.status(500).json({ error: "Internal Server Error", success: false });
    }
  } else {
    console.log("Invalid request method");
    res.status(405).json({ error: "Method Not Allowed", success: false });
  }
};

export default connectDb(handler); // Wrap the handler with connectDb
