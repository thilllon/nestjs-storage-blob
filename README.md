# why?

- nestjs with [@azure/storage-blob](https://www.npmjs.com/package/@azure/storage-blob)

- [@nestjs/azure-storage](https://www.npmjs.com/package/@nestjs/azure-storage) does not provide the method to upload using presigned url

# how?

## setup

```sh
yarn add nestjs-blob-storage @azure/storage-blob
```

### options #1

```ts
// app.module.ts

import { Module } from '@nestjs/common';
import { BlobStorageModule } from 'nestjs-blob-storage';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CONNECTION_VARIABLE } from './blob.constants';

@Module({
  imports: [
    BlobStorageModule.forRoot({
      connection: process.env[CONNECTION_VARIABLE],
      isGlobal: true, // optional
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### option #2

```ts
// app.module.ts

import { Module } from '@nestjs/common';
import { BlobStorageModule } from 'nestjs-blob-storage';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CONNECTION_VARIABLE } from './blob.constants';

@Module({
  imports: [
    BlobStorageModule.forRootAsync({
      useFactory: () => ({
        connection: process.env[CONNECTION_VARIABLE],
      }),
      isGlobal: true, // optional
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## usage

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
const formData = new FormData();
formData.append('file', file); // file to upload

axios.put(blobSasUrl, {}).then((res) => {
  //
});
```

# roadmap

- [ ] add test code
- [ ] add other authentication method (https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob/samples/v12/typescript)

# reference

- https://www.youtube.com/watch?v=hIAKzDz09tc

- https://blog.devgenius.io/manage-azure-blob-storage-in-nestjs-daf5cb5125d4

- https://www.youtube.com/watch?v=Z9HeNZ8lmi4

- https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md

- https://docs.microsoft.com/ko-kr/azure/storage/blobs/quickstart-blobs-javascript-browser

- https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview

- https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html

- https://github.com/Azure-Samples/functions-node-sas-token/blob/master/GetSasToken-Node/index.js#L18

- https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob/samples/v12/typescript

# contribution

## install

```sh
# to test locally
yarn add link:./path/to/nestjs-blob-storage
```

## publish

```sh
# DO NOT USE YARN: 2FA error occurs when using yarn
npm run release
```

## test

```sh
# set environment variable at ".env.test"
NEST_AZURE_STORAGE_BLOB_CONNECTION="DefaultEndpointsProtocol=https;AccountName=<ACCOUNT_NAME>;AccountKey=<ACCOUNT_KEY>;EndpointSuffix=core.windows.net"
```
