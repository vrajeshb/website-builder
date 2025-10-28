interface OllamaGenerateParams {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
      temperature?: number;
      top_p?: number;
      top_k?: number;
    };
  }
  
  interface OllamaResponse {
    response: string;
    done: boolean;
  }
  
  export class OllamaService {
    private baseUrl: string;
    private model: string;
  
    constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama2') {
      this.baseUrl = baseUrl;
      this.model = model;
    }
  
    async generate(prompt: string, temperature: number = 0.7): Promise<string> {
      try {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt,
            stream: false,
            options: {
              temperature,
              top_p: 0.9,
              top_k: 40,
            },
          } as OllamaGenerateParams),
        });
  
        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }
  
        const data: OllamaResponse = await response.json();
        return data.response;
      } catch (error) {
        if (error instanceof Error && error.message.includes('fetch')) {
          throw new Error('Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434');
        }
        throw error;
      }
    }
  
    async checkConnection(): Promise<boolean> {
      try {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        return response.ok;
      } catch {
        return false;
      }
    }
  
    async listModels(): Promise<string[]> {
      try {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        if (!response.ok) return [];
  
        const data = await response.json();
        return data.models?.map((m: any) => m.name) || [];
      } catch {
        return [];
      }
    }
  
    setModel(model: string) {
      this.model = model;
    }
  }
  
  export const ollamaService = new OllamaService();  