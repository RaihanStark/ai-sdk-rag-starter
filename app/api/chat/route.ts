import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  searchInventory,
  getPriceRanking,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/lib/actions/inventory";
import { executeSqlQuery } from "@/lib/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful restaurant operations assistant. You have access to food inventory, employee, and shift databases.

DATABASE SCHEMA:
1. inventory table: id, name, price (in cents), description, created_at, updated_at
2. employees table: id, employee_code, first_name, last_name, email, phone, role, department, hourly_rate, overtime_rate, employment_type, employment_status, hire_date, average_rating, total_shifts_worked, total_hours_worked, max_hours_per_week, min_hours_per_week, can_work_weekends, can_work_holidays, preferred_shift
3. shifts table: id, employee_id, shift_date, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, break_duration, status, shift_type, role, station, scheduled_hours, actual_hours, regular_hours, overtime_hours, hourly_rate, total_pay, sales_generated, customers_served, tables_served, drinks_served, dishes_produced, manager_notes, labor_cost_percentage, productivity_score

When users ask questions about food items, prices, or inventory:
1. For general searches: use getInventoryInfo tool
2. For most/least expensive: use getPriceRanking tool
3. To add new items: use addInventoryItem tool
4. To update existing items: use updateInventoryItem tool  
5. To remove items: use deleteInventoryItem tool

When users ask about employees, shifts, or labor analytics:
- Use executeSqlQuery to query the employees and shifts tables
- Common queries include:
  - Employee lists by department/role
  - Shift schedules and coverage
  - Labor cost analysis (total_pay / sales_generated)
  - Overtime tracking
  - Productivity metrics
  - Staff performance ratings
  - Scheduling patterns

For data visualization:
- Use generateChart tool for visual representations
- Ideal for showing labor costs over time, department comparisons, productivity trends

Be conversational and helpful. Provide insights and recommendations based on the data.`,
    messages,
    tools: {
      getInventoryInfo: tool({
        description: `Search the food inventory database for items, prices, and information. Use this for any food-related questions.`,
        parameters: z.object({
          query: z
            .string()
            .describe(
              "search query for food items, ingredients, or categories"
            ),
        }),
        execute: async ({ query }) => {
          const results = await searchInventory(query);

          if (results.length === 0) {
            return `No matching items found for "${query}". Try searching for other food items, ingredients, or categories.`;
          }

          const formattedResults = results
            .map(
              (item) =>
                `• ${item.name} - ${item.priceFormatted}\n  ${item.description}\n  ID: ${item.id}`
            )
            .join("\n\n");

          return `Found ${results.length} relevant items for "${query}":\n\n${formattedResults}`;
        },
      }),
      getPriceRanking: tool({
        description: `Get items ranked by price (highest or lowest). Use this when users ask for most/least expensive items, price rankings, or budget options.`,
        parameters: z.object({
          type: z
            .enum(["highest", "lowest"])
            .describe("whether to get highest or lowest priced items"),
          limit: z
            .number()
            .optional()
            .default(5)
            .describe("number of items to return (default 5)"),
        }),
        execute: async ({ type, limit }) => {
          const results = await getPriceRanking(type, limit);

          if (results.length === 0) {
            return `Unable to retrieve price ranking at this time.`;
          }

          const title =
            type === "highest" ? "Most Expensive Items:" : "Cheapest Items:";
          const formattedResults = results
            .map(
              (item) =>
                `${item.rank}. ${item.name} - ${item.priceFormatted}\n   ${item.description}`
            )
            .join("\n\n");

          return `${title}\n\n${formattedResults}`;
        },
      }),
      addInventoryItem: tool({
        description: `Add a new item to the inventory database. Use when users want to add new food items.`,
        parameters: z.object({
          name: z.string().describe("the name of the food item"),
          price: z
            .number()
            .describe("the price in cents (e.g., 599 for $5.99)"),
          description: z.string().describe("detailed description of the item"),
        }),
        execute: async ({ name, price, description }) => {
          const result = await createInventoryItem({
            name,
            price,
            description,
          });

          if (!result.success) {
            return `Failed to add item: ${result.error}`;
          }

          return `Successfully added new item:\n\n${result.item?.name} - ${result.item?.priceFormatted}\n${result.item?.description}\n\nThe item has been added to the inventory and is now searchable!`;
        },
      }),
      updateInventoryItem: tool({
        description: `Update an existing item in the inventory. Search for the item first to get its ID.`,
        parameters: z.object({
          id: z.string().describe("the ID of the item to update"),
          name: z.string().optional().describe("new name for the item"),
          price: z.number().optional().describe("new price in cents"),
          description: z.string().optional().describe("new description"),
        }),
        execute: async ({ id, name, price, description }) => {
          const updates = {
            ...(name && { name }),
            ...(price !== undefined && { price }),
            ...(description && { description }),
          };

          const result = await updateInventoryItem(id, updates);

          if (!result.success) {
            return `Failed to update item: ${result.error}`;
          }

          return `Successfully updated item:\n\n${result.item?.name} - ${result.item?.priceFormatted}\n${result.item?.description}\n\nThe item's information and search index have been updated!`;
        },
      }),
      deleteInventoryItem: tool({
        description: `Delete an item from the inventory. Search for the item first to confirm and get its ID.`,
        parameters: z.object({
          id: z.string().describe("the ID of the item to delete"),
        }),
        execute: async ({ id }) => {
          const result = await deleteInventoryItem(id);

          if (!result.success) {
            return `Failed to delete item: ${result.error}`;
          }

          return `Successfully deleted item: ${result.deletedItem?.name}\n\nThe item has been removed from the inventory and search index.`;
        },
      }),
      generateChart: tool({
        description: `Generate a chart visualization for inventory data. Use this when users ask to see charts, graphs, or visualizations.`,
        parameters: z.object({
          type: z
            .enum(["bar", "line", "pie", "area"])
            .describe("The type of chart to generate"),
          title: z.string().describe("The title of the chart"),
          data: z
            .array(
              z.object({
                name: z.string().describe("Label for the data point"),
                value: z.number().describe("Numeric value for the data point"),
                category: z
                  .string()
                  .optional()
                  .describe("Optional category for grouping"),
              })
            )
            .describe("Array of data points for the chart"),
          xAxisLabel: z.string().optional().describe("Label for the X-axis"),
          yAxisLabel: z.string().optional().describe("Label for the Y-axis"),
          colorScheme: z
            .enum(["default", "warm", "cool", "pastel"])
            .optional()
            .default("default")
            .describe("Color scheme for the chart"),
        }),
        execute: async ({
          type,
          title,
          data,
          xAxisLabel,
          yAxisLabel,
          colorScheme,
        }) => {
          // Return a special artifact format that the UI can recognize and render
          return {
            artifact: {
              type: "chart",
              chartType: type,
              title,
              data,
              xAxisLabel,
              yAxisLabel,
              colorScheme,
            },
          };
        },
      }),
      executeSqlQuery: tool({
        description: `Execute a custom SQL query on the inventory database. Use this for complex data analysis, custom reports, or when users ask for specific database queries. Only SELECT queries are allowed for security.`,
        parameters: z.object({
          query: z.string().describe("The SQL SELECT query to execute"),
        }),
        execute: async ({ query }) => {
          const result = await executeSqlQuery(query);

          if (!result.success) {
            return `SQL Query failed: ${result.error}`;
          }

          if (result.rowCount === 0) {
            return `Query executed successfully but returned no results.\n\nQuery: ${query}`;
          }

          // Format the results in a readable way
          const formattedData = JSON.stringify(result.data, null, 2);

          return `Query executed successfully! Found ${result.rowCount} row(s).\n\nQuery: ${query}\n\nResults:\n\`\`\`json\n${formattedData}\n\`\`\``;
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
