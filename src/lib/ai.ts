import OpenAI from 'openai';
import { Component } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const aiService = {
  async generateWebsite(prompt: string, availableComponents: Component[]) {
    try {
      const componentsByCategory = availableComponents.reduce((acc, comp) => {
        if (!acc[comp.category]) acc[comp.category] = [];
        acc[comp.category].push({
          id: comp.id,
          name: comp.name,
          tags: comp.tags
        });
        return acc;
      }, {} as Record<string, any[]>);

      const systemMessage = `You are a professional web designer. Based on the user's requirements, select the most appropriate components from the available library and suggest a website structure.

Available components by category:
${Object.entries(componentsByCategory).map(([category, components]) => 
  `${category.toUpperCase()}: ${components.map(c => `${c.name} (${c.tags.join(', ')})`).join(', ')}`
).join('\n')}

Return a JSON response with:
{
  "selectedComponents": [
    {
      "componentId": "component-id",
      "reason": "why this component fits"
    }
  ],
  "structure": "Brief description of the suggested page structure",
  "additionalSuggestions": "Any additional recommendations"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Create a website for: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate website suggestions');
    }
  },

  async generateCustomComponent(description: string, category: string) {
    try {
      const systemMessage = `You are an expert frontend developer. Generate a complete HTML component based on the description.

Return a JSON response with:
{
  "name": "Component name",
  "html": "Complete HTML with Tailwind CSS classes",
  "description": "Brief description",
  "tags": ["tag1", "tag2", "tag3"]
}

Use modern, responsive design with Tailwind CSS classes. Ensure the HTML is semantic and accessible.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Create a ${category} component: ${description}` }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Component Generation Error:', error);
      throw new Error('Failed to generate component');
    }
  }
};