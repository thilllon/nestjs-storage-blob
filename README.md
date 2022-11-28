# nestjs-blob-storage

Azure Blob Storage module for Nest.js

# Why?

- Nest.js with [@azure/storage-blob](https://www.npmjs.com/package/@azure/storage-blob)

- [@nestjs/azure-storage](https://www.npmjs.com/package/@nestjs/azure-storage)
  - does not provide the method to upload a file using presigned url
  - does not provide multiple authentication methods
  - does not provide method to upload files directly to Azure without passing through my server

# How?

## Setup

```sh
yarn add nestjs-blob-storage @azure/storage-blob
```

### Options #1

```ts
// app.module.ts

import { Module } from '@nestjs/common';
import { BlobStorageModule } from 'nestjs-blob-storage';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BlobStorageModule.forRoot({
      connection: process.env.NEST_AZURE_STORAGE_BLOB_CONNECTION,
      isGlobal: true, // optional
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Option #2

```ts
// app.module.ts

import { Module } from '@nestjs/common';
import { BlobStorageModule } from 'nestjs-blob-storage';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BlobStorageModule.forRootAsync({
      useFactory: () => ({
        connection: process.env.NEST_AZURE_STORAGE_BLOB_CONNECTION,
      }),
      isGlobal: true, // optional
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Usage

```ts
// app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { BlobStorageService } from 'nestjs-blob-storage';

@Controller()
export class AppController {
  constructor(private readonly blobService: BlobStorageService) {}

  @Get('/')
  async getSas() {
    const containerName = 'mycontainer';
    const fileName = 'test.txt';
    const expiresOn = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);

    const accountSasUrl = await this.blobService.getAccountSasUrl();

    const containerSasUrl = await this.blobService.getContainerSasUrl(
      containerName,
    );

    const blobSasUrl = await this.blobService.getBlockBlobSasUrl(
      containerName,
      fileName,
      { add: true, create: true, read: true, delete: true },
      { expiresOn },
    );

    return { accountSasUrl, containerSasUrl, blobSasUrl };
  }
}
```

```ts
// For example, let's assume that we are in the browser-side.

// Get blob SAS URL which will be endpoint of uploading file
const res = await axios.get('https://example.com/block-blob-sas');
const sasUrl = res.data.blobSasUrl;

// Upload a file directly to Azure Blob Storage which reduces the load on the server
// Make a `FormData` instance and set the file data to upload
const formData = new FormData();
formData.append('file', file);

// Don't forget to set header
const uploadResponse = await axios.put(blobSasUrl, formData, {
  header: { 'x-ms-blob-type': 'BlockBlob' },
});
console.log(uploadReponse.status); // 201 Created
```

# Roadmap

- [ ] add test code
- [ ] add other authentication method [link](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob/samples/v12/typescript)

# Reference

- https://www.youtube.com/watch?v=hIAKzDz09tc

- https://blog.devgenius.io/manage-azure-blob-storage-in-nestjs-daf5cb5125d4

- https://www.youtube.com/watch?v=Z9HeNZ8lmi4

- https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md

- https://docs.microsoft.com/ko-kr/azure/storage/blobs/quickstart-blobs-javascript-browser

- https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview

- https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html

- https://github.com/Azure-Samples/functions-node-sas-token/blob/master/GetSasToken-Node/index.js#L18

- https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob/samples/v12/typescript

# Contribution

## Install

```sh
# to test locally
yarn add link:./path/to/nestjs-blob-storage
```

## Publish

```sh
# DO NOT USE YARN: 2FA error occurs when using yarn
npm run release
```

## Test

```sh
# set environment variable at ".env.test"
NEST_AZURE_STORAGE_BLOB_CONNECTION="DefaultEndpointsProtocol=https;AccountName=<ACCOUNT_NAME>;AccountKey=<ACCOUNT_KEY>;EndpointSuffix=core.windows.net"
```
