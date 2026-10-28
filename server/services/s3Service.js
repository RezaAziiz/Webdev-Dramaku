// S3 upload service — generates pre-signed URLs so the browser can upload
// directly to S3 without routing the file through our server.
// AWS credentials stay here on the backend only.
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');
const s3 = require('../config/s3');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const PRESIGNED_URL_EXPIRES_SEC = 120; // 2 minutes

/**
 * Returns a pre-signed PUT URL the client can use to upload a file
 * directly to S3, plus the final public URL of the object.
 *
 * @param {object} opts
 * @param {string} opts.folder  - S3 folder prefix, e.g. "avatars"
 * @param {string} opts.mimeType - MIME type declared by the client
 * @param {number} opts.size     - File size in bytes declared by the client
 */
exports.createPresignedUploadUrl = async ({ folder = 'uploads', mimeType, size }) => {
  if (!env.AWS_S3_BUCKET) {
    throw new AppError('S3 upload is not configured on this server.', 503);
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(
      `File type not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`,
      400,
    );
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new AppError('File is too large. Maximum size is 5 MB.', 400);
  }

  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const key = `${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: mimeType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_SEC,
  });

  // The public URL the object will be accessible at after upload.
  const publicUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
};

/**
 * Uploads a file buffer directly to S3 from backend.
 * @param {object} opts
 * @param {Buffer} opts.buffer
 * @param {string} opts.mimeType
 * @param {string} opts.folder
 */
exports.uploadBuffer = async ({ buffer, mimeType = 'image/jpeg', folder = 'avatars' }) => {
  if (!env.AWS_S3_BUCKET) {
    throw new AppError('S3 bucket is not configured on this server.', 503);
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(`File type not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`, 400);
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new AppError('File is too large. Maximum size is 5 MB.', 400);
  }

  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const key = `${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);
  const publicUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { publicUrl, key };
};

/**
 * Deletes an S3 object by key. Use when replacing an existing avatar.
 * @param {string} key - The S3 object key (path inside the bucket)
 */
exports.deleteObject = async (key) => {
  if (!env.AWS_S3_BUCKET || !key) return;
  await s3.send(
    new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
  );
};

