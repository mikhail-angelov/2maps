declare module "aws-sdk" {
  export class S3 {
    constructor(options?: {
      endpoint?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
      signatureVersion?: string;
    });

    listObjectsV2(
      params: { Bucket: string; Prefix?: string },
      callback: (err: AWSError, data: S3.Types.ListObjectsV2Output) => void
    ): void;

    getSignedUrlPromise(
      operation: "getObject",
      params: { Bucket: string; Key: string; Expires?: number }
    ): Promise<string>;
  }

  export interface AWSError {
    code?: string;
    message?: string;
    statusCode?: number;
    retryable?: boolean;
  }

  export namespace S3 {
    export namespace Types {
      export interface ListObjectsV2Output {
        Contents?: S3Object[];
        IsTruncated?: boolean;
        NextContinuationToken?: string;
        Name?: string;
        Prefix?: string;
        KeyCount?: number;
        MaxKeys?: number;
        ContinuationToken?: string;
      }

      export interface S3Object {
        Key?: string;
        LastModified?: Date;
        ETag?: string;
        Size?: number;
        StorageClass?: string;
      }
    }
  }
}