import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, date } = await req.json();

    if (!userId || !date) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Fetch workout data for the specified date
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (*),
          workout_sets (*)
        )
      `)
      .eq('user_id', userId)
      .eq('date', date);

    if (sessionsError) {
      console.error('Sessions error:', sessionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workout sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No workouts found for this date' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch body weight for the date
    const { data: bodyWeight } = await supabase
      .from('body_weight_logs')
      .select('body_weight, unit')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    // Prepare workout data for AI analysis
    const workoutData = {
      sessions: sessions.length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration_min || 0), 0),
      exercises: [],
      totalVolume: 0,
      avgRpe: 0,
      bodyParts: new Set(),
      personalRecords: [],
      bodyWeight: bodyWeight?.body_weight ? `${bodyWeight.body_weight}${bodyWeight.unit}` : null
    };

    let totalRpe = 0;
    let rpeCount = 0;

    sessions.forEach(session => {
      session.workout_exercises?.forEach((workoutExercise: any) => {
        const exercise = workoutExercise.exercises;
        const sets = workoutExercise.workout_sets || [];
        
        if (exercise) {
          // Get body part name
          workoutData.bodyParts.add(exercise.primary_body_part_id);
          
          // Calculate top set and volume
          let topSet = null;
          let exerciseVolume = 0;
          
          sets.forEach((set: any) => {
            if (set.weight && set.reps) {
              const setVolume = set.weight * set.reps;
              exerciseVolume += setVolume;
              
              if (!topSet || setVolume > (topSet.weight * topSet.reps)) {
                topSet = { weight: set.weight, reps: set.reps, unit: set.unit };
              }
            }
            
            if (set.rpe) {
              totalRpe += set.rpe;
              rpeCount++;
            }
          });
          
          if (topSet) {
            workoutData.exercises.push({
              name: exercise.name,
              topSet,
              volume: exerciseVolume
            });
            workoutData.totalVolume += exerciseVolume;
          }
        }
      });
    });

    workoutData.avgRpe = rpeCount > 0 ? totalRpe / rpeCount : 0;

    // Create AI prompt
    const prompt = `You are a friendly but professional fitness coach. Summarize the user's workout day in 3–5 sentences. 

Workout Data:
- Sessions: ${workoutData.sessions}
- Duration: ${workoutData.totalDuration} minutes
- Exercises performed: ${workoutData.exercises.map(e => `${e.name} (top set: ${e.topSet.weight}${e.topSet.unit} × ${e.topSet.reps})`).join(', ')}
- Total volume: ${workoutData.totalVolume}kg
- Average RPE: ${workoutData.avgRpe.toFixed(1)}
- Body parts trained: ${Array.from(workoutData.bodyParts).join(', ')}
${workoutData.bodyWeight ? `- Body weight: ${workoutData.bodyWeight}` : ''}

Mention which body parts were trained, highlight top lifts with weights and reps, note total training volume, include average RPE, and call out any personal records or milestones. Keep the tone motivational, concise, and encouraging — like a coach giving a recap.`;

    // Generate AI summary
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a friendly fitness coach providing workout summaries.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0]?.message?.content;

    if (!summary) {
      return new Response(
        JSON.stringify({ error: 'No summary generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save summary to database
    const { error: saveError } = await supabase
      .from('workout_summary')
      .upsert({
        user_id: userId,
        date,
        summary_text: summary
      });

    if (saveError) {
      console.error('Save error:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});