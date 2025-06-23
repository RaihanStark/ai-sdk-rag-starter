# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI SDK RAG (Retrieval-Augmented Generation) starter project built with Next.js 14 App Router. It implements a chatbot that stores and retrieves information from a knowledge base using vector embeddings and similarity search.

## Common Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server on http://localhost:3000

# Database operations (Drizzle ORM with PostgreSQL)
npm run db:generate  # Generate migrations after schema changes
npm run db:migrate   # Apply pending migrations
npm run db:push      # Push schema directly (dev only)
npm run db:studio    # Open Drizzle Studio GUI

# Code quality
npm run lint         # Run ESLint
npm run build        # Build for production (also runs type checking)
```

## Architecture & Key Components

### Core Flow
1. User sends message → `/app/api/chat/route.ts`
2. System checks if it needs to store new information (`addResource` tool) or retrieve existing information (`getInformation` tool)
3. For retrieval: Generates embedding → Searches similar vectors in PostgreSQL → Returns relevant context
4. For storage: Saves content → Splits into chunks → Generates embeddings → Stores in database

### Key Files
- `/app/api/chat/route.ts`: Main chat API endpoint with RAG logic
- `/lib/ai/embedding.ts`: Handles OpenAI embeddings generation
- `/lib/db/schema/`: Database schema definitions (resources & embeddings tables)
- `/lib/actions/resources.ts`: Server actions for resource CRUD operations

### Database Schema
- **resources**: Stores raw content (id, content, createdAt, updatedAt)
- **embeddings**: Stores content chunks with vector embeddings for similarity search
  - Uses pgvector extension with HNSW index for performance

### Environment Variables
Required in `.env.local`:
- `DATABASE_URL`: PostgreSQL connection string (must include pgvector extension)
- `OPENAI_API_KEY`: For embeddings and chat completion

## Tech Stack Specifics

- **UI Components**: Uses shadcn-ui (Radix UI + Tailwind). Components are in `/components/ui/`
- **State Management**: Server actions + React hooks (useChat from Vercel AI SDK)
- **Vector Search**: PostgreSQL with pgvector, using cosine similarity for finding relevant content
- **Embeddings**: OpenAI's text-embedding-ada-002 model (1536 dimensions)

## Development Notes

- The chatbot only responds based on its knowledge base - it will decline to answer questions about topics not in its stored resources
- Vector similarity threshold is set to 0.5 for relevant results
- Content is automatically chunked (1000 chars with 200 char overlap) when creating embeddings
- All database operations use Drizzle ORM with type-safe schema