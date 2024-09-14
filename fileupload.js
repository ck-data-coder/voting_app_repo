import   {BlobServiceClient} from '@azure/storage-blob';
import pkg from 'pdf-lib-plus-encrypt';
const { PDFDocument } = pkg;

import dotenv from 'dotenv'
dotenv.config()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'upload';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadFileToAzure = async (buffer, blobName) => {
    try {
     
      await containerClient.createIfNotExists(); // Ensure container exists
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(buffer);  // Upload the file buffer to Azure Blob Storage
      console.log(`File uploaded to Azure Blob Storage as ${blobName}`);
    } catch (error) {
      console.error('Error uploading to Azure Blob Storage:', error);
    }
  };


  const streamToBuffer = async (readableStream) => {
    const chunks = [];
    for await (const chunk of readableStream) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  };

  async function downloadImageFromAzure(blobName) {
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download();
    const downloadedImageBuffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    return downloadedImageBuffer;
  }

async function encryptFileAndStore(pdfFileBlob,blobName,userPassword,ownerPassword){
  
const pdfFile=await downloadImageFromAzure(pdfFileBlob)

try {
 
const pdfDoc=await PDFDocument.load(pdfFile)

 pdfDoc.encrypt({
  userPassword : userPassword,
  ownerPassword:ownerPassword,
  permissions: {
    printing: 'highResolution',
    modifying: false,
    copying: false,
    annotating: false,
    fillingForms: false,
    contentAccessibility: false,
    documentAssembly: false,
},
})
const pdfBytes = await pdfDoc.save();
const blockBlobClient = containerClient.getBlockBlobClient(blobName);

// Upload the PDF directly from buffer
await blockBlobClient.uploadData(Buffer.from(pdfBytes));
console.log(`PDF uploaded successfully to Azure as ${blobName}.`);
}
catch (error) {
  console.error('Error during PDF encryption and upload:', error.message);
  throw error;
}
}


async function deleteFolderInContainer(folderName) {
  try {
    let marker = undefined;
    do {
      // List blobs in the container with the folder prefix
      const listBlobsResponse = await containerClient.listBlobsFlat({
          prefix: folderName, // Prefix to filter blobs by folder name
      });

      for await (const blob of listBlobsResponse) {
          // Get the blob client for each blob
          const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
          
          // Delete the blob
          await blockBlobClient.delete();
          console.log(`Deleted blob: ${blob.name}`);
      }
      
      // Update the marker for the next page of results
      marker = listBlobsResponse.continuationToken;
  } while (marker); // Continue until there are no more pages of results
  console.log(`Folder '${folderName}' and its contents have been deleted successfully.`);

  let marker2 = undefined;
  do {
    // List blobs in the container with the folder prefix
    const listBlobsResponse = await containerClient.listBlobsFlat({
        prefix: folderName+"/bnw/", // Prefix to filter blobs by folder name
    });

    for await (const blob of listBlobsResponse) {
        // Get the blob client for each blob
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        
        // Delete the blob
        await blockBlobClient.delete();
        console.log(`Deleted blob: ${blob.name}`);
    }
    
    // Update the marker for the next page of results
    marker2 = listBlobsResponse.continuationToken;
} while (marker2); // Continue until there are no more pages of results
console.log(`Folder '${folderName}/bnw' and its contents have been deleted successfully.`);
} 
catch (error) {
    console.error('Error deleting folder in Azure Blob Storage:', error.message);
}
}

  export {uploadFileToAzure ,downloadImageFromAzure,streamToBuffer,encryptFileAndStore,deleteFolderInContainer}