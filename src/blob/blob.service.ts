import {
  AccountSASPermissions,
  BlobGenerateSasUrlOptions,
  BlobSASPermissions,
  BlobServiceClient,
  ContainerGenerateSasUrlOptions,
  ContainerSASPermissions,
  ServiceGenerateAccountSasUrlOptions,
} from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { BLOB_STORAGE_CLIENT } from './blob.constants';

@Injectable()
export class BlobService {
  constructor(
    @Inject(BLOB_STORAGE_CLIENT)
    private readonly blobServiceClient: BlobServiceClient,
  ) {}

  private getContainerClient(containerName: string) {
    return this.blobServiceClient.getContainerClient(containerName);
  }

  getAccountSasUrl(
    expiresOn = new Date(Date.now() + 5 * 60 * 1000),
    permissionsString = 'r',
    resourceTypes = 'container',
    options?: ServiceGenerateAccountSasUrlOptions,
  ) {
    // https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md
    // https://docs.microsoft.com/ko-kr/azure/storage/blobs/quickstart-blobs-javascript-browser
    // https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview
    // https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html
    // https://github.com/Azure-Samples/functions-node-sas-token/blob/master/GetSasToken-Node/index.js#L18

    const permissions = this.convertToPermissions(
      new AccountSASPermissions(),
      permissionsString,
    );

    const accountSasUrl = this.blobServiceClient.generateAccountSasUrl(
      expiresOn,
      permissions,
      resourceTypes,
      options,
    );

    return accountSasUrl;
  }

  async getContainerSasUrl(
    containerName: string,
    options?: Omit<ContainerGenerateSasUrlOptions, 'permissions'>,
    permissionsString = 'rwac',
  ) {
    const permissions = this.convertToPermissions(
      new ContainerSASPermissions(),
      permissionsString,
    );

    const sasUrl = await this.getContainerClient(containerName).generateSasUrl({
      ...options,
      permissions,
    });

    return sasUrl;
  }

  async getBlockBlobSasUrl(
    containerName: string,
    blobName: string,
    permissionsString = 'r',
    options?: Omit<BlobGenerateSasUrlOptions, 'permissions'>,
  ) {
    const permissions = this.convertToPermissions(
      new BlobSASPermissions(),
      permissionsString,
    );

    const sasUrl = await this.getContainerClient(containerName)
      .getBlockBlobClient(blobName)
      .generateSasUrl({
        ...options,
        permissions,
      });

    return sasUrl;
  }

  private convertToPermissions<
    T extends
      | AccountSASPermissions
      | ContainerSASPermissions
      | BlobSASPermissions,
  >(perm: T, permissions: string): T {
    if (permissions.includes('a')) {
      perm.add = true;
    }
    if (permissions.includes('c')) {
      perm.create = true;
    }
    if (permissions.includes('d')) {
      perm.delete = true;
    }
    if (permissions.includes('v')) {
      perm.deleteVersion = true;
    }
    if (permissions.includes('p')) {
      perm.permanentDelete = true;
    }
    if (permissions.includes('r')) {
      perm.read = true;
    }
    if (permissions.includes('w')) {
      perm.write = true;
    }

    if (perm instanceof AccountSASPermissions) {
      if (permissions.includes('l')) {
        perm.list = true;
      }

      if (permissions.includes('u')) {
        perm.update = true;
      }
    }

    if (perm instanceof ContainerSASPermissions) {
      if (permissions.includes('e')) {
        perm.execute = true;
      }
      if (permissions.includes('m')) {
        perm.move = true;
      }
      if (permissions.includes('l')) {
        perm.list = true;
      }
    }

    if (perm instanceof BlobSASPermissions) {
      if (permissions.includes('e')) {
        perm.execute = true;
      }
      if (permissions.includes('m')) {
        perm.move = true;
      }
    }

    return perm;
  }
}
