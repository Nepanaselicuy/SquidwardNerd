import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAttendanceSchema, 
  insertLeaveRequestSchema, 
  insertLeaveBalanceSchema,
  insertLeavePolicySchema,
  insertBarcodeSessionSchema,
  insertHrisSyncLogSchema,
  loginSchema, 
  registerSchema,
  barcodeScanSchema,
  leaveRequestSchema,
  hrisSyncSchema
} from "@shared/schema";
import { requireAuth, optionalAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const { email, password } = validation.data;
      const employee = await storage.authenticateUser(email, password);
      
      if (!employee) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // Regenerate session for security
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
        
        // Set session
        req.session.userId = employee.id;
        
        // Save session before sending response
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ message: "Session error" });
          }
          
          console.log("Login successful - session saved:", req.session);
          
          res.json({ 
            message: "Login berhasil",
            user: employee
          });
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging out" });
        }
        res.json({ message: "Logout berhasil" });
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", optionalAuth, async (req, res) => {
    try {
      console.log("Auth me - session:", req.session);
      console.log("Auth me - user:", req.user);
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Employee routes
  app.get("/api/employee/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update employee profile
  app.patch("/api/employee/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Only allow updating certain fields
      const allowedUpdates = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        position: updates.position,
        department: updates.department,
      };

      const updatedEmployee = await storage.updateEmployee(id, allowedUpdates);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change password
  app.patch("/api/employee/:id/password", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      const result = await storage.changePassword(id, currentPassword, newPassword);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload profile avatar
  app.post("/api/employee/:id/avatar", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // In a real application, you would handle file upload here
      // For now, we'll simulate the upload
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;
      
      const updatedEmployee = await storage.updateEmployee(id, { avatarUrl });
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ avatarUrl });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/:employeeId/today", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const today = new Date().toISOString().split('T')[0];
      const record = await storage.getAttendanceRecord(employeeId, today);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/:employeeId/history", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const records = await storage.getAttendanceHistory(employeeId, limit);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/:employeeId/stats", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const now = new Date();
      const stats = await storage.getMonthlyAttendanceStats(employeeId, now.getFullYear(), now.getMonth() + 1);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/attendance/checkin", async (req, res) => {
    try {
      const { employeeId } = req.body;
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already checked in today
      const existing = await storage.getAttendanceRecord(employeeId, today);
      if (existing && existing.checkIn) {
        return res.status(400).json({ message: "Already checked in today" });
      }

      const now = new Date();
      if (existing) {
        // Update existing record
        const updated = await storage.updateAttendanceRecord(existing.id, {
          checkIn: now,
          status: "present"
        });
        res.json(updated);
      } else {
        // Create new record
        const record = await storage.createAttendanceRecord({
          employeeId,
          date: today,
          checkIn: now,
          checkOut: null,
          status: "present",
          totalHours: null,
        });
        res.json(record);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/attendance/checkout", async (req, res) => {
    try {
      const { employeeId } = req.body;
      const today = new Date().toISOString().split('T')[0];
      
      const existing = await storage.getAttendanceRecord(employeeId, today);
      if (!existing || !existing.checkIn) {
        return res.status(400).json({ message: "Must check in first" });
      }

      if (existing.checkOut) {
        return res.status(400).json({ message: "Already checked out today" });
      }

      const now = new Date();
      const checkInTime = new Date(existing.checkIn);
      const diffMs = now.getTime() - checkInTime.getTime();
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const totalHoursFormatted = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;

      const updated = await storage.updateAttendanceRecord(existing.id, {
        checkOut: now,
        totalHours: totalHoursFormatted,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leave routes
  app.get("/api/leave/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const requests = await storage.getLeaveRequests(employeeId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/leave", async (req, res) => {
    try {
      const validation = insertLeaveRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const request = await storage.createLeaveRequest(validation.data);
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const notifications = await storage.getNotifications(employeeId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/notifications/:employeeId/unread-count", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const count = await storage.getUnreadNotificationCount(employeeId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Company events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getCompanyEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== ADVANCED LEAVE MANAGEMENT ROUTES =====
  
  // Get leave balances for employee
  app.get("/api/leave/:employeeId/balances", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const balances = await storage.getLeaveBalances(employeeId);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leave policies
  app.get("/api/leave/policies", requireAuth, async (req, res) => {
    try {
      const policies = await storage.getLeavePolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit advanced leave request
  app.post("/api/leave/request", requireAuth, async (req, res) => {
    try {
      const validation = leaveRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const request = await storage.createAdvancedLeaveRequest({
        ...validation.data,
        employeeId: req.user!.id,
        submittedAt: new Date(),
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approve/reject leave request
  app.patch("/api/leave/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;
      
      if (!['approved', 'rejected', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateLeaveRequestStatus(
        parseInt(id), 
        status, 
        req.user!.name,
        comments
      );
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leave calendar
  app.get("/api/leave/calendar/:employeeId", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      
      const calendar = await storage.getLeaveCalendar(employeeId, year, month);
      res.json(calendar);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== BARCODE/QR CODE ROUTES =====

  // Generate barcode/QR code for employee
  app.post("/api/barcode/generate/:employeeId", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const { type } = req.body; // "barcode" or "qr"
      
      const code = await storage.generateEmployeeCode(employeeId, type);
      res.json(code);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Scan barcode/QR code for attendance
  app.post("/api/barcode/scan", async (req, res) => {
    try {
      const validation = barcodeScanSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const { barcodeId, action, location } = validation.data;
      const session = await storage.processBarcodeScan(barcodeId, action, location, req.ip);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get barcode scan history
  app.get("/api/barcode/history/:employeeId", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const history = await storage.getBarcodeHistory(employeeId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Validate barcode session
  app.post("/api/barcode/validate", async (req, res) => {
    try {
      const { sessionId } = req.body;
      const isValid = await storage.validateBarcodeSession(sessionId);
      res.json({ isValid });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== HRIS INTEGRATION ROUTES =====

  // Sync employee data with HRIS
  app.post("/api/hris/sync/employee", requireAuth, async (req, res) => {
    try {
      const validation = hrisSyncSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const syncResult = await storage.syncEmployeeWithHRIS(validation.data);
      res.json(syncResult);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sync attendance data with HRIS
  app.post("/api/hris/sync/attendance", requireAuth, async (req, res) => {
    try {
      const { employeeId, startDate, endDate } = req.body;
      const syncResult = await storage.syncAttendanceWithHRIS(employeeId, startDate, endDate);
      res.json(syncResult);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sync leave data with HRIS
  app.post("/api/hris/sync/leave", requireAuth, async (req, res) => {
    try {
      const { employeeId, year } = req.body;
      const syncResult = await storage.syncLeaveWithHRIS(employeeId, year);
      res.json(syncResult);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get HRIS sync logs
  app.get("/api/hris/sync/logs/:employeeId", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getHrisSyncLogs(employeeId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get HRIS sync status
  app.get("/api/hris/sync/status/:employeeId", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const status = await storage.getHrisSyncStatus(employeeId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== ENHANCED ATTENDANCE ROUTES =====

  // Check in with enhanced data
  app.post("/api/attendance/checkin-enhanced", requireAuth, async (req, res) => {
    try {
      const { location, photo, method } = req.body;
      const employeeId = req.user!.id;
      const today = new Date().toISOString().split('T')[0];
      
      const existing = await storage.getAttendanceRecord(employeeId, today);
      if (existing && existing.checkIn) {
        return res.status(400).json({ message: "Already checked in today" });
      }

      const now = new Date();
      const record = await storage.createEnhancedAttendanceRecord({
        employeeId,
        date: today,
        checkIn: now,
        checkInLocation: location,
        checkInPhoto: photo,
        checkInMethod: method || 'manual',
        status: "present"
      });
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check out with enhanced data
  app.post("/api/attendance/checkout-enhanced", requireAuth, async (req, res) => {
    try {
      const { location, photo, notes } = req.body;
      const employeeId = req.user!.id;
      const today = new Date().toISOString().split('T')[0];
      
      const existing = await storage.getAttendanceRecord(employeeId, today);
      if (!existing || !existing.checkIn) {
        return res.status(400).json({ message: "Must check in first" });
      }

      if (existing.checkOut) {
        return res.status(400).json({ message: "Already checked out today" });
      }

      const now = new Date();
      const checkInTime = new Date(existing.checkIn);
      const diffMs = now.getTime() - checkInTime.getTime();
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const totalHoursFormatted = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;

      const updated = await storage.updateAttendanceRecord(existing.id, {
        checkOut: now,
        checkOutLocation: location,
        checkOutPhoto: photo,
        checkOutMethod: 'manual',
        totalHours: totalHoursFormatted,
        notes
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
