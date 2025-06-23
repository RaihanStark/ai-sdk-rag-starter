import { 
  vectorizeAllInventory, 
  clearInventoryEmbeddings, 
  syncInventoryVectors,
  checkVectorSyncStatus 
} from "@/lib/db/seed/inventory-vectors";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case "clear":
        await clearInventoryEmbeddings();
        break;
      
      case "vectorize":
        await vectorizeAllInventory();
        break;
      
      case "status":
        await checkVectorSyncStatus();
        break;
      
      case "sync":
      default:
        // Default: full sync (clear + vectorize)
        await syncInventoryVectors();
        break;
    }
    
    console.log("✨ Operation completed!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Operation failed:", error);
    process.exit(1);
  }
}

main();