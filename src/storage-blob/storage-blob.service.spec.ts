import { BlobServiceClient } from '@azure/storage-blob';
import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import {
  STORAGE_BLOB_CLIENT,
  CONNECTION_VARIABLE,
} from './storage-blob.constants';
import { StorageBlobService } from './storage-blob.service';

dotenv.config({ path: '.env.test' });

describe('StorageBlobService', () => {
  let service: StorageBlobService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StorageBlobService,
        {
          provide: STORAGE_BLOB_CLIENT,
          useValue: BlobServiceClient.fromConnectionString(
            process.env[CONNECTION_VARIABLE],
          ),
        },
      ],
    }).compile();

    service = module.get(StorageBlobService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  it('should return', async () => {
    const { sasUrl } = service.getAccountSasUrl();
    expect(typeof sasUrl).toBe('string');
    expect(typeof sasUrl).toBe('string');
    expect(typeof sasUrl).toBe('string');
    expect(typeof sasUrl).toBe('string');
    expect(typeof sasUrl).toBe('string');
    expect(typeof sasUrl).toBe('string');
    expect(typeof sasUrl).toBe('string');
  });
});
