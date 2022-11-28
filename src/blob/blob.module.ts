import { BlobServiceClient } from '@azure/storage-blob';
import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import {
  BLOB_STORAGE_CLIENT,
  BLOB_STORAGE_OPTIONS,
  CONNECTION_VARIABLE,
} from './blob.constants';
import {
  ModuleAsyncOptions,
  ModuleOptions,
  OptionsFactory,
} from './blob.interface';
import { BlobStorageService } from './blob.service';

@Module({
  providers: [BlobStorageService],
  exports: [BlobStorageService],
})
export class BlobStorageModule {
  public static forRoot(options: ModuleOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: BlobStorageModule,
      providers: [
        {
          provide: BLOB_STORAGE_CLIENT,
          scope: options.scope || Scope.DEFAULT,
          useValue: this.instantiate(options),
        },
      ],
    };
  }

  public static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      useFactory: (options: ModuleOptions) => this.instantiate(options),
      provide: BLOB_STORAGE_CLIENT,
      scope: options.scope || Scope.DEFAULT,
      inject: [BLOB_STORAGE_OPTIONS],
    };
    return {
      global: options.isGlobal,
      imports: options.imports || [],
      module: BlobStorageModule,
      providers: [...this.createAsyncProviders(options), provider],
    };
  }

  private static createAsyncProviders(
    optionsAsync: ModuleAsyncOptions,
  ): Provider[] {
    if (optionsAsync.useExisting || optionsAsync.useFactory) {
      return [this.createAsyncOptionsProvider(optionsAsync)];
    }
    if (optionsAsync.useClass) {
      return [
        this.createAsyncOptionsProvider(optionsAsync),
        {
          provide: optionsAsync.useClass,
          useClass: optionsAsync.useClass,
        },
      ];
    }
    throw Error(
      'One of useClass, useFactory or useExisting should be provided',
    );
  }

  private static createAsyncOptionsProvider(
    options: ModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: BLOB_STORAGE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const provider: Provider = {
      provide: BLOB_STORAGE_OPTIONS,
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
