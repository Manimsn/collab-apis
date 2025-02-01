const AWS = require("aws-sdk");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    console.log("🚀 Event Received:", JSON.stringify(event, null, 2));

    // Extract S3 event details
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    if (!objectKey.endsWith(".pdf")) {
      console.log(`⚠️ Skipping non-PDF file: ${objectKey}`);
      return;
    }

    // ✅ Extract a safe filename
    const originalFilename = path.basename(objectKey, ".pdf"); // Remove .pdf
    const sanitizedFilename = originalFilename.replace(/[^\w\s.-]/g, ""); // Remove special chars

    // ✅ Define temporary paths
    const filePath = `/tmp/input.pdf`;
    const outputPath = `/tmp/output.jpg`; // Extracted first-page image
    const croppedPath = `/tmp/cropped.jpg`; // Top-section image

    // ✅ Step 1: Download PDF from S3
    console.log(`📥 Downloading ${objectKey} from ${bucketName}`);
    const params = { Bucket: bucketName, Key: objectKey };
    const data = await s3.getObject(params).promise();
    fs.writeFileSync(filePath, data.Body);

    // ✅ Step 2: Convert first page of PDF to an image using Ghostscript
    console.log("🖼️ Extracting first page using Ghostscript...");
    execSync(
      `/opt/bin/gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=jpeg -r150 -dFirstPage=1 -dLastPage=1 -sOutputFile=${outputPath} ${filePath}`
    );

    // ✅ Step 3: Crop the top 40% of the image
    console.log("📏 Cropping top section...");
    const { width, height } = await sharp(outputPath).metadata();
    const cropHeight = Math.floor(height * 0.4); // Extract only the top 40%

    await sharp(outputPath)
      .extract({ left: 0, top: 0, width: width, height: cropHeight }) // Crop top part
      .toFile(croppedPath);

    // ✅ Step 4: Resize for Different Screens
    const sizes = [
      { name: "800x440", width: 800, height: 440 },
      { name: "315x195", width: 315, height: 195 },
      { name: "256x144", width: 256, height: 144 },
    ];

    const uploadToS3 = async (filePath, sizeLabel) => {
      const thumbnailKey = `thumbnails/${sanitizedFilename}_${sizeLabel}.webp`;
      console.log(`🚀 Uploading Thumbnail to ${bucketName}/${thumbnailKey}`);
      await s3
        .putObject({
          Bucket: bucketName,
          Key: thumbnailKey,
          Body: fs.readFileSync(filePath),
          ContentType: "image/webp",
        })
        .promise();
    };

    await Promise.all(
      sizes.map(async ({ name, width, height }) => {
        const resizedPath = `/tmp/${sanitizedFilename}_${name}.webp`;

        await sharp(croppedPath)
          .resize(width, height, { fit: "cover" }) // Crop to fit
          .toFile(resizedPath);

        await uploadToS3(resizedPath, name);
      })
    );

    console.log("✅ Thumbnail Generation Complete!");
    return { statusCode: 200, body: "PDF Thumbnails Created Successfully!" };
  } catch (error) {
    console.error("❌ Error Processing PDF:", error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};
