import {
  AccountSASPermissions,
  AccountSASPermissionsLike,
  AccountSASResourceTypes,
  BlobGenerateSasUrlOptions,
  BlobItem,
  BlobSASPermissions,
  BlobSASPermissionsLike,
  BlobServiceClient,
  ContainerGenerateSasUrlOptions,
  ContainerSASPermissions,
  ContainerSASPermissionsLike,
  ServiceGenerateAccountSasUrlOptions,
} from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_BLOB_CLIENT } from './storage-blob.constants';
import {
  GetAccountSasUrlResponse,
  GetBlockBlobSasUrlResponse,
  GetContainerSasUrlResponse,
} from './storage-blob.interface';

/**
 * request headers
 * https://learn.microsoft.com/rest/api/storageservices/put-blob#request-headers-all-blob-types
 */
@Injectable()
export class StorageBlobService {
  private containerName?: string;

  constructor(
    @Inject(STORAGE_BLOB_CLIENT)
    private readonly blobServiceClient: BlobServiceClient,
  ) {
    this.containerName = process.env.NEST_STORAGE_BLOB_CONTAINER;
  }

  getClient() {
    return this.blobServiceClient;
  }

  convertToResourceTypes(
    resourceTypeMap: Omit<AccountSASResourceTypes, 'toString'> = {
      container: true,
      object: true,
      service: true,
    },
  ) {
    const resType = new AccountSASResourceTypes();
    if (resourceTypeMap.container) {
      resType.container = true;
    }
    if (resourceTypeMap.object) {
      resType.object = true;
    }
    if (resourceTypeMap.service) {
      resType.service = true;
    }
    return resType.toString();
  }

  getAccountSasUrl(
    expiresOn = new Date(Date.now() + 5 * 60 * 1000),
    permissions: AccountSASPermissionsLike = { read: true },
    resourceTypeMap: Omit<AccountSASResourceTypes, 'toString'> = {
      container: true,
      object: true,
      service: true,
    },
    options?: ServiceGenerateAccountSasUrlOptions,
  ) {
    const _permissions = AccountSASPermissions.from(permissions);
    const resourceTypes = this.convertToResourceTypes(resourceTypeMap);
    const accountSasUrl = this.blobServiceClient.generateAccountSasUrl(
      expiresOn,
      _permissions,
      resourceTypes,
      options,
    );

    const data: GetAccountSasUrlResponse = {
      sasUrl: accountSasUrl,
      headers: {},
    };

    return data;
  }

  async getContainerSasUrl(
    containerName: string,
    permissions: ContainerSASPermissionsLike = {
      read: true,
    },
    options: Omit<ContainerGenerateSasUrlOptions, 'permissions'> = {
      expiresOn: new Date(Date.now() + 5 * 60 * 1000),
    },
  ) {
    const _permissions = ContainerSASPermissions.from(permissions);
    const containerSasUrl = await this.blobServiceClient
      .getContainerClient(containerName)
      .generateSasUrl({
        ...options,
        permissions: _permissions,
      });

    const data: GetContainerSasUrlResponse = {
      sasUrl: containerSasUrl,
      headers: {},
    };

    return data;
  }

  async getBlockBlobSasUrl(
    containerName: string,
    blobName: string,
    permissions: BlobSASPermissionsLike = {
      read: true,
      create: true,
    },
    options: Omit<BlobGenerateSasUrlOptions, 'permissions'> = {},
  ) {
    // how to use this sasURl?
    // PUT {{sasUrl}} with header 'x-ms-blob-type: BlockBlob'
    // header setting is mendatory
    // and attach file to body

    // how to revoke sasUrl after upload?
    // https://stackoverflow.com/questions/26206993/how-to-revoke-shared-access-signature-in-azure-sdk
    // https://www.youtube.com/watch?v=lFFYcNbDvdo

    const _permissions = BlobSASPermissions.from(permissions);
    const sasUrl = await this.blobServiceClient
      .getContainerClient(containerName)
      .getBlockBlobClient(blobName)
      .generateSasUrl({
        ...options,
        permissions: _permissions,
      });

    const data: GetBlockBlobSasUrlResponse = {
      sasUrl,
      headers: { 'x-ms-blob-type': 'BlockBlob' },
    };
    return data;
  }

  async listFiles(destination: string, containerName: string) {
    const container = this.blobServiceClient.getContainerClient(containerName);
    const files = container.listBlobsFlat({ prefix: destination });
    const paths: BlobItem[] = [];
    for await (const file of files) {
      paths.push(file);
    }
    return paths;
  }

  async deleteFile(container: string, blob: string) {
    return this.blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(blob)
      .delete();
  }

  async deleteFileIfExists(container: string, blob: string) {
    return this.blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(blob)
      .deleteIfExists();
  }

  async downloadStream(container: string, blob: string) {
    return this.blobServiceClient
      .getContainerClient(container)
      .getBlockBlobClient(blob)
      .download();
  }
}
