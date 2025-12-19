// Utility functions for Admin Product API calls
// Usage: import { adminProductAPI } from '@/lib/adminProductAPI'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

/**
 * Create headers with authentication
 */
function createHeaders(includeContentType = false): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "An error occurred");
  }
  return response.json();
}

export const adminProductAPI = {
  /**
   * GET /api/admin/products
   * Fetch list of products with pagination and filters
   */
  async getProducts(params?: { search?: string; brand_id?: number; category_id?: number; is_active?: boolean; per_page?: number }) {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.brand_id) queryParams.append("brand_id", params.brand_id.toString());
    if (params?.category_id) queryParams.append("category_id", params.category_id.toString());
    if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());

    const url = `${API_BASE}/admin/products?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * POST /api/admin/products
   * Create a new product with file upload
   */
  async createProduct(data: {
    name: string;
    brand_id: number;
    category_id: number;
    price: number;
    stock: number;
    old_price?: number;
    sku?: string;
    description?: string;
    content?: string;
    is_active?: boolean;
    is_featured?: boolean;
    thumbnail?: File;
  }) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("brand_id", data.brand_id.toString());
    formData.append("category_id", data.category_id.toString());
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());

    if (data.old_price) formData.append("old_price", data.old_price.toString());
    if (data.sku) formData.append("sku", data.sku);
    if (data.description) formData.append("description", data.description);
    if (data.content) formData.append("content", data.content);
    if (data.is_active !== undefined) formData.append("is_active", data.is_active ? "1" : "0");
    if (data.is_featured !== undefined) formData.append("is_featured", data.is_featured ? "1" : "0");
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    const response = await fetch(`${API_BASE}/admin/products`, {
      method: "POST",
      headers: createHeaders(), // Don't include Content-Type for FormData
      body: formData,
    });

    return handleResponse(response);
  },

  /**
   * GET /api/admin/products/{id}
   * Get product details by ID
   */
  async getProduct(id: string | number) {
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "GET",
      headers: createHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * PUT /api/admin/products/{id}
   * Update an existing product
   */
  async updateProduct(
    id: string | number,
    data: {
      name?: string;
      brand_id?: number;
      category_id?: number;
      price?: number;
      stock?: number;
      old_price?: number;
      sku?: string;
      description?: string;
      content?: string;
      is_active?: boolean;
      is_featured?: boolean;
      thumbnail?: File;
    }
  ) {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.brand_id) formData.append("brand_id", data.brand_id.toString());
    if (data.category_id) formData.append("category_id", data.category_id.toString());
    if (data.price !== undefined) formData.append("price", data.price.toString());
    if (data.stock !== undefined) formData.append("stock", data.stock.toString());
    if (data.old_price) formData.append("old_price", data.old_price.toString());
    if (data.sku) formData.append("sku", data.sku);
    if (data.description) formData.append("description", data.description);
    if (data.content) formData.append("content", data.content);
    if (data.is_active !== undefined) formData.append("is_active", data.is_active ? "1" : "0");
    if (data.is_featured !== undefined) formData.append("is_featured", data.is_featured ? "1" : "0");
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: formData,
    });

    return handleResponse(response);
  },

  /**
   * DELETE /api/admin/products/{id}
   * Delete a product by ID
   */
  async deleteProduct(id: string | number) {
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    });

    return handleResponse(response);
  },
};

/**
 * Auth API helpers
 */
export const authAPI = {
  /**
   * POST /api/login
   * Login and get token
   */
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse<{ token: string; user: any }>(response);

    // Save token to localStorage
    if (data.token && typeof window !== "undefined") {
      localStorage.setItem("admin_token", data.token);
    }

    return data;
  },

  /**
   * POST /api/logout
   * Logout and clear token
   */
  async logout() {
    const response = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: createHeaders(true),
    });

    // Clear token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
    }

    return handleResponse(response);
  },
};
