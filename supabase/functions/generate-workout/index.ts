import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has Pro plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'pro') {
      return new Response(
        JSON.stringify({ error: 'Pro plan required for AI workout generation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    const { bodyParts, minutes, equipment, intensity, notes, preferences } = requestBody;

    // Validate input
    if (!bodyParts || !Array.isArray(bodyParts) || bodyParts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Body parts are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!minutes || minutes < 10 || minutes > 180) {
      return new Response(
        JSON.stringify({ error: 'Minutes must be between 10 and 180' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Equipment selection is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch available exercises for context
    const { data: exercises } = await supabase
      .from('exercises')
      .select('name, category, primary_body_part_id, is_machine_based, body_parts!exercises_primary_body_part_id_fkey(name)')
      .limit(100);

    const exerciseContext = exercises?.map(ex => 
      `${ex.name} (${ex.body_parts?.name}, ${ex.is_machine_based ? 'machine' : 'free weight'})`
    ).join(', ') || '';

    // Create system prompt
    const systemPrompt = `You are a certified strength coach creating safe, periodized workouts. You MUST respond with valid JSON only, no additional text.

    Output JSON that maps cleanly into our schema. Respect the user's equipment, body parts, time, and intensity. Choose exercises from our database when possible, or suggest similar alternatives.

    Available exercises include: ${exerciseContext}

    Guidelines:
    - Intensity 1-2: Higher reps (12-20), longer rests (120-180s), lower RPE (6-7)
    - Intensity 3: Moderate reps (8-12), moderate rests (90-120s), moderate RPE (7-8)
    - Intensity 4-5: Lower reps (6-10), shorter rests (60-90s), higher RPE (8-9)
    - Include compound movements first, then accessories
    - Match exercise selection to available equipment
    - Default to 3 sets for weight-based exercises
    - For bodyweight exercises like plank, wall sit, use duration_sec field instead of reps
    - For weight/machine exercises, always include weight field (default null)
    - Default weight to null so users can fill in at gym
    - Use "kg" as default unit

    Response format MUST be exactly this structure:
    {
      "session": {
        "estimated_duration_min": number,
        "notes": "Brief description of workout focus and intensity",
        "exercises": [
          {
            "name": "Exercise Name",
            "body_part": "target body part",
            "is_machine_based": boolean,
            "sets": [
              {
                "weight": null,
                "unit": "kg", 
                "reps": number (use for weight/machine exercises),
                "duration_sec": number (use for bodyweight exercises like plank),
                "rpe": number,
                "rest_sec": number
              }
            ]
          }
        ]
      }
    }`;

    const userPrompt = `Create a workout with these parameters:
    Body Parts: ${bodyParts.join(', ')}
    Duration: ${minutes} minutes
    Equipment: ${equipment.join(', ')}
    Intensity: ${intensity}/5
    Notes: ${notes || 'None'}
    Preferences: ${JSON.stringify(preferences || {})}`;

    console.log('Calling OpenAI with prompts:', { systemPrompt, userPrompt });

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI request failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response:', openaiData);

    const generatedText = openaiData.choices[0]?.message?.content;
    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: 'No response from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let workoutData;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = generatedText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      workoutData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw response:', generatedText);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON response from AI. Please try regenerating.',
          raw_response: generatedText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!workoutData.session || !workoutData.session.exercises || !Array.isArray(workoutData.session.exercises)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid workout format. Please try regenerating.',
          received: workoutData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log generation for telemetry (non-PII)
    try {
      await supabase
        .from('audit_logs')
        .insert({
          actor_user_id: user.id,
          action: 'ai_workout_generated',
          metadata: {
            body_parts: bodyParts,
            duration_min: minutes,
            equipment: equipment,
            intensity: intensity,
            exercise_count: workoutData.session.exercises.length
          }
        });
    } catch (logError) {
      console.error('Failed to log generation:', logError);
      // Continue anyway, don't fail the request
    }

    return new Response(
      JSON.stringify(workoutData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-workout function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});