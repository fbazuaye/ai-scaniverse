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
    const requestBody = await req.json();
    const { filePath, contentType, title, description } = requestBody;
    
    console.log('Processing scan request:', { filePath, contentType, title });

    // Validate required parameters
    if (!filePath) {
      throw new Error('File path is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the uploaded file
    console.log('Downloading file from storage...');
    const { data: fileData, error: fileError } = await supabase.storage
      .from('scans')
      .download(filePath);

    if (fileError) {
      console.error('File download error:', fileError);
      throw new Error(`Failed to download file: ${fileError.message}`);
    }

    // Convert file to base64
    console.log('Converting file to base64...');
    const fileBuffer = await fileData.arrayBuffer();
    
    // Use a more memory-efficient approach for base64 conversion
    const uint8Array = new Uint8Array(fileBuffer);
    let binary = '';
    const chunkSize = 0x8000; // 32KB chunks
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const fileBase64 = btoa(binary);

    // Process with OpenAI Vision for OCR and analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Sending request to OpenAI...');
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
            content: `You are an advanced AI assistant that provides comprehensive document and image analysis. Analyze the provided image/document and extract all relevant information.

Return your analysis in this exact JSON format:
{
  "extractedText": "all visible text found in the image/document",
  "aiSummary": "intelligent summary highlighting key points and insights",
  "aiTags": ["relevant", "tags", "based", "on", "content"],
  "category": "passport|invoice|receipt|photo|document|contract|form|certificate|other",
  "isSensitive": false,
  "translation": {
    "originalLanguage": "detected language",
    "translatedText": "english translation if not in english, otherwise null",
    "confidence": 0.95
  },
  "enhancement": {
    "imageQuality": "excellent|good|fair|poor",
    "suggestions": ["improvement suggestion 1", "improvement suggestion 2"],
    "readability": "high|medium|low"
  },
  "smartInsights": {
    "keyPoints": ["important point 1", "important point 2"],
    "actionItems": ["action 1", "action 2"],
    "entities": ["person names", "dates", "amounts", "locations"],
    "documentStructure": "well-organized|partially-structured|unstructured"
  },
  "metadata": {
    "language": "detected language ISO code",
    "confidence": 0.95,
    "documentType": "specific document type",
    "processingTime": "${new Date().toISOString()}",
    "textRegions": 1,
    "estimatedWords": 100
  }
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${contentType || 'image'} ${title ? `titled "${title}"` : ''}. ${description ? `Description: ${description}` : ''} Provide comprehensive analysis including OCR, categorization, and insights.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${fileBase64}`,
                  detail: 'high'
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
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    console.log('OpenAI response received');

    if (!openaiResult.choices || !openaiResult.choices[0]) {
      throw new Error('Invalid OpenAI response format');
    }

    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(openaiResult.choices[0].message.content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', openaiResult.choices[0].message.content);
      throw new Error('Failed to parse AI analysis response');
    }

    console.log('AI analysis completed successfully');

    const response = {
      filePath,
      ...aiAnalysis,
      success: true,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-scan function:', error);
    
    const errorResponse = {
      error: error.message || 'Unknown error occurred',
      success: false,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});