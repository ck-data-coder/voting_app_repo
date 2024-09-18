import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import dotenv from 'dotenv'
dotenv.config()

const accountName = process.env.STORAGE_ACCOUNT_NAME;
const accountKey = process.env.STORAGE_ACCOUNT_ACCESS_KEY;

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
);

async function generateBlobSasUrl( blobName) {
    const containerName = 'upload';
    // Get a reference to the container client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Get a reference to the specific blob (image file)
    const blobClient = containerClient.getBlobClient(blobName);

    // Set the expiry time for the SAS token (e.g., valid for 1 hour)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getMilliseconds() + 2000); // Token expires in 1 hour

    // Generate the SAS token with read permission
    const sasToken = generateBlobSASQueryParameters({
        containerName: containerClient.containerName,
        blobName: blobClient.name,
        permissions: BlobSASPermissions.parse('r'), // Read-only permission
        startsOn: new Date(), // Start immediately
        expiresOn: expiryTime // Expire after 1 hour
    }, sharedKeyCredential).toString();

    // Construct the full URL with the SAS token
    const sasUrl = `${blobClient.url}?${sasToken}`;
    
    return sasUrl;  // Return the dynamically generated SAS URL
}

export {generateBlobSasUrl}