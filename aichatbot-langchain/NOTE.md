# 📋 NOTE - Setup & Running Guide

> คู่มือการติดตั้งและรันโปรเจค Skin Vision AI Chatbot
> สำหรับ Windows และ macOS

## 📖 สารบัญ

- [ข้อกำหนดของระบบ](#ข้อกำหนดของระบบ)
- [การติดตั้ง - macOS](#การติดตั้ง---macos)
- [การติดตั้ง - Windows](#การติดตั้ง---windows)
- [Environment Variables](#environment-variables)
- [การรันโปรเจค](#การรันโปรเจค)
- [การทดสอบระบบ](#การทดสอบระบบ)
- [Troubleshooting](#troubleshooting)

---

## 🔧 ข้อกำหนดของระบบ

### สำหรับทั้ง macOS และ Windows

| Software | Version | Required |
|----------|---------|----------|
| Node.js | 18.x หรือสูงกว่า | ✅ ใช่ |
| npm | 9.x หรือสูงกว่า | ✅ ใช่ |
| Python | 3.11.x หรือสูงกว่า | ✅ ใช่ |
| pip | Latest | ✅ ใช่ |
| Git | Latest | ✅ ใช่ |
| Supabase Account | - | ✅ ใช่ |
| OpenAI API Key หรือ Google API Key | - | ✅ ใช่ (อย่างน้อย 1 อัน) |

---

## 🍎 การติดตั้ง - macOS

### 1. ติดตั้ง Homebrew (ถ้ายังไม่มี)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. ติดตั้ง Node.js และ Python

```bash
# ติดตั้ง Node.js
brew install node

# ติดตั้ง Python 3.11
brew install python@3.11

# ตรวจสอบ version
node --version    # ควรเป็น v18.x หรือสูงกว่า
python3 --version # ควรเป็น Python 3.11.x
```

### 3. Clone โปรเจค

```bash
git clone <your-repository-url>
cd aichatbot-langchain
```

### 4. ติดตั้ง Dependencies

#### Frontend (Next.js)
```bash
# ติดตั้ง Node packages
npm install

# หรือใช้ yarn
yarn install
```

#### Backend (Python)
```bash
# สร้าง virtual environment (แนะนำ)
python3 -m venv venv

# เปิดใช้งาน virtual environment
source venv/bin/activate

# ติดตั้ง Python packages
pip install -r requirements.txt

# อัพเกรด pip (ถ้าจำเป็น)
pip install --upgrade pip
```

### 5. ตั้งค่า Environment Variables

```bash
# คัดลอกไฟล์ .env.example เป็น .env.local
cp .env.example .env.local

# แก้ไขไฟล์ .env.local
nano .env.local
# หรือใช้ text editor ที่ชอบ
```

---

## 🪟 การติดตั้ง - Windows

### 1. ติดตั้ง Node.js

1. ดาวน์โหลด Node.js จาก https://nodejs.org/
2. เลือก LTS version (18.x หรือสูงกว่า)
3. รัน installer และติดตั้ง
4. เปิด Command Prompt และตรวจสอบ:
   ```cmd
   node --version
   npm --version
   ```

### 2. ติดตั้ง Python

1. ดาวน์โหลด Python จาก https://www.python.org/downloads/
2. เลือก Python 3.11.x
3. ⚠️ **สำคัญ**: เลือก "Add Python to PATH" ในหน้าติดตั้ง
4. รัน installer
5. เปิด Command Prompt และตรวจสอบ:
   ```cmd
   python --version
   pip --version
   ```

### 3. ติดตั้ง Git (ถ้ายังไม่มี)

1. ดาวน์โหลดจาก https://git-scm.com/download/win
2. รัน installer (ใช้ค่า default ได้)

### 4. Clone โปรเจค

```cmd
git clone <your-repository-url>
cd aichatbot-langchain
```

### 5. ติดตั้ง Dependencies

#### Frontend (Next.js)
```cmd
# ติดตั้ง Node packages
npm install
```

#### Backend (Python)
```cmd
# สร้าง virtual environment (แนะนำ)
python -m venv venv

# เปิดใช้งาน virtual environment
# สำหรับ Command Prompt:
venv\Scripts\activate.bat

# สำหรับ PowerShell:
venv\Scripts\Activate.ps1

# ถ้า PowerShell บล็อก ให้รันคำสั่งนี้ก่อน (run as Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# ติดตั้ง Python packages
pip install -r requirements.txt

# อัพเกรด pip (ถ้าจำเป็น)
python -m pip install --upgrade pip
```

### 6. ตั้งค่า Environment Variables

```cmd
# คัดลอกไฟล์ .env.example เป็น .env.local
copy .env.example .env.local

# แก้ไขไฟล์ด้วย Notepad
notepad .env.local
```

---

## 🔐 Environment Variables

สร้างไฟล์ `.env.local` และกรอกข้อมูลดังนี้:

```bash
# ============================================================================
# Supabase Configuration
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================================================
# OpenAI Configuration (Optional - ถ้าใช้ GPT models)
# ============================================================================
OPENAI_API_KEY=sk-your-openai-api-key

# ============================================================================
# Google AI Configuration (Optional - ถ้าใช้ Gemini models)
# ============================================================================
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key

# ============================================================================
# Python API Configuration
# ============================================================================
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000

# ============================================================================
# App Configuration
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🔑 วิธีหา API Keys:

#### Supabase
1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจค
3. Settings → API
4. คัดลอก URL และ Keys

#### OpenAI
1. ไปที่ https://platform.openai.com/api-keys
2. สร้าง API key ใหม่
3. คัดลอก key (จะเห็นครั้งเดียว!)

#### Google AI
1. ไปที่ https://makersuite.google.com/app/apikey
2. สร้าง API key
3. คัดลอก key

---

## 🚀 การรันโปรเจค

### 🍎 macOS

#### วิธีที่ 1: ใช้ Terminal แยก (แนะนำ)

**Terminal 1: Next.js Frontend**
```bash
npm run dev
# เปิดที่ http://localhost:3000
```

**Terminal 2: Python Backend (Mock Server)**
```bash
# เปิดใช้งาน virtual environment
source venv/bin/activate

# รัน mock server
python3 inference_server_mock.py

# หรือรันในพื้นหลัง
nohup python3 inference_server_mock.py > logs/mock_server.log 2>&1 &

# ตรวจสอบ process
ps aux | grep inference_server_mock.py
```

#### วิธีที่ 2: ใช้ Script อัตโนมัติ
```bash
# ให้สิทธิ์รันไฟล์
chmod +x start.sh
chmod +x check_mock_server.sh

# รันทั้งหมด
./start.sh

# ตรวจสอบสถานะ
./check_mock_server.sh
```

### 🪟 Windows

#### วิธีที่ 1: ใช้ Command Prompt แยก (แนะนำ)

**Command Prompt 1: Next.js Frontend**
```cmd
npm run dev
REM เปิดที่ http://localhost:3000
```

**Command Prompt 2: Python Backend (Mock Server)**
```cmd
REM เปิดใช้งาน virtual environment
venv\Scripts\activate.bat

REM รัน mock server
python inference_server_mock.py
```

#### วิธีที่ 2: สร้าง Batch Script

สร้างไฟล์ `start.bat`:
```batch
@echo off
echo Starting Skin Vision AI Chatbot...

REM Start Python Backend
start "Python Backend" cmd /k "venv\Scripts\activate.bat && python inference_server_mock.py"

REM Wait 3 seconds
timeout /t 3 /nobreak > nul

REM Start Next.js Frontend
start "Next.js Frontend" cmd /k "npm run dev"

echo All services started!
echo Next.js: http://localhost:3000
echo Python API: http://localhost:8000
pause
```

จากนั้นรัน:
```cmd
start.bat
```

---

## 🧪 การทดสอบระบบ

### 1. ตรวจสอบ Python Backend

#### macOS/Linux:
```bash
# ตรวจสอบ health endpoint
curl http://localhost:8000/health

# ควรได้ผลลัพธ์:
# {"status":"healthy","mode":"mock","model_loaded":true}
```

#### Windows:
```cmd
REM ใช้ PowerShell
Invoke-RestMethod -Uri http://localhost:8000/health

REM หรือเปิดใน browser
start http://localhost:8000/health
```

### 2. ตรวจสอบ Next.js Frontend

เปิด browser ที่ http://localhost:3000

ควรเห็นหน้า login page

### 3. ทดสอบฟีเจอร์หลัก

1. **ลงทะเบียน/เข้าสู่ระบบ**
   - ไปที่ `/auth/sign-up` หรือ `/auth/login`
   
2. **ทดสอบ Chat**
   - ไปที่ `/chat`
   - พิมพ์ข้อความและส่ง
   - ตรวจสอบว่า AI ตอบกลับ

3. **ทดสอบ Acne Detection**
   - คลิกไอคอน 📎 ในหน้า chat
   - แนบรูปภาพ
   - ควรเห็น "🔬 กำลังตรวจจับสิวจากภาพและวิเคราะห์ด้วย AI..."
   - ข้อความถูกส่งไปยัง AI อัตโนมัติ
   - รอผล AI วิเคราะห์

---

## 🔧 Troubleshooting

### ❌ ปัญหาที่พบบ่อย

#### 1. Port Already in Use

**อาการ**: `Error: listen EADDRINUSE: address already in use :::3000`

**วิธีแก้ (macOS):**
```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# ปิด process
kill -9 <PID>

# หรือใช้คำสั่งเดียว
kill -9 $(lsof -t -i:3000)
```

**วิธีแก้ (Windows):**
```cmd
REM หา process ที่ใช้ port 3000
netstat -ano | findstr :3000

REM ปิด process
taskkill /PID <PID> /F
```

#### 2. Python Backend ไม่ทำงาน

**อาการ**: `ECONNREFUSED` error เมื่อใช้ detection feature

**วิธีแก้:**

macOS:
```bash
# ตรวจสอบว่า server ทำงานหรือไม่
curl http://localhost:8000/health

# ถ้าไม่ทำงาน รีสตาร์ท
./check_mock_server.sh
```

Windows:
```cmd
REM เข้าไปใน Command Prompt ที่รัน Python
REM กด Ctrl+C เพื่อหยุด
REM จากนั้นรันใหม่
python inference_server_mock.py
```

#### 3. Module Not Found

**อาการ**: `ModuleNotFoundError: No module named 'xxx'`

**วิธีแก้:**
```bash
# ตรวจสอบว่าอยู่ใน virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate.bat

# ติดตั้ง dependencies ใหม่
pip install -r requirements.txt
```

#### 4. Permission Denied (macOS)

**อาการ**: `Permission denied` เมื่อรัน script

**วิธีแก้:**
```bash
# ให้สิทธิ์รันไฟล์
chmod +x start.sh
chmod +x check_mock_server.sh

# หรือรันด้วย bash โดยตรง
bash start.sh
```

#### 5. Environment Variables ไม่ทำงาน

**วิธีแก้:**
1. ตรวจสอบว่าไฟล์ชื่อ `.env.local` (ไม่ใช่ `.env.local.txt`)
2. ตรวจสอบว่าไม่มีช่องว่างในชื่อตัวแปร
3. รีสตาร์ท development server:
   ```bash
   # กด Ctrl+C เพื่อหยุด
   # จากนั้นรันใหม่
   npm run dev
   ```

#### 6. Database Connection Error

**อาการ**: Error เกี่ยวกับ Supabase

**วิธีแก้:**
1. ตรวจสอบ Supabase URL และ Keys ใน `.env.local`
2. ตรวจสอบว่าโปรเจค Supabase ยังใช้งานได้
3. ตรวจสอบ network connection

#### 7. AI ไม่ตอบกลับ

**อาการ**: ส่งข้อความแล้วไม่มีการตอบกลับ

**วิธีแก้:**
1. ตรวจสอบ API Keys (OpenAI หรือ Google AI)
2. เปิด Browser Console (F12) ดูข้อผิดพลาด
3. ตรวจสอบ quota/credits ของ API
4. ลองเปลี่ยนโมเดล AI

## ✅ Checklist ก่อนเริ่มพัฒนา

- [ ] ติดตั้ง Node.js (18.x+)
- [ ] ติดตั้ง Python (3.11+)
- [ ] Clone repository
- [ ] ติดตั้ง npm dependencies (`npm install`)
- [ ] สร้าง virtual environment Python (`python -m venv venv`)
- [ ] ติดตั้ง Python dependencies (`pip install -r requirements.txt`)
- [ ] สร้างไฟล์ `.env.local` และกรอก environment variables
- [ ] ตั้งค่า Supabase (database, auth, storage)
- [ ] รับ API keys (OpenAI หรือ Google AI)
- [ ] ทดสอบรัน Next.js (`npm run dev`)
- [ ] ทดสอบรัน Python backend (`python inference_server_mock.py`)
- [ ] ทดสอบ health endpoint (`curl http://localhost:8000/health`)
- [ ] ทดสอบ login/signup
- [ ] ทดสอบ chat feature
- [ ] ทดสอบ acne detection feature

---

## 🆘 ขอความช่วยเหลือ

ถ้าพบปัญหาที่แก้ไม่ได้:

1. ตรวจสอบ Browser Console (F12)
2. ตรวจสอบ Terminal logs
3. ตรวจสอบ Python logs (`logs/mock_server.log`)
4. ตรวจสอบเอกสาร Troubleshooting ด้านบน
5. ตรวจสอบ issues ใน repository
6. สร้าง issue ใหม่พร้อมข้อมูล:
   - OS และ version
   - Node.js และ Python version
   - Error messages
   - Steps to reproduce

