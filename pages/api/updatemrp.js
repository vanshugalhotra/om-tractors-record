import mongoose from "mongoose";
import Product from "@/models/Product";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { nameField, mrpField, fileName, date } = req.body;

      // Load the Excel file from the public directory
      const filePath = path.join(
        process.cwd(),
        "public",
        "assets",
        "data",
        fileName
      );
      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: "File does not exist" });
      }

      // Parse the Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      // Extract the relevant columns and convert part numbers to lowercase
      const updates = data
        .filter((row) => row[nameField] && row[mrpField]) // Ensure both fields exist
        .map((row) => ({
          partNumber: row[nameField].toLowerCase(),
          amount: row[mrpField],
        }));

      // Update the database and count the number of updates
      let updateCount = 0;
      for (const update of updates) {
        const result = await Product.updateOne(
          {
            $expr: {
              $eq: [{ $toLower: "$partNumber" }, update.partNumber],
            },
          },
          { amount: update.amount, lastUpdated: date }
        );
        if (result.matchedCount > 0) {
          updateCount++;
        }
      }

      res.status(200).json({ success: true, updatedCount: updateCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error", success: false });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed", success: false });
  }
};

export default handler;
