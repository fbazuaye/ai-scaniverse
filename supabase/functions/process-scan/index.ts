import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { filePath, contentType, title, description } = requestBody;
    
    console.log('Processing scan request:', { filePath, contentType, title });

    if (!filePath) {
      throw new Error('File path is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Downloading file from storage...');
    const { data: fileData, error: fileError } = await supabase.storage
      .from('scans')
      .download(filePath);

    if (fileError) {
      console.error('File download error:', fileError);
      throw new Error(`Failed to download file: ${fileError.message}`);
    }

    console.log('Converting file to base64...');
    const fileBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const fileBase64 = btoa(binary);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an advanced AI assistant that provides comprehensive document and image analysis. Analyze the provided image/document and extract all relevant information.

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
}`;

    console.log('Sending request to Lovable AI Gateway...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
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

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later.", success: false }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage.", success: false }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    console.log('AI response received');

    if (!aiResult.choices || !aiResult.choices[0]) {
      throw new Error('Invalid AI response format');
    }

    let aiAnalysis;
    try {
      let content = aiResult.choices[0].message.content;
      // Strip markdown code fences if present
      content = content.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      aiAnalysis = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', aiResult.choices[0].message.content);
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
    
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error occurred',
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});