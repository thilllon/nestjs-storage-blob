import { BlobServiceClient } from '@azure/storage-blob';
import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import {
  STORAGE_BLOB_CLIENT,
  STORAGE_BLOB_OPTIONS,
  CONNECTION_VARIABLE,
} from './storage-blob.constants';
import {
  ModuleAsyncOptions,
  ModuleOptions,
  OptionsFactory,
} from './storage-blob.interface';
import { StorageBlobService } from './storage-blob.service';

@Module({
  providers: [StorageBlobService],
  exports: [StorageBlobService],
})
export class BlobStorageModule {
  static forRoot(options: ModuleOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: BlobStorageModule,
      providers: [
        {
          provide: STORAGE_BLOB_CLIENT,
          scope: options.scope || Scope.DEFAULT,
          useValue: this.instantiate(options),
        },
      ],
    };
  }

  static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      useFactory: (options: ModuleOptions) => this.instantiate(options),
      provide: STORAGE_BLOB_CLIENT,
      scope: options.scope || Scope.DEFAULT,
      inject: [STORAGE_BLOB_OPTIONS],
    };
    return {
      global: options.isGlobal,
      imports: options.imports ?? [],
      module: BlobStorageModule,
      providers: [...this.createAsyncProviders(options), provider],
    };
  }

  private static createAsyncProviders(
    optionsAsync: ModuleAsyncOptions,
  ): Provider[] {
    if (optionsAsync.useExisting || optionsAsync.useFactory) {
      return [this.createAsyncOptionsProvider(optionsAsync)];
    } else if (optionsAsync.useClass) {
      return [
        this.createAsyncOptionsProvider(optionsAsync),
        {
          provide: optionsAsync.useClass,
          useClass: optionsAsync.useClass,
        },
      ];
    }

    throw new Error(
      'One of useClass, useFactory or useExisting should be provided',
    );
  }

  private static createAsyncOptionsProvider(
    options: ModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: STORAGE_BLOB_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }

    const provider: Provider = {
      provide: STORAGE_BLOB_OPTIONS,
      useFactory: async (optionsFactory: OptionsFactory) =>
        await optionsFactory.createOptions(),
    };
    if (options.useExisting) {
      provider.inject = [options.useExisting];
    }
    if (options.useClass) {
      provider.inject = [options.useClass];
    }
    return provider;
  }

  private static instantiate(options: ModuleOptions): BlobServiceClient {
    if (!options.connection) {
      throw new Error(
        `Environment variable is required: "${CONNECTION_VARIABLE}"`,
      );
    }

    return BlobServiceClient.fromConnectionString(
      options.connection,
      options.storageOptions,
    );
  }
}
