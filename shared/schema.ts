import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  manager: text("manager"),
  phone: text("phone"),
  address: text("address"),
  joinDate: date("join_date").notNull(),
  status: text("status").notNull().default("active"),
  annualLeaveBalance: integer("annual_leave_balance").notNull().default(12),
  sickLeaveBalance: integer("sick_leave_balance").notNull().default(12),
  personalLeaveBalance: integer("personal_leave_balance").notNull().default(12),
  emergencyLeaveBalance: integer("emergency_leave_balance").notNull().default(6),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: text("status").notNull(), // "present", "absent", "late", "leave"
  totalHours: text("total_hours"),
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  type: text("type").notNull(), // "annual", "sick", "personal", "emergency"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  duration: text("duration").notNull(), // "full", "half", "hours"
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  submittedAt: timestamp("submitted_at").notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "attendance", "leave", "announcement", "reminder"
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
});

export const companyEvents = pgTable("company_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: text("time"),
  location: text("location"),
  type: text("type").notNull(), // "meeting", "training", "holiday", "gathering"
});

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertAttendanceSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyEventSchema = createInsertSchema(companyEvents).omit({
  id: true,
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type CompanyEvent = typeof companyEvents.$inferSelect;
export type InsertCompanyEvent = z.infer<typeof insertCompanyEventSchema>;
