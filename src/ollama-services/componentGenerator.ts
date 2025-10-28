import { ollamaService } from './ollama';
import { trainingDataService } from './trainingData';

interface GenerateOptions {
  style: string;
  colorScheme: string;
  complexity: string;
  responsive: boolean;
}

export class ComponentGeneratorService {
  async generateComponent(
    description: string,
    category: string,
    options: GenerateOptions
  ): Promise<string> {
    const examples = trainingDataService.getExamplesForCategory(category);
    const examplesContext = examples.length > 0
      ? `\n\nHere are examples of ${category} components for reference:\n\n${examples.join('\n\n---\n\n')}`
      : '';

    const prompt = this.buildPrompt(description, category, options, examplesContext);
    const response = await ollamaService.generate(prompt, 0.7);
    return this.extractCode(response);
  }

  private buildPrompt(
    description: string,
    category: string,
    options: GenerateOptions,
    examplesContext: string
  ): string {
    return `You are an expert React and Tailwind CSS developer. Generate a React component.

REQUIREMENTS:
- Description: ${description}
- Category: ${category}
- Style: ${options.style}
- Color Scheme: ${options.colorScheme}
- Complexity: ${options.complexity}
- Responsive: ${options.responsive ? 'Yes' : 'No'}

INSTRUCTIONS:
1. Use React with TypeScript
2. Use Tailwind CSS classes only
3. Use lucide-react for icons if needed
4. Match the ${options.style} design aesthetic
5. Use ${options.colorScheme} colors
6. ${options.responsive ? 'Make it fully responsive' : 'Desktop only'}
7. Return ONLY the component code${examplesContext}

Generate the React component now:`;
  }

  private extractCode(response: string): string {
    const codeBlockRegex = /```(?:tsx?|javascript|jsx)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    if (response.includes('import') && response.includes('export')) {
      return response.trim();
    }

    return response.trim();
  }
}

export const componentGeneratorService = new ComponentGeneratorService();
