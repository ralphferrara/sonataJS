//*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata.js :: Core Classes
//|| Cloud Wrapper for Google Cloud Storage
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Imports
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      import app                          from "../../app.js";
      import { Storage, Bucket }          from '@google-cloud/storage';
      import { CloudFile }                from '../.interfaces.js';

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Cloud Google
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      export default class CloudGoogle {

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Name
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public name   : string;
            public config : any;

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Cloud Google
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            constructor(cloudName : string, config : any) {
                  this.name             = cloudName;
                  this.config           = config;
            };

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Make Bucket Function
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async openBucket(cloudName : string, bucketName: string): Promise<Bucket> {
                  const accessStorage = new Storage({
                        keyFilename             : app.path("/config/credentials/" + this.config.credentials).abs()
                  });
                  return accessStorage.bucket(bucketName);
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Upload a Single File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            
            private uploadFile(bucket: Bucket, file: CloudFile): Promise<void> {
                  app.log('CloudGoogle : uploadFile() ' + file.path, 'info');
          
                  // Determine the content type based on the file extension
                  const extension = file.path.split('.').pop();
                  let contentType = 'application/octet-stream';
          
                  switch (extension) {
                      case 'webp': contentType = 'image/webp'; break;
                      case 'gif' : contentType = 'image/gif';  break;
                      case 'mp4' : contentType = 'video/mp4';  break;
                      case 'jpg' : contentType = 'video/mp4';  break;
                      case 'mov' : contentType = 'video/mov';  break;
                  }
          
                  const gcsFile = bucket.file(file.path);
                  const stream = gcsFile.createWriteStream({
                      metadata            : { contentType },
                      resumable           : false
                  });
          
                  return new Promise((resolve, reject) => {
                      stream.on('error', err => {
                          file.status = "ERROR";
                          console.error('Stream error:', err);
                          reject(err);
                      });
          
                      stream.on('finish', () => {
                          file.status = "SAVED";
                          resolve();
                      });
          
                      stream.end(file.data);
                  });
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Write a File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async write(bucketName: string, files: CloudFile[]): Promise<boolean> {
                  app.log('CloudGoogle : write()', 'info');
                  const myBucket = await this.openBucket(this.name, bucketName);
                  const uploadPromises = files.map(file => this.uploadFile(myBucket, file));          
                  return Promise.all(uploadPromises).then(() => {
                        return true;
                        console.log('All files uploaded successfully!')
                  }).catch((err) => {
                        console.error('Error uploading one or more files:', err)
                        return false;
                  });
            }            

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Delete a File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async delete(bucketName: string, fileName: string): Promise<boolean> {
                  app.log('CloudGoogle: delete()', 'info');
                  const myBucket    = await this.openBucket(this.name, bucketName);
                  const file        = myBucket.file(fileName);
                  try {
                        await file.delete();
                        app.log(`Deleted file ${fileName} from Google Cloud Storage bucket ${bucketName}`, 'info');
                        return true;
                  } catch (error) {
                        console.error(`Error deleting file ${fileName} from Google Cloud Storage bucket ${bucketName}:`, error);
                        return false;
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Rename a File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async rename(bucketName: string, oldName: string, newName: string): Promise<boolean> {
                  app.log('CloudGoogle: rename()', 'info');
                  const myBucket    = await this.openBucket(this.name, bucketName);
                  const file        = myBucket.file(oldName);
                  try {
                        await file.move(newName);
                        app.log(`Renamed file from ${oldName} to ${newName} in Google Cloud Storage bucket ${bucketName}`, 'info');
                        return true;
                  } catch (error) {
                        console.error(`Error renaming file from ${oldName} to ${newName} in Google Cloud Storage bucket ${bucketName}:`, error);
                        return false;
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| End Class
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      }
