import { nanoid } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, integer, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";

// Enum for employee roles in F&B
export const employeeRoleEnum = pgEnum('employee_role', [
  'manager',
  'assistant_manager',
  'head_chef',
  'sous_chef',
  'line_cook',
  'prep_cook',
  'dishwasher',
  'head_bartender',
  'bartender',
  'barback',
  'head_server',
  'server',
  'host',
  'busser',
  'food_runner',
  'cashier'
]);

// Enum for employment status
export const employmentStatusEnum = pgEnum('employment_status', [
  'active',
  'inactive',
  'on_leave',
  'terminated'
]);

// Enum for employment type
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'seasonal',
  'temporary'
]);

export const employees = pgTable('employees', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  employeeCode: varchar('employee_code', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  role: employeeRoleEnum('role').notNull(),
  department: varchar('department', { length: 50 }).notNull(), // kitchen, bar, service, management
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  overtimeRate: decimal('overtime_rate', { precision: 10, scale: 2 }), // Usually 1.5x hourly rate
  employmentType: employmentTypeEnum('employment_type').notNull(),
  employmentStatus: employmentStatusEnum('employment_status').notNull().default('active'),
  hireDate: timestamp('hire_date').notNull(),
  terminationDate: timestamp('termination_date'),
  emergencyContact: text('emergency_contact'),
  notes: text('notes'),
  // Performance metrics
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }), // 1.00 to 5.00
  totalShiftsWorked: integer('total_shifts_worked').notNull().default(0),
  totalHoursWorked: decimal('total_hours_worked', { precision: 10, scale: 2 }).notNull().default('0'),
  // Scheduling preferences
  maxHoursPerWeek: integer('max_hours_per_week').default(40),
  minHoursPerWeek: integer('min_hours_per_week').default(0),
  canWorkWeekends: boolean('can_work_weekends').notNull().default(true),
  canWorkHolidays: boolean('can_work_holidays').notNull().default(true),
  preferredShift: varchar('preferred_shift', { length: 20 }), // morning, afternoon, evening, night
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});