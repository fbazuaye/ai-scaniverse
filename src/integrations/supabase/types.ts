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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          access_granted: boolean
          access_method: string
          card_id: string
          driver_id: string | null
          error_message: string | null
          id: string
          timestamp: string | null
          vehicle_id: string | null
        }
        Insert: {
          access_granted: boolean
          access_method: string
          card_id: string
          driver_id?: string | null
          error_message?: string | null
          id?: string
          timestamp?: string | null
          vehicle_id?: string | null
        }
        Update: {
          access_granted?: boolean
          access_method?: string
          card_id?: string
          driver_id?: string | null
          error_message?: string | null
          id?: string
          timestamp?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          rate_limit: number
          updated_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          rate_limit?: number
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          rate_limit?: number
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          endpoint: string
          error_count: number
          id: string
          request_count: number
          success_count: number
          timestamp: string
        }
        Insert: {
          api_key_id?: string | null
          endpoint: string
          error_count?: number
          id?: string
          request_count?: number
          success_count?: number
          timestamp?: string
        }
        Update: {
          api_key_id?: string | null
          endpoint?: string
          error_count?: number
          id?: string
          request_count?: number
          success_count?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_id: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_goals: {
        Row: {
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          milestones: Json | null
          progress: number | null
          status: string | null
          target_company: string | null
          target_position: string | null
          target_salary: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          progress?: number | null
          status?: string | null
          target_company?: string | null
          target_position?: string | null
          target_salary?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          progress?: number | null
          status?: string | null
          target_company?: string | null
          target_position?: string | null
          target_salary?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company: string | null
          connection_strength: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_date: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          connection_strength?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          connection_strength?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          company_name: string
          content: string
          created_at: string
          id: string
          job_description: string | null
          position_title: string
          status: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          content: string
          created_at?: string
          id?: string
          job_description?: string | null
          position_title: string
          status?: string | null
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          content?: string
          created_at?: string
          id?: string
          job_description?: string | null
          position_title?: string
          status?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          embedding: string | null
          id: string
          metadata: Json | null
          pageContent: string | null
          user_id: string
        }
        Insert: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          pageContent?: string | null
          user_id: string
        }
        Update: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          pageContent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string | null
          email: string
          employee_id: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      football_search_history: {
        Row: {
          created_at: string
          id: string
          question: string
          response: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          response: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          response?: string
          sources?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          aspect_ratio: string
          created_at: string
          id: string
          image_url: string
          prompt: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aspect_ratio: string
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_credentials: {
        Row: {
          access_token_encrypted: string | null
          expires_at: string
          id: number
          refresh_token_encrypted: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          expires_at: string
          id: number
          refresh_token_encrypted?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          expires_at?: string
          id?: number
          refresh_token_encrypted?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_preparations: {
        Row: {
          answers: Json | null
          company_name: string
          created_at: string
          id: string
          interview_date: string | null
          interview_type: string | null
          notes: string | null
          position_title: string
          preparation_status: string | null
          questions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          company_name: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interview_type?: string | null
          notes?: string | null
          position_title: string
          preparation_status?: string | null
          questions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          company_name?: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interview_type?: string | null
          notes?: string | null
          position_title?: string
          preparation_status?: string | null
          questions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          application_date: string | null
          company_name: string
          created_at: string
          id: string
          job_url: string | null
          location: string | null
          notes: string | null
          position_title: string
          salary_range: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_date?: string | null
          company_name: string
          created_at?: string
          id?: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          position_title: string
          salary_range?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_date?: string | null
          company_name?: string
          created_at?: string
          id?: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          position_title?: string
          salary_range?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_matches: {
        Row: {
          application_status: string | null
          company_name: string
          created_at: string
          id: string
          job_description: string | null
          job_title: string
          job_url: string | null
          location: string | null
          match_score: number | null
          matching_skills: string[] | null
          missing_skills: string[] | null
          salary_range: string | null
          saved_at: string | null
          user_id: string
        }
        Insert: {
          application_status?: string | null
          company_name: string
          created_at?: string
          id?: string
          job_description?: string | null
          job_title: string
          job_url?: string | null
          location?: string | null
          match_score?: number | null
          matching_skills?: string[] | null
          missing_skills?: string[] | null
          salary_range?: string | null
          saved_at?: string | null
          user_id: string
        }
        Update: {
          application_status?: string | null
          company_name?: string
          created_at?: string
          id?: string
          job_description?: string | null
          job_title?: string
          job_url?: string | null
          location?: string | null
          match_score?: number | null
          matching_skills?: string[] | null
          missing_skills?: string[] | null
          salary_range?: string | null
          saved_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          completed_resources: string[] | null
          created_at: string
          current_level: number | null
          estimated_hours: number | null
          id: string
          learning_resources: Json | null
          progress: number | null
          skill_name: string
          status: string | null
          target_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_resources?: string[] | null
          created_at?: string
          current_level?: number | null
          estimated_hours?: number | null
          id?: string
          learning_resources?: Json | null
          progress?: number | null
          skill_name: string
          status?: string | null
          target_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_resources?: string[] | null
          created_at?: string
          current_level?: number | null
          estimated_hours?: number | null
          id?: string
          learning_resources?: Json | null
          progress?: number | null
          skill_name?: string
          status?: string | null
          target_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      motivational_content: {
        Row: {
          category: string | null
          content: string
          content_type: string
          created_at: string
          id: string
          is_favorite: boolean | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          content_type: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      motivational_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          quote_text: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          quote_text: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          quote_text?: string
        }
        Relationships: []
      }
      networking_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_date: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          relationship_type: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          relationship_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          relationship_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nfc_cards: {
        Row: {
          card_id: string
          created_at: string | null
          driver_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_revoked: boolean | null
          master_key_version: number
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          card_id: string
          created_at?: string | null
          driver_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_revoked?: boolean | null
          master_key_version?: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string | null
          driver_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_revoked?: boolean | null
          master_key_version?: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfc_cards_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfc_cards_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_logs: {
        Row: {
          action_type: string
          created_at: string
          data: Json | null
          id: string
          tag_uid: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          data?: Json | null
          id?: string
          tag_uid?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          data?: Json | null
          id?: string
          tag_uid?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nfc_metadata: {
        Row: {
          created_at: string
          driver_id: string | null
          encrypted_payload: string
          expiry_date: string | null
          id: string
          is_active: boolean
          last_scanned_at: string | null
          scan_count: number
          tag_uid: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          encrypted_payload: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          scan_count?: number
          tag_uid: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          encrypted_payload?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          scan_count?: number
          tag_uid?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      nfc_operations: {
        Row: {
          error_message: string | null
          id: string
          metadata: Json | null
          operation_type: string
          success: boolean
          tag_uid: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation_type: string
          success?: boolean
          tag_uid?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          success?: boolean
          tag_uid?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          image_urls: string[] | null
          is_featured: boolean | null
          project_url: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean | null
          project_url?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean | null
          project_url?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_search_history: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          query: string
          response: string
          session_id: string | null
          sources: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown
          query: string
          response: string
          session_id?: string | null
          sources?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          query?: string
          response?: string
          session_id?: string | null
          sources?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ats_score: number | null
          content: Json
          created_at: string
          file_url: string | null
          id: string
          is_primary: boolean | null
          last_analyzed_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          content?: Json
          created_at?: string
          file_url?: string | null
          id?: string
          is_primary?: boolean | null
          last_analyzed_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_score?: number | null
          content?: Json
          created_at?: string
          file_url?: string | null
          id?: string
          is_primary?: boolean | null
          last_analyzed_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salary_insights: {
        Row: {
          created_at: string
          currency: string | null
          data_source: string | null
          experience_level: string
          id: string
          last_updated: string | null
          location: string
          position_title: string
          salary_max: number | null
          salary_min: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          data_source?: string | null
          experience_level: string
          id?: string
          last_updated?: string | null
          location: string
          position_title: string
          salary_max?: number | null
          salary_min?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          data_source?: string | null
          experience_level?: string
          id?: string
          last_updated?: string | null
          location?: string
          position_title?: string
          salary_max?: number | null
          salary_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      scan_documents: {
        Row: {
          ai_summary: string | null
          ai_tags: string[] | null
          category: string | null
          created_at: string
          extracted_text: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_sensitive: boolean | null
          metadata: Json | null
          scan_id: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          category?: string | null
          created_at?: string
          extracted_text?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_sensitive?: boolean | null
          metadata?: Json | null
          scan_id: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          category?: string | null
          created_at?: string
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_sensitive?: boolean | null
          metadata?: Json | null
          scan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_documents_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          ai_summary: string | null
          ai_tags: string[] | null
          category: string | null
          content_type: string
          created_at: string
          description: string | null
          extracted_text: string | null
          file_path: string
          file_size: number | null
          id: string
          is_sensitive: boolean | null
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          category?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          extracted_text?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          is_sensitive?: boolean | null
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          category?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          extracted_text?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          is_sensitive?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          answer: string
          citations: Json | null
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          answer: string
          citations?: Json | null
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          answer?: string
          citations?: Json | null
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          notes: string | null
          proficiency_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          proficiency_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          proficiency_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills_assessments: {
        Row: {
          assessment_type: string | null
          certification_url: string | null
          created_at: string
          id: string
          notes: string | null
          proficiency_level: number | null
          skill_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_type?: string | null
          certification_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          proficiency_level?: number | null
          skill_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_type?: string | null
          certification_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          proficiency_level?: number | null
          skill_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staged_images: {
        Row: {
          created_at: string
          id: string
          original_image_url: string
          prompt: string
          room_type: string
          staged_image_url: string
          staging_accessories: string[] | null
          staging_colors: string[] | null
          staging_decor: string[] | null
          staging_furniture: string[] | null
          staging_lighting: string[] | null
          staging_materials: string[] | null
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_image_url: string
          prompt: string
          room_type: string
          staged_image_url: string
          staging_accessories?: string[] | null
          staging_colors?: string[] | null
          staging_decor?: string[] | null
          staging_furniture?: string[] | null
          staging_lighting?: string[] | null
          staging_materials?: string[] | null
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          original_image_url?: string
          prompt?: string
          room_type?: string
          staged_image_url?: string
          staging_accessories?: string[] | null
          staging_colors?: string[] | null
          staging_decor?: string[] | null
          staging_furniture?: string[] | null
          staging_lighting?: string[] | null
          staging_materials?: string[] | null
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          asset_id: string | null
          container_id: string | null
          created_at: string
          id: string
          last_scanned: string | null
          shipment_id: string | null
          tag_uid: string
          updated_at: string
          user_id: string
          written_data: Json
        }
        Insert: {
          asset_id?: string | null
          container_id?: string | null
          created_at?: string
          id?: string
          last_scanned?: string | null
          shipment_id?: string | null
          tag_uid: string
          updated_at?: string
          user_id: string
          written_data: Json
        }
        Update: {
          asset_id?: string | null
          container_id?: string | null
          created_at?: string
          id?: string
          last_scanned?: string | null
          shipment_id?: string | null
          tag_uid?: string
          updated_at?: string
          user_id?: string
          written_data?: Json
        }
        Relationships: []
      }
      token_access_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_encrypted: string
          api_key_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          api_key_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          api_key_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_uploads: {
        Row: {
          content_type: string
          created_at: string
          file_size: number
          file_url: string
          filename: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          file_size: number
          file_url: string
          filename: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          file_size?: number
          file_url?: string
          filename?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          license_plate: string
          model: string
          name: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate: string
          model?: string
          name: string
          updated_at?: string | null
          year?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string
          model?: string
          name?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_google_token_status: {
        Args: never
        Returns: {
          expires_at: string
          has_access_token: boolean
          has_refresh_token: boolean
          id: number
          scope: string
          token_type: string
          updated_at: string
        }[]
      }
      decrypt_token: { Args: { encrypted_token: string }; Returns: string }
      encrypt_token: { Args: { token_value: string }; Returns: string }
      get_user_google_tokens: {
        Args: { target_user_id: string }
        Returns: {
          access_token: string
          expires_at: string
          refresh_token: string
        }[]
      }
      insert_google_credentials: {
        Args: {
          p_access_token: string
          p_expires_at?: string
          p_refresh_token?: string
          p_scope?: string
          p_token_type?: string
        }
        Returns: string
      }
      log_token_access: { Args: { action_type: string }; Returns: undefined }
      update_google_credentials: {
        Args: {
          p_access_token?: string
          p_credential_id: number
          p_expires_at?: string
          p_refresh_token?: string
        }
        Returns: boolean
      }
      validate_api_key: {
        Args: { api_key_value: string }
        Returns: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          rate_limit: number
          updated_at: string
          usage_count: number
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "api_keys"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
