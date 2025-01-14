/* Sonata.js :: Core Classes
Cloud Wrapper for AWS S3 */

import app from "../../app.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { CloudFile } from '../.interfaces.js';

export default class CloudAWS {

    public name: string;
    public config: any;

    constructor(cloudName: string, config: any) {
        this.name = cloudName;
        this.config = config;
    };

    public createS3Client(): S3Client {
        return new S3Client({
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey
            }
        });
    }

    public async write(bucketName: string, files: CloudFile[]): Promise<boolean> {
        app.log('CloudAWS: write()', 'info');
        const s3 = this.createS3Client();
        const commands = files.map(file => new PutObjectCommand({
            Bucket: bucketName,
            Key: file.path,
            Body: file.data
        }));

        try {
            await Promise.all(commands.map(command => s3.send(command)));
            app.log(`Uploaded ${files.length} files to S3 bucket ${bucketName}`, 'info');
            return true;
        } catch (error) {
            console.error('Error uploading files to S3:', error);
            return false;
        }
    }

    public async delete(bucketName: string, fileName: string): Promise<boolean> {
        app.log('CloudAWS: delete()', 'info');
        const s3 = this.createS3Client();
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName
        });

        try {
            await s3.send(command);
            app.log(`Deleted file ${fileName} from S3 bucket ${bucketName}`, 'info');
            return true;
        } catch (error) {
            console.error(`Error deleting file ${fileName} from S3 bucket ${bucketName}:`, error);
            return false;
        }
    }

    public async rename(bucketName: string, oldName: string, newName: string): Promise<boolean> {
        app.log('CloudAWS: rename()', 'info');
        const s3 = this.createS3Client();
        const copyCommand = new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `/${bucketName}/${oldName}`,
            Key: newName
        });
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldName
        });

        try {
            await s3.send(copyCommand);
            await s3.send(deleteCommand);
            app.log(`Renamed file from ${oldName} to ${newName} in S3 bucket ${bucketName}`, 'info');
            return true;
        } catch (error) {
            console.error(`Error renaming file from ${oldName} to ${newName} in S3 bucket ${bucketName}:`, error);
            return false;
        }
    }
}
