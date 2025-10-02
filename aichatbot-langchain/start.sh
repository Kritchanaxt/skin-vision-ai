#!/bin/bash

# 🚀 Startup Script for Skin Vision AI - Acne Detection System
# This script starts both Python ML server and Next.js app

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🔬 Skin Vision AI - Startup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed${NC}"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

# Check if model files exist
if [ ! -f "model/acne_detection_best.pt" ]; then
    echo -e "${RED}❌ Model file not found: model/acne_detection_best.pt${NC}"
    exit 1
fi

if [ ! -f "model/model_info.yaml" ]; then
    echo -e "${RED}❌ Model info not found: model/model_info.yaml${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Model files found${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${YELLOW}Please edit .env.local with your API keys${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found${NC}"
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Install Node.js dependencies
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🚀 Starting servers...${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $PYTHON_PID $NEXTJS_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python ML server in background
echo -e "${BLUE}Starting Python ML Server on port 8000...${NC}"
python inference_server.py > logs/python_server.log 2>&1 &
PYTHON_PID=$!
echo -e "${GREEN}✓ Python server started (PID: $PYTHON_PID)${NC}"

# Wait for Python server to be ready
echo -e "${YELLOW}Waiting for ML server to be ready...${NC}"
sleep 5

# Check if Python server is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${RED}❌ Python server failed to start${NC}"
    echo "Check logs/python_server.log for details"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ ML server is ready${NC}"

# Start Next.js dev server
echo -e "${BLUE}Starting Next.js on port 3000...${NC}"
npm run dev > logs/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo -e "${GREEN}✓ Next.js started (PID: $NEXTJS_PID)${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ All servers running!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}📱 Access the app at:${NC}"
echo -e "   ${GREEN}→${NC} http://localhost:3000/detect"
echo ""
echo -e "${BLUE}🔧 ML Server API:${NC}"
echo -e "   ${GREEN}→${NC} http://localhost:8000"
echo -e "   ${GREEN}→${NC} http://localhost:8000/docs (API docs)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for background processes
wait
