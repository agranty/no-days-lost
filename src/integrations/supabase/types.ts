export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      body_parts: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          id: string
          is_user_defined: boolean
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          is_user_defined?: boolean
          name: string
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          is_user_defined?: boolean
          name?: string
        }
        Relationships: []
      }
      body_weight_logs: {
        Row: {
          body_weight: number
          created_at: string | null
          date: string
          id: string
          notes: string | null
          unit: Database["public"]["Enums"]["unit_type"]
          user_id: string
        }
        Insert: {
          body_weight: number
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          unit?: Database["public"]["Enums"]["unit_type"]
          user_id: string
        }
        Update: {
          body_weight?: number
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          unit?: Database["public"]["Enums"]["unit_type"]
          user_id?: string
        }
        Relationships: []
      }
      cardio_details: {
        Row: {
          cadence_rpm: number | null
          cardio_type_id: string
          created_at: string | null
          id: string
          incline_percent: number | null
          resistance_level: number | null
          workout_set_id: string
        }
        Insert: {
          cadence_rpm?: number | null
          cardio_type_id: string
          created_at?: string | null
          id?: string
          incline_percent?: number | null
          resistance_level?: number | null
          workout_set_id: string
        }
        Update: {
          cadence_rpm?: number | null
          cardio_type_id?: string
          created_at?: string | null
          id?: string
          incline_percent?: number | null
          resistance_level?: number | null
          workout_set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_details_cardio_type_id_fkey"
            columns: ["cardio_type_id"]
            isOneToOne: false
            referencedRelation: "cardio_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_details_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string | null
          created_by_user_id: string | null
          default_unit: Database["public"]["Enums"]["unit_type"] | null
          id: string
          is_machine_based: boolean | null
          is_user_defined: boolean | null
          name: string
          notes: string | null
          primary_body_part_id: string | null
          secondary_body_part_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string | null
          created_by_user_id?: string | null
          default_unit?: Database["public"]["Enums"]["unit_type"] | null
          id?: string
          is_machine_based?: boolean | null
          is_user_defined?: boolean | null
          name: string
          notes?: string | null
          primary_body_part_id?: string | null
          secondary_body_part_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string | null
          created_by_user_id?: string | null
          default_unit?: Database["public"]["Enums"]["unit_type"] | null
          id?: string
          is_machine_based?: boolean | null
          is_user_defined?: boolean | null
          name?: string
          notes?: string | null
          primary_body_part_id?: string | null
          secondary_body_part_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_primary_body_part_id_fkey"
            columns: ["primary_body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          calibration_notes: string | null
          created_at: string | null
          id: string
          location: string | null
          name: string
          selector_setting_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calibration_notes?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          selector_setting_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calibration_notes?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          selector_setting_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string | null
          exercise_id: string
          id: string
          session_id: string | null
          set_id: string | null
          type: Database["public"]["Enums"]["pr_type"]
          unit: string | null
          user_id: string
          value: number
        }
        Insert: {
          achieved_at: string
          created_at?: string | null
          exercise_id: string
          id?: string
          session_id?: string | null
          set_id?: string | null
          type: Database["public"]["Enums"]["pr_type"]
          unit?: string | null
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          created_at?: string | null
          exercise_id?: string
          id?: string
          session_id?: string | null
          set_id?: string | null
          type?: Database["public"]["Enums"]["pr_type"]
          unit?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_period_end: string | null
          email: string
          id: string
          plan: string
          stripe_customer_id: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          email: string
          id: string
          plan?: string
          stripe_customer_id?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          email?: string
          id?: string
          plan?: string
          stripe_customer_id?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          default_unit: Database["public"]["Enums"]["unit_type"] | null
          distance_unit:
            | Database["public"]["Enums"]["distance_unit_type"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_unit?: Database["public"]["Enums"]["unit_type"] | null
          distance_unit?:
            | Database["public"]["Enums"]["distance_unit_type"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_unit?: Database["public"]["Enums"]["unit_type"] | null
          distance_unit?:
            | Database["public"]["Enums"]["distance_unit_type"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          session_id: string
          sort_index: number
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          session_id: string
          sort_index?: number
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          session_id?: string
          sort_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration_min: number | null
          end_time: string | null
          id: string
          notes: string | null
          perceived_exertion: number | null
          start_time: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          duration_min?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          start_time?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_min?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          start_time?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_sets: {
        Row: {
          avg_hr_bpm: number | null
          created_at: string | null
          distance_m: number | null
          duration_sec: number | null
          estimated_1rm: number | null
          id: string
          machine_id: string | null
          machine_setting: string | null
          pace_sec_per_km: number | null
          pace_sec_per_mile: number | null
          reps: number | null
          rest_sec: number | null
          rpe: number | null
          set_index: number
          unit: Database["public"]["Enums"]["unit_type"] | null
          weight: number | null
          workout_exercise_id: string
        }
        Insert: {
          avg_hr_bpm?: number | null
          created_at?: string | null
          distance_m?: number | null
          duration_sec?: number | null
          estimated_1rm?: number | null
          id?: string
          machine_id?: string | null
          machine_setting?: string | null
          pace_sec_per_km?: number | null
          pace_sec_per_mile?: number | null
          reps?: number | null
          rest_sec?: number | null
          rpe?: number | null
          set_index?: number
          unit?: Database["public"]["Enums"]["unit_type"] | null
          weight?: number | null
          workout_exercise_id: string
        }
        Update: {
          avg_hr_bpm?: number | null
          created_at?: string | null
          distance_m?: number | null
          duration_sec?: number | null
          estimated_1rm?: number | null
          id?: string
          machine_id?: string | null
          machine_setting?: string | null
          pace_sec_per_km?: number | null
          pace_sec_per_mile?: number | null
          reps?: number | null
          rest_sec?: number | null
          rpe?: number | null
          set_index?: number
          unit?: Database["public"]["Enums"]["unit_type"] | null
          weight?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_summary: {
        Row: {
          created_at: string | null
          date: string
          id: string
          summary_text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          summary_text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          summary_text?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_for_webhook: {
        Args: { profile_id: string }
        Returns: Json
      }
    }
    Enums: {
      distance_unit_type: "km" | "mile"
      exercise_category: "strength" | "cardio" | "mobility"
      pr_type:
        | "one_rm_estimate"
        | "best_weight_single_set"
        | "best_volume_day"
        | "fastest_1k"
        | "fastest_mile"
        | "fastest_5k"
        | "longest_distance"
      unit_type: "kg" | "lb"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      distance_unit_type: ["km", "mile"],
      exercise_category: ["strength", "cardio", "mobility"],
      pr_type: [
        "one_rm_estimate",
        "best_weight_single_set",
        "best_volume_day",
        "fastest_1k",
        "fastest_mile",
        "fastest_5k",
        "longest_distance",
      ],
      unit_type: ["kg", "lb"],
    },
  },
} as const
