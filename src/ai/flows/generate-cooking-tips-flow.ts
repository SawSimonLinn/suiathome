'use server';
/**
 * @fileOverview A Genkit flow for generating creative cooking tips based on recipe ingredients and steps.
 *
 * - generateCookingTips - A function that handles the cooking tips generation process.
 * - GenerateCookingTipsInput - The input type for the generateCookingTips function.
 * - GenerateCookingTipsOutput - The return type for the generateCookingTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCookingTipsInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients for the recipe.'),
  steps: z.array(z.string()).describe('A list of cooking steps for the recipe.'),
});
export type GenerateCookingTipsInput = z.infer<typeof GenerateCookingTipsInputSchema>;

const GenerateCookingTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('A list of creative and useful cooking tips for the recipe.'),
});
export type GenerateCookingTipsOutput = z.infer<typeof GenerateCookingTipsOutputSchema>;

export async function generateCookingTips(
  input: GenerateCookingTipsInput
): Promise<GenerateCookingTipsOutput> {
  return generateCookingTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCookingTipsPrompt',
  input: {schema: GenerateCookingTipsInputSchema},
  output: {schema: GenerateCookingTipsOutputSchema},
  prompt: `You are an expert chef and culinary instructor. Your task is to provide creative and useful cooking tips for a given recipe.

Based on the following ingredients and steps, suggest 3-5 unique and practical cooking tips that would enhance the home cook's experience or the dish's outcome. Focus on techniques, ingredient preparation, flavor enhancements, or common pitfalls to avoid.

Ingredients:
{{#each ingredients}}- {{{this}}}
{{/each}}

Steps:
{{#each steps}}- {{{this}}}
{{/each}}

Provide the tips as a JSON array of strings.
`,
});

const generateCookingTipsFlow = ai.defineFlow(
  {
    name: 'generateCookingTipsFlow',
    inputSchema: GenerateCookingTipsInputSchema,
    outputSchema: GenerateCookingTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
