import { GenerationOptions } from './types';

class OpenAIService {
  private apiKey: string | undefined;
  private model: string = 'gpt-4o-mini';
  private baseURL: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  setModel(model: string): void {
    this.model = model;
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
  }

  async generateComponent(
    description: string,
    category: string,
    options: GenerationOptions
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = this.buildPrompt(description, category, options);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert web developer specialized in creating beautiful, modern, and functional HTML/CSS/JavaScript components. Generate complete, production-ready code that uses Tailwind CSS for styling. Always return ONLY the HTML code with inline styles using Tailwind classes. Do not include explanations or markdown code blocks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate component');
      }

      const data = await response.json();
      const generatedCode = data.choices[0]?.message?.content;

      if (!generatedCode) {
        throw new Error('No code generated');
      }

      return this.cleanGeneratedCode(generatedCode);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async enhanceComponent(
    existingCode: string,
    enhancementRequest: string,
    category: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `
I have an existing ${category} component with the following code:

${existingCode}

Please enhance it with the following requirements:
${enhancementRequest}

Return ONLY the enhanced HTML code with Tailwind CSS classes. Make sure the enhancement maintains the original structure while improving it based on the requirements.
    `.trim();

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert web developer specialized in enhancing and improving existing HTML/CSS/JavaScript components. Return ONLY the enhanced HTML code with Tailwind CSS classes. Do not include explanations or markdown code blocks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to enhance component');
      }

      const data = await response.json();
      const enhancedCode = data.choices[0]?.message?.content;

      if (!enhancedCode) {
        throw new Error('No enhanced code generated');
      }

      return this.cleanGeneratedCode(enhancedCode);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  private buildPrompt(
    description: string,
    category: string,
    options: GenerationOptions
  ): string {
    const styleDescriptions: Record<string, string> = {
      modern: 'clean lines, contemporary design, subtle shadows',
      minimal: 'simple, lots of whitespace, essential elements only',
      bold: 'strong colors, large typography, attention-grabbing',
      elegant: 'sophisticated, refined, premium feel'
    };

    const complexityLevels: Record<string, string> = {
      simple: 'basic structure with essential elements',
      medium: 'well-balanced with multiple sections and features',
      complex: 'detailed with advanced features and interactions'
    };

    return `
Create a ${options.style} ${category} component with the following requirements:

Description: ${description}

Design Requirements:
- Style: ${styleDescriptions[options.style] || options.style}
- Color Scheme: ${options.colorScheme} color palette
- Complexity: ${complexityLevels[options.complexity] || options.complexity}
- Responsive: ${options.responsive ? 'Must be fully responsive for mobile, tablet, and desktop' : 'Desktop-focused design'}

Technical Requirements:
- Use Tailwind CSS utility classes for all styling
- Include proper semantic HTML5 elements
- Add hover states and transitions for interactive elements
- Ensure accessibility with proper ARIA labels and semantic tags
- Use modern design patterns and best practices

Return ONLY the complete HTML code with Tailwind CSS classes. Do NOT include any explanations, markdown formatting, or code block syntax.
    `.trim();
  }

  private cleanGeneratedCode(code: string): string {
    let cleaned = code.trim();

    cleaned = cleaned.replace(/```html\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');

    cleaned = cleaned.replace(/^[^<]*/, '');
    cleaned = cleaned.replace(/[^>]*$/, '');

    return cleaned.trim();
  }
}

export const openaiService = new OpenAIService();
