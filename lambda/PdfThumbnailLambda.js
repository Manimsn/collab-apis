const AWS = require("aws-sdk");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

    // Ensure it's a PDF file
    if (!objectKey.endsWith(".pdf")) {
      console.log(`⚠️ Skipping non-PDF file: ${objectKey}`);
      return;
    }

    // Define file paths
    // const filePath = `/tmp/${path.basename(objectKey)}`;
    // const outputPath = `/tmp/${path.basename(objectKey, ".pdf")}.jpg`;
    // const filePath = `/tmp/input.pdf`; // Always use a safe name
    // const outputPath = `/tmp/output.jpg`; // Always use a safe name
    // ✅ Extract a safe filename (to be used later for uploading)
    const originalFilename = path.basename(objectKey, ".pdf"); // Get name without .pdf
    const sanitizedFilename = originalFilename.replace(/[^\w\s.-]/g, ""); // Remove special characters

    // ✅ Normalize file paths (Use fixed names for processing)
    const filePath = `/tmp/input.pdf`; // Temporary fixed name for processing
    const outputPath = `/tmp/output.jpg`; // Temporary fixed name for output

    // ✅ Step 1: Download PDF from S3
    console.log(`📥 Downloading ${objectKey} from ${bucketName}`);
    const params = { Bucket: bucketName, Key: objectKey };
    const data = await s3.getObject(params).promise();
    fs.writeFileSync(filePath, data.Body);

    // ✅ Step 2: Convert first page of PDF to an image using Ghostscript
    // console.log("🖼️ Generating Thumbnail using Ghostscript...");
    // execSync(`/opt/bin/gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=jpeg -r150 -dFirstPage=1 -dLastPage=1 -sOutputFile=${outputPath} ${filePath}`);

    // ✅ Step 2: Convert first page of PDF to an image using Ghostscript
    console.log("🖼️ Generating Thumbnail using Ghostscript...");
    execSync(
      `/opt/bin/gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=jpeg -r150 -dFirstPage=1 -dLastPage=1 -sOutputFile=${outputPath} ${filePath}`
    );

    // ✅ Step 3: Rename the processed output file to its original name
    const finalOutputPath = `/tmp/${sanitizedFilename}.jpg`; // Rename the output file
    fs.renameSync(outputPath, finalOutputPath);

    // ✅ Step 3: Upload the Thumbnail to S3
    const thumbnailBucket = bucketName;
    // const thumbnailKey = `thumbnails/${path.basename(outputPath)}`;
    const thumbnailKey = `thumbnails/${sanitizedFilename}.jpg`; // Keep original filename

    console.log(`🚀 Uploading Thumbnail to ${thumbnailBucket}/${thumbnailKey}`);
    await s3
      .putObject({
        Bucket: thumbnailBucket,
        Key: thumbnailKey,
        Body: fs.readFileSync(finalOutputPath),
        ContentType: "image/jpeg",
      })
      .promise();

    console.log("✅ Thumbnail Generation Complete!");
    return { statusCode: 200, body: "PDF Thumbnail Created Successfully!" };
  } catch (error) {
    console.error("❌ Error Processing PDF:", error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};
