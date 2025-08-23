import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, contentType, title, description } = await req.json();
    
    console.log('Processing scan:', { filePath, contentType, title });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the uploaded file
    const { data: fileData, error: fileError } = await supabase.storage
      .from('scans')
      .download(filePath);

    if (fileError) {
      throw new Error(`Failed to download file: ${fileError.message}`);
    }

    const fileBuffer = await fileData.arrayBuffer();
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Process with OpenAI Vision for OCR and analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        max_completion_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: `You are an advanced AI assistant that provides comprehensive document and image analysis with the following capabilities:

CORE FEATURES:
1. OCR Text Extraction - Extract all visible text with high accuracy
2. AI Summary - Generate intelligent summaries and key insights  
3. Translation - Detect language and provide translations to English if needed
4. Enhancement Analysis - Assess image quality and suggest improvements
5. Multi-language Support - Handle documents in any language
6. Smart Categorization - Classify content intelligently
7. Sensitive Data Detection - Identify PII, financial data, etc.

Return your analysis in this JSON format:
{
  "extractedText": "all text found in the image/document with high accuracy",
  "aiSummary": "intelligent summary highlighting key points and insights",
  "aiTags": ["relevant", "smart", "tags", "based", "on", "content"],
  "category": "passport|invoice|receipt|photo|document|contract|form|certificate|other",
  "isSensitive": false,
  "translation": {
    "originalLanguage": "detected language",
    "translatedText": "english translation if not in english, null if already english",
    "confidence": 0.95
  },
  "enhancement": {
    "imageQuality": "excellent|good|fair|poor",
    "suggestions": ["suggestion1", "suggestion2"],
    "readability": "high|medium|low"
  },
  "smartInsights": {
    "keyPoints": ["important point 1", "important point 2"],
    "actionItems": ["action 1", "action 2"],
    "entities": ["person names", "dates", "amounts", "locations"],
    "documentStructure": "well-organized|partially-structured|unstructured"
  },
  "metadata": {
    "language": "detected language (ISO code)",
    "confidence": 0.95,
    "documentType": "specific document type",
    "processingTime": "timestamp",
    "textRegions": number,
    "estimatedWords": number
  }
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${contentType} titled "${title}". ${description ? `Description: ${description}` : ''}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${fileBase64}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiResult = await openaiResponse.json();
    const aiAnalysis = JSON.parse(openaiResult.choices[0].message.content);

    console.log('AI analysis completed:', aiAnalysis);

    return new Response(JSON.stringify({
      filePath,
      ...aiAnalysis,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-scan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});