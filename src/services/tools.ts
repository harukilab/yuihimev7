export interface ToolResponse {
  stdout?: string;
  stderr?: string;
  content?: string;
  success?: boolean;
  error?: string;
  files?: string[];
}

export class ToolService {
  static async execShell(command: string): Promise<ToolResponse> {
    const res = await fetch('/api/tools/shell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    return res.json();
  }

  static async writeFile(filename: string, content: string): Promise<ToolResponse> {
    const res = await fetch('/api/tools/files/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content })
    });
    return res.json();
  }

  static async readFile(filename: string): Promise<ToolResponse> {
    const res = await fetch(`/api/tools/files/read?filename=${encodeURIComponent(filename)}`);
    return res.json();
  }

  static async listFiles(): Promise<ToolResponse> {
    const res = await fetch('/api/tools/files/list');
    return res.json();
  }
}
