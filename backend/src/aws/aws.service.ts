import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UploadFile extends Express.Multer.File {
  buffer: Buffer;
}

@Injectable()
export class AwsService {
  private s3Client: S3Client;
  private lambdaClient: LambdaClient;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow('aws.bucketName');

    this.s3Client = new S3Client({
      region: configService.getOrThrow('aws.region'),
      credentials: {
        accessKeyId: configService.getOrThrow('aws.accessId'),
        secretAccessKey: configService.getOrThrow('aws.secretAccessKey'),
      },
    });

    this.lambdaClient = new LambdaClient({
      region: configService.getOrThrow('aws.region'),
      credentials: {
        accessKeyId: configService.getOrThrow('aws.accessId'),
        secretAccessKey: configService.getOrThrow('aws.secretAccessKey'),
      },
    });
  }

  async uploadFile(
    file: UploadFile,
    id: number,
    folder: string = 'resumes',
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = file.originalname.split('.').shift();
    const uniqueKey = `${folder}/${fileName}_${id}.${fileExtension}`;

    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: uniqueKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      return `https://${this.bucketName}.s3.${this.configService.get('aws.region')}.amazonaws.com/${uniqueKey}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload file to S3.');
    }
  }

  async predict(job_description: string, applicants_number: number) {
    const command = new InvokeCommand({
      FunctionName: 'resume-ranking-function',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        job_description,
        top_k: applicants_number,
        s3_bucke: this.configService.get<string>('aws.bucketName') || 'talentscope',
      }),
    });

    try {
      const response = await this.lambdaClient.send(command);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responsePayload: Record<string, string | number> = JSON.parse(
        new TextDecoder().decode(response.Payload),
      );

      if (responsePayload.statusCode !== 200) {
        throw new Error(`Lambda Error: ${responsePayload.body}`);
      }

      return JSON.parse(responsePayload.body as string) as Record<string, any>;
    } catch (error) {
      console.error('Error triggering process pdf lambda', error);
      throw error;
    }
  }
}
