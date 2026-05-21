import type { Timestamp } from "firebase/firestore";

export interface Ticket {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  countryCode: string;
  location: string;
  googleUserId: string;
  googleDisplayName: string;
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
  createdAt: Timestamp | null;
  notes?: string;
  scheduledDate?: string;
}