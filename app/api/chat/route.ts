import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls (required getInformation tool call).
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know.". Tools are: getInformation.`,
    messages,
    tools: {
      getInformation: tool({
        description: `get information from the knowledge base.`,
        parameters: z.object({
          question: z.string().describe('the question to search the knowledge base'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toDataStreamResponse();
}