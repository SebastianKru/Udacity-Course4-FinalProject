import * as AWS from 'aws-sdk'
//#
import { String } from 'aws-sdk/clients/cloudsearch';


const urlExiration = process.env.SIGNED_URL_EXPIRATION
const S3 = new  AWS.S3({
    signatureVersion: 'v4'
})

// TODO: Implement the fileStogare logic
const bucket = process.env.ATTACHMENT_S3_BUCKET

export async function createUploadPresignedUrl(todoId:string): Promise<String>{
   
    const url = await S3.getSignedUrl("putObject", {
        Bucket: bucket,
        Key: todoId,
        Expires: parseInt(urlExiration)
    });
    return url;
    }