const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  console.log("🚀 Event received:", JSON.stringify(event, null, 2));

  try {
    const bucket = event.Records[0].s3.bucket.name;

    // 🔹 Decode the key properly
    const encodedKey = event.Records[0].s3.object.key;
    const key = decodeURIComponent(encodedKey.replace(/\+/g, " "));

    console.log(`🔹 Processing new file: ${key}`);

    // 🔹 Debug: List all objects in the bucket to check if the file exists
    const listObjects = await s3.listObjectsV2({ Bucket: bucket }).promise();
    console.log(
      "📂 S3 Bucket Contents:",
      JSON.stringify(
        listObjects.Contents.map((obj) => obj.Key),
        null,
        2
      )
    );

    // 🔹 Check if the file exists before fetching it
    console.log(`🔍 Checking file existence: ${key}`);
    const metadata = await s3
      .headObject({ Bucket: bucket, Key: key })
      .promise();
    console.log(`✅ File found: ${key}`);

    // Allowed image MIME types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedMimeTypes.includes(metadata.ContentType)) {
      console.log(
        `⚠️ Skipping invalid file type: ${key}, MIME Type: ${metadata.ContentType}`
      );
      return;
    }

    // 🔹 Fetch the image
    const originalImage = await s3
      .getObject({ Bucket: bucket, Key: key })
      .promise();
    console.log(`✅ Successfully fetched original image: ${key}`);

    // 🔹 Generate Thumbnails
    const sizes = [
      { width: 1080, suffix: "1080px" },
      { width: 720, suffix: "720px" },
      { width: 200, suffix: "200px" },
    ];

    // 🔹 Extract the filename without extension
    const filenameWithExt = key.split("/").pop();
    const filename = filenameWithExt.replace(/\.[^/.]+$/, ""); // Remove file extension

    // 🔹 Upload thumbnails
    const uploadPromises = sizes.flatMap(({ width, suffix }) => [
      sharp(originalImage.Body)
        .resize(width)
        .toFormat("webp")
        .toBuffer()
        .then((buffer) =>
          s3
            .putObject({
              Bucket: bucket,
              Key: `thumbnails/${filename}-${suffix}.webp`, // ✅ Corrected Path
              Body: buffer,
              ContentType: "image/webp",
            })
            .promise()
        ),

      sharp(originalImage.Body)
        .resize(width)
        .toFormat("jpeg")
        .toBuffer()
        .then((buffer) =>
          s3
            .putObject({
              Bucket: bucket,
              Key: `thumbnails/${filename}-${suffix}.jpg`, // ✅ Corrected Path
              Body: buffer,
              ContentType: "image/jpeg",
            })
            .promise()
        ),
    ]);

    await Promise.all(uploadPromises);

    console.log(`✅ Thumbnails successfully generated for ${filename}`);
  } catch (error) {
    console.error("❌ Error processing file:", error);
  }
};
