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
      { add: true, read: true },
      { expiresOn },
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
