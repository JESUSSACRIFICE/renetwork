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
      awards: {
        Row: {
          created_at: string
          date_awarded: string | null
          description: string | null
          id: string
          image_url: string | null
          recipient_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date_awarded?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          recipient_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date_awarded?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          recipient_id?: string | null
          title?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          group_id: string
          id: string
          is_pinned: boolean | null
          reply_count: number | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          group_id: string
          id?: string
          is_pinned?: boolean | null
          reply_count?: number | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_pinned?: boolean | null
          reply_count?: number | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_pinned: boolean | null
          member_count: number | null
          owner_id: string
          privacy: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_pinned?: boolean | null
          member_count?: number | null
          owner_id: string
          privacy?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_pinned?: boolean | null
          member_count?: number | null
          owner_id?: string
          privacy?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hot_topics: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          profile_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          profile_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          profile_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      payment_preferences: {
        Row: {
          accepts_cash: boolean | null
          accepts_credit: boolean | null
          accepts_financing: boolean | null
          created_at: string | null
          id: string
          payment_packet: string | null
          payment_terms: string | null
          stripe_account_id: string | null
          user_id: string
        }
        Insert: {
          accepts_cash?: boolean | null
          accepts_credit?: boolean | null
          accepts_financing?: boolean | null
          created_at?: string | null
          id?: string
          payment_packet?: string | null
          payment_terms?: string | null
          stripe_account_id?: string | null
          user_id: string
        }
        Update: {
          accepts_cash?: boolean | null
          accepts_credit?: boolean | null
          accepts_financing?: boolean | null
          created_at?: string | null
          id?: string
          payment_packet?: string | null
          payment_terms?: string | null
          stripe_account_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name: string
          hourly_rate: number | null
          id: string
          languages: string[] | null
          license_number: string | null
          phone: string | null
          price_per_sqft: number | null
          referral_fee_percentage: number | null
          training_details: string | null
          updated_at: string | null
          website: string | null
          willing_to_train: boolean | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name: string
          hourly_rate?: number | null
          id: string
          languages?: string[] | null
          license_number?: string | null
          phone?: string | null
          price_per_sqft?: number | null
          referral_fee_percentage?: number | null
          training_details?: string | null
          updated_at?: string | null
          website?: string | null
          willing_to_train?: boolean | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          license_number?: string | null
          phone?: string | null
          price_per_sqft?: number | null
          referral_fee_percentage?: number | null
          training_details?: string | null
          updated_at?: string | null
          website?: string | null
          willing_to_train?: boolean | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          profile_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          profile_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          name: string
          search_params: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          search_params: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          search_params?: Json
          user_id?: string
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          radius_miles: number
          user_id: string
          zip_code: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          radius_miles?: number
          user_id: string
          zip_code: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          radius_miles?: number
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          name: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["professional_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["professional_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["professional_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["professional_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      experience_level: "expert" | "mature" | "seasonal" | "new"
      professional_role:
        | "real_estate_agent"
        | "mortgage_consultant"
        | "real_estate_attorney"
        | "escrow_officer"
        | "property_inspector"
        | "appraiser"
        | "title_officer"
        | "general_contractor"
        | "electrician"
        | "plumber"
        | "hvac_technician"
        | "roofer"
        | "landscaper"
        | "admin"
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
      experience_level: ["expert", "mature", "seasonal", "new"],
      professional_role: [
        "real_estate_agent",
        "mortgage_consultant",
        "real_estate_attorney",
        "escrow_officer",
        "property_inspector",
        "appraiser",
        "title_officer",
        "general_contractor",
        "electrician",
        "plumber",
        "hvac_technician",
        "roofer",
        "landscaper",
        "admin",
      ],
    },
  },
} as const
