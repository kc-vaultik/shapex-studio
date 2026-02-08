import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  source: string;
  overall_score: number;
  feasibility_score: number;
  market_score: number;
  monetization_score: number;
  competition_score: number;
  risk_score: number;
  created_at: string;
}

export const fetchIdeas = async (limit: number = 5): Promise<Idea[]> => {
  try {
    const response = await axios.get(`${API_BASE}/ideas`, {
      params: { limit, sort_by: 'overall_score' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return [];
  }
};

export const registerUser = async (email: string, tier: string) => {
  try {
    const response = await axios.post(`${API_BASE}/register`, {
      email,
      tier
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export interface Stats {
  total_ideas: number;
  ideas_today: number;
  avg_score: number;
  top_categories: string[];
  data_sources: number;
  scanning_status: string;
}

export const fetchStats = async (): Promise<Stats | null> => {
  try {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

export interface CheckoutData {
  email: string;
  tier: string;
  success_url?: string;
  cancel_url?: string;
}

export const createCheckoutSession = async (data: CheckoutData) => {
  try {
    const response = await axios.post(`${API_BASE}/billing/create-checkout`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createBillingPortalSession = async (customerId: string) => {
  try {
    const response = await axios.post(`${API_BASE}/billing/create-portal-session`, {
      customer_id: customerId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
};
