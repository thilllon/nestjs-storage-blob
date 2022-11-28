import { BlobServiceClient } from '@azure/storage-blob';
import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { BLOB_STORAGE_CLIENT } from './blob.constants';
import { BlobStorageService } from './blob.service';

dotenv.config();

describe('BlobStorageService', () => {
  let service: BlobStorageService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BlobStorageService,
        {
          provide: BLOB_STORAGE_CLIENT,
          useValue: new BlobServiceClient(
            'https://<MY_ACCOUNT>.blob.core.windows.net?<SAS_STRING>',
          ),
          // useValue: BlobServiceClient.fromConnectionString(''),
        },
      ],
    }).compile();

    service = module.get(BlobStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  // it('should be able to interact with the Octokit instance', async () => {
  //   const response = await service.rest.search.repos({
  //     q: 'nestjs',
  //     per_page: 1,
  //   });
  //   expect(response.data).toBeDefined();
  // });
});
