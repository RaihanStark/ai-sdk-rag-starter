DO $$ BEGIN
 CREATE TYPE "public"."employee_role" AS ENUM('manager', 'assistant_manager', 'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'dishwasher', 'head_bartender', 'bartender', 'barback', 'head_server', 'server', 'host', 'busser', 'food_runner', 'cashier');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."employment_status" AS ENUM('active', 'inactive', 'on_leave', 'terminated');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'seasonal', 'temporary');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."shift_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."shift_type" AS ENUM('regular', 'overtime', 'holiday', 'special_event', 'training');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"employee_code" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"role" "employee_role" NOT NULL,
	"department" varchar(50) NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"overtime_rate" numeric(10, 2),
	"employment_type" "employment_type" NOT NULL,
	"employment_status" "employment_status" DEFAULT 'active' NOT NULL,
	"hire_date" timestamp NOT NULL,
	"termination_date" timestamp,
	"emergency_contact" text,
	"notes" text,
	"average_rating" numeric(3, 2),
	"total_shifts_worked" integer DEFAULT 0 NOT NULL,
	"total_hours_worked" numeric(10, 2) DEFAULT '0' NOT NULL,
	"max_hours_per_week" integer DEFAULT 40,
	"min_hours_per_week" integer DEFAULT 0,
	"can_work_weekends" boolean DEFAULT true NOT NULL,
	"can_work_holidays" boolean DEFAULT true NOT NULL,
	"preferred_shift" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shifts" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"employee_id" varchar(191) NOT NULL,
	"shift_date" timestamp NOT NULL,
	"scheduled_start_time" timestamp NOT NULL,
	"scheduled_end_time" timestamp NOT NULL,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"break_duration" integer DEFAULT 0,
	"status" "shift_status" DEFAULT 'scheduled' NOT NULL,
	"shift_type" "shift_type" DEFAULT 'regular' NOT NULL,
	"role" varchar(50) NOT NULL,
	"station" varchar(100),
	"scheduled_hours" numeric(5, 2) NOT NULL,
	"actual_hours" numeric(5, 2),
	"regular_hours" numeric(5, 2),
	"overtime_hours" numeric(5, 2),
	"hourly_rate" numeric(10, 2) NOT NULL,
	"total_pay" numeric(10, 2),
	"sales_generated" numeric(10, 2),
	"customers_served" integer,
	"tables_served" integer,
	"drinks_served" integer,
	"dishes_produced" integer,
	"manager_notes" text,
	"employee_notes" text,
	"labor_cost_percentage" numeric(5, 2),
	"productivity_score" numeric(5, 2),
	"is_late_arrival" boolean DEFAULT false NOT NULL,
	"is_early_departure" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"approved_by" varchar(191),
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shifts" ADD CONSTRAINT "shifts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
