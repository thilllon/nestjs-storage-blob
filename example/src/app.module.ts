import { Module } from '@nestjs/common';
import { StorageBlobModule } from 'nestjs-storage-blob';
import { AppController } from './app.controller';

@Module({
  imports: [
    StorageBlobModule.forRootAsync({
      useFactory: () => ({
        connection: process.env.NEST_STORAGE_BLOB_CONNECTION,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
