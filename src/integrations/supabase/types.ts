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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string
          display_label: string | null
          id: string
          password_hash: string
          role: string
          supabase_email: string | null
          supabase_user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          display_label?: string | null
          id?: string
          password_hash: string
          role?: string
          supabase_email?: string | null
          supabase_user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          display_label?: string | null
          id?: string
          password_hash?: string
          role?: string
          supabase_email?: string | null
          supabase_user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      admin_login_requests: {
        Row: {
          created_at: string
          credential_id: string
          expires_at: string
          id: string
          ip_address: string | null
          remember_me: boolean
          resolved_at: string | null
          status: string
          token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          credential_id: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          remember_me?: boolean
          resolved_at?: string | null
          status?: string
          token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          credential_id?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          remember_me?: boolean
          resolved_at?: string | null
          status?: string
          token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_login_requests_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          last_login_at: string | null
          mfa_enrolled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          mfa_enrolled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          mfa_enrolled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          access_count: number | null
          created_at: string
          credential_id: string
          expires_at: string
          id: string
          last_accessed_at: string | null
          last_ip_address: string | null
          last_user_agent: string | null
          session_token: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          credential_id: string
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          last_ip_address?: string | null
          last_user_agent?: string | null
          session_token: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          credential_id?: string
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          last_ip_address?: string | null
          last_user_agent?: string | null
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          abandoned_at: string | null
          created_at: string
          email: string | null
          id: string
          item_count: number
          items: Json
          recovered_at: string | null
          session_id: string | null
          status: string
          subtotal: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          abandoned_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          item_count?: number
          items?: Json
          recovered_at?: string | null
          session_id?: string | null
          status?: string
          subtotal?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          abandoned_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          item_count?: number
          items?: Json
          recovered_at?: string | null
          session_id?: string | null
          status?: string
          subtotal?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          changed_at: string
          changed_by: string | null
          entity_id: string
          entity_label: string | null
          entity_type: string
          id: string
          new_value: Json
          previous_value: Json | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          entity_id: string
          entity_label?: string | null
          entity_type: string
          id?: string
          new_value: Json
          previous_value?: Json | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          entity_id?: string
          entity_label?: string | null
          entity_type?: string
          id?: string
          new_value?: Json
          previous_value?: Json | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          internal_notes: string | null
          last_activity_at: string | null
          name: string | null
          order_count: number | null
          phone: string | null
          status: string | null
          total_spend: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          internal_notes?: string | null
          last_activity_at?: string | null
          name?: string | null
          order_count?: number | null
          phone?: string | null
          status?: string | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          internal_notes?: string | null
          last_activity_at?: string | null
          name?: string | null
          order_count?: number | null
          phone?: string | null
          status?: string | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      maintenance_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          notified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          cancelled_at: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          deleted_at: string | null
          fulfilled_at: string | null
          id: string
          internal_notes: string | null
          line_items: Json | null
          order_number: string
          payment_status: string | null
          shipping: number | null
          shipping_address: Json | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          deleted_at?: string | null
          fulfilled_at?: string | null
          id?: string
          internal_notes?: string | null
          line_items?: Json | null
          order_number: string
          payment_status?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          deleted_at?: string | null
          fulfilled_at?: string | null
          id?: string
          internal_notes?: string | null
          line_items?: Json | null
          order_number?: string
          payment_status?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      preorder_requests: {
        Row: {
          country: string | null
          created_at: string
          delivery_region: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          product_id: string | null
          product_name: string
          size_preference: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          delivery_region?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          product_id?: string | null
          product_name: string
          size_preference?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          delivery_region?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          product_id?: string | null
          product_name?: string
          size_preference?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preorder_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allocated_count: number
          availability: string
          care_info: string | null
          collection: string | null
          color_options: Json | null
          compare_at_price: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          edition_size: number | null
          featured: boolean | null
          gender_segment: string | null
          hero_image_url: string | null
          id: string
          long_description: string | null
          materials: string | null
          media_gallery: Json | null
          name: string
          preorder_enabled: boolean | null
          preorder_statement: string | null
          price: number | null
          seo_description: string | null
          seo_title: string | null
          size_options: Json | null
          sku: string | null
          slug: string
          status: string
          stock_quantity: number | null
          thumbnail_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allocated_count?: number
          availability?: string
          care_info?: string | null
          collection?: string | null
          color_options?: Json | null
          compare_at_price?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          edition_size?: number | null
          featured?: boolean | null
          gender_segment?: string | null
          hero_image_url?: string | null
          id?: string
          long_description?: string | null
          materials?: string | null
          media_gallery?: Json | null
          name: string
          preorder_enabled?: boolean | null
          preorder_statement?: string | null
          price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          size_options?: Json | null
          sku?: string | null
          slug: string
          status?: string
          stock_quantity?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allocated_count?: number
          availability?: string
          care_info?: string | null
          collection?: string | null
          color_options?: Json | null
          compare_at_price?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          edition_size?: number | null
          featured?: boolean | null
          gender_segment?: string | null
          hero_image_url?: string | null
          id?: string
          long_description?: string | null
          materials?: string | null
          media_gallery?: Json | null
          name?: string
          preorder_enabled?: boolean | null
          preorder_statement?: string | null
          price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          size_options?: Json | null
          sku?: string | null
          slug?: string
          status?: string
          stock_quantity?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_city: string | null
          billing_country: string | null
          billing_state_province: string | null
          billing_street_address: string | null
          billing_street_address_2: string | null
          billing_zip_code: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          phone: string | null
          preferences: Json | null
          state_province: string | null
          street_address: string | null
          street_address_2: string | null
          updated_at: string
          use_shipping_as_billing: boolean | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_state_province?: string | null
          billing_street_address?: string | null
          billing_street_address_2?: string | null
          billing_zip_code?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          phone?: string | null
          preferences?: Json | null
          state_province?: string | null
          street_address?: string | null
          street_address_2?: string | null
          updated_at?: string
          use_shipping_as_billing?: boolean | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_state_province?: string | null
          billing_street_address?: string | null
          billing_street_address_2?: string | null
          billing_zip_code?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          phone?: string | null
          preferences?: Json | null
          state_province?: string | null
          street_address?: string | null
          street_address_2?: string | null
          updated_at?: string
          use_shipping_as_billing?: boolean | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          attempted_at: string
          id: string
          identifier: string
          metadata: Json | null
          scope: string
          success: boolean
        }
        Insert: {
          attempted_at?: string
          id?: string
          identifier: string
          metadata?: Json | null
          scope: string
          success?: boolean
        }
        Update: {
          attempted_at?: string
          id?: string
          identifier?: string
          metadata?: Json | null
          scope?: string
          success?: boolean
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_value: Json
          id: string
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_value?: Json
          id?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_value?: Json
          id?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          maintenance_collect_email: boolean
          maintenance_enabled: boolean
          maintenance_headline: string
          maintenance_started_at: string | null
          maintenance_subline: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          maintenance_collect_email?: boolean
          maintenance_enabled?: boolean
          maintenance_headline?: string
          maintenance_started_at?: string | null
          maintenance_subline?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          maintenance_collect_email?: boolean
          maintenance_enabled?: boolean
          maintenance_headline?: string
          maintenance_started_at?: string | null
          maintenance_subline?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_snapshots: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          products_data: Json
          site_content_data: Json
          site_settings_data: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          products_data?: Json
          site_content_data?: Json
          site_settings_data?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          products_data?: Json
          site_content_data?: Json
          site_settings_data?: Json
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_rate_limit_attempts: {
        Args: { _older_than_hours?: number }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_editor_or_admin: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      verify_admin_credentials: {
        Args: { p_password: string; p_username: string }
        Returns: {
          display_label: string
          id: string
          role: string
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "support_viewer"
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
      app_role: ["super_admin", "admin", "editor", "support_viewer"],
    },
  },
} as const
