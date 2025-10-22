import { Router } from "express";
import multer from "multer";
import { storagePut } from "../storage";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const key = `workers/${filename}`;

    // Upload to S3
    const result = await storagePut(key, file.buffer, file.mimetype);

    res.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;

