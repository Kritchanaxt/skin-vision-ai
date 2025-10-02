/**
 * API endpoint for acne detection using YOLOv7
 * Handles image upload and returns detection results
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const confidenceThreshold = formData.get('confidence_threshold') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Forward to Python API
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);
    
    // Build URL correctly
    let url = `${PYTHON_API_URL}/detect`;
    if (confidenceThreshold) {
      url += `?confidence_threshold=${confidenceThreshold}`;
    }

    console.log('Calling Python API:', url);

    const response = await fetch(url, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Detection failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Detection error:', error);
    
    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Python API server. Please make sure the server is running on port 8000.',
          details: 'Run: python3 inference_server_mock.py'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/health`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Cannot connect to Python API' },
      { status: 503 }
    );
  }
}
