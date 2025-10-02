#!/bin/bash

# สคริปต์ตรวจสอบและเริ่ม Mock Server

echo "🔍 ตรวจสอบ Mock Server..."

# ตรวจสอบว่า server ทำงานอยู่หรือไม่
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Mock Server กำลังทำงานอยู่แล้ว"
    curl -s http://localhost:8000/health | python3 -m json.tool
else
    echo "⚠️  Mock Server ไม่ทำงาน กำลังเริ่มใหม่..."
    
    # Kill process เก่า (ถ้ามี)
    pkill -f inference_server_mock.py 2>/dev/null
    
    # เริ่ม server ใหม่
    nohup python3 inference_server_mock.py > logs/mock_server.log 2>&1 &
    
    echo "⏳ รอ server เริ่มทำงาน..."
    sleep 3
    
    # ตรวจสอบอีกครั้ง
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Mock Server เริ่มทำงานสำเร็จ!"
        curl -s http://localhost:8000/health | python3 -m json.tool
    else
        echo "❌ ไม่สามารถเริ่ม Mock Server ได้"
        echo "📝 ตรวจสอบ log: tail -f logs/mock_server.log"
        exit 1
    fi
fi

echo ""
echo "🚀 Mock Server พร้อมใช้งาน!"
echo "📍 URL: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
