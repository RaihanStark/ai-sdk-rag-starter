import { db } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";
import { embeddings } from "@/lib/db/schema/embeddings";
import { generateEmbedding } from "@/lib/ai/embedding";
import { cosineDistance, desc, gt, sql, eq } from "drizzle-orm";

export async function searchInventory(query: string) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      queryEmbedding,
    )})`;
    
    const results = await db
      .select({
        id: inventory.id,
        name: inventory.name,
        price: inventory.price,
        description: inventory.description,
        similarity,
        content: embeddings.content
      })
      .from(embeddings)
      .innerJoin(inventory, eq(embeddings.inventoryId, inventory.id))
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(5);

    return results.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      priceFormatted: `$${(item.price / 100).toFixed(2)}`,
      description: item.description,
      similarity: item.similarity,
      content: item.content
    }));
  } catch (error) {
    console.error("Error searching inventory:", error);
    return [];
  }
}

export async function getAllInventory() {
  try {
    const items = await db.select().from(inventory);
    return items.map(item => ({
      ...item,
      priceFormatted: `$${(item.price / 100).toFixed(2)}`
    }));
  } catch (error) {
    console.error("Error getting all inventory:", error);
    return [];
  }
}

export async function getInventoryById(id: string) {
  try {
    const item = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, id))
      .limit(1);
      
    if (item.length === 0) return null;
    
    return {
      ...item[0],
      priceFormatted: `$${(item[0].price / 100).toFixed(2)}`
    };
  } catch (error) {
    console.error("Error getting inventory by ID:", error);
    return null;
  }
}