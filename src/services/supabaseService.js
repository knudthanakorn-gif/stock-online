import { supabase } from '../utils/supabaseClient';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REQUESTERS,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

// Map database column names (snake_case) to JS object properties (camelCase)
export const mapProductFromDb = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  barcode: row.barcode,
  category: row.category,
  costPrice: Number(row.cost_price ?? row.costPrice ?? 0),
  sellingPrice: Number(row.selling_price ?? row.sellingPrice ?? 0),
  quantity: Number(row.quantity ?? 0),
  minThreshold: Number(row.min_threshold ?? row.minThreshold ?? 0),
  unit: row.unit || 'ชิ้น',
  supplierId: row.supplier_id || row.supplierId,
  image: row.image,
  description: row.description,
  createdAt: row.created_at || row.createdAt,
  updatedAt: row.updated_at || row.updatedAt,
});

export const mapProductToDb = (p) => ({
  id: p.id,
  name: p.name,
  sku: p.sku || '',
  barcode: p.barcode || '',
  category: p.category || '',
  cost_price: p.costPrice ?? p.cost_price ?? 0,
  selling_price: p.sellingPrice ?? p.selling_price ?? 0,
  quantity: p.quantity ?? 0,
  min_threshold: p.minThreshold ?? p.min_threshold ?? 0,
  unit: p.unit || 'ชิ้น',
  supplier_id: p.supplierId || p.supplier_id || null,
  image: p.image || '',
  description: p.description || '',
  updated_at: new Date().toISOString(),
});

export const mapSupplierFromDb = (row) => ({
  id: row.id,
  name: row.name,
  contactPerson: row.contact_person || row.contactPerson || '',
  phone: row.phone || '',
  email: row.email || '',
  address: row.address || '',
  createdAt: row.created_at,
});

export const mapSupplierToDb = (s) => ({
  id: s.id,
  name: s.name,
  contact_person: s.contactPerson || s.contact_person || '',
  phone: s.phone || '',
  email: s.email || '',
  address: s.address || '',
});

export const mapCategoryFromDb = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  icon: row.icon || '',
});

export const mapCategoryToDb = (c) => ({
  id: c.id,
  name: c.name,
  description: c.description || '',
  icon: c.icon || '',
});

export const mapRequesterFromDb = (row) => ({
  id: row.id,
  employeeCode: row.employee_code || row.employeeCode || '',
  name: row.name,
  company: row.company || '',
  department: row.department || '',
  position: row.position || '',
  email: row.email || '',
  phone: row.phone || '',
  avatar: row.avatar || null,
  createdAt: row.created_at,
});

export const mapRequesterToDb = (r) => ({
  id: r.id,
  employee_code: r.employeeCode || r.employee_code || '',
  name: r.name,
  company: r.company || '',
  department: r.department || '',
  position: r.position || '',
  email: r.email || '',
  phone: r.phone || '',
  avatar: r.avatar || null,
});

export const mapTransactionFromDb = (row) => ({
  id: row.id,
  productId: row.product_id || row.productId,
  productName: row.product_name || row.productName || '',
  type: row.type,
  quantity: Number(row.quantity ?? 0),
  unitPrice: Number(row.unit_price ?? row.unitPrice ?? 0),
  totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
  date: row.timestamp || row.date || row.created_at,
  timestamp: row.timestamp || row.date || row.created_at,
  requesterName: row.requester_name || row.requesterName || '',
  department: row.department || '',
  approvedBy: row.approved_by || row.approvedBy || '',
  status: row.status || 'COMPLETED',
  note: row.note || '',
  createdAt: row.created_at,
});

export const mapTransactionToDb = (tx) => ({
  id: tx.id,
  product_id: tx.productId || tx.product_id,
  type: tx.type,
  quantity: tx.quantity,
  timestamp: tx.timestamp || tx.date || new Date().toISOString(),
  requester_name: tx.requesterName || tx.requester_name || '',
  department: tx.department || '',
  approved_by: tx.approvedBy || tx.approved_by || '',
  status: tx.status || 'COMPLETED',
  note: tx.note || '',
});

export const mapRequestFromDb = (row) => ({
  id: row.id,
  requesterId: row.requester_id || row.requesterId,
  requesterName: row.requester_name || row.requesterName,
  department: row.department || '',
  items: Array.isArray(row.items) ? row.items : [],
  status: row.status || 'PENDING',
  priority: row.priority || 'NORMAL',
  reason: row.reason || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapRequestToDb = (req) => ({
  id: req.id,
  requester_id: req.requesterId || req.requester_id || '',
  requester_name: req.requesterName || req.requester_name || '',
  department: req.department || '',
  items: req.items || [],
  status: req.status || 'PENDING',
  priority: req.priority || 'NORMAL',
  reason: req.reason || '',
  updated_at: new Date().toISOString(),
});

export const mapNotificationFromDb = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  linkTab: row.link_tab || row.linkTab,
  read: row.read ?? false,
  createdAt: row.created_at,
});

export const mapNotificationToDb = (n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  link_tab: n.linkTab || n.link_tab || '',
  read: n.read ?? false,
});

// Seed data function if Supabase is completely fresh/empty
export const seedInitialDataIfEmpty = async () => {
  try {
    const { count } = await supabase.from('products').select('id', { count: 'exact', head: true });
    if (count === 0) {
      console.log('Seeding initial data to Supabase...');
      if (INITIAL_CATEGORIES?.length) {
        await supabase.from('categories').upsert(INITIAL_CATEGORIES.map(mapCategoryToDb));
      }
      if (INITIAL_SUPPLIERS?.length) {
        await supabase.from('suppliers').upsert(INITIAL_SUPPLIERS.map(mapSupplierToDb));
      }
      if (INITIAL_REQUESTERS?.length) {
        await supabase.from('requesters').upsert(INITIAL_REQUESTERS.map(mapRequesterToDb));
      }
      if (INITIAL_PRODUCTS?.length) {
        // Upsert in batches of 50 to avoid payload limits
        const chunk = 50;
        for (let i = 0; i < INITIAL_PRODUCTS.length; i += chunk) {
          const slice = INITIAL_PRODUCTS.slice(i, i + chunk).map(mapProductToDb);
          await supabase.from('products').upsert(slice);
        }
      }
      if (INITIAL_TRANSACTIONS?.length) {
        const chunk = 50;
        for (let i = 0; i < INITIAL_TRANSACTIONS.length; i += chunk) {
          const slice = INITIAL_TRANSACTIONS.slice(i, i + chunk).map(mapTransactionToDb);
          await supabase.from('transactions').upsert(slice);
        }
      }
      if (INITIAL_REQUESTS?.length) {
        await supabase.from('requests').upsert(INITIAL_REQUESTS.map(mapRequestToDb));
      }
      if (INITIAL_NOTIFICATIONS?.length) {
        await supabase.from('notifications').upsert(INITIAL_NOTIFICATIONS.map(mapNotificationToDb));
      }
      console.log('Initial data seeded successfully!');
    }
  } catch (err) {
    console.error('Error during seed check:', err);
  }
};
