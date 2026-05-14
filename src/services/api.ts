import axios from "axios";
import type { AxiosInstance } from "axios";
import {
  API_USER_OTP_LOGIN,
  API_GET_COMPANIES,
  API_GET_INVENTORY,
  API_CREATE_INVENTORY,
  API_GET_PRODUCTS,
  API_CREATE_PRODUCT,
  API_GET_VENDORS,
  API_CREATE_VENDOR,
  API_CREATE_ORDER,
  API_EXECUTE_GOAL,
  API_GET_AGENT_PULSE,
} from "../constants/ApiPathConstant";

// Use relative URL to go through Vite proxy (handles CORS)
const API_BASE_URL = "";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Bypass ngrok browser warning for free tier
    "ngrok-skip-browser-warning": "true",
  },
});

export { axiosInstance };

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  message?: string;
  success?: boolean;
}

export interface Company {
  id: number;
  name: string;
  address: string;
  location: string;
  business_type: string;
  business_description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: number;
  name: string;
  current_stock: string;
  max_capacity: string;
  reorder_threshold_percentage: string;
  stock_percentage: number;
  needs_reorder: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryPayload {
  name: string;
  current_stock: number;
  max_capacity: number;
  reorder_threshold_percentage: number;
}

export interface RawMaterialUsed {
  id: number;
  name: string;
  unit: string;
  quantity?: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  quantity_available: string;
  quantity_reserved: string;
  total_quantity: string;
  unit_price: string;
  total_value: string;
  raw_materials_used: RawMaterialUsed[];
  manufacturing_date: string;
  expiry_date: string | null;
  warehouse_location: string;
  status: string;
  quality_check_status: string;
  quality_check_notes: string;
  batch_number: string;
  supplier_batch_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  quantity_available: number;
  unit_price: number;
  raw_materials_used: number[];
  manufacturing_date: string;
  description?: string;
  warehouse_location?: string;
  batch_number?: string;
  notes?: string;
}

export interface Vendor {
  id: number;
  name: string;
  material_supply: number;
  material_name: string;
  email: string;
  phone_number: string;
  address: string;
  price_per_unit: number;
  lead_time_days: number;
  reliability_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorPayload {
  name: string;
  material_supply: number;
  email: string;
  phone_number: string;
  address: string;
  price_per_unit: number;
  lead_time_days: number;
  reliability_score: number;
  is_active?: boolean;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  required_delivery_date: string;
  total_amount: number;
  company: number;
  priority: string;
  assigned_to_agent: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  required_delivery_date: string;
  total_amount: number;
  company: number;
  priority: string;
  assigned_to_agent: string;
}

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post(API_USER_OTP_LOGIN, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Login failed with status ${error.response.status}`,
      );
    }
    throw new Error("Login failed");
  }
};

export const getCompanies = async (): Promise<Company[]> => {
  try {
    const response = await axiosInstance.get(API_GET_COMPANIES);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to fetch companies with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to fetch companies");
  }
};

export const getInventory = async (): Promise<Inventory[]> => {
  try {
    const response = await axiosInstance.get(API_GET_INVENTORY);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to fetch inventory with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to fetch inventory");
  }
};
export const createInventory = async (
  payload: CreateInventoryPayload,
): Promise<Inventory> => {
  try {
    const response = await axiosInstance.post(API_CREATE_INVENTORY, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to create inventory with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to create inventory");
  }
};
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(API_GET_PRODUCTS);
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to fetch products with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to fetch products");
  }
};

export const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  try {
    const response = await axiosInstance.post(API_CREATE_PRODUCT, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to create product with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to create product");
  }
};

export interface ExecuteGoalPayload {
  goal: string;
}

export interface ExecuteGoalResponse {
  success?: boolean;
  message?: string;
  result?: string;
  explanation?: string;
  data?: unknown;
  goal?: string;
  inventory_status?: unknown;
  procurement_required?: boolean;
  selected_vendor?: unknown;
  order_quantity?: number;
  expected_cost?: number;
  confidence_score?: number;
}

export const executeGoal = async (
  payload: ExecuteGoalPayload,
): Promise<ExecuteGoalResponse> => {
  try {
    const response = await axiosInstance.post(API_EXECUTE_GOAL, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as { error?: string; message?: string };
      // Prioritize 'error' field over 'message' field
      throw new Error(
        errorData.error || errorData.message || `Failed to execute goal with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to execute goal");
  }
};

// Vendor APIs
export const getVendors = async (): Promise<Vendor[]> => {
  try {
    const response = await axiosInstance.get(API_GET_VENDORS);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to fetch vendors with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to fetch vendors");
  }
};

export const createVendor = async (
  payload: CreateVendorPayload,
): Promise<Vendor> => {
  try {
    const response = await axiosInstance.post(API_CREATE_VENDOR, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to create vendor with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to create vendor");
  }
};

// Order APIs
export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<Order> => {
  try {
    const response = await axiosInstance.post(API_CREATE_ORDER, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to create order with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to create order");
  }
};

// Agent Pulse Interfaces
export interface AgentActivity {
  id: number;
  agent_type: string;
  agent_name: string;
  agent_abbreviation: string;
  status: string;
  description: string;
  agent_output: string | null;
  time_ago: string;
  timestamp: string;
  completed: boolean;
  duration: number;
  goal: string;
  execution_id: string;
}

export interface AgentPulseResponse {
  success: boolean;
  count: number;
  activities: AgentActivity[];
}

// Agent Pulse APIs
export const getAgentPulse = async (): Promise<AgentPulseResponse> => {
  try {
    const response = await axiosInstance.get(API_GET_AGENT_PULSE);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        (error.response.data as { message?: string }).message ||
          `Failed to fetch agent pulse with status ${error.response.status}`,
      );
    }
    throw new Error("Failed to fetch agent pulse");
  }
};
