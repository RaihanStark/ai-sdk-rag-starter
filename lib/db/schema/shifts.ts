import { nanoid } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, integer, decimal, boolean, text, pgEnum } from "drizzle-orm/pg-core";
import { employees } from "./employees";

// Enum for shift status
export const shiftStatusEnum = pgEnum('shift_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);

// Enum for shift types
export const shiftTypeEnum = pgEnum('shift_type', [
  'regular',
  'overtime',
  'holiday',
  'special_event',
  'training'
]);

export const shifts = pgTable('shifts', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  employeeId: varchar('employee_id', { length: 191 })
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  shiftDate: timestamp('shift_date').notNull(),
  scheduledStartTime: timestamp('scheduled_start_time').notNull(),
  scheduledEndTime: timestamp('scheduled_end_time').notNull(),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  breakDuration: integer('break_duration').default(0), // in minutes
  status: shiftStatusEnum('status').notNull().default('scheduled'),
  shiftType: shiftTypeEnum('shift_type').notNull().default('regular'),
  role: varchar('role', { length: 50 }).notNull(), // Role for this specific shift
  station: varchar('station', { length: 100 }), // e.g., "grill", "bar", "section A"
  // Hours and pay calculation
  scheduledHours: decimal('scheduled_hours', { precision: 5, scale: 2 }).notNull(),
  actualHours: decimal('actual_hours', { precision: 5, scale: 2 }),
  regularHours: decimal('regular_hours', { precision: 5, scale: 2 }),
  overtimeHours: decimal('overtime_hours', { precision: 5, scale: 2 }),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  totalPay: decimal('total_pay', { precision: 10, scale: 2 }),
  // Performance metrics
  salesGenerated: decimal('sales_generated', { precision: 10, scale: 2 }),
  customersServed: integer('customers_served'),
  tablesServed: integer('tables_served'),
  drinksServed: integer('drinks_served'),
  dishesProduced: integer('dishes_produced'),
  // Shift notes
  managerNotes: text('manager_notes'),
  employeeNotes: text('employee_notes'),
  // Labor cost analysis
  laborCostPercentage: decimal('labor_cost_percentage', { precision: 5, scale: 2 }), // labor cost / sales
  productivityScore: decimal('productivity_score', { precision: 5, scale: 2 }), // 0-100
  // Flags
  isLateArrival: boolean('is_late_arrival').notNull().default(false),
  isEarlyDeparture: boolean('is_early_departure').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(false),
  approvedBy: varchar('approved_by', { length: 191 }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});