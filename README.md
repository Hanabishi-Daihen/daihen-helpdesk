# วิธีการนำ Code ไปติดตั้งบน Google Apps Script (Turnkey Deployment Guide)

ระบบนี้รองรับการทำงานร่วมกับ **Google Apps Script (GAS)** โดยสมบูรณ์ 100% สามารถคัดลอกไฟล์ไปวางและใช้งานได้ทันที

---

## 📁 1. โครงสร้างไฟล์ใน Google Apps Script Project

ในโปรเจกต์ Google Apps Script (Extensions > Apps Script) ให้สร้างไฟล์ตามนี้:

### สคริปต์ (`.gs`) - ทั้งหมด 6 ไฟล์:
1. `Code.gs` - ฟังก์ชันหลัก (`doGet`, `getIssues`, `saveIssue`, `updateStatus`, `addChat`, `updateIssueDetails`)
2. `EmailService.gs` - ส่งอีเมลแจ้งเตือนอัตโนมัติ (แจ้งเปิดเรื่องใหม่, อัปเดตสถานะ)
3. `FileService.gs` - อัปโหลดไฟล์แนบและรูปภาพไปยัง Google Drive
4. `ScheduleService.gs` - ระบบแผนการผลิต (Schedules view, Import CSV)
5. `Settings.gs` - จัดเก็บ UI Settings (PropertiesService) และข้อมูลอีเมลแอดมิน
6. `Triggers.gs` - ตรวจสอบงานค้างแจ้งเตือนอัตโนมัติประจำวัน

### ไฟล์ HTML (`.html`) - 1 ไฟล์:
1. `index.html` - หน้าเว็บแอพพลิเคชัน React + Tailwind ที่ถูก Bundle เป็น Single-file แบบเบ็ดเสร็จในไฟล์เดียว (จากไฟล์ `dist/index.html`)

---

## ⚙️ 2. การตั้งค่าตัวแปรสำคัญในไฟล์ `.gs`

ก่อนกด Deploy ให้ตรวจสอบตัวแปรต่อไปนี้ในไฟล์ `.gs`:

1. ใน **`Code.gs`**:
   - `SPREADSHEET_ID`: ใส่ ID ของ Google Spreadsheet สำหรับเก็บข้อมูลแจ้งปัญหา (ตาราง Data)
   - `SHEET_NAME`: ชื่อชีต (ค่าเริ่มต้น: `'Data'`)

2. ใน **`FileService.gs`**:
   - `DRIVE_FOLDER_ID`: ใส่ ID ของโฟลเดอร์ Google Drive สำหรับเก็บไฟล์แนบ (หากไม่มี ระบบจะสร้างโฟลเดอร์ `DAIHEN_Helpdesk_Uploads` ให้อัตโนมัติ)

3. ใน **`ScheduleService.gs`**:
   - `SCHEDULE_SPREADSHEET_ID`: ใส่ ID ของ Google Spreadsheet สำหรับตารางแผนงาน (ชีต `Q_SchedulesForUpdate`)

---

## 🚀 3. ขั้นตอนการติดตั้งและ Deploy Web App

1. เข้าไปที่ Google Apps Script ของคุณ: [script.google.com](https://script.google.com)
2. วางโค้ดไฟล์ `.gs` ทั้ง 6 ไฟล์ตามที่เตรียมไว้ในโฟลเดอร์ `/gas`
3. สร้างไฟล์ชื่อ `index.html` ใน Apps Script แล้วคัดลอกเนื้อหาจากไฟล์ `dist/index.html` (หรือกดปุ่ม **"คัดลอกโค้ด index.html"** ภายในระบบเว็บ) มาวางลงไป
4. คลิกปุ่ม **Deploy (การปรับใช้)** > **New deployment (การปรับใช้รายการใหม่)**
5. เลือกประเภท: **Web app (เว็บแอป)**
6. ตั้งค่าการปรับใช้:
   - **Description**: `DAIHEN Helpdesk Pro v2`
   - **Execute as (ดำเนินการในฐานะ)**: `Me (ฉัน / บัญชีของคุณ)`
   - **Who has access (ผู้มีสิทธิ์เข้าถึง)**: `Anyone (ทุกคน)`
7. คลิก **Deploy** แล้วอนุญาตสิทธิ์ (Authorize access)
8. คัดลอก **Web app URL** ไปใช้งาน หรือส่งต่อให้พนักงานใช้งานได้ทันที!

---

## 🔗 4. รองรับ Deep Linking
เมื่อเปิดลิงก์พร้อมระบุรหัสปัญหา เช่น:
`https://script.google.com/macros/s/AKfycb.../exec?issue=ISS-2026001`
ระบบจะเปิดหน้าต่างรายละเอียดของเคสดังกล่าวขึ้นมาให้อัตโนมัติทันที
