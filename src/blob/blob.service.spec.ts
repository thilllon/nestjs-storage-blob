import { BlobServiceClient } from '@azure/storage-blob';
import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { BLOB_STORAGE_CLIENT } from './blob.constants';
import { BlobStorageService } from './blob.service';

dotenv.config({ path: '.env.test' });

describe('BlobStorageService', () => {
  let service: BlobStorageService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BlobStorageService,
        {
          provide: BLOB_STORAGE_CLIENT,
          useValue: BlobServiceClient.fromConnectionString(
            process.env.AZURE_CONNECTION,
          ),
        },
      ],
    }).compile();

    service = module.get(BlobStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  it('should return', () => {
    expect(service.getAccountSasUrl()).toBeTruthy();
  });
});
