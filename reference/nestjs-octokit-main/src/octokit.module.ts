import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import { Octokit } from 'octokit';
import { OCTOKIT, OCTOKIT_OPTIONS } from './octokit.constants';
import { ModuleAsyncOptions, ModuleOptions, OptionsFactory } from './octokit.interface';
import { OctokitService } from './octokit.service';

@Module({
  providers: [OctokitService],
  exports: [OctokitService],
})
export class OctokitModule {
  public static forRoot(options: ModuleOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: OctokitModule,
      providers: [
        {
          provide: OCTOKIT,
          scope: options.scope || Scope.DEFAULT,
          useValue: this.instantiate(options),
        },
      ],
    };
  }

  public static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const OctokitProvider: Provider = {
      useFactory: (options: ModuleOptions) => this.instantiate(options),
      provide: OCTOKIT,
      scope: options.scope || Scope.DEFAULT,
      inject: [OCTOKIT_OPTIONS],
    };
    return {
      global: options.isGlobal,
      imports: options.imports || [],
      module: OctokitModule,
      providers: [...this.createAsyncProviders(options), OctokitProvider],
    };
  }

  private static createAsyncProviders(optionsAsync: ModuleAsyncOptions): Provider[] {
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
    throw Error('One of useClass, useFactory or useExisting should be provided');
  }
  private static createAsyncOptionsProvider(options: ModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: OCTOKIT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const provider: Provider = {
      provide: OCTOKIT_OPTIONS,
      useFactory: async (optionsFactory: OptionsFactory) => await optionsFactory.createOptions(),
    };
    if (options.useExisting) provider.inject = [options.useExisting];
    if (options.useClass) provider.inject = [options.useClass];
    return provider;
  }

  private static instantiate(options: ModuleOptions): Octokit {
    let MyOctokit = Octokit;

    if (options.plugins) {
      MyOctokit = MyOctokit.plugin(...options.plugins);
    }
    let instanceOptions: ModuleOptions['octokitOptions'] = {
      ...options.octokitOptions,
    };
    if (typeof instanceOptions?.auth === 'function') {
      instanceOptions.auth = instanceOptions.auth();
    }
    return new MyOctokit(instanceOptions);
  }
}
