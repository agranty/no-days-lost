import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  plan: string;
  subscription_status: string;
  current_period_end?: string;
  last_login_at?: string;
  created_at: string;
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireAuth(): Promise<{ user: User; profile: UserProfile }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AuthError(401, 'Authentication required');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new AuthError(404, 'User profile not found');
  }

  return { user, profile: profile as UserProfile };
}

export async function requireAdmin(): Promise<{ user: User; profile: UserProfile }> {
  const { user, profile } = await requireAuth();
  
  if (profile.role !== 'admin') {
    throw new AuthError(403, 'Admin access required');
  }

  return { user, profile };
}

export async function logAuditAction(
  actorUserId: string,
  action: string,
  targetUserId?: string,
  metadata: Record<string, any> = {}
) {
  await supabase
    .from('audit_logs')
    .insert({
      actor_user_id: actorUserId,
      target_user_id: targetUserId,
      action,
      metadata
    });
}