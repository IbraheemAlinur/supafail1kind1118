export interface Skill {
  name: string;
  isTopSkill: boolean;
  level: 'beginner' | 'intermediate' | 'expert';
  endorsements?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  kiPoints: number;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  skills?: Skill[];
  customUrl?: string;
  emailVerified: boolean;
  emailNotifications?: boolean;
  createdAt: Date;
  lastActive: Date;
  socialLinks?: {
    website?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}