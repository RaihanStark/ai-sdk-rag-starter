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

  // Vegetables
  { name: "Organic Carrots", price: 199, description: "Fresh organic carrots, crunchy and sweet. Great for snacking and cooking." },
  { name: "Broccoli Crowns", price: 299, description: "Fresh broccoli crowns packed with vitamins and fiber." },
  { name: "Bell Peppers", price: 149, description: "Colorful bell peppers, perfect for stir-fries and salads." },
  { name: "Roma Tomatoes", price: 199, description: "Fresh Roma tomatoes, ideal for sauces and cooking." },
  { name: "Cucumber", price: 119, description: "Crisp cucumbers perfect for salads and sandwiches." },
  { name: "Red Onions", price: 149, description: "Fresh red onions with mild flavor, great for cooking and salads." },
  { name: "Fresh Spinach", price: 399, description: "Baby spinach leaves, perfect for salads and smoothies." },
  { name: "Celery", price: 199, description: "Crisp celery stalks, great for soups and snacking." },
  { name: "Mushrooms", price: 299, description: "Fresh button mushrooms, perfect for cooking and pizza." },
  { name: "Sweet Potatoes", price: 179, description: "Orange sweet potatoes packed with vitamins and natural sweetness." },

  // Dairy & Eggs
  { name: "Whole Milk Gallon", price: 449, description: "Fresh whole milk, rich in calcium and protein." },
  { name: "Large Eggs Dozen", price: 349, description: "Grade A large eggs, perfect for breakfast and baking." },
  { name: "Greek Yogurt", price: 599, description: "Plain Greek yogurt, high in protein and probiotics." },
  { name: "Cheddar Cheese Block", price: 699, description: "Sharp cheddar cheese block, perfect for sandwiches and cooking." },
  { name: "Butter", price: 499, description: "Salted butter, perfect for cooking and baking." },
  { name: "Cream Cheese", price: 299, description: "Smooth cream cheese, great for bagels and baking." },
  { name: "Mozzarella Cheese", price: 599, description: "Fresh mozzarella cheese, perfect for pizza and caprese." },
  { name: "Heavy Cream", price: 399, description: "Heavy whipping cream for cooking and desserts." },

  // Meat & Seafood
  { name: "Chicken Breast", price: 899, description: "Boneless skinless chicken breast, lean protein source." },
  { name: "Ground Beef 80/20", price: 699, description: "Fresh ground beef, perfect for burgers and tacos." },
  { name: "Salmon Fillet", price: 1299, description: "Fresh Atlantic salmon fillet, rich in omega-3 fatty acids." },
  { name: "Pork Chops", price: 799, description: "Bone-in pork chops, tender and flavorful." },
  { name: "Turkey Slices", price: 599, description: "Sliced deli turkey, perfect for sandwiches." },
  { name: "Shrimp", price: 999, description: "Large peeled shrimp, perfect for pasta and stir-fries." },
  { name: "Bacon", price: 699, description: "Thick-cut bacon, perfect for breakfast." },
  { name: "Ground Turkey", price: 599, description: "Lean ground turkey, healthy alternative to ground beef." },

  // Grains & Bread
  { name: "Whole Wheat Bread", price: 299, description: "Fresh whole wheat bread loaf, perfect for sandwiches and toast." },
  { name: "Brown Rice", price: 399, description: "Long grain brown rice, healthy whole grain option." },
  { name: "Pasta", price: 199, description: "Italian pasta, perfect for quick and easy meals." },
  { name: "Quinoa", price: 699, description: "Organic quinoa, complete protein and gluten-free grain." },
  { name: "Oatmeal", price: 499, description: "Steel-cut oats, perfect for healthy breakfast." },
  { name: "Bagels", price: 399, description: "Fresh everything bagels, perfect for breakfast." },
  { name: "Tortillas", price: 349, description: "Flour tortillas, perfect for wraps and quesadillas." },
  { name: "Cereal", price: 599, description: "Whole grain cereal with vitamins and minerals." },

  // Pantry Staples
  { name: "Olive Oil", price: 899, description: "Extra virgin olive oil, perfect for cooking and dressing." },
  { name: "Sea Salt", price: 199, description: "Fine sea salt for cooking and seasoning." },
  { name: "Black Pepper", price: 399, description: "Freshly ground black pepper for seasoning." },
  { name: "Garlic", price: 149, description: "Fresh garlic bulbs, essential for cooking." },
  { name: "Canned Tomatoes", price: 199, description: "Whole peeled tomatoes, perfect for sauces." },
  { name: "Chicken Broth", price: 299, description: "Low-sodium chicken broth for soups and cooking." },
  { name: "Honey", price: 699, description: "Pure honey, natural sweetener for tea and baking." },
  { name: "Vanilla Extract", price: 799, description: "Pure vanilla extract for baking and desserts." },
  { name: "Baking Soda", price: 149, description: "Baking soda for cooking and cleaning." },
  { name: "All-Purpose Flour", price: 399, description: "Unbleached all-purpose flour for baking." },

  // Frozen Foods
  { name: "Frozen Berries", price: 599, description: "Mixed frozen berries, perfect for smoothies." },
  { name: "Frozen Vegetables", price: 349, description: "Mixed frozen vegetables, convenient and nutritious." },
  { name: "Ice Cream", price: 699, description: "Vanilla ice cream, perfect for dessert." },
  { name: "Frozen Pizza", price: 599, description: "Margherita frozen pizza, quick dinner option." },
  { name: "Frozen Chicken Nuggets", price: 799, description: "Breaded chicken nuggets, kid-friendly option." },
  { name: "Frozen French Fries", price: 399, description: "Crispy frozen french fries, perfect side dish." },

  // Snacks
  { name: "Almonds", price: 899, description: "Raw almonds, healthy snack rich in protein and healthy fats." },
  { name: "Peanut Butter", price: 599, description: "Creamy peanut butter, perfect for sandwiches and snacking." },
  { name: "Crackers", price: 399, description: "Whole wheat crackers, perfect for cheese and spreads." },
  { name: "Granola Bars", price: 699, description: "Oats and honey granola bars, perfect for on-the-go snacking." },
  { name: "Popcorn", price: 399, description: "Air-popped popcorn, healthy whole grain snack." },
  { name: "Trail Mix", price: 799, description: "Mixed nuts and dried fruit trail mix." },
  { name: "Pretzels", price: 349, description: "Salted pretzels, crunchy snack option." },
  { name: "Chips", price: 449, description: "Kettle-cooked potato chips with sea salt." },

  // Beverages
  { name: "Orange Juice", price: 499, description: "100% pure orange juice, no added sugar." },
  { name: "Coffee Beans", price: 1299, description: "Medium roast coffee beans, freshly roasted." },
  { name: "Green Tea", price: 699, description: "Organic green tea bags, antioxidant-rich." },
  { name: "Sparkling Water", price: 399, description: "Natural sparkling water with no calories." },
  { name: "Apple Juice", price: 399, description: "100% apple juice, perfect for kids." },
  { name: "Energy Drink", price: 299, description: "Sugar-free energy drink with vitamins." },

  // Condiments & Sauces
  { name: "Ketchup", price: 349, description: "Classic tomato ketchup, perfect for fries and burgers." },
  { name: "Mustard", price: 299, description: "Dijon mustard, perfect for sandwiches and cooking." },
  { name: "Mayonnaise", price: 499, description: "Creamy mayonnaise, perfect for sandwiches and salads." },
  { name: "Hot Sauce", price: 399, description: "Medium heat hot sauce, perfect for adding spice." },
  { name: "Soy Sauce", price: 399, description: "Low-sodium soy sauce for Asian cooking." },
  { name: "BBQ Sauce", price: 449, description: "Sweet and tangy BBQ sauce for grilling." },
  { name: "Ranch Dressing", price: 399, description: "Creamy ranch dressing, perfect for salads and dipping." },
  { name: "Salsa", price: 399, description: "Medium salsa with tomatoes and peppers." },

  // Canned Goods
  { name: "Canned Beans", price: 199, description: "Black beans, perfect for tacos and salads." },
  { name: "Canned Corn", price: 179, description: "Sweet corn kernels, perfect side dish." },
  { name: "Tuna Can", price: 199, description: "Chunk light tuna in water, high in protein." },
  { name: "Tomato Sauce", price: 149, description: "Plain tomato sauce for pasta and pizza." },
  { name: "Coconut Milk", price: 299, description: "Canned coconut milk for curries and desserts." },
  { name: "Chicken Soup", price: 249, description: "Classic chicken noodle soup, comfort food." },

  // Specialty Items
  { name: "Coconut Oil", price: 999, description: "Organic coconut oil, perfect for cooking and baking." },
  { name: "Chia Seeds", price: 799, description: "Organic chia seeds, superfood rich in omega-3." },
  { name: "Protein Powder", price: 2999, description: "Whey protein powder for smoothies and shakes." },
  { name: "Almond Milk", price: 399, description: "Unsweetened almond milk, dairy-free alternative." },
  { name: "Dark Chocolate", price: 599, description: "70% dark chocolate bar, rich and antioxidant-rich." },
  { name: "Maple Syrup", price: 1199, description: "Pure maple syrup, perfect for pancakes and baking." },
  { name: "Coconut Water", price: 399, description: "Natural coconut water, perfect for hydration." },
  { name: "Kimchi", price: 699, description: "Fermented Korean kimchi, probiotic-rich." },
  { name: "Hummus", price: 499, description: "Classic hummus, perfect for dipping vegetables." },
  { name: "Kombucha", price: 599, description: "Probiotic kombucha drink, gut-healthy beverage." }
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
