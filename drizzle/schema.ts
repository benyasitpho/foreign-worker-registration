import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /**
   * Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user.
   * This mirrors the Manus account and should be used for authentication lookups.
   */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Employer table - stores information about employers
 */
export const employers = mysqlTable("employers", {
  id: int("id").autoincrement().primaryKey(),
  
  // ประเภทนายจ้าง
  employerType: mysqlEnum("employerType", ["individual", "company", "partnership"]).notNull(),
  
  // ข้อมูลบริษัท/นายจ้าง
  companyName: varchar("companyName", { length: 500 }).notNull(),
  taxId: varchar("taxId", { length: 20 }).notNull(),
  registrationNumber: varchar("registrationNumber", { length: 50 }),
  
  // ข้อมูลผู้ติดต่อ
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactPosition: varchar("contactPosition", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  fax: varchar("fax", { length: 20 }),
  
  // ที่อยู่
  address: text("address"),
  subdistrict: varchar("subdistrict", { length: 100 }),
  district: varchar("district", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postalCode", { length: 10 }),
  
  // ข้อมูลธุรกิจ
  businessType: varchar("businessType", { length: 255 }),
  numberOfEmployees: int("numberOfEmployees"),
  capitalAmount: int("capitalAmount"),
  
  // ข้อมูลเพิ่มเติม
  notes: text("notes"),
  
  // เอกสาร (JSON array of {type, url})
  documentsUrl: text("documentsUrl"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
});

export type Employer = typeof employers.$inferSelect;
export type InsertEmployer = typeof employers.$inferInsert;

/**
 * Worker table - stores information about foreign workers
 */
export const workers = mysqlTable("workers", {
  id: int("id").autoincrement().primaryKey(),
  
  // ข้อมูลส่วนตัว
  title: varchar("title", { length: 50 }),
  fullName: varchar("fullName", { length: 500 }).notNull(),
  
  // ข้อมูลพื้นฐาน
  nationality: varchar("nationality", { length: 100 }).notNull(),
  dateOfBirth: date("dateOfBirth"),
  gender: mysqlEnum("gender", ["male", "female"]),
  
  // เอกสารประจำตัว
  passportNo: varchar("passportNo", { length: 50 }).notNull(),
  passportIssueDate: date("passportIssueDate"),
  passportExpiryDate: date("passportExpiryDate"),
  
  // วีซ่า
  visaType: varchar("visaType", { length: 50 }),
  visaNo: varchar("visaNo", { length: 50 }),
  visaExpiryDate: date("visaExpiryDate"),
  
  // ใบอนุญาตทำงาน
  workPermitNo: varchar("workPermitNo", { length: 50 }),
  workPermitExpiryDate: date("workPermitExpiryDate"),
  
  // ที่อยู่ในประเทศไทย
  addressTh: text("addressTh"),
  subdistrictTh: varchar("subdistrictTh", { length: 100 }),
  districtTh: varchar("districtTh", { length: 100 }),
  provinceTh: varchar("provinceTh", { length: 100 }),
  postalCodeTh: varchar("postalCodeTh", { length: 10 }),
  
  // ข้อมูลติดต่อ
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  emergencyContact: varchar("emergencyContact", { length: 255 }),
  emergencyPhone: varchar("emergencyPhone", { length: 20 }),
  
  // ข้อมูลการทำงาน
  employerId: int("employerId"),
  employerName: varchar("employerName", { length: 500 }),
  position: varchar("position", { length: 255 }),
  salary: int("salary"),
  workStartDate: date("workStartDate"),
  workLocation: text("workLocation"),
  jobDescription: text("jobDescription"),
  
  // ข้อมูลการศึกษา
  educationLevel: varchar("educationLevel", { length: 100 }),
  educationDetails: varchar("educationDetails", { length: 500 }),
  
  // ข้อมูลสุขภาพ
  bloodType: varchar("bloodType", { length: 10 }),
  allergies: text("allergies"),
  medicalConditions: text("medicalConditions"),
  
  // ข้อมูลเพิ่มเติม
  notes: text("notes"),
  
  // สถานะการทำงาน
  employmentStatus: varchar("employmentStatus", { length: 50 }).default("active"), // active, resigned
  resignationDate: date("resignationDate"),
  
  // ไฟล์และเอกสาร
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 500 }),
  documentsUrl: text("documentsUrl"), // JSON array of document URLs
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
});

export type Worker = typeof workers.$inferSelect;
export type InsertWorker = typeof workers.$inferInsert;