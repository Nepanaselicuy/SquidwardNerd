import { 
  employees, 
  attendanceRecords, 
  leaveRequests, 
  notifications, 
  companyEvents,
  type Employee, 
  type InsertEmployee,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type LeaveRequest,
  type InsertLeaveRequest,
  type Notification,
  type InsertNotification,
  type CompanyEvent,
  type InsertCompanyEvent
} from "@shared/schema";

export interface IStorage {
  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined>;
  
  // Attendance operations
  getAttendanceRecord(employeeId: number, date: string): Promise<AttendanceRecord | undefined>;
  getAttendanceHistory(employeeId: number, limit?: number): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: number, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  getMonthlyAttendanceStats(employeeId: number, year: number, month: number): Promise<{present: number, total: number}>;
  
  // Leave operations
  getLeaveRequests(employeeId: number): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequestStatus(id: number, status: string, reviewedBy: string): Promise<LeaveRequest | undefined>;
  
  // Notification operations
  getNotifications(employeeId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  getUnreadNotificationCount(employeeId: number): Promise<number>;
  
  // Company events operations
  getCompanyEvents(): Promise<CompanyEvent[]>;
  getUpcomingEvents(limit?: number): Promise<CompanyEvent[]>;
  createCompanyEvent(event: InsertCompanyEvent): Promise<CompanyEvent>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee>;
  private attendanceRecords: Map<number, AttendanceRecord>;
  private leaveRequests: Map<number, LeaveRequest>;
  private notifications: Map<number, Notification>;
  private companyEvents: Map<number, CompanyEvent>;
  private currentId: number;

  constructor() {
    this.employees = new Map();
    this.attendanceRecords = new Map();
    this.leaveRequests = new Map();
    this.notifications = new Map();
    this.companyEvents = new Map();
    this.currentId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Create default employee
    const defaultEmployee: Employee = {
      id: 1,
      employeeId: "EMP-2024-001",
      name: "Ahmad Sutrisno",
      email: "ahmad.sutrisno@intek.co.id",
      position: "IT Developer",
      department: "Information Technology",
      manager: "Budi Setiawan",
      phone: "+62 812-3456-7890",
      address: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220",
      joinDate: "2023-03-01",
      status: "active",
      annualLeaveBalance: 8,
      sickLeaveBalance: 10,
      personalLeaveBalance: 9,
      emergencyLeaveBalance: 5,
    };
    this.employees.set(1, defaultEmployee);

    // Create today's attendance record
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance: AttendanceRecord = {
      id: 1,
      employeeId: 1,
      date: today,
      checkIn: new Date(new Date().setHours(8, 0, 0, 0)),
      checkOut: null,
      status: "present",
      totalHours: null,
    };
    this.attendanceRecords.set(1, todayAttendance);

    // Create some sample notifications
    const notifications: Notification[] = [
      {
        id: 1,
        employeeId: 1,
        title: "Pengajuan cuti disetujui",
        message: "Pengajuan cuti tahunan Anda untuk tanggal 18-19 Januari 2024 telah disetujui oleh manager.",
        type: "leave",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 2,
        employeeId: 1,
        title: "Pengumuman: Rapat Tim Bulanan",
        message: "Rapat tim bulanan akan diadakan pada Kamis, 18 Januari 2024 pukul 09:00 WIB di ruang meeting.",
        type: "announcement",
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 3,
        employeeId: 1,
        title: "Reminder: Check Out",
        message: "Jangan lupa untuk melakukan check out sebelum meninggalkan kantor.",
        type: "reminder",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];
    
    notifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
    });

    // Create company events
    const events: CompanyEvent[] = [
      {
        id: 1,
        title: "Rapat Tim Bulanan",
        description: "Diskusi progress proyek dan planning bulan depan",
        date: "2024-01-18",
        time: "09:00",
        location: "Ruang Meeting A",
        type: "meeting",
      },
      {
        id: 2,
        title: "Training Keamanan IT",
        description: "Pelatihan awareness keamanan untuk seluruh karyawan",
        date: "2024-01-20",
        time: "13:00",
        location: "Aula Utama",
        type: "training",
      },
      {
        id: 3,
        title: "Company Gathering",
        description: "Acara gathering bulanan seluruh karyawan",
        date: "2024-01-25",
        time: "18:00",
        location: "Restaurant XYZ",
        type: "gathering",
      },
    ];

    events.forEach(event => {
      this.companyEvents.set(event.id, event);
    });

    this.currentId = 4;
  }

  // Employee operations
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.email === email);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentId++;
    const employee: Employee = { ...insertEmployee, id };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updated = { ...employee, ...updates };
    this.employees.set(id, updated);
    return updated;
  }

  // Attendance operations
  async getAttendanceRecord(employeeId: number, date: string): Promise<AttendanceRecord | undefined> {
    return Array.from(this.attendanceRecords.values()).find(
      record => record.employeeId === employeeId && record.date === date
    );
  }

  async getAttendanceHistory(employeeId: number, limit: number = 10): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values())
      .filter(record => record.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = this.currentId++;
    const record: AttendanceRecord = { ...insertRecord, id };
    this.attendanceRecords.set(id, record);
    return record;
  }

  async updateAttendanceRecord(id: number, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const record = this.attendanceRecords.get(id);
    if (!record) return undefined;
    
    const updated = { ...record, ...updates };
    this.attendanceRecords.set(id, updated);
    return updated;
  }

  async getMonthlyAttendanceStats(employeeId: number, year: number, month: number): Promise<{present: number, total: number}> {
    const records = Array.from(this.attendanceRecords.values())
      .filter(record => {
        if (record.employeeId !== employeeId) return false;
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1;
      });
    
    const present = records.filter(record => record.status === "present").length;
    const daysInMonth = new Date(year, month, 0).getDate();
    const workdays = Math.floor(daysInMonth * 5/7); // Approximate workdays
    
    return { present, total: workdays };
  }

  // Leave operations
  async getLeaveRequests(employeeId: number): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values())
      .filter(request => request.employeeId === employeeId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = this.currentId++;
    const request: LeaveRequest = { 
      ...insertRequest, 
      id,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    };
    this.leaveRequests.set(id, request);
    
    // Create notification for the request
    await this.createNotification({
      employeeId: insertRequest.employeeId,
      title: "Pengajuan izin/cuti diterima",
      message: `Pengajuan ${insertRequest.type} Anda telah diterima dan sedang dalam proses review.`,
      type: "leave",
      isRead: false,
    });
    
    return request;
  }

  async updateLeaveRequestStatus(id: number, status: string, reviewedBy: string): Promise<LeaveRequest | undefined> {
    const request = this.leaveRequests.get(id);
    if (!request) return undefined;
    
    const updated = { 
      ...request, 
      status, 
      reviewedBy, 
      reviewedAt: new Date() 
    };
    this.leaveRequests.set(id, updated);
    
    // Create notification for status update
    await this.createNotification({
      employeeId: request.employeeId,
      title: `Pengajuan ${request.type} ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      message: `Pengajuan ${request.type} Anda untuk periode ${request.startDate} - ${request.endDate} telah ${status === 'approved' ? 'disetujui' : 'ditolak'}.`,
      type: "leave",
      isRead: false,
    });
    
    return updated;
  }

  // Notification operations
  async getNotifications(employeeId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async getUnreadNotificationCount(employeeId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.employeeId === employeeId && !notification.isRead)
      .length;
  }

  // Company events operations
  async getCompanyEvents(): Promise<CompanyEvent[]> {
    return Array.from(this.companyEvents.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getUpcomingEvents(limit: number = 5): Promise<CompanyEvent[]> {
    const today = new Date();
    return Array.from(this.companyEvents.values())
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  async createCompanyEvent(insertEvent: InsertCompanyEvent): Promise<CompanyEvent> {
    const id = this.currentId++;
    const event: CompanyEvent = { ...insertEvent, id };
    this.companyEvents.set(id, event);
    return event;
  }
}

export const storage = new MemStorage();
