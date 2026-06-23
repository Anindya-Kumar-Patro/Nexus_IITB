export type Department =
  | "CSE" | "Electrical" | "Mechanical" | "Civil" | "Chemical" | "Aerospace"
  | "Metallurgy" | "EnergyScience" | "EngineeringPhysics" | "IDC" | "SJMSOM"
  | "Mathematics" | "Physics" | "Chemistry" | "Other";

export type UserRole = "Founder" | "Builder" | "Both";
export type AccountType = "student" | "faculty" | "investor";
export type VentureStage = "Brainstorming" | "MVP" | "Early traction" | "Funded";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  roll_number: string | null;
  department: Department | null;
  role: UserRole | null;
  account_type: AccountType;
  skills: string[];
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Venture {
  id: string;
  owner_id: string;
  title: string;
  one_liner: string;
  description: string;
  stage: VentureStage;
  roles_needed: string[];
  domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  venture_id: string;
  applicant_id: string;
  role: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  application_id: string;
  venture_id: string;
  owner_id: string;
  applicant_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  file_url: string | null;
  file_name: string | null;
  read: boolean;
  created_at: string;
}

export interface Bookmark {
  user_id: string;
  venture_id: string;
  created_at: string;
}

export interface VentureWithOwner extends Venture {
  owner: Pick<Profile, "full_name" | "department" | "role"> | null;
}

export interface ApplicationWithVenture extends Application {
  venture: Pick<Venture, "id" | "title" | "one_liner" | "stage"> | null;
}

export interface ApplicationWithApplicant extends Application {
  applicant: Profile | null;
  venture: Pick<Venture, "id" | "title"> | null;
}

export interface ConversationWithDetails extends Conversation {
  venture: Pick<Venture, "id" | "title" | "one_liner"> | null;
  owner: Pick<Profile, "id" | "full_name" | "department" | "role" | "skills" | "email" | "linkedin_url"> | null;
  applicant: Pick<Profile, "id" | "full_name" | "department" | "role" | "skills" | "email" | "linkedin_url"> | null;
  application: Pick<Application, "id" | "role" | "message" | "status"> | null;
  last_message: string | null;
  unread_count: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      };
      ventures: {
        Row: Venture;
        Insert: Omit<Venture, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Venture, "id" | "owner_id" | "created_at">>;
      };
      applications: {
        Row: Application;
        Insert: {
          venture_id: string;
          applicant_id: string;
          role: string;
          message?: string | null;
          status?: ApplicationStatus;
        };
        Update: Partial<Pick<Application, "status">>;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: { user_id: string; venture_id: string };
        Update: never;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at">;
        Update: never;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at" | "read">;
        Update: Partial<Pick<Message, "read">>;
      };
    };
  };
}
export type { MessageState } from "@/actions/messages";
