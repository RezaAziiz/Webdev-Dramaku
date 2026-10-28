export const AWS_CONFIG = {
  S3_BUCKET: process.env.REACT_APP_AWS_S3_BUCKET || 'your-bucket-name',
  S3_REGION: process.env.REACT_APP_AWS_S3_REGION || 'your-region',
  // Pre-signed URL endpoint usually comes from your backend
  UPLOAD_ENDPOINT: process.env.REACT_APP_AWS_UPLOAD_URL || '/api/upload-url',
};
