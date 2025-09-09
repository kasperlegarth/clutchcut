export {};

declare global {
  interface Window {
    cc: { ping: () => Promise<string> };
  }
}
