import { seedInventory, clearInventory } from "@/lib/db/seed/inventory";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case "clear":
        await clearInventory();
        break;
      
      case "reset":
        await clearInventory();
        await seedInventory();
        break;
      
      default:
        // Default: just seed with predefined items
        await seedInventory();
        break;
    }
    
    console.log("✨ Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
}

main();