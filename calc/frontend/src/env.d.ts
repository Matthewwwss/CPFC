/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SBER_TOKEN: string;
  readonly VITE_INIT_PHRASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
