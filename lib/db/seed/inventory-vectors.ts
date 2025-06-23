import { db } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";
import { embeddings } from "@/lib/db/schema/embeddings";
import { generateEmbedding } from "@/lib/ai/embedding";
import { sql, inArray, eq } from "drizzle-orm";
import { nanoid } from "@/lib/utils";

export async function vectorizeAllInventory() {
  try {
    console.log("🔄 Starting inventory vectorization...");
    
    // Get all inventory items
    const items = await db.select().from(inventory);
    
    if (items.length === 0) {
      console.log("⚠️ No inventory items found to vectorize");
      return;
    }

    console.log(`📦 Found ${items.length} inventory items to vectorize`);

    let processed = 0;
    let failed = 0;

    for (const item of items) {
      try {
        // Create rich content string with price and category info
        const content = `${item.name}: ${item.description}. Price: $${(item.price / 100).toFixed(2)}`;
        
        console.log(`⏳ Processing: ${item.name}...`);
        
        // Generate embedding
        const embedding = await generateEmbedding(content);
        
        // Delete existing embedding for this inventory item (if any)
        await db.delete(embeddings).where(eq(embeddings.inventoryId, item.id));
        
        // Store new embedding directly linked to inventory
        await db.insert(embeddings).values({
          id: nanoid(),
          inventoryId: item.id,
          content,
          embedding,
        });

        processed++;
        console.log(`✅ [${processed}/${items.length}] Vectorized: ${item.name}`);
        
        // Small delay to avoid OpenAI rate limiting (60 RPM = 1 per second)
        await new Promise(resolve => setTimeout(resolve, 1100));
        
      } catch (error) {
        failed++;
        console.error(`❌ Failed to vectorize "${item.name}":`, error);
        
        // Continue with next item instead of stopping
        continue;
      }
    }

    console.log(`\n🎉 Vectorization complete!`);
    console.log(`✅ Successfully processed: ${processed} items`);
    console.log(`❌ Failed: ${failed} items`);
    console.log(`📊 Success rate: ${((processed / items.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error("❌ Error during vectorization:", error);
    throw error;
  }
}

export async function clearInventoryEmbeddings() {
  try {
    console.log("🧹 Clearing inventory embeddings...");
    
    // Delete all embeddings that have inventoryId (all are inventory-related now)
    const result = await db.delete(embeddings);
    
    console.log(`✅ Cleared all inventory embeddings`);
    
  } catch (error) {
    console.error("❌ Error clearing inventory embeddings:", error);
    throw error;
  }
}

export async function syncInventoryVectors() {
  try {
    console.log("🔄 Syncing inventory vectors...");
    
    // First clear existing embeddings
    await clearInventoryEmbeddings();
    
    // Then vectorize all current inventory
    await vectorizeAllInventory();
    
    console.log("✨ Inventory vector sync complete!");
    
  } catch (error) {
    console.error("❌ Error syncing inventory vectors:", error);
    throw error;
  }
}

// Helper function to check sync status
export async function checkVectorSyncStatus() {
  try {
    const inventoryCount = await db.select({ count: sql<number>`count(*)` }).from(inventory);
    
    // Count embeddings linked to inventory items
    const vectorCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(embeddings)
      .innerJoin(inventory, eq(embeddings.inventoryId, inventory.id));
    
    const inventoryTotal = inventoryCount[0]?.count || 0;
    const vectorTotal = vectorCount[0]?.count || 0;
    
    console.log(`📊 Sync Status:`);
    console.log(`   Inventory items: ${inventoryTotal}`);
    console.log(`   Vectorized items: ${vectorTotal}`);
    console.log(`   Sync percentage: ${inventoryTotal > 0 ? ((vectorTotal / inventoryTotal) * 100).toFixed(1) : 0}%`);
    
    return {
      inventoryCount: inventoryTotal,
      vectorCount: vectorTotal,
      isFullySynced: inventoryTotal === vectorTotal && inventoryTotal > 0
    };
    
  } catch (error) {
    console.error("❌ Error checking sync status:", error);
    throw error;
  }
}