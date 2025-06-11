import { AppDataSource } from "./data-source";
import express from "express";
import * as dotenv from "dotenv";
import type { Request, Response } from "express";
import "reflect-metadata";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import { authorization } from "./middleware/auth.middleware";
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import { BadRequestError } from "./errors/http.errors";
import logger from "./lib/logger";
import usersRoutes from "./routes/users.routes";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asyncHandler } from "./utils/async-handler";
import { v4 as uuidv4 } from "uuid";
import settingsRoutes from "./routes/settings.routes";
import authRoutes from "./routes/auth.routes";
import bikeRoutes from "./routes/bike.routes";
import userAddressRoutes from "./routes/user-address.routes";
import bookingRoutes from "./routes/booking.routes";
import { BookingController } from "./controllers/booking-controller";

dotenv.config();

const delayMiddleware = (_: any, __: any, next: any) => {
  const delay = Math.floor(Math.random() * 500) + 200;
  setTimeout(() => {
    next();
  }, delay);
};

const app = express();

app.use(
  express.json({
    verify: (req: any, res: any, buf: any, encoding: any) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8");
      }
    },
  })
);

// Middleware to log all requests
app.use((req, res, next) => {
  const start = Date.now();

  // When response finishes, log the request details
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
    });
  });

  next();
});

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  // Enable Swagger Documentation in development mode only
  app.use(delayMiddleware);
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Table Vege API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authorization, usersRoutes);
app.use("/api/settings", authorization, settingsRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/address", authorization, userAddressRoutes);

// Single endpoint for file upload
app.post("/api/upload", upload.single("file"), (req: any, res: Response) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded.");
  }

  // Generate the public URL for the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;

  // Return the file URL and any additional data
  res.json({
    message: "File uploaded successfully",
    fileUrl: fileUrl,
    additionalData: req.body, // Any additional form data sent with the request
  });
});

app.post(
  "/api/sign",
  asyncHandler(async (req: any, res: Response) => {
    const body = await req.body;
    const { fileName, fileType, fileSize } = body;

    // Validate required fields
    if (!fileName || !fileType) {
      throw new BadRequestError("fileName and fileType are required");
    }

    // Optional: Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestError(
        "File type not allowed. Only JPG, PNG, and GIF are supported."
      );
    }

    // Optional: Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize && fileSize > maxSize) {
      throw new BadRequestError("File size exceeds the maximum limit of 5MB.");
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT!,
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Generate a unique file key to prevent overwriting
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `uploads/${uniqueFileName}`;

    // Create the command to put the object in S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    // Generate a signed URL
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Construct the final file URL that will be accessible after upload
    const fileUrl = `${process.env.AWS_ENDPOINT}/${key}`;

    // Return the signed URL and file URL to the client
    return res.json({ signedUrl, fileUrl, key: `/${key}` });
  })
);

// Simple log viewer endpoint
// @ts-ignore
app.get("/logs", (req, res) => {
  const logFile = req.query.file || "../combined.log";
  const allowedLogFiles = ["../combined.log", "../error.log"];

  // @ts-ignore
  if (!allowedLogFiles.includes(logFile)) {
    return res.status(400).json({ error: "Invalid log file requested" });
  }

  try {
    // @ts-ignore
    const logPath = path.join(__dirname, logFile);
    const logs = fs
      .readFileSync(logPath, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          // Extract JSON part from log line
          const jsonStart = line.indexOf("{");
          if (jsonStart > -1) {
            const message = line.substring(0, jsonStart).trim();
            const meta = JSON.parse(line.substring(jsonStart));
            return { message, ...meta };
          }
          return { message: line };
        } catch (e) {
          return { message: line };
        }
      });

    if (req.headers.accept.includes("application/json")) {
      res.json(logs);
    } else {
      // Simple HTML viewer
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Log Viewer</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            .log-entry { border-bottom: 1px solid #eee; padding: 8px 0; }
            .error { color: #e74c3c; }
            .warn { color: #f39c12; }
            .info { color: #3498db; }
            .debug { color: #2ecc71; }
          </style>
        </head>
        <body>
          <h1>Log Viewer - ${logFile}</h1>
          <div>
            <a href="/logs?file=../combined.log">Combined Logs</a> | 
            <a href="/logs?file=../error.log">Error Logs</a>
          </div>
          <div id="logs">
            ${logs
              .reverse()
              .map((log) => {
                const level = log.level || "";
                return `<div class="log-entry ${level}">${JSON.stringify(
                  log
                )}</div>`;
              })
              .join("")}
          </div>
        </body>
        </html>
      `;
      res.send(html);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Single endpoint for file upload
app.post(
  "/api/upload",
  upload.single("file"),
  (req: Request, res: Response): void => {
    // @ts-ignore
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
    }
    // Generate the public URL for the uploaded file
    // @ts-ignore
    const fileUrl = `/uploads/${req.file.filename}`;
    // Return the file URL and any additional data
    res.json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      additionalData: req.body, // Any additional form data sent with the request
    });
  }
);

// Error handling middleware
// @ts-ignore
app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        "Server is running on http://localhost:" + process.env.PORT || 8000
      );
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));
