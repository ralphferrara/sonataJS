//*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata.js :: Core Classes
//|| Cloud Wrapper for Azure Blob Storage
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Imports
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      import app from "../../app.js";
      import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
      import { CloudFile } from '../.interfaces.js';

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Azure Blob Storage
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      export default class CloudAzure {

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Name
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public name: string;
            public config: any;

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Cloud Azure
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            constructor(cloudName: string, config: any) {
                  this.name = cloudName;
                  this.config = config;
            };

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Create Blob Service Client
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async createBlobServiceClient(): Promise<BlobServiceClient> {
                  const sharedKeyCredential = new StorageSharedKeyCredential(
                        this.config.accountName,
                        this.config.accountKey
                  );

                  return new BlobServiceClient(
                        `https://${this.config.accountName}.blob.core.windows.net`,
                        sharedKeyCredential
                  );
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Write a File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async write(containerName: string, files: CloudFile[]): Promise<boolean> {
                  app.log('CloudAzure: write()', 'info');
                  const blobServiceClient = await this.createBlobServiceClient();
                  const containerClient = blobServiceClient.getContainerClient(containerName);
                  let success = true;

                  for (const file of files) {
                        try {
                              const blockBlobClient   = containerClient.getBlockBlobClient(file.path);
                              const uploadResponse    = await blockBlobClient.uploadData(file.data);
                              app.log(`Uploaded file ${file.path}`, 'info');
                              console.log(uploadResponse);
                        } catch (error) {
                              console.error(`Error uploading file ${file.path}:`, error);
                              success = false;
                        }
                  }
                  return success;
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Delete a File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async delete(containerName: string, fileName: string): Promise<boolean> {
                  app.log('CloudAzure: delete()', 'info');
                  const blobServiceClient = await this.createBlobServiceClient();
                  const containerClient = blobServiceClient.getContainerClient(containerName);

                  try {
                        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
                        await blockBlobClient.delete();
                        app.log(`Deleted file ${fileName}`, 'info');
                        return true;
                  } catch (error) {
                        console.error(`Error deleting file ${fileName}:`, error);
                        return false;
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Rename a File
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public async rename(containerName: string, oldName: string, newName: string): Promise<boolean> {
                  app.log('CloudAzure: rename()', 'info');
                  const blobServiceClient = await this.createBlobServiceClient();
                  const containerClient = blobServiceClient.getContainerClient(containerName);
          
                  try {
                      const sourceBlobClient = containerClient.getBlockBlobClient(oldName);
                      const destinationBlobClient = containerClient.getBlockBlobClient(newName);
          
                      // Start a copy operation from the source blob to the destination blob
                      const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
          
                      // Wait for the copy operation to complete
                      await copyPoller.pollUntilDone();
          
                      // Delete the source blob
                      await sourceBlobClient.delete();
          
                      app.log(`Renamed file from ${oldName} to ${newName}`, 'info');
                      return true;
                  } catch (error) {
                      console.error(`Error renaming file from ${oldName} to ${newName}:`, error);
                      return false;
                  }
              }


      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| End Class
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

}
