export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          custom_url: string | null;
          ki_points: number;
          role: 'authenticated' | 'admin';
          email_verified: boolean;
          email_notifications: boolean;
          last_active: string | null;
          created_at: string;
          updated_at: string;
          skills: Array<{
            name: string;
            isTopSkill: boolean;
            level: 'beginner' | 'intermediate' | 'expert';
            endorsements?: number;
          }>;
          social_links: {
            website?: string;
            twitter?: string;
            github?: string;
            linkedin?: string;
          };
          stats: {
            monthlyPoints: number;
            quarterlyPoints: number;
            yearlyPoints: number;
            totalEarned: number;
            totalSpent: number;
            lastUpdated: string | null;
            asksCompleted: number;
            offersCompleted: number;
            responseRate: number;
            averageRating: number;
            totalRatings: number;
            reputation: number;
          };
          settings: {
            theme: 'light' | 'dark';
            language: string;
            timezone: string;
            notifications: {
              email: boolean;
              browser: boolean;
              mobile: boolean;
              digest: 'daily' | 'weekly' | 'never';
            };
            privacy: {
              showEmail: boolean;
              showLocation: boolean;
              showActivity: boolean;
            };
          };
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          custom_url?: string | null;
          ki_points?: number;
          role?: 'authenticated' | 'admin';
          email_verified?: boolean;
          email_notifications?: boolean;
          last_active?: string | null;
          created_at?: string;
          updated_at?: string;
          skills?: Array<{
            name: string;
            isTopSkill: boolean;
            level: 'beginner' | 'intermediate' | 'expert';
            endorsements?: number;
          }>;
          social_links?: {
            website?: string;
            twitter?: string;
            github?: string;
            linkedin?: string;
          };
          stats?: {
            monthlyPoints: number;
            quarterlyPoints: number;
            yearlyPoints: number;
            totalEarned: number;
            totalSpent: number;
            lastUpdated: string | null;
            asksCompleted: number;
            offersCompleted: number;
            responseRate: number;
            averageRating: number;
            totalRatings: number;
            reputation: number;
          };
          settings?: {
            theme: 'light' | 'dark';
            language: string;
            timezone: string;
            notifications: {
              email: boolean;
              browser: boolean;
              mobile: boolean;
              digest: 'daily' | 'weekly' | 'never';
            };
            privacy: {
              showEmail: boolean;
              showLocation: boolean;
              showActivity: boolean;
            };
          };
        };
        Update: {
          email?: string;
          name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          custom_url?: string | null;
          ki_points?: number;
          role?: 'authenticated' | 'admin';
          email_verified?: boolean;
          email_notifications?: boolean;
          last_active?: string | null;
          updated_at?: string;
          skills?: Array<{
            name: string;
            isTopSkill: boolean;
            level: 'beginner' | 'intermediate' | 'expert';
            endorsements?: number;
          }>;
          social_links?: {
            website?: string;
            twitter?: string;
            github?: string;
            linkedin?: string;
          };
          stats?: {
            monthlyPoints: number;
            quarterlyPoints: number;
            yearlyPoints: number;
            totalEarned: number;
            totalSpent: number;
            lastUpdated: string | null;
            asksCompleted: number;
            offersCompleted: number;
            responseRate: number;
            averageRating: number;
            totalRatings: number;
            reputation: number;
          };
          settings?: {
            theme: 'light' | 'dark';
            language: string;
            timezone: string;
            notifications: {
              email: boolean;
              browser: boolean;
              mobile: boolean;
              digest: 'daily' | 'weekly' | 'never';
            };
            privacy: {
              showEmail: boolean;
              showLocation: boolean;
              showActivity: boolean;
            };
          };
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string | null;
          owner_id: string;
          member_count: number;
          visibility: 'public' | 'private' | 'unlisted';
          requires_approval: boolean;
          guidelines: string | null;
          created_at: string;
          updated_at: string;
          settings: {
            allowMemberPosts: boolean;
            allowMemberEvents: boolean;
            allowMemberInvites: boolean;
            autoApproveMembers: boolean;
            defaultKiPoints: {
              ask: number;
              offer: number;
            };
            categories: string[];
            tags: string[];
            moderation: {
              requirePostApproval: boolean;
              autoModeration: boolean;
              bannedWords: string[];
            };
          };
          stats: {
            totalPosts: number;
            totalEvents: number;
            totalKiPoints: number;
            activeMembers: number;
            weeklyGrowth: number;
            monthlyGrowth: number;
            engagementRate: number;
            topContributors: any[];
          };
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url?: string | null;
          owner_id: string;
          member_count?: number;
          visibility?: 'public' | 'private' | 'unlisted';
          requires_approval?: boolean;
          guidelines?: string | null;
          created_at?: string;
          updated_at?: string;
          settings?: {
            allowMemberPosts?: boolean;
            allowMemberEvents?: boolean;
            allowMemberInvites?: boolean;
            autoApproveMembers?: boolean;
            defaultKiPoints?: {
              ask: number;
              offer: number;
            };
            categories?: string[];
            tags?: string[];
            moderation?: {
              requirePostApproval?: boolean;
              autoModeration?: boolean;
              bannedWords?: string[];
            };
          };
          stats?: {
            totalPosts?: number;
            totalEvents?: number;
            totalKiPoints?: number;
            activeMembers?: number;
            weeklyGrowth?: number;
            monthlyGrowth?: number;
            engagementRate?: number;
            topContributors?: any[];
          };
        };
        Update: {
          name?: string;
          description?: string;
          image_url?: string | null;
          owner_id?: string;
          member_count?: number;
          visibility?: 'public' | 'private' | 'unlisted';
          requires_approval?: boolean;
          guidelines?: string | null;
          updated_at?: string;
          settings?: {
            allowMemberPosts?: boolean;
            allowMemberEvents?: boolean;
            allowMemberInvites?: boolean;
            autoApproveMembers?: boolean;
            defaultKiPoints?: {
              ask: number;
              offer: number;
            };
            categories?: string[];
            tags?: string[];
            moderation?: {
              requirePostApproval?: boolean;
              autoModeration?: boolean;
              bannedWords?: string[];
            };
          };
          stats?: {
            totalPosts?: number;
            totalEvents?: number;
            totalKiPoints?: number;
            activeMembers?: number;
            weeklyGrowth?: number;
            monthlyGrowth?: number;
            engagementRate?: number;
            topContributors?: any[];
          };
        };
      };
      community_members: {
        Row: {
          community_id: string;
          user_id: string;
          role: 'member' | 'moderator' | 'admin';
          status: 'pending' | 'approved' | 'rejected';
          joined_at: string;
        };
        Insert: {
          community_id: string;
          user_id: string;
          role?: 'member' | 'moderator' | 'admin';
          status?: 'pending' | 'approved' | 'rejected';
          joined_at?: string;
        };
        Update: {
          role?: 'member' | 'moderator' | 'admin';
          status?: 'pending' | 'approved' | 'rejected';
          joined_at?: string;
        };
      };
    };
  };
}