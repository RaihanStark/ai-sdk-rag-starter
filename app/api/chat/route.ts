import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { searchInventory } from '@/lib/actions/inventory';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful food inventory assistant. You have access to a food inventory database.

When users ask questions about food items, prices, or inventory:
1. ALWAYS use the getInventoryInfo tool to search for relevant items
2. Provide detailed information including names, descriptions, and prices
3. If asking about price comparisons, show multiple options
4. For recipe suggestions, find relevant ingredients with prices
5. If no relevant items found, suggest similar alternatives or say you don't have that item

Be conversational and helpful. Always include prices when discussing items.`,
    messages,
    tools: {
      getInventoryInfo: tool({
        description: `Search the food inventory database for items, prices, and information. Use this for any food-related questions.`,
        parameters: z.object({
          query: z.string().describe('search query for food items, ingredients, or categories'),
        }),
        execute: async ({ query }) => {
          const results = await searchInventory(query);
          
          if (results.length === 0) {
            return `No matching items found for "${query}". Try searching for other food items, ingredients, or categories.`;
          }

          const formattedResults = results.map(item => 
            `• ${item.name} - ${item.priceFormatted}\n  ${item.description}`
          ).join('\n\n');

          return `Found ${results.length} relevant items for "${query}":\n\n${formattedResults}`;
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}