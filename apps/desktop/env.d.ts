declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    clutchcut: {
      pickFile: (filters?: any)=>Promise<any>;
      toCcFileUrl: (absPath: string) => string;
      ffprobe: (path: string)=>Promise<any>;
      startAnalysis: (opts: any) => Promise<{ events: any[]; clips: any[]; tookMs: number }>;
      cancelAnalysis: () => Promise<void>;
      onAnalysisProgress: (cb: (p:any)=>void) => void;
      onAnalysisDebugFrame: (cb:(p:{idx:number;t:number;path:string})=>void)=>void;
      onAnalysisFramesKept: (cb:(p:{dir:string})=>void)=>void;
      openPath: (p:string)=>Promise<string>;
    }
  }
}
export {};