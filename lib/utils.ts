import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./db";
import { sql } from "drizzle-orm";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

// SQL Query execution utility
export async function executeSqlQuery(sqlQuery: string) {
  try {
    // Basic SQL injection prevention - only allow SELECT queries for safety
    const trimmedQuery = sqlQuery.trim().toLowerCase();

    if (!trimmedQuery.startsWith("select ")) {
      throw new Error("Only SELECT queries are allowed for security reasons");
    }

    // Execute the query using Drizzle's raw SQL
    const result = await db.execute(sql.raw(sqlQuery));

    return {
      success: true,
      data: result,
      rowCount: Array.isArray(result) ? result.length : 0,
    };
  } catch (error) {
    console.error("SQL Query execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
