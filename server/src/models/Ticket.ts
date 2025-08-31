export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  created_at: Date;
  updated_at: Date;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
}
