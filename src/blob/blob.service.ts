import {
  AccountSASPermissions,
  AccountSASPermissionsLike,
  AccountSASResourceTypes,
  BlobGenerateSasUrlOptions,
  BlobSASPermissions,
  BlobSASPermissionsLike,
  BlobServiceClient,
  ContainerGenerateSasUrlOptions,
  ContainerSASPermissions,
  ContainerSASPermissionsLike,
  ServiceGenerateAccountSasUrlOptions,
} from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { BLOB_STORAGE_CLIENT } from './blob.constants';

// https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md
// https://docs.microsoft.com/ko-kr/azure/storage/blobs/quickstart-blobs-javascript-browser
// https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview
// https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html
// https://github.com/Azure-Samples/functions-node-sas-token/blob/master/GetSasToken-Node/index.js#L18

@Injectable()
export class BlobStorageService {
  constructor(
    @Inject(BLOB_STORAGE_CLIENT)
    private readonly blobServiceClient: BlobServiceClient,
  ) {}

  private getContainerClient(containerName: string) {
    return this.blobServiceClient.getContainerClient(containerName);
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
    const __permissions = AccountSASPermissions.from(permissions);
    const resourceTypes = this.convertToResourceTypes(resourceTypeMap);
    const accountSasUrl = this.blobServiceClient.generateAccountSasUrl(
      expiresOn,
      __permissions,
      resourceTypes,
      options,
    );

    return accountSasUrl;
  }

  async getContainerSasUrl(
    containerName: string,
    options?: Omit<ContainerGenerateSasUrlOptions, 'permissions'>,
    permissions: ContainerSASPermissionsLike = { read: true },
  ) {
    const __permissions = ContainerSASPermissions.from(permissions);
    const sasUrl = await this.getContainerClient(containerName).generateSasUrl({
      ...options,
      permissions: __permissions,
    });

    return sasUrl;
  }

  async getBlockBlobSasUrl(
    containerName: string,
    blobName: string,
    permissions: BlobSASPermissionsLike = { read: true },
    options?: Omit<BlobGenerateSasUrlOptions, 'permissions'>,
  ) {
    const __permissions = BlobSASPermissions.from(permissions);
    const sasUrl = await this.getContainerClient(containerName)
      .getBlockBlobClient(blobName)
      .generateSasUrl({
        ...options,
        permissions: __permissions,
      });

    // how to use this sasURl?
    // PUT {{sasUrl}} with header 'x-ms-blob-type: BlockBlob'
    // header setting is mendatory
    // and attach file to body

    // how to revoke sasUrl after upload?
    // https://stackoverflow.com/questions/26206993/how-to-revoke-shared-access-signature-in-azure-sdk
    // https://www.youtube.com/watch?v=lFFYcNbDvdo

    return sasUrl;
  }
}
