import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, employers, InsertEmployer, Employer, workers, InsertWorker, Worker } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Employer functions
export async function createEmployer(employer: InsertEmployer): Promise<Employer> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(employers).values(employer);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(employers).where(eq(employers.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getEmployers(): Promise<Employer[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(employers);
}

export async function getEmployerById(id: number): Promise<Employer | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(employers).where(eq(employers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmployer(id: number, data: Partial<InsertEmployer>): Promise<Employer> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(employers).set(data).where(eq(employers.id, id));
  
  const updated = await db.select().from(employers).where(eq(employers.id, id)).limit(1);
  return updated[0];
}

export async function deleteEmployer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(employers).where(eq(employers.id, id));
}

// Worker functions
export async function createWorker(worker: InsertWorker): Promise<Worker> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(workers).values(worker);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(workers).where(eq(workers.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getWorkers(): Promise<Worker[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(workers);
}

export async function getWorkerById(id: number): Promise<Worker | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(workers).where(eq(workers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWorkersByEmployerId(employerId: number): Promise<Worker[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(workers).where(eq(workers.employerId, employerId));
}

export async function updateWorker(id: number, data: Partial<InsertWorker>): Promise<Worker> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(workers).set(data).where(eq(workers.id, id));
  
  const updated = await db.select().from(workers).where(eq(workers.id, id)).limit(1);
  return updated[0];
}

export async function deleteWorker(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(workers).where(eq(workers.id, id));
}


// ==================== User Management ====================

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(users);
}

export async function getPendingUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(users).where(eq(users.approvalStatus, "pending"));
}

export async function approveUser(userId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({
      approvalStatus: "approved",
      approvedBy: approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true };
}

export async function rejectUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({
      approvalStatus: "rejected",
    })
    .where(eq(users.id, userId));

  return { success: true };
}

