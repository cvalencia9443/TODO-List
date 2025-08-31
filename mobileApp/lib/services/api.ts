import { TicketStatus } from "@/lib/database/models/Ticket";

const API_BASE_URL = "http://10.0.0.45:3001/api";

export interface ApiTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  status: TicketStatus;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getTickets(): Promise<ApiTicket[]> {
    const response = await this.request<{
      success: boolean;
      data: ApiTicket[];
    }>("/tickets");
    return response.data;
  }

  async getTicket(id: string): Promise<ApiTicket> {
    const response = await this.request<{ success: boolean; data: ApiTicket }>(
      `/tickets/${id}`
    );
    return response.data;
  }

  async createTicket(ticket: CreateTicketRequest): Promise<ApiTicket> {
    const response = await this.request<{ success: boolean; data: ApiTicket }>(
      "/tickets",
      {
        method: "POST",
        body: JSON.stringify(ticket),
      }
    );
    return response.data;
  }

  async updateTicket(
    id: string,
    updates: UpdateTicketRequest
  ): Promise<ApiTicket> {
    const response = await this.request<{ success: boolean; data: ApiTicket }>(
      `/tickets/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
    return response.data;
  }

  async deleteTicket(id: string): Promise<void> {
    await this.request<void>(`/tickets/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
