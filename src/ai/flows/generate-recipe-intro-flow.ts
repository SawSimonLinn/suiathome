'use server';
/**
 * @fileOverview A Genkit flow for generating engaging recipe intros and cooking tips.
 *
 * - generateRecipeIntro - A function that generates an intro story and cooking tips for a recipe.
 * - GenerateRecipeIntroInput - The input type for the generateRecipeIntro function.
 * - GenerateRecipeIntroOutput - The return type for the generateRecipeIntro function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeIntroInputSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients in the recipe.'),
});
export type GenerateRecipeIntroInput = z.infer<typeof GenerateRecipeIntroInputSchema>;

const GenerateRecipeIntroOutputSchema = z.object({
  storyOrIntro: z.string().describe('An engaging story or introduction about the dish.'),
  cookingTips: z.string().describe('Creative and useful cooking tips for the recipe.'),
});
export type GenerateRecipeIntroOutput = z.infer<typeof GenerateRecipeIntroOutputSchema>;

export async function generateRecipeIntro(
  input: GenerateRecipeIntroInput
): Promise<GenerateRecipeIntroOutput> {
  return generateRecipeIntroFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeIntroPrompt',
  input: {schema: GenerateRecipeIntroInputSchema},
  output: {schema: GenerateRecipeIntroOutputSchema},
  prompt: `You are a world-renowned culinary expert and food writer. Your task is to craft an engaging, descriptive story or introduction for a recipe, and provide creative and useful cooking tips. The tone should be warm, inviting, and inspiring, making the reader eager to try the dish. The story should be about 100-150 words and the cooking tips should be a concise paragraph.

Here is the recipe information:
Recipe Title: {{{title}}}
Ingredients: {{#each ingredients}}- {{{this}}}
{{/each}}

Based on the title and ingredients, generate a compelling story/intro and practical cooking tips.`,
});

const generateRecipeIntroFlow = ai.defineFlow(
  {
    name: 'generateRecipeIntroFlow',
    inputSchema: GenerateRecipeIntroInputSchema,
    outputSchema: GenerateRecipeIntroOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
