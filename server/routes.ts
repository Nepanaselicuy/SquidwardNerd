import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttendanceSchema, insertLeaveRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employee/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
