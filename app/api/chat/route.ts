import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { 
  searchInventory, 
  getPriceRanking,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '@/lib/actions/inventory';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful food inventory assistant. You have access to a food inventory database.

When users ask questions about food items, prices, or inventory:
1. For general searches: use getInventoryInfo tool
2. For most/least expensive: use getPriceRanking tool
3. To add new items: use addInventoryItem tool
4. To update existing items: use updateInventoryItem tool  
5. To remove items: use deleteInventoryItem tool
6. Provide detailed information including names, descriptions, and prices
7. If no relevant items found, suggest similar alternatives

For CRUD operations:
- When adding items, confirm the details before creating
- When updating, search for the item first to get its ID
- When deleting, confirm the item name before deletion
- Always report the result of the operation

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
            `• ${item.name} - ${item.priceFormatted}\n  ${item.description}\n  ID: ${item.id}`
          ).join('\n\n');

          return `Found ${results.length} relevant items for "${query}":\n\n${formattedResults}`;
        },
      }),
      getPriceRanking: tool({
        description: `Get items ranked by price (highest or lowest). Use this when users ask for most/least expensive items, price rankings, or budget options.`,
        parameters: z.object({
          type: z.enum(['highest', 'lowest']).describe('whether to get highest or lowest priced items'),
          limit: z.number().optional().default(5).describe('number of items to return (default 5)'),
        }),
        execute: async ({ type, limit }) => {
          const results = await getPriceRanking(type, limit);
          
          if (results.length === 0) {
            return `Unable to retrieve price ranking at this time.`;
          }

          const title = type === 'highest' ? 'Most Expensive Items:' : 'Cheapest Items:';
          const formattedResults = results.map(item => 
            `${item.rank}. ${item.name} - ${item.priceFormatted}\n   ${item.description}`
          ).join('\n\n');

          return `${title}\n\n${formattedResults}`;
        },
      }),
      addInventoryItem: tool({
        description: `Add a new item to the inventory database. Use when users want to add new food items.`,
        parameters: z.object({
          name: z.string().describe('the name of the food item'),
          price: z.number().describe('the price in cents (e.g., 599 for $5.99)'),
          description: z.string().describe('detailed description of the item'),
        }),
        execute: async ({ name, price, description }) => {
          const result = await createInventoryItem({ name, price, description });
          
          if (!result.success) {
            return `Failed to add item: ${result.error}`;
          }

          return `Successfully added new item:\n\n${result.item.name} - ${result.item.priceFormatted}\n${result.item.description}\n\nThe item has been added to the inventory and is now searchable!`;
        },
      }),
      updateInventoryItem: tool({
        description: `Update an existing item in the inventory. Search for the item first to get its ID.`,
        parameters: z.object({
          id: z.string().describe('the ID of the item to update'),
          name: z.string().optional().describe('new name for the item'),
          price: z.number().optional().describe('new price in cents'),
          description: z.string().optional().describe('new description'),
        }),
        execute: async ({ id, name, price, description }) => {
          const updates = {
            ...(name && { name }),
            ...(price !== undefined && { price }),
            ...(description && { description })
          };

          const result = await updateInventoryItem(id, updates);
          
          if (!result.success) {
            return `Failed to update item: ${result.error}`;
          }

          return `Successfully updated item:\n\n${result.item.name} - ${result.item.priceFormatted}\n${result.item.description}\n\nThe item's information and search index have been updated!`;
        },
      }),
      deleteInventoryItem: tool({
        description: `Delete an item from the inventory. Search for the item first to confirm and get its ID.`,
        parameters: z.object({
          id: z.string().describe('the ID of the item to delete'),
        }),
        execute: async ({ id }) => {
          const result = await deleteInventoryItem(id);
          
          if (!result.success) {
            return `Failed to delete item: ${result.error}`;
          }

          return `Successfully deleted item: ${result.deletedItem.name}\n\nThe item has been removed from the inventory and search index.`;
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}