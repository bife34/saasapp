

export type Company = {
  id: string;
  name: string;
  ownerAdminId: string;
  logo?: string;
  enable_record_notifications?: boolean;
};

export type Pool = {
  id: string;
  companyId?: string;
  status: 'Active' | 'Maintenance' | 'Closed';
  
  // General Info
  pool_name: string;
  pool_location: string;
  pool_picture?: string; // URL
  owner_email?: string;
  extra_info?: string;

  // Equipment
  pump: {
    pump_image?: string; // URL
    pump_power?: string;
    salt_water: boolean;
  };
  has_heatpump: boolean;
  heatpump?: {
    heatpump_image?: string; // URL
    heatpump_on: boolean;
    heatpump_temperature?: number;
  };
  has_ph_controller: boolean;
  salt_system_model?: string;
  salt_system_image?: string; // URL
  sand_filter_model?: string;
  sand_filter_sand_amount?: number;
  pool_cover?: 'None' | 'Manual' | 'Automatic';
  
  // Construction
  grouting_type?: string;
  tile_image?: string; // URL

  // Maintenance & Notifications
  loses_water: boolean;
  water_loss_reason?: string;
  water_filling_on: boolean;
  send_record_notification_on_creation?: boolean;
};


export type PoolRecord = {
  id: string;
  poolId: string;
  created_at: string; // ISO date string

  // Water Chemistry
  ph: number;
  cl: number;
  chlorine_type: 'liquid' | 'tablets' | 'granular' | 'other';
  chlorine_quantity?: number;
  flocculant_type?: string;
  flocculant_quantity?: number;
  salt_quantity?: number;
  acid_quantity?: number;
  ph_plus_quantity?: number;
  ph_minus_quantity?: number;
  algaecide_quantity?: number;
  chlorine_tablets_quantity?: number;

  // Maintenance Actions
  vacuumed: boolean;
  brushed: boolean;
  leaves_cleaned: boolean;

  // General State
  overall_state: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  weather_status: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Superadmin' | 'Admin' | 'Technician' | 'Client';
  status: 'Active' | 'Invited' | 'Inactive';
  avatar?: string;
  last_login: string; // ISO date string
  accessible_pool_ids?: string[];
  companyId?: string;
  password?: string; // In a real app, this would be a hash
  forcePasswordChange?: boolean;
};

export type StockItem = {
  id: string;
  companyId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'units';
  supplier?: string;
  low_stock_threshold: number;
};

export type StockUsageRecord = {
  id: string;
  companyId?: string;
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: 'kg' | 'liters' | 'units';
  userId: string;
  userName: string;
  poolId?: string;
  poolName?: string;
  date: string; // ISO date string
};

export type Task = {
  id: string;
  companyId: string;
  technicianId: string;
  technicianName: string;
  description: string;
  is_completed: boolean;
  created_at: string;
  due_time?: string;
  has_alert?: boolean;
};
