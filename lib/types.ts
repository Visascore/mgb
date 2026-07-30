export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'CAD' | 'AUD' | 'ZAR' | 'AED' | 'KES' | 'GHS';

export type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  currency: CurrencyCode;
  deposit_percentage: number;
  duration_minutes: number;
  is_active: boolean;
  is_archived: boolean;
};

export type AvailabilitySlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked';
};

export type Booking = {
  id: string;
  user_id: string | null;
  service_id: string;
  slot_id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  total_price: number;
  deposit_amount: number;
  balance_amount: number;
  currency: CurrencyCode;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  services?: Service;
  availability_slots?: AvailabilitySlot;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  benefits: string | null;
  ingredients: string | null;
  usage_instructions: string | null;
  price: number;
  currency: CurrencyCode;
  stock_quantity: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
};

export type Order = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  county_state: string | null;
  postcode: string;
  country: string;
  delivery_cost: number;
  total_amount: number;
  currency: CurrencyCode;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  customer_photo_url: string | null;
  review_date: string;
  status: 'pending' | 'approved' | 'hidden';
};

export type GalleryItem = {
  id: string;
  before_image_url: string | null;
  after_image_url: string | null;
  category: string | null;
  caption: string | null;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
};

export type AppRole = 'admin' | 'staff' | 'client';
