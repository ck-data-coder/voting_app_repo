// import pkg from '@azure/ms-rest-js';
 import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { ComputerVisionClient }  from '@azure/cognitiveservices-computervision';
// import { CognitiveServicesCredentials } from '@azure/ms-rest-js';
import dotenv from 'dotenv'
import { downloadImageFromAzure } from './fileupload.js';
import { generateBlobSasUrl } from './SASgenerate.js';
dotenv.config()
import { promisify } from 'util';
const sleep = promisify(setTimeout);
// const { CognitiveServicesCredentials } = pkg;
const key = process.env.IMAGE_TEXT_EXTRACT_KEY; 
const endpoint = process.env.IMAGE_TEXT_EXTRACT_ENDPOINT;

// const credentials = new CognitiveServicesCredentials(key);
const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const client = new ComputerVisionClient(credentials, endpoint);


async function findAadhaarNumberAndDOB(textResults) {


    const aadhaarPattern =/\b\d{4}\s\d{4}\s\d{4}\b/; // Aadhaar number pattern (4-4-4 digits)
    const DOBPattern=/\bDOB\s*:\s*(\d{2}\/\d{2}\/\d{4})/i;
    const VIDPattern = /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/;
    let aadhaarCandidates = [];
    let dobCandidates = [];
   

    textResults.forEach(line => {
        let cleanedText = line.text.replace(/\s+/g, ' ').trim();
        const confidence = line.confidence;
        const matchVID = cleanedText.match(VIDPattern);
        if (matchVID) {
            console.log('VID found:', matchVID[0]);
            // Remove the VID from the text to prevent it from being interpreted as an Aadhaar number
            cleanedText = cleanedText.replace(matchVID[0], '');
        }
        const aadhaarMatch = cleanedText.match(aadhaarPattern);
        if (aadhaarMatch) {
            aadhaarCandidates.push({
                aadhaar: aadhaarMatch[0],
                confidence: confidence
            });
        }

        const dobMatch = cleanedText.match(DOBPattern);
        if (dobMatch) {
            dobCandidates.push({
                dob: dobMatch[1],
                confidence: confidence
            });
        }

    });

    aadhaarCandidates.sort((a, b) => b.confidence - a.confidence);
    dobCandidates.sort((a, b) => b.confidence - a.confidence);

   console.log("aadharcandidate="+JSON.stringify(aadhaarCandidates))
   console.log('dobcandidates='+JSON.stringify(dobCandidates))

   if ( aadhaarCandidates.length > 1 && dobCandidates.length > 0) {
       
    return [aadhaarCandidates[1].aadhaar ,dobCandidates[0].dob]; // Returns the Aadhaar number
    }

   else if ( aadhaarCandidates.length > 0 && dobCandidates.length > 0) {
       
        return [aadhaarCandidates[0].aadhaar ,dobCandidates[0].dob]; // Returns the Aadhaar number
    }

     else {
        return ["",""]; // If no Aadhaar number is found
    }
}

async function extractTextFromImage(blobUrl) {
    console.log('Reading text from image...');
try{
    let result = await client.read(blobUrl, { modelVersion: 'latest', readingOrder: 'natural' , language: 'en'});
    console.log('read result= ' +JSON.stringify(result, null, 2))
    // const operationLocation = result['operationLocation'];
    //     console.log('Operation Location:', operationLocation);
    const operation = result.operationLocation.split('/').slice(-1)[0];
    console.log('Operation:', operation);
  
    while (result.status !== "succeeded") { await sleep(1000); result = await client.getReadResult(operation); }
    return result.analyzeResult.readResults; 
}
catch(err){
console.log(err)
}
}
    
 async function extractAadharAndDOB(blobURL){
    try {
     return  await generateBlobSasUrl(blobURL).then(async(res)=>{
        console.log('Generated SAS URL:', res);
            // const imageBuffer = await downloadImageFromAzure(blobURL);
   return await  extractTextFromImage(res)
    .then(async(readResults) => {
        let textData = [];
        readResults.forEach((page) => {
            page.lines.forEach((line) => {
                textData.push({
                    text: line.text,
                    confidence: line.appearance ? line.appearance.style.confidence : 0 // Default to confidence 1 if not provided
                });
              
            });
        });
        console.log('textdata= '+JSON.stringify(textData))
      return await findAadhaarNumberAndDOB(textData)

    })
    .catch((err) => console.error('Error reading text from image:', err));

       })
       .catch(()=>{})
       
    } catch (error) {
        console.error('Error generating SAS URL:', error.message);
    }
 }

export {extractAadharAndDOB}