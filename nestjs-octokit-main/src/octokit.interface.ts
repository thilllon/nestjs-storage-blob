import { ModuleMetadata, Scope, Type } from '@nestjs/common';
import { Octokit } from 'octokit';

export interface ModuleOptions {
  isGlobal?: boolean;
  octokitOptions?: ConstructorParameters<typeof Octokit>[0];
  plugins?: Parameters<typeof Octokit['plugin']>;
  scope?: Scope;
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
