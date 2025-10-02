/**
 * API endpoint for analyzing acne detection results with LLM
 * Receives detection data and provides skin analysis and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Types
interface Detection {
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  class: number;
  class_name: string;
}

interface AnalysisRequest {
  detections: Detection[];
  detections_count: number;
  image_size: {
    width: number;
    height: number;
  };
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { detections, detections_count, image_size, model = 'gemini-pro' } = body;

    if (!detections || !Array.isArray(detections)) {
      return NextResponse.json(
        { error: 'Invalid detection data' },
        { status: 400 }
      );
    }

    // Initialize LLM based on model selection
    let llm;
    if (model.startsWith('gpt')) {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
      llm = new ChatOpenAI({
        modelName: model,
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json(
          { error: 'Google API key not configured' },
          { status: 500 }
        );
      }
      llm = new ChatGoogleGenerativeAI({
        model: 'gemini-pro',
        temperature: 0.7,
        apiKey: process.env.GOOGLE_API_KEY,
      });
    }

    // Prepare detection summary
    const detectionSummary = detections.map((det, idx) => ({
      id: idx + 1,
      type: det.class_name,
      confidence: `${(det.confidence * 100).toFixed(1)}%`,
      location: `(${det.bbox.x.toFixed(0)}, ${det.bbox.y.toFixed(0)})`,
      size: `${det.bbox.width.toFixed(0)}x${det.bbox.height.toFixed(0)}px`
    }));

    // Create analysis prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `คุณคือผู้เชี่ยวชาญด้านผิวหนังและการดูแลผิวพรรณ มีความรู้เชิงลึกเกี่ยวกับสิว ปัญหาผิว และการรักษา

คุณจะได้รับข้อมูลการตรวจจับสิวจากระบบ AI และต้องวิเคราะห์ให้คำแนะนำที่เป็นมืออาชีพ เป็นกันเอง และมีประโยชน์

**หน้าที่ของคุณ:**
1. วิเคราะห์จำนวนและตำแหน่งของสิวที่ตรวจพบ
2. ประเมินระดับความรุนแรง (เล็กน้อย, ปานกลาง, มาก)
3. ให้คำแนะนำในการดูแลผิว
4. แนะนำผลิตภัณฑ์หรือวิธีการรักษาที่เหมาะสม
5. ข้อควรระวังและคำแนะนำเพิ่มเติม

**รูปแบบคำตอบ:**
- ใช้ภาษาที่เข้าใจง่าย เป็นมิตร
- แบ่งเป็นหัวข้อชัดเจน
- ให้ข้อมูลที่เป็นประโยชน์และปฏิบัติได้จริง
- หากไม่พบสิว ให้ชมเชยและให้คำแนะนำในการรักษาผิวให้สวยต่อไป`],
      ['user', `กรุณาวิเคราะห์ผลการตรวจจับสิวต่อไปนี้:

**ข้อมูลภาพ:**
- ขนาดภาพ: ${image_size.width}x${image_size.height} พิกเซล
- จำนวนสิวที่ตรวจพบ: ${detections_count} จุด

**รายละเอียดการตรวจจับ:**
${detectionSummary.length > 0 
  ? detectionSummary.map(det => 
      `${det.id}. ${det.type} - ความมั่นใจ: ${det.confidence}, ตำแหน่ง: ${det.location}, ขนาด: ${det.size}`
    ).join('\n')
  : 'ไม่พบสิวในภาพ'}

กรุณาวิเคราะห์และให้คำแนะนำที่ครบถ้วน`]
    ]);

    // Generate analysis
    const chain = prompt.pipe(llm);
    const response = await chain.invoke({});

    // Extract text from response
    let analysisText = '';
    if (typeof response.content === 'string') {
      analysisText = response.content;
    } else if (Array.isArray(response.content)) {
      analysisText = response.content
        .map((item: any) => item.text || '')
        .join('');
    }

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      detection_summary: {
        total_detections: detections_count,
        detections: detectionSummary,
        severity: getSeverityLevel(detections_count)
      },
      model_used: model
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze detection results' },
      { status: 500 }
    );
  }
}

// Helper function to determine severity level
function getSeverityLevel(count: number): string {
  if (count === 0) return 'none';
  if (count <= 5) return 'mild';
  if (count <= 15) return 'moderate';
  return 'severe';
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Acne Analysis API',
    endpoints: {
      POST: '/api/analyze-acne',
      description: 'Analyze acne detection results with LLM'
    },
    supported_models: ['gpt-4', 'gpt-3.5-turbo', 'gemini-pro']
  });
}
