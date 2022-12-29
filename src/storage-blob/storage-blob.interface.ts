import { StoragePipelineOptions } from '@azure/storage-blob';
import { ModuleMetadata, Scope, Type } from '@nestjs/common';

export type PartialModuleOptions = {
  storageOptions?: StoragePipelineOptions;
  scope?: Scope;
  connection: string;
};

export type ModuleOptions = PartialModuleOptions & {
  isGlobal?: boolean;
};

export type OptionsFactory = {
  createOptions(): Promise<PartialModuleOptions> | PartialModuleOptions;
};

export type ModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
  isGlobal?: boolean;
  useExisting?: Type<OptionsFactory>;
  useClass?: Type<OptionsFactory>;
  useFactory?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<PartialModuleOptions> | PartialModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
  scope?: Scope;
};

export type GetAccountSasUrlResponse = {
  sasUrl: string;
  headers: Record<string, string | number>;
};

export type GetContainerSasUrlResponse = {
  sasUrl: string;
  headers: Record<string, string | number>;
};

export type GetBlockBlobSasUrlResponse = {
  sasUrl: string;
  headers: Record<string, string | number>;
};
