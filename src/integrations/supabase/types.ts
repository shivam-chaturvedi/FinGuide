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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          type: 'video' | 'text' | 'quiz'
          duration_minutes: number
          video_url: string | null
          text_content: string | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          is_completed: boolean
          is_locked: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          type: 'video' | 'text' | 'quiz'
          duration_minutes?: number
          video_url?: string | null
          text_content?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          is_completed?: boolean
          is_locked?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          type?: 'video' | 'text' | 'quiz'
          duration_minutes?: number
          video_url?: string | null
          text_content?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          is_completed?: boolean
          is_locked?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          module_id: string
          answers: Json | null
          score: number | null
          passed: boolean
          time_taken_minutes: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          module_id: string
          answers?: Json | null
          score?: number | null
          passed?: boolean
          time_taken_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          module_id?: string
          answers?: Json | null
          score?: number | null
          passed?: boolean
          time_taken_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quizzes: {
        Row: {
          id: string
          name: string
          description: string | null
          questions: Json
          passing_score: number
          time_limit_minutes: number | null
          is_published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          questions: Json
          passing_score?: number
          time_limit_minutes?: number | null
          is_published?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          questions?: Json
          passing_score?: number
          time_limit_minutes?: number | null
          is_published?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string
          category: 'basics' | 'management' | 'remittance' | 'advanced' | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
          level: 'Beginner' | 'Intermediate' | 'Advanced' | null
          estimated_duration: number | null
          duration_weeks: number | null
          rating: number | null
          progress: number | null
          status: 'completed' | 'in-progress' | 'locked' | 'not-started' | null
          price: 'Free' | 'Premium' | null
          thumbnail: string | null
          what_youll_learn: string[] | null
          prerequisites: string[] | null
          quiz_score: number | null
          video_url: string | null
          thumbnail_url: string | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          quiz_id: string | null
          is_published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: string
          category?: 'basics' | 'management' | 'remittance' | 'advanced' | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          level?: 'Beginner' | 'Intermediate' | 'Advanced' | null
          estimated_duration?: number | null
          duration_weeks?: number | null
          rating?: number | null
          progress?: number | null
          status?: 'completed' | 'in-progress' | 'locked' | 'not-started' | null
          price?: 'Free' | 'Premium' | null
          thumbnail?: string | null
          what_youll_learn?: string[] | null
          prerequisites?: string[] | null
          quiz_score?: number | null
          video_url?: string | null
          thumbnail_url?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          quiz_id?: string | null
          is_published?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string
          category?: 'basics' | 'management' | 'remittance' | 'advanced' | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          level?: 'Beginner' | 'Intermediate' | 'Advanced' | null
          estimated_duration?: number | null
          duration_weeks?: number | null
          rating?: number | null
          progress?: number | null
          status?: 'completed' | 'in-progress' | 'locked' | 'not-started' | null
          price?: 'Free' | 'Premium' | null
          thumbnail?: string | null
          what_youll_learn?: string[] | null
          prerequisites?: string[] | null
          quiz_score?: number | null
          video_url?: string | null
          thumbnail_url?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          quiz_id?: string | null
          is_published?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          is_completed: boolean
          completed_at: string | null
          quiz_answers: Json | null
          quiz_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          is_completed?: boolean
          completed_at?: string | null
          quiz_answers?: Json | null
          quiz_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          is_completed?: boolean
          completed_at?: string | null
          quiz_answers?: Json | null
          quiz_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_module_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          progress: number
          status: 'completed' | 'in-progress' | 'locked' | 'not-started'
          quiz_score: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          progress?: number
          status?: 'completed' | 'in-progress' | 'locked' | 'not-started'
          quiz_score?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          progress?: number
          status?: 'completed' | 'in-progress' | 'locked' | 'not-started'
          quiz_score?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_module_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          country: string | null
          created_at: string | null
          financial_goals: string[] | null
          full_name: string
          id: string
          monthly_income: number | null
          occupation: string | null
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          financial_goals?: string[] | null
          full_name: string
          id?: string
          monthly_income?: number | null
          occupation?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          financial_goals?: string[] | null
          full_name?: string
          id?: string
          monthly_income?: number | null
          occupation?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
