import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  plan: string;
  subscription_status: string;
  current_period_end?: string;
  last_login_at?: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile to check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const body = await req.json();
    const { action } = body;

    // Route handling based on action in request body
    if (req.method === 'POST') {
      if (action === 'set-role') {
        return await handleSetRole(req, supabase, user.id, body);
      } else if (action === 'grant-pro') {
        return await handleGrantPro(req, supabase, user.id, body);
      } else if (action === 'downgrade') {
        return await handleDowngrade(req, supabase, user.id, body);
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSetRole(req: Request, supabase: any, actorUserId: string, body: any) {
  try {
    const { userId, role } = body;

    if (!userId || !role || !['user', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user data
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Update user role
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: actorUserId,
        target_user_id: userId,
        action: role === 'admin' ? 'make_admin' : 'remove_admin',
        metadata: { 
          previous_role: currentUser?.role, 
          new_role: role,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error setting role:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to set role' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGrantPro(req: Request, supabase: any, actorUserId: string, body: any) {
  try {
    const { userId, months = 12 } = body;

    if (!userId || months < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Update user plan
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: 'pro',
        subscription_status: 'active',
        current_period_end: endDate.toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: actorUserId,
        target_user_id: userId,
        action: 'grant_pro',
        metadata: { 
          months,
          end_date: endDate.toISOString(),
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error granting pro:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to grant pro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDowngrade(req: Request, supabase: any, actorUserId: string, body: any) {
  try {
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user plan
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: 'free',
        subscription_status: 'inactive',
        current_period_end: null
      })
      .eq('id', userId);

    if (error) throw error;

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: actorUserId,
        target_user_id: userId,
        action: 'downgrade_plan',
        metadata: { 
          previous_plan: 'pro',
          new_plan: 'free',
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error downgrading user:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to downgrade user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}