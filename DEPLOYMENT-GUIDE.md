# คู่มือการ Deploy ระบบลงทะเบียนลูกจ้างต่างด้าว

## 📋 สารบัญ
1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนที่ 1: สร้าง Database บน Supabase](#ขั้นตอนที่-1-สร้าง-database-บน-supabase)
3. [ขั้นตอนที่ 2: Deploy ไปยัง Vercel](#ขั้นตอนที่-2-deploy-ไปยัง-vercel)
4. [ขั้นตอนที่ 3: ตั้งค่า Environment Variables](#ขั้นตอนที่-3-ตั้งค่า-environment-variables)
5. [การทดสอบระบบ](#การทดสอบระบบ)
6. [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## ข้อกำหนดเบื้องต้น

### บัญชีที่ต้องมี (ทั้งหมดฟรี 100%)
- ✅ GitHub Account (มีแล้ว)
- 🔲 Vercel Account - สมัครที่ https://vercel.com
- 🔲 Supabase Account - สมัครที่ https://supabase.com

### ข้อมูลที่ต้องเตรียม
- GitHub Repository URL: `https://github.com/benyasitpho/foreign-worker-registration`
- Database Connection String (จะได้จาก Supabase)

---

## ขั้นตอนที่ 1: สร้าง Database บน Supabase

### 1.1 สร้างโปรเจกต์ใหม่
1. เข้า https://supabase.com และ Login
2. คลิก **"New Project"**
3. กรอกข้อมูล:
   - **Name**: `foreign-worker-db`
   - **Database Password**: สร้างรหัสผ่านที่แข็งแรง (เก็บไว้ใช้ภายหลัง)
   - **Region**: เลือก `Southeast Asia (Singapore)` (ใกล้ไทยที่สุด)
4. คลิก **"Create new project"** (รอประมาณ 2-3 นาที)

### 1.2 คัดลอก Database URL
1. เมื่อโปรเจกต์สร้างเสร็จ ไปที่ **Settings** → **Database**
2. หา **Connection string** → **URI**
3. คลิก **"Copy"** เพื่อคัดลอก URL (จะมีรูปแบบ: `postgresql://postgres:[YOUR-PASSWORD]@...`)
4. **สำคัญ**: แทนที่ `[YOUR-PASSWORD]` ด้วยรหัสผ่านที่สร้างไว้ในขั้นตอน 1.1

### 1.3 สร้างตาราง Database
1. ไปที่ **SQL Editor** ในเมนูด้านซ้าย
2. คลิก **"New query"**
3. วาง SQL นี้ลงไป:

```sql
-- สร้างตาราง employers (นายจ้าง)
CREATE TABLE employers (
  id SERIAL PRIMARY KEY,
  employer_type VARCHAR(50) NOT NULL,
  title VARCHAR(10),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  tax_id VARCHAR(20) NOT NULL UNIQUE,
  id_card_number VARCHAR(20),
  registration_number VARCHAR(50),
  address TEXT NOT NULL,
  sub_district VARCHAR(100),
  district VARCHAR(100),
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  fax VARCHAR(20),
  email VARCHAR(100),
  number_of_employees INTEGER,
  capital_amount DECIMAL(15,2),
  contact_person VARCHAR(100),
  contact_position VARCHAR(100),
  documents_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง workers (ลูกจ้างต่างด้าว)
CREATE TABLE workers (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES employers(id) ON DELETE CASCADE,
  title VARCHAR(10) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  passport_number VARCHAR(50) NOT NULL UNIQUE,
  alien_id VARCHAR(50),
  visa_type VARCHAR(50),
  work_permit_number VARCHAR(50),
  position VARCHAR(100) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'employed',
  termination_date DATE,
  profile_photo_url TEXT,
  documents_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX idx_employers_tax_id ON employers(tax_id);
CREATE INDEX idx_workers_passport ON workers(passport_number);
CREATE INDEX idx_workers_employer ON workers(employer_id);
CREATE INDEX idx_workers_status ON workers(status);
```

4. คลิก **"Run"** เพื่อรัน SQL
5. ตรวจสอบว่าตารางถูกสร้างแล้วที่ **Table Editor**

---

## ขั้นตอนที่ 2: Deploy ไปยัง Vercel

### 2.1 เชื่อมต่อ GitHub กับ Vercel
1. เข้า https://vercel.com และ Login
2. คลิก **"Add New..."** → **"Project"**
3. เลือก **"Import Git Repository"**
4. ค้นหา `foreign-worker-registration` และคลิก **"Import"**

### 2.2 ตั้งค่าโปรเจกต์
1. **Project Name**: `foreign-worker-registration` (หรือชื่อที่ต้องการ)
2. **Framework Preset**: เลือก **"Other"**
3. **Root Directory**: `.` (ค่าเริ่มต้น)
4. **Build Command**: 
   ```bash
   pnpm install && pnpm run build
   ```
5. **Output Directory**: `dist`
6. **Install Command**: 
   ```bash
   pnpm install
   ```

### 2.3 ยังไม่ต้อง Deploy
- **สำคัญ**: อย่ากด **"Deploy"** ตอนนี้
- ต้องตั้งค่า Environment Variables ก่อน (ขั้นตอนถัดไป)

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### 3.1 เพิ่ม Environment Variables ใน Vercel
1. ในหน้าตั้งค่าโปรเจกต์ Vercel ให้เลื่อนลงไปที่ **"Environment Variables"**
2. เพิ่มตัวแปรทั้งหมดนี้:

#### Database Configuration
```
DATABASE_URL
```
**Value**: วาง Database URL ที่คัดลอกจาก Supabase (ขั้นตอนที่ 1.2)

#### JWT Secret (สร้างรหัสผ่านแบบสุ่ม)
```
JWT_SECRET
```
**Value**: สร้างรหัสผ่านยาวๆ เช่น `your-super-secret-jwt-key-change-this-in-production-12345`

#### Application Settings
```
VITE_APP_TITLE
```
**Value**: `ระบบลงทะเบียนลูกจ้างต่างด้าว`

```
VITE_APP_LOGO
```
**Value**: `https://placehold.co/40x40/2d5f4d/ffffff?text=FW`

#### OAuth Settings (ถ้าต้องการใช้ระบบ Login)
```
VITE_OAUTH_PORTAL_URL
```
**Value**: `https://vida.butterfly-effect.dev`

```
OAUTH_SERVER_URL
```
**Value**: `https://vidabiz.butterfly-effect.dev`

```
VITE_APP_ID
```
**Value**: `foreign-worker-registration`

```
OWNER_OPEN_ID
```
**Value**: `admin@example.com` (อีเมลของคุณ)

```
OWNER_NAME
```
**Value**: `เบญญสิทธิ์ ภูมิพันธ์`

#### Built-in API Settings (สำหรับ File Upload)
```
BUILT_IN_FORGE_API_URL
```
**Value**: `https://api.manus.im`

```
BUILT_IN_FORGE_API_KEY
```
**Value**: `your-manus-api-key` (ถ้ามี หรือใช้ค่าว่างไว้ก่อน)

### 3.2 ตรวจสอบความถูกต้อง
- ตรวจสอบว่า `DATABASE_URL` ถูกต้องและมี password แทนที่แล้ว
- ตรวจสอบว่า `JWT_SECRET` เป็นรหัสผ่านที่แข็งแรง
- ตรวจสอบว่าไม่มีช่องว่างหรือตัวอักษรพิเศษที่ไม่ต้องการ

---

## ขั้นตอนที่ 4: Deploy

### 4.1 เริ่ม Deploy
1. หลังจากตั้งค่า Environment Variables เสร็จแล้ว
2. คลิก **"Deploy"**
3. รอประมาณ 3-5 นาที (Vercel จะ build และ deploy ให้)

### 4.2 ตรวจสอบสถานะ
- ดูสถานะการ build ใน **Deployment Logs**
- ถ้าเกิด error ให้ตรวจสอบ logs เพื่อหาสาเหตุ

### 4.3 เข้าใช้งานระบบ
- เมื่อ deploy สำเร็จ จะได้ URL เช่น: `https://foreign-worker-registration.vercel.app`
- คลิก **"Visit"** เพื่อเข้าใช้งานระบบ

---

## การทดสอบระบบ

### ทดสอบฟีเจอร์หลัก
1. ✅ เปิดหน้าเว็บได้ปกติ
2. ✅ ลงทะเบียนนายจ้างใหม่ได้
3. ✅ ลงทะเบียนลูกจ้างใหม่ได้
4. ✅ อัพโหลดรูปภาพและเอกสารได้
5. ✅ ค้นหาและกรองข้อมูลได้
6. ✅ ส่งออก CSV ได้
7. ✅ ดู Dashboard สถิติได้

### ทดสอบ Database
1. เข้า Supabase → **Table Editor**
2. ตรวจสอบว่าข้อมูลที่บันทึกปรากฏในตาราง `employers` และ `workers`

---

## การแก้ไขปัญหา

### ปัญหา: Build Failed
**สาเหตุ**: ขาด Dependencies หรือ Configuration ผิด

**วิธีแก้**:
1. ตรวจสอบ Build Logs ใน Vercel
2. ตรวจสอบว่า `package.json` มี dependencies ครบ
3. ลอง build ในเครื่องก่อน: `pnpm run build`

### ปัญหา: Database Connection Error
**สาเหตุ**: `DATABASE_URL` ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ `DATABASE_URL` ใน Vercel Environment Variables
2. ตรวจสอบว่าแทนที่ `[YOUR-PASSWORD]` แล้ว
3. ทดสอบ connection ใน Supabase SQL Editor

### ปัญหา: File Upload ไม่ทำงาน
**สาเหตุ**: ยังไม่ได้ตั้งค่า S3 หรือ Storage

**วิธีแก้**:
1. ตรวจสอบ `BUILT_IN_FORGE_API_KEY` และ `BUILT_IN_FORGE_API_URL`
2. หรือเปลี่ยนไปใช้ Supabase Storage แทน

### ปัญหา: 404 Not Found เมื่อ Refresh
**สาเหตุ**: Routing ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ `vercel.json` มี rewrites ถูกต้อง
2. ตรวจสอบว่า `outputDirectory` ตั้งค่าเป็น `dist`

---

## การอัพเดทระบบ

### เมื่อมีการแก้ไขโค้ด
1. Push โค้ดขึ้น GitHub:
   ```bash
   git add .
   git commit -m "อัพเดทฟีเจอร์ใหม่"
   git push github main
   ```
2. Vercel จะ auto-deploy ให้อัตโนมัติ (ไม่ต้องทำอะไรเพิ่ม)

### เมื่อต้องการเปลี่ยน Environment Variables
1. เข้า Vercel → **Settings** → **Environment Variables**
2. แก้ไขค่าที่ต้องการ
3. คลิก **"Redeploy"** เพื่อให้ค่าใหม่มีผล

---

## ค่าใช้จ่าย

### ทั้งหมดฟรี 100% 🎉
- ✅ Vercel Free Plan: 100 GB Bandwidth/เดือน
- ✅ Supabase Free Plan: 500 MB Database, 1 GB File Storage
- ✅ GitHub: ฟรีสำหรับ Public Repository

### ข้อจำกัดของ Free Plan
- Vercel: จำกัด 100 deployments/วัน (เพียงพอมาก)
- Supabase: จำกัด 500 MB Database (เพียงพอสำหรับข้อมูลหลายพันรายการ)

---

## สรุป

ระบบลงทะเบียนลูกจ้างต่างด้าวพร้อม Deploy แล้ว! 🎊

**สิ่งที่ได้:**
- ✅ เว็บไซต์ที่เข้าถึงได้จากทุกที่
- ✅ Database ที่มั่นคงและปลอดภัย
- ✅ Auto-deploy เมื่อ push โค้ดใหม่
- ✅ ใช้งานฟรี 100%

**URL ระบบ:**
- Production: `https://your-project.vercel.app`
- GitHub: `https://github.com/benyasitpho/foreign-worker-registration`
- Database: Supabase Dashboard

---

## ติดต่อและสนับสนุน

หากมีปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ [Vercel Documentation](https://vercel.com/docs)
- ตรวจสอบ [Supabase Documentation](https://supabase.com/docs)
- หรือติดต่อผู้พัฒนาระบบ

---

**สร้างโดย:** Manus AI Assistant  
**วันที่:** 2024  
**เวอร์ชัน:** 1.0

