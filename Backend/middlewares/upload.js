import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
    ".avif",
    ".heic",
    ".heif",
    ".jfif",
    ".bmp",
    ".tif",
    ".tiff"
  ];

  const ext = path.extname(file.originalname || "").toLowerCase();
  const isImageMime = typeof file.mimetype === "string" && file.mimetype.startsWith("image/");
  const isAllowedExtension = allowedExtensions.includes(ext);

  if (isImageMime || isAllowedExtension) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
