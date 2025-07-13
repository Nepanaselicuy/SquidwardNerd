import { pgTable, text, serial, integer, boolean, timestamp, date, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  manager: text("manager"),
  phone: text("phone"),
  address: text("address"),
  joinDate: date("join_date").notNull(),
  status: text("status").notNull().default("active"),
  // Enhanced leave balances
  annualLeaveBalance: integer("annual_leave_balance").notNull().default(12),
  sickLeaveBalance: integer("sick_leave_balance").notNull().default(12),
  personalLeaveBalance: integer("personal_leave_balance").notNull().default(12),
  emergencyLeaveBalance: integer("emergency_leave_balance").notNull().default(6),
  maternityLeaveBalance: integer("maternity_leave_balance").notNull().default(90),
  paternityLeaveBalance: integer("paternity_leave_balance").notNull().default(14),
  // Barcode/QR code
  barcodeId: text("barcode_id").unique(),
  qrCodeId: text("qr_code_id").unique(),
  // HRIS integration
  hrisEmployeeId: text("hris_employee_id").unique(),
  hrisData: json("hris_data"), // Store HRIS sync data
  lastHrisSync: timestamp("last_hris_sync"),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: text("status").notNull(), // "present", "absent", "late", "leave", "overtime"
  totalHours: text("total_hours"),
  // Enhanced tracking
  checkInLocation: json("check_in_location"), // {lat, lng, address}
  checkOutLocation: json("check_out_location"),
  checkInPhoto: text("check_in_photo"), // URL to photo
  checkOutPhoto: text("check_out_photo"),
  checkInMethod: text("check_in_method"), // "manual", "barcode", "qr", "geolocation"
  checkOutMethod: text("check_out_method"),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  type: text("type").notNull(), // "annual", "sick", "personal", "emergency", "maternity", "paternity", "unpaid"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  duration: text("duration").notNull(), // "full", "half", "hours"
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "cancelled"
  submittedAt: timestamp("submitted_at").notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  // Enhanced leave management
  daysRequested: decimal("days_requested", { precision: 4, scale: 2 }).notNull(),
  balanceBefore: json("balance_before"), // Store balance before request
  balanceAfter: json("balance_after"), // Store balance after approval
  attachments: json("attachments"), // Array of attachment URLs
  comments: text("comments"), // Additional comments
  approvalWorkflow: json("approval_workflow"), // Multi-level approval tracking
  emergencyContact: json("emergency_contact"), // For emergency leaves
  returnToWorkDate: date("return_to_work_date"),
  medicalCertificate: text("medical_certificate"), // For sick leave
});

export const leaveBalances = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  year: integer("year").notNull(),
  leaveType: text("leave_type").notNull(),
  totalAllocated: integer("total_allocated").notNull(),
  totalUsed: integer("total_used").notNull().default(0),
  totalCarriedOver: integer("total_carried_over").notNull().default(0),
  totalAdjusted: integer("total_adjusted").notNull().default(0),
  currentBalance: integer("current_balance").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
});

export const leavePolicies = pgTable("leave_policies", {
  id: serial("id").primaryKey(),
  leaveType: text("leave_type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  defaultDays: integer("default_days").notNull(),
  maxDays: integer("max_days"),
  minDays: integer("min_days").default(1),
  requiresApproval: boolean("requires_approval").notNull().default(true),
  approvalLevels: json("approval_levels"), // Array of approval levels
  requiresDocument: boolean("requires_document").default(false),
  documentTypes: json("document_types"), // Array of accepted document types
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const barcodeSessions = pgTable("barcode_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  employeeId: integer("employee_id").notNull(),
  barcodeId: text("barcode_id").notNull(),
  action: text("action").notNull(), // "check_in", "check_out"
  timestamp: timestamp("timestamp").notNull(),
  location: json("location"),
  deviceInfo: json("device_info"), // Browser/device information
  ipAddress: text("ip_address"),
  isValid: boolean("is_valid").notNull().default(true),
  notes: text("notes"),
});

export const hrisSyncLogs = pgTable("hris_sync_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  syncType: text("sync_type").notNull(), // "employee", "attendance", "leave"
  status: text("status").notNull(), // "success", "failed", "partial"
  dataSent: json("data_sent"),
  dataReceived: json("data_received"),
  errorMessage: text("error_message"),
  syncTimestamp: timestamp("sync_timestamp").notNull(),
  duration: integer("duration"), // Sync duration in milliseconds
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "attendance", "leave", "announcement", "reminder", "approval"
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
  // Enhanced notifications
  priority: text("priority").notNull().default("normal"), // "low", "normal", "high", "urgent"
  actionUrl: text("action_url"), // URL to navigate when clicked
  expiresAt: timestamp("expires_at"),
  metadata: json("metadata"), // Additional data
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
  lastHrisSync: true,
});

export const insertAttendanceSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  balanceBefore: true,
  balanceAfter: true,
});

export const insertLeaveBalanceSchema = createInsertSchema(leaveBalances).omit({
  id: true,
  lastUpdated: true,
});

export const insertLeavePolicySchema = createInsertSchema(leavePolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBarcodeSessionSchema = createInsertSchema(barcodeSessions).omit({
  id: true,
  timestamp: true,
});

export const insertHrisSyncLogSchema = createInsertSchema(hrisSyncLogs).omit({
  id: true,
  syncTimestamp: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyEventSchema = createInsertSchema(companyEvents).omit({
  id: true,
});

// Login schemas
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  employeeId: z.string().min(1, "Employee ID wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  position: z.string().min(1, "Posisi wajib diisi"),
  department: z.string().min(1, "Departemen wajib diisi"),
  manager: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  joinDate: z.string().min(1, "Tanggal bergabung wajib diisi"),
});

// Barcode schemas
export const barcodeScanSchema = z.object({
  barcodeId: z.string().min(1, "Barcode ID wajib diisi"),
  action: z.enum(["check_in", "check_out"]),
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
});

// Leave request schemas
export const leaveRequestSchema = z.object({
  type: z.enum(["annual", "sick", "personal", "emergency", "maternity", "paternity", "unpaid"]),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  duration: z.enum(["full", "half", "hours"]),
  reason: z.string().min(1, "Alasan wajib diisi"),
  daysRequested: z.number().positive("Jumlah hari harus positif"),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  attachments: z.array(z.string()).optional(),
});

// HRIS integration schemas
export const hrisSyncSchema = z.object({
  employeeId: z.string().min(1, "Employee ID wajib diisi"),
  syncType: z.enum(["employee", "attendance", "leave"]),
  data: z.record(z.any()),
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = z.infer<typeof insertLeaveBalanceSchema>;

export type LeavePolicy = typeof leavePolicies.$inferSelect;
export type InsertLeavePolicy = z.infer<typeof insertLeavePolicySchema>;

export type BarcodeSession = typeof barcodeSessions.$inferSelect;
export type InsertBarcodeSession = z.infer<typeof insertBarcodeSessionSchema>;

export type HrisSyncLog = typeof hrisSyncLogs.$inferSelect;
export type InsertHrisSyncLog = z.infer<typeof insertHrisSyncLogSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type CompanyEvent = typeof companyEvents.$inferSelect;
export type InsertCompanyEvent = z.infer<typeof insertCompanyEventSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type BarcodeScanData = z.infer<typeof barcodeScanSchema>;
export type LeaveRequestData = z.infer<typeof leaveRequestSchema>;
export type HrisSyncData = z.infer<typeof hrisSyncSchema>;
