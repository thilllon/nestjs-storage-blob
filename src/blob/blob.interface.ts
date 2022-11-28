import { StoragePipelineOptions } from '@azure/storage-blob';
import { ModuleMetadata, Scope, Type } from '@nestjs/common';

export interface ModuleOptions {
  storageOptions?: StoragePipelineOptions;
  isGlobal?: boolean;
  scope?: Scope;
  connection: string;
}

export type _PartialModuleOptions = Omit<ModuleOptions, 'isGlobal'>;

export interface OptionsFactory {
  createOptions(): Promise<_PartialModuleOptions> | _PartialModuleOptions;
}

export interface ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  useExisting?: Type<OptionsFactory>;
  useClass?: Type<OptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<_PartialModuleOptions> | _PartialModuleOptions;
  inject?: any[];
  scope?: Scope;
}
