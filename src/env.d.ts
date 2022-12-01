declare module NodeJS {
  interface ProcessEnv {
    NEST_STORAGE_BLOB_CONNECTION: string;
    NEST_STORAGE_BLOB_CONTAINER: string;
  }
}
