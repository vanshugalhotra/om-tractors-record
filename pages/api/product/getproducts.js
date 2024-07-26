import Product from "@/models/Product";
import Type from "@/models/Type";
import Brand from "@/models/Brand";
import connectDb from "@/db/mongoose";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const { search, limit } = req.query;
      const parsedLimit = limit ? parseInt(limit, 10) : null; // Use null if limit is not provided

      const typeQuery = search
        ? { name: { $regex: search, $options: "i" } }
        : {};

      const types = await Type.find(typeQuery);
      const typeIDs = types.map((type) => type._id);

      const brandQuery = search
        ? { name: { $regex: search, $options: "i" } }
        : {};

      const brands = await Brand.find(brandQuery);
      const brandIDs = brands.map((brand) => brand._id);

      // Create a search query for products using a regular expression
      const productSearchQuery = search
        ? {
            $or: [
              { productName: { $regex: search, $options: "i" } },
              { partNumber: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { type: { $in: typeIDs } },
              { brand: { $in: brandIDs } },
            ],
          }
        : {};

      let products = [];

      if (parsedLimit) {
        // Build the query with the limit
        products = await Product.find(productSearchQuery)
          .populate({
            path: "type",
            select: "name color", // Specify the fields you want to populate
          })
          .populate({
            path: "brand",
            select: "name", // Specify the fields you want to populate for brand
          })
          .sort({ createdAt: -1 }) // Sort by createdAt in descending order
          .limit(parsedLimit); // Apply the limit
      } else {
        // Build the query with the limit
        products = await Product.find(productSearchQuery)
          .populate({
            path: "type",
            select: "name color", // Specify the fields you want to populate
          })
          .populate({
            path: "brand",
            select: "name", // Specify the fields you want to populate for brand
          })
          .sort({ createdAt: -1 }); // Sort by createdAt in descending order
      }

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default connectDb(handler);
