import { BlobServiceClient } from '@azure/storage-blob';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import {
  CONNECTION_VARIABLE,
  STORAGE_BLOB_CLIENT,
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

  it('should check account SAS URL', async () => {
    const { sasUrl, headers } = await service.getAccountSasUrl();
    expect(typeof sasUrl).toBe('string');
    expect(sasUrl.startsWith('https://')).toBe(true);
    expect(headers).toBeTruthy();
  });

  it('should check container SAS URL ', async () => {
    const { sasUrl, headers } = await service.getContainerSasUrl(
      'test',
      { add: true },
      { expiresOn: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7) },
    );
    expect(typeof sasUrl).toBe('string');
    expect(sasUrl.startsWith('https://')).toBe(true);
    expect(headers).toBeTruthy();
  });

  it('should check block BLOB SAS URL', async () => {
    const { sasUrl, headers } = await service.getBlockBlobSasUrl(
      'mycontainer',
      'myfile.txt',
      { add: true, create: true },
    );
    expect(typeof sasUrl).toBe('string');
    expect(sasUrl.startsWith('https://')).toBe(true);
    expect(headers).toBeTruthy();
  });

  it('should be valid URL', async () => {
    const fileName = 'image.jpg';
    const containerName = process.env.NEST_STORAGE_BLOB_CONTAINER;

    const { sasUrl, headers } = await service.getBlockBlobSasUrl(
      containerName,
      fileName,
      { add: true, create: true },
      { expiresOn: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7) },
    );

    const buffer = fs.readFileSync(
      path.join(process.cwd(), '__test__', 'fixture', fileName),
    );
    const { data, status } = await axios.put(sasUrl, buffer, { headers });
    expect(status).toBe(201);
    expect(data).toBeTruthy();
  });

  // TODO: complete test case
  // it('should upload files', () => {
  //   // https://gist.github.com/binki/10ac3e91851b524546f8279733cdadad
  //   expect(true).toBe(true);
  // });
});
