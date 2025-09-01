/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    clutchcut: {
      pickFile: (filters?: any)=>Promise<any>;
      ffprobe: (path: string)=>Promise<any>;
      startAnalysis: (path: string)=>Promise<any>;
      cancelAnalysis: ()=>Promise<void>;
      onProgress: (cb: (p:any)=>void)=>void;
    };
  }
}
export {};