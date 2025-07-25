import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
export class S3Service {
  private s3: S3Client;

  constructor() {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
      throw new Error('Missing required AWS configuration (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, or AWS_S3_BUCKET)');
    }
    console.log('AWS_REGION:', process.env.AWS_REGION); // Debug log
    console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET); // Debug log
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION, // Use environment variable
    });
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }
    const params = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3.send(command);
     return key;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw error;
    }
  }
  async getPresignedUrl(key: string): Promise<string> {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 3600, // URL expires in 1 hour (adjust as needed)
    };

    try {
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error('S3 Presigned URL Error:', error);
      throw error;
    }
  }
  async deleteFile(key: string): Promise<void> {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }
    const params = {
      Bucket: bucket,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw error;
    }
  }
}