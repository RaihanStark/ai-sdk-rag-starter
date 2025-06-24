import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema/employees";
import { shifts } from "@/lib/db/schema/shifts";
import { seedEmployees } from "@/lib/db/seed/employees";
import { generateShifts } from "@/lib/db/seed/shifts";

async function seedEmployeesAndShifts() {
  console.log("🌱 Starting to seed employees and shifts...");

  try {
    // First, clear existing data
    console.log("🗑️  Clearing existing shifts...");
    await db.delete(shifts);
    
    console.log("🗑️  Clearing existing employees...");
    await db.delete(employees);

    // Insert employees
    console.log("👥 Inserting employees...");
    const insertedEmployees = await db.insert(employees).values(seedEmployees).returning();
    console.log(`✅ Inserted ${insertedEmployees.length} employees`);

    // Create a map of employee codes to IDs
    const employeeMap = insertedEmployees.reduce((acc, emp) => {
      acc[emp.employeeCode] = emp.id;
      return acc;
    }, {} as Record<string, string>);

    // Generate and insert shifts
    console.log("📅 Generating shifts...");
    const shiftsData = generateShifts(employeeMap);
    
    console.log("📅 Inserting shifts...");
    const insertedShifts = await db.insert(shifts).values(shiftsData).returning();
    console.log(`✅ Inserted ${insertedShifts.length} shifts`);

    // Print some statistics
    console.log("\n📊 Seeding Summary:");
    console.log(`- Total Employees: ${insertedEmployees.length}`);
    console.log(`- Total Shifts: ${insertedShifts.length}`);
    
    // Count by department
    const deptCounts = insertedEmployees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("\n👥 Employees by Department:");
    Object.entries(deptCounts).forEach(([dept, count]) => {
      console.log(`  - ${dept}: ${count}`);
    });

    // Count shifts by status
    const statusCounts = insertedShifts.reduce((acc, shift) => {
      acc[shift.status] = (acc[shift.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("\n📅 Shifts by Status:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    console.log("\n✨ Seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedEmployeesAndShifts();