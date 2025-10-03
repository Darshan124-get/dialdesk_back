import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_CONFIG } from './aws-config.js';

// AWS S3 Configuration
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey
  }
});

const BUCKET_NAME = AWS_CONFIG.bucketName;

// Upload file to S3
export const uploadToS3 = async (file, key) => {
  try {
    console.log('S3 Upload - File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer ? file.buffer.length : 'no buffer',
      key: key
    });

    if (!file.buffer || file.buffer.length === 0) {
      console.error('S3 Upload Error: File buffer is empty or missing');
      return {
        success: false,
        error: 'File buffer is empty or missing'
      };
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      }
    });

    const result = await s3Client.send(command);
    console.log('S3 Upload Success:', {
      etag: result.ETag,
      versionId: result.VersionId,
      uploadedSize: file.buffer.length
    });
    
    return {
      success: true,
      location: `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${key}`,
      etag: result.ETag,
      versionId: result.VersionId
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate pre-signed URL for file access
export const generatePresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('S3 Presigned URL Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate unique S3 key for Excel files
export const generateS3Key = (originalName, taskId) => {
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `uploads/excel-files/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${taskId}_${timestamp}_${sanitizedName}`;
};

export { s3Client, BUCKET_NAME };
