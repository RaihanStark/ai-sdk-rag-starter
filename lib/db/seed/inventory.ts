import { db } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";

const foodInventoryItems = [
  // Fruits
  { name: "Organic Bananas", price: 299, description: "Fresh organic bananas, perfect for smoothies and snacking. Rich in potassium and fiber." },
  { name: "Gala Apples", price: 399, description: "Crisp and sweet Gala apples, great for lunch boxes and baking." },
  { name: "Fresh Strawberries", price: 599, description: "Sweet, juicy strawberries perfect for desserts and breakfast." },
  { name: "Navel Oranges", price: 449, description: "Seedless navel oranges packed with vitamin C and natural sweetness." },
  { name: "Avocados", price: 199, description: "Ripe Hass avocados, perfect for guacamole, toast, and salads." },
  { name: "Blueberries", price: 699, description: "Antioxidant-rich fresh blueberries, great for pancakes and yogurt." },
  { name: "Red Grapes", price: 499, description: "Sweet seedless red grapes, perfect for snacking and fruit salads." },
  { name: "Pineapple", price: 399, description: "Fresh whole pineapple, sweet and tropical flavor." },
  { name: "Mangoes", price: 149, description: "Ripe mangoes with sweet tropical flavor, perfect for smoothies." },
  { name: "Lemons", price: 99, description: "Fresh lemons for cooking, baking, and beverages." },

];

export async function seedInventory() {
  try {
    console.log("🌱 Seeding inventory table...");
    
    // Insert all items
    const result = await db.insert(inventory).values(foodInventoryItems);
    
    console.log(`✅ Successfully inserted ${foodInventoryItems.length} food inventory items`);
    return result;
  } catch (error) {
    console.error("❌ Error seeding inventory:", error);
    throw error;
  }
}

// Function to clear inventory before seeding (optional)
export async function clearInventory() {
  try {
    console.log("🧹 Clearing inventory table...");
    await db.delete(inventory);
    console.log("✅ Inventory table cleared");
  } catch (error) {
    console.error("❌ Error clearing inventory:", error);
    throw error;
  }
}
