import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { StorageBlobService } from 'nestjs-storage-blob';
import * as path from 'path';

// https://gist.github.com/binki/10ac3e91851b524546f8279733cdadad

@Controller()
export class AppController {
  constructor(private readonly storageBlobService: StorageBlobService) {}

  @Get('/')
  async getSas(
    @Query('containerName') containerName?: string,
    @Query('fileName') fileName?: string,
  ) {
    containerName = containerName || process.env.NEST_STORAGE_BLOB_CONTAINER;
    fileName = fileName || 'sample2.jpg';

    const expiresOn = new Date(new Date().getTime() + 3600 * 1000);
    const accountSas = await this.storageBlobService.getAccountSasUrl();
    const containerSas = await this.storageBlobService.getContainerSasUrl(
      containerName,
      { add: true, read: true },
      { expiresOn },
    );

    const blobSas = await this.storageBlobService.getBlockBlobSasUrl(
      containerName,
      fileName,
      { add: true, create: true, read: true, delete: true, write: true },
      { expiresOn },
    );

    const buffer = fs.readFileSync(path.join(process.cwd(), fileName));

    if (buffer) {
      await axios
        .put(blobSas.sasUrl, buffer, {
          headers: {
            ...blobSas.headers,
          },
        })
        .then((res) => {
          console.log(res.status);
        })
        .catch((err: any) => {
          console.error(err.message);
        });
    }

    return {
      accountSas,
      containerSas,
      blobSas,
    };
  }
}
