declare module 'node:fs/promises' {
  export function readFile(path: string): Promise<Uint8Array>;
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
}
