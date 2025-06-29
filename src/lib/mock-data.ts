

import { Company, Pool, PoolRecord, StockItem, StockUsageRecord, User, Task } from '@/lib/types';

export const mockCompanies: Company[] = [
  { id: 'comp_1', name: 'ProPools Inc.', ownerAdminId: 'usr_1', logo: 'https://placehold.co/100x100.png', enable_record_notifications: true }
];

export const mockUsers: User[] = [
    {
        id: 'usr_super',
        name: 'Super Admin',
        email: 'bife34@gmail.com',
        role: 'Superadmin',
        status: 'Active',
        avatar: 'https://placehold.co/100x100.png',
        last_login: new Date().toISOString(),
        password: 'cdcdcdcd',
        forcePasswordChange: false,
    },
    {
        id: 'usr_1',
        name: 'Alex Johnson',
        email: 'alex.j@propools.com',
        role: 'Admin',
        status: 'Active',
        avatar: 'https://placehold.co/100x100.png',
        last_login: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        companyId: 'comp_1',
        password: 'password123',
        forcePasswordChange: false,
    },
    {
        id: 'usr_2',
        name: 'Maria Garcia',
        email: 'maria.g@client.com',
        role: 'Client',
        status: 'Active',
        avatar: 'https://placehold.co/100x100.png',
        last_login: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        accessible_pool_ids: ['1'],
        companyId: 'comp_1',
        password: 'password123',
        forcePasswordChange: true,
    },
    {
        id: 'usr_3',
        name: 'David Smith',
        email: 'david.s@propools.com',
        role: 'Technician',
        status: 'Active',
        avatar: 'https://placehold.co/100x100.png',
        last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        accessible_pool_ids: ['1', '2'],
        companyId: 'comp_1',
        password: 'password123',
        forcePasswordChange: false,
    },
    {
        id: 'usr_4',
        name: 'pending.user@client.com',
        email: 'pending.user@client.com',
        role: 'Client',
        status: 'Inactive',
        last_login: '',
        companyId: 'comp_1',
        password: 'password123',
        forcePasswordChange: true,
    },
    {
        id: 'usr_5',
        name: 'Chris Lee',
        email: 'chris.l@propools.com',
        role: 'Technician',
        status: 'Active',
        avatar: 'https://placehold.co/100x100.png',
        last_login: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        companyId: 'comp_1',
        password: 'password123',
        forcePasswordChange: false,
    },
];

export const initialPools: Pool[] = [
    {
    id: '1',
    companyId: 'comp_1',
    pool_name: 'Sunset Resort Pool',
    pool_location: '123 Ocean Drive, Miami, FL',
    owner_email: 'pool.owner@example.com',
    status: 'Active',
    pool_picture: 'https://placehold.co/100x100.png',
    pump: {
      pump_power: '1.5 HP',
      salt_water: true,
      pump_image: 'https://placehold.co/200x200.png',
    },
    has_heatpump: true,
    heatpump: {
      heatpump_on: true,
      heatpump_temperature: 28,
      heatpump_image: 'https://placehold.co/200x200.png',
    },
    grouting_type: 'Epoxy',
    tile_image: 'https://placehold.co/200x200.png',
    extra_info: 'Pool gets a lot of sun in the afternoon. Check for algae growth near the steps.',
    loses_water: false,
    has_ph_controller: true,
    sand_filter_model: 'SF-2000',
    sand_filter_sand_amount: 150,
    pool_cover: 'Automatic',
    water_filling_on: false,
    salt_system_model: 'AquaPure 9000',
    salt_system_image: 'https://placehold.co/200x200.png',
    send_record_notification_on_creation: true,
  },
  {
    id: '2',
    companyId: 'comp_1',
    pool_name: 'Downtown Community Center',
    pool_location: '456 Central Ave, Miami, FL',
    status: 'Maintenance',
    owner_email: '',
    pump: {
      pump_power: '2.0 HP',
      salt_water: false,
    },
    has_heatpump: false,
    loses_water: true,
    water_loss_reason: 'Suspected crack in the skimmer line.',
    has_ph_controller: false,
    pool_cover: 'Manual',
    water_filling_on: true,
    send_record_notification_on_creation: false,
  },
];


export const mockRecords: PoolRecord[] = [
  { id: 'rec1', poolId: '1', created_at: '2023-07-30T10:00:00Z', ph: 7.4, cl: 1.5, chlorine_type: 'tablets', vacuumed: true, brushed: true, leaves_cleaned: true, overall_state: 'Excellent', weather_status: 'Sunny' },
  { id: 'rec2', poolId: '1', created_at: '2023-07-29T10:00:00Z', ph: 7.2, cl: 1.2, chlorine_type: 'liquid', chlorine_quantity: 2, vacuumed: true, brushed: false, leaves_cleaned: true, overall_state: 'Good', weather_status: 'Sunny' },
  { id: 'rec3', poolId: '1', created_at: '2023-07-28T10:00:00Z', ph: 7.6, cl: 1.8, chlorine_type: 'tablets', vacuumed: false, brushed: true, leaves_cleaned: false, overall_state: 'Good', weather_status: 'Cloudy' },
  { id: 'rec4', poolId: '1', created_at: '2023-07-27T10:00:00Z', ph: 7.5, cl: 1.4, chlorine_type: 'tablets', vacuumed: true, brushed: true, leaves_cleaned: true, overall_state: 'Excellent', weather_status: 'Sunny' },
  { id: 'rec5', poolId: '1', created_at: '2023-07-26T10:00:00Z', ph: 7.3, cl: 1.6, chlorine_type: 'granular', chlorine_quantity: 1, vacuumed: true, brushed: false, leaves_cleaned: true, overall_state: 'Good', weather_status: 'Rainy' },
  { id: 'rec6', poolId: '1', created_at: '2023-07-20T10:00:00Z', ph: 7.8, cl: 1.0, chlorine_type: 'tablets', vacuumed: false, brushed: false, leaves_cleaned: false, overall_state: 'Fair', weather_status: 'Sunny' },
  { id: 'rec7', poolId: '2', created_at: '2023-07-30T11:00:00Z', ph: 7.0, cl: 2.0, chlorine_type: 'liquid', chlorine_quantity: 3, vacuumed: true, brushed: true, leaves_cleaned: true, overall_state: 'Good', weather_status: 'Sunny' },
  { id: 'rec8', poolId: '2', created_at: '2023-07-28T11:00:00Z', ph: 7.2, cl: 1.8, chlorine_type: 'liquid', chlorine_quantity: 2, vacuumed: true, brushed: true, leaves_cleaned: true, overall_state: 'Good', weather_status: 'Cloudy' },
];


export const mockStockItems: StockItem[] = [
  { id: 'item1', companyId: 'comp_1', name: 'Chlorine Tablets (25kg)', category: 'Sanitizer', quantity: 85, unit: 'units', low_stock_threshold: 20 },
  { id: 'item2', companyId: 'comp_1', name: 'Liquid Chlorine (20L)', category: 'Sanitizer', quantity: 60, unit: 'liters', low_stock_threshold: 30, supplier: 'ChemCo' },
  { id: 'item3', companyId: 'comp_1', name: 'pH Minus (10kg)', category: 'Balancer', quantity: 45, unit: 'kg', low_stock_threshold: 15 },
  { id: 'item4', companyId: 'comp_1', name: 'Algaecide (5L)', category: 'Specialty', quantity: 25, unit: 'liters', low_stock_threshold: 10, supplier: 'PoolGuard' },
  { id: 'item5', companyId: 'comp_1', name: 'Flocculant (5L)', category: 'Clarifier', quantity: 70, unit: 'liters', low_stock_threshold: 20 },
  { id: 'item6', companyId: 'comp_1', name: 'Test Strips (100 pack)', category: 'Testing', quantity: 8, unit: 'units', low_stock_threshold: 5 },
];

export const mockUsageRecords: StockUsageRecord[] = [
  { id: 'usage1', companyId: 'comp_1', itemId: 'item2', itemName: 'Liquid Chlorine (20L)', quantityUsed: 5, unit: 'liters', userId: 'usr_3', userName: 'David Smith', poolId: '2', poolName: 'Downtown Community Center', date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 'usage2', companyId: 'comp_1', itemId: 'item1', itemName: 'Chlorine Tablets (25kg)', quantityUsed: 1, unit: 'units', userId: 'usr_3', userName: 'David Smith', poolId: '1', poolName: 'Sunset Resort Pool', date: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
  { id: 'usage3', companyId: 'comp_1', itemId: 'item3', itemName: 'pH Minus (10kg)', quantityUsed: 2, unit: 'kg', userId: 'usr_1', userName: 'Alex Johnson', poolId: '1', poolName: 'Sunset Resort Pool', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

export const mockTasks: Task[] = [
  { id: 'task_1', companyId: 'comp_1', technicianId: 'usr_3', technicianName: 'David Smith', description: 'Check pH and Chlorine levels for Sunset Resort Pool', is_completed: true, created_at: new Date().toISOString() },
  { id: 'task_2', companyId: 'comp_1', technicianId: 'usr_3', technicianName: 'David Smith', description: 'Vacuum pool floor at Sunset Resort', is_completed: false, created_at: new Date().toISOString(), due_time: '14:00', has_alert: true },
  { id: 'task_3', companyId: 'comp_1', technicianId: 'usr_3', technicianName: 'David Smith', description: 'Backwash sand filter at Downtown Community Center', is_completed: false, created_at: new Date().toISOString() },
  { id: 'task_4', companyId: 'comp_1', technicianId: 'usr_5', technicianName: 'Chris Lee', description: 'Clean skimmer baskets for all assigned pools', is_completed: true, created_at: new Date().toISOString() },
  { id: 'task_5', companyId: 'comp_1', technicianId: 'usr_5', technicianName: 'Chris Lee', description: 'Restock chlorine tablets in van', is_completed: false, created_at: new Date().toISOString(), due_time: '17:00', has_alert: false },
];
