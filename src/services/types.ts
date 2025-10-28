export interface GenerationOptions {
    style: string;
    colorScheme: string;
    complexity: string;
    responsive: boolean;
  }
  
  export interface AIGenerationRequest {
    description: string;
    category: string;
    options: GenerationOptions;
  }
  
  export interface AIGenerationResponse {
    html: string;
    css?: string;
    js?: string;
  }
  