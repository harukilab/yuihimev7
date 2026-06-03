import { ToolModule } from '../../../include/types';
import manifest from './manifest.json';

export const FileReadTool: ToolModule = {
  metadata: manifest as any,
  execute: async (args: any) => {
    const res = await fetch(`/api/tools/files/read?filename=${encodeURIComponent(args.filename)}`);
    return res.json();
  }
};
