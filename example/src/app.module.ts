import { Module } from '@nestjs/common';
import { BlobStorageModule } from 'nestjs-storage-blob';
import { AppController } from './app.controller';

@Module({
  imports: [
    BlobStorageModule.forRootAsync({
      isGlobal: false,
      useFactory: () => ({
        connection: process.env.NEST_STORAGE_BLOB_CONNECTION,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
