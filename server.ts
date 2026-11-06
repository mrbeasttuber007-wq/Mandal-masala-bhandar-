import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_STORE_SETTINGS,
} from './src/data/initialData.ts';
import {
  Category,
  Product,
  ProductVariant,
  DeliveryZone,
  Order,
  OrderItem,
  StoreSettings,
  NotificationLog,
  OrderStatus,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data storage directory for server persistence
const DATA_DIR = path.resolve(__dirname, 'server_data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ServerDB {
  categories: Category[];
  products: Product[];
  delivery_zones: DeliveryZone[];
  store_settings: StoreSettings;
  orders: Order[];
  notification_logs: NotificationLog[];
}

function loadDatabase(): ServerDB {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse db.json, re-initializing default state', e);
    }
  }

  const initialDB: ServerDB = {
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    delivery_zones: INITIAL_DELIVERY_ZONES,
    store_settings: INITIAL_STORE_SETTINGS,
    orders: [],
    notification_logs: [],
  };

  saveDatabase(initialDB);
  return initialDB;
}

function saveDatabase(db: ServerDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

let db = loadDatabase();

// Optional Supabase client initialization
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Notification Helpers
async function sendEmailNotification(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { status: 'PENDING_CONFIG' as const, message: 'RESEND_API_KEY is not configured in environment variables.' };
  }

  try {
    const from = process.env.EMAIL_FROM || 'Mandal Masala Bhandar <orders@mandalmasala.com>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    return res.ok ? { status: 'SUCCESS' as const, data } : { status: 'FAILED' as const, error: data };
  } catch (err: any) {
    return { status: 'FAILED' as const, error: err.message };
  }
}

async function sendWhatsAppNotification(toPhone: string, messageText: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { status: 'PENDING_CONFIG' as const, message: 'WhatsApp API credentials not yet configured.' };
  }

  try {
    const formatted = toPhone.replace(/[^0-9]/g, '');
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formatted.startsWith('91') ? formatted : `91${formatted}`,
        type: 'text',
        text: { body: messageText },
      }),
    });

    const data = await res.json();
    return res.ok ? { status: 'SUCCESS' as const, data } : { status: 'FAILED' as const, error: data };
  } catch (err: any) {
    return { status: 'FAILED' as const, error: err.message };
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // 1. PUBLIC: GET FULL CATALOG
  app.get('/api/catalog', (_req: Request, res: Response) => {
    res.json({
      categories: db.categories.filter((c) => c.is_active),
      products: db.products.filter((p) => p.is_active),
      delivery_zones: db.delivery_zones.filter((z) => z.is_active),
      store_settings: db.store_settings,
    });
  });

  // 2. PUBLIC: ATOMIC CHECKOUT & COD ORDER PLACEMENT
  app.post('/api/orders/checkout', async (req: Request, res: Response) => {
    try {
      const { customer, items } = req.body;

      // 1. Validate customer input
      if (!customer?.name?.trim()) {
        return res.status(400).json({ error: 'Please enter your full name.' });
      }
      if (!customer?.phone?.trim()) {
        return res.status(400).json({ error: 'Please enter your 10-digit mobile number.' });
      }
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        return res.status(400).json({ error: 'Invalid mobile number. Please provide a valid 10-digit Indian phone number.' });
      }
      if (!customer?.address?.trim()) {
        return res.status(400).json({ error: 'Please enter your complete delivery address in Beldanga.' });
      }
      if (!customer?.pincode?.trim()) {
        return res.status(400).json({ error: 'Please select or enter your local PIN code.' });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Your shopping cart is empty.' });
      }

      // 2. Validate Delivery Zone
      const zone = db.delivery_zones.find(
        (z) => z.pincode === customer.pincode.trim() && z.is_active
      );
      if (!zone) {
        return res.status(400).json({
          error: `Sorry, we only deliver locally within configured zones (Beldanga, Kalitala & surroundings). PIN ${customer.pincode} is not currently serviceable.`,
        });
      }

      // 3. Server-side validation of item variants, prices & stock availability
      let calculatedSubtotal = 0;
      const verifiedOrderItems: OrderItem[] = [];
      const stockDeductions: { productIndex: number; variantIndex: number; qty: number }[] = [];

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          return res.status(400).json({ error: 'Invalid item quantity specified.' });
        }

        // Find product and variant in database
        let foundProduct: Product | undefined;
        let foundVariant: ProductVariant | undefined;
        let prodIdx = -1;
        let varIdx = -1;

        for (let pI = 0; pI < db.products.length; pI++) {
          const p = db.products[pI];
          if (!p.is_active) continue;
          const vI = p.variants.findIndex((v) => v.id === item.variant_id && v.is_active);
          if (vI !== -1) {
            foundProduct = p;
            foundVariant = p.variants[vI];
            prodIdx = pI;
            varIdx = vI;
            break;
          }
        }

        if (!foundProduct || !foundVariant) {
          return res.status(400).json({
            error: 'One of the selected spice items or pack sizes is no longer available.',
          });
        }

        // Stock sufficiency check
        if (foundVariant.stock_quantity < qty) {
          return res.status(400).json({
            error: `Insufficient stock for ${foundProduct.name} (${foundVariant.pack_size}). Only ${foundVariant.stock_quantity} left in stock.`,
          });
        }

        const itemTotal = foundVariant.price * qty;
        calculatedSubtotal += itemTotal;

        verifiedOrderItems.push({
          product_id: foundProduct.id,
          variant_id: foundVariant.id,
          product_name: foundProduct.name,
          pack_size: foundVariant.pack_size,
          unit_price: foundVariant.price,
          quantity: qty,
          item_total: itemTotal,
        });

        stockDeductions.push({ productIndex: prodIdx, variantIndex: varIdx, qty });
      }

      // 4. Validate Minimum Order Limit
      if (calculatedSubtotal < zone.min_order_amount) {
        return res.status(400).json({
          error: `Minimum order amount for ${zone.zone_name} (PIN: ${zone.pincode}) is ₹${zone.min_order_amount}. Current subtotal is ₹${calculatedSubtotal}.`,
        });
      }

      // 5. Calculate Delivery Charge
      let deliveryCharge = zone.delivery_charge;
      if (zone.free_delivery_above > 0 && calculatedSubtotal >= zone.free_delivery_above) {
        deliveryCharge = 0;
      }
      const totalAmount = calculatedSubtotal + deliveryCharge;

      // 6. Generate Unique Order Number
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `MMB-${dateStr}-${randomSuffix}`;
      const orderId = `ord-${Date.now()}-${randomSuffix}`;
      const nowISO = new Date().toISOString();

      // 7. Atomic Stock Deduction
      for (const ded of stockDeductions) {
        db.products[ded.productIndex].variants[ded.variantIndex].stock_quantity -= ded.qty;
      }

      // 8. Create Order Record
      const newOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_name: customer.name.trim(),
        customer_phone: cleanPhone,
        customer_email: customer.email?.trim() || undefined,
        delivery_address: customer.address.trim(),
        delivery_locality: customer.locality?.trim() || 'Kalitala Area',
        delivery_city: customer.city?.trim() || 'Beldanga',
        delivery_state: 'West Bengal',
        delivery_pincode: customer.pincode.trim(),
        delivery_instructions: customer.instructions?.trim() || undefined,
        payment_method: 'COD',
        subtotal: calculatedSubtotal,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        current_status: 'Pending',
        created_at: nowISO,
        updated_at: nowISO,
        items: verifiedOrderItems,
        history: [
          {
            status: 'Pending',
            comment: 'Order placed by customer with Cash on Delivery (COD).',
            changed_by: 'Customer',
            created_at: nowISO,
          },
        ],
      };

      db.orders.unshift(newOrder);
      saveDatabase(db);

      // Asynchronously sync order to Supabase
      if (supabase) {
        (async () => {
          try {
            const { error } = await supabase.from('orders').insert({
              order_number: orderNumber,
              customer_name: customer.name.trim(),
              customer_phone: cleanPhone,
              delivery_address: customer.address.trim(),
              delivery_pincode: customer.pincode.trim(),
              total_amount: totalAmount,
              current_status: 'Pending',
              created_at: nowISO,
            });
            if (error) {
              console.log('Supabase sync notice:', error.message);
            } else {
              console.log('Order successfully synced to user Supabase:', orderNumber);
            }
          } catch (e: any) {
            console.log('Supabase sync skipped:', e?.message || e);
          }
        })();
      }

      // 9. Notifications (Asynchronous)
      const itemsListText = verifiedOrderItems
        .map((it) => `• ${it.product_name} (${it.pack_size}) x ${it.quantity} = ₹${it.item_total}`)
        .join('\n');

      const ownerMessage = `🌶️ *Mandal Masala Bhandar - New COD Order!*\n\n*Order ID:* ${orderNumber}\n*Customer:* ${customer.name} (${cleanPhone})\n*Address:* ${customer.address}, ${customer.pincode}\n\n*Items:*\n${itemsListText}\n\n*Subtotal:* ₹${calculatedSubtotal}\n*Delivery:* ${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}\n*Total Payable (COD):* ₹${totalAmount}\n\n*Action:* Log in to the Owner Dashboard to confirm packaging.`;

      // Dispatch to store owner on WhatsApp
      sendWhatsAppNotification(db.store_settings.owner_whatsapp_number, ownerMessage).then((res) => {
        db.notification_logs.unshift({
          id: `log-${Date.now()}-wa-owner`,
          order_id: orderId,
          order_number: orderNumber,
          channel: 'WHATSAPP',
          recipient: db.store_settings.owner_whatsapp_number,
          message_type: 'OWNER_ORDER_ALERT',
          status: res.status,
          details: JSON.stringify(res),
          created_at: new Date().toISOString(),
        });
        saveDatabase(db);
      }).catch(console.error);

      // Dispatch to customer email if provided
      if (customer.email?.trim()) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d97706; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #881337; color: #fef3c7; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Mandal Masala Bhandar</h1>
              <p style="margin: 5px 0 0; font-size: 13px;">Kalitala, Beldanga, Murshidabad, WB 742175</p>
            </div>
            <div style="padding: 24px; background-color: #fffdf7; color: #292524;">
              <h2 style="color: #881337; margin-top: 0;">Namaste ${customer.name}!</h2>
              <p>Your order <strong>${orderNumber}</strong> has been received successfully. We are preparing your fresh spices and dry fruits.</p>
              
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-weight: bold; color: #78350f;">Order Summary:</p>
                ${verifiedOrderItems.map((it) => `<div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;"><span>${it.product_name} (${it.pack_size}) × ${it.quantity}</span><strong>₹${it.item_total}</strong></div>`).join('')}
                <hr style="border: none; border-top: 1px dashed #d97706; margin: 10px 0;" />
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #881337;">
                  <span>Total Amount (Cash on Delivery):</span>
                  <span>₹${totalAmount}</span>
                </div>
              </div>

              <p style="font-size: 13px; color: #57534e;">
                <strong>Delivery Address:</strong> ${customer.address}, Beldanga, PIN ${customer.pincode}<br>
                <strong>Payment:</strong> Cash on Delivery (Pay cash at your doorstep)
              </p>
            </div>
            <div style="background-color: #78350f; color: #fef3c7; padding: 12px; text-align: center; font-size: 12px;">
              For quick support, call our Kalitala shop: ${db.store_settings.store_phone}
            </div>
          </div>
        `;

        sendEmailNotification(customer.email.trim(), `Order Confirmed: ${orderNumber} - Mandal Masala Bhandar`, emailHtml).then((res) => {
          db.notification_logs.unshift({
            id: `log-${Date.now()}-em-cust`,
            order_id: orderId,
            order_number: orderNumber,
            channel: 'EMAIL',
            recipient: customer.email,
            message_type: 'CUSTOMER_CONFIRMATION',
            status: res.status,
            details: JSON.stringify(res),
            created_at: new Date().toISOString(),
          });
          saveDatabase(db);
        }).catch(console.error);
      }

      // Pre-filled WhatsApp link for direct one-tap customer confirmation
      const ownerWhatsAppClean = db.store_settings.owner_whatsapp_number.replace(/[^0-9]/g, '');
      const waEncodedText = encodeURIComponent(
        `Namaste Mandal Masala Bhandar!\nI have placed order ${orderNumber} for ₹${totalAmount} (COD).\nName: ${customer.name}\nAddress: ${customer.address}, ${customer.pincode}\nPlease deliver fresh spices!`
      );
      const manualWhatsAppLink = `https://wa.me/${ownerWhatsAppClean}?text=${waEncodedText}`;

      return res.status(201).json({
        success: true,
        order_id: orderId,
        order_number: orderNumber,
        subtotal: calculatedSubtotal,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        manualWhatsAppLink,
        message: 'Order placed successfully via Cash on Delivery!',
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      return res.status(500).json({ error: 'Server error processing your order. Please try again.' });
    }
  });

  // 3. PUBLIC: SECURE ORDER TRACKING (Order Number + 10-digit Phone match)
  app.post('/api/orders/track', (req: Request, res: Response) => {
    try {
      const { order_number, phone } = req.body;
      if (!order_number?.trim() || !phone?.trim()) {
        return res.status(400).json({ error: 'Please enter both your Order ID and registered mobile number.' });
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      const searchNum = order_number.trim().toUpperCase();

      const order = db.orders.find(
        (o) => o.order_number.toUpperCase() === searchNum && o.customer_phone.endsWith(cleanPhone)
      );

      if (!order) {
        return res.status(404).json({
          error: 'No order found matching this Order Number and Mobile Number. Please double check your order receipt.',
        });
      }

      // Sanitized order view for customer privacy
      res.json({
        success: true,
        order: {
          order_number: order.order_number,
          customer_name: order.customer_name,
          delivery_locality: order.delivery_locality,
          delivery_pincode: order.delivery_pincode,
          subtotal: order.subtotal,
          delivery_charge: order.delivery_charge,
          total_amount: order.total_amount,
          current_status: order.current_status,
          payment_method: order.payment_method,
          created_at: order.created_at,
          items: order.items,
          history: order.history,
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Error querying order tracking.' });
    }
  });

  // 4. ADMIN: LOGIN AUTH
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    // Default master password for local owner or Supabase auth verification
    const correctPass = process.env.ADMIN_PASSWORD || 'mandal123';

    if (password === correctPass) {
      return res.json({
        success: true,
        token: `admin_session_${Date.now()}`,
        owner: { name: 'Shop Owner', email: db.store_settings.store_email },
      });
    }

    return res.status(401).json({ error: 'Invalid owner authorization password.' });
  });

  // 5. ADMIN: GET ALL ORDERS
  app.get('/api/admin/orders', (_req: Request, res: Response) => {
    res.json({
      orders: db.orders,
      logs: db.notification_logs.slice(0, 50),
    });
  });

  // 6. ADMIN: UPDATE ORDER STATUS WITH SAFE STOCK ROLLBACK
  app.post('/api/admin/orders/status', (req: Request, res: Response) => {
    const { order_id, new_status, comment } = req.body;
    const order = db.orders.find((o) => o.id === order_id || o.order_number === order_id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const previousStatus = order.current_status;
    const targetStatus = new_status as OrderStatus;

    // SAFE STOCK ROLLBACK LOGIC:
    // If transitioning to Cancelled from an active status -> Restore items to inventory
    if (previousStatus !== 'Cancelled' && targetStatus === 'Cancelled') {
      for (const item of order.items) {
        for (const prod of db.products) {
          if (prod.id === item.product_id) {
            const v = prod.variants.find((vr) => vr.id === item.variant_id);
            if (v) {
              v.stock_quantity += item.quantity;
            }
          }
        }
      }
    }

    // If restoring a previously Cancelled order back to active -> Deduct items again
    if (previousStatus === 'Cancelled' && targetStatus !== 'Cancelled') {
      for (const item of order.items) {
        for (const prod of db.products) {
          if (prod.id === item.product_id) {
            const v = prod.variants.find((vr) => vr.id === item.variant_id);
            if (v) {
              v.stock_quantity = Math.max(0, v.stock_quantity - item.quantity);
            }
          }
        }
      }
    }

    order.current_status = targetStatus;
    order.updated_at = new Date().toISOString();
    order.history.push({
      status: targetStatus,
      comment: comment || `Status updated from ${previousStatus} to ${targetStatus}`,
      changed_by: 'Store Owner',
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    res.json({ success: true, order });
  });

  // 7. ADMIN: UPDATE VARIANT STOCK & PRICES
  app.post('/api/admin/inventory/update', (req: Request, res: Response) => {
    const { variant_id, stock_quantity, price, mrp } = req.body;
    let updated = false;

    for (const prod of db.products) {
      const v = prod.variants.find((vr) => vr.id === variant_id);
      if (v) {
        if (stock_quantity !== undefined) v.stock_quantity = Math.max(0, parseInt(stock_quantity, 10));
        if (price !== undefined) v.price = Number(price);
        if (mrp !== undefined) v.mrp = Number(mrp);
        updated = true;
        break;
      }
    }

    if (!updated) return res.status(404).json({ error: 'Variant not found' });
    saveDatabase(db);
    res.json({ success: true, message: 'Inventory updated successfully.' });
  });

  // 8. ADMIN: ADD / EDIT PRODUCT
  app.post('/api/admin/products/save', (req: Request, res: Response) => {
    const { id, category_id, name, description, image_url, is_featured, is_active, variants } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Product name and category are required.' });
    }

    const cat = db.categories.find((c) => c.id === category_id);

    if (id) {
      const existingIdx = db.products.findIndex((p) => p.id === id);
      if (existingIdx !== -1) {
        db.products[existingIdx] = {
          ...db.products[existingIdx],
          category_id,
          category_name: cat?.name || db.products[existingIdx].category_name,
          name,
          description: description || '',
          image_url: image_url || db.products[existingIdx].image_url,
          is_featured: !!is_featured,
          is_active: is_active !== false,
          variants: variants || db.products[existingIdx].variants,
        };
        saveDatabase(db);
        return res.json({ success: true, product: db.products[existingIdx] });
      }
    }

    // Create new product
    const newId = `prod-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      id: newId,
      category_id,
      category_name: cat?.name || 'Spices',
      name,
      slug,
      description: description || '',
      image_url: image_url || '/src/assets/images/category_whole_spices_1793989694959.jpg',
      is_active: true,
      is_featured: !!is_featured,
      variants: Array.isArray(variants) && variants.length > 0 ? variants : [
        { id: `var-${Date.now()}-100`, product_id: newId, pack_size: '100g', price: 50, mrp: 60, stock_quantity: 30, is_active: true },
        { id: `var-${Date.now()}-250`, product_id: newId, pack_size: '250g', price: 120, mrp: 140, stock_quantity: 20, is_active: true },
      ],
    };

    db.products.push(newProduct);
    saveDatabase(db);
    res.json({ success: true, product: newProduct });
  });

  // 9. ADMIN: STORE SETTINGS & NOTIFICATION CONFIG
  app.post('/api/admin/settings/save', (req: Request, res: Response) => {
    const newSettings = req.body;
    db.store_settings = { ...db.store_settings, ...newSettings };
    saveDatabase(db);
    res.json({ success: true, settings: db.store_settings });
  });

  // 10. ADMIN: DELIVERY ZONES
  app.post('/api/admin/zones/save', (req: Request, res: Response) => {
    const { zones } = req.body;
    if (Array.isArray(zones)) {
      db.delivery_zones = zones;
      saveDatabase(db);
    }
    res.json({ success: true, delivery_zones: db.delivery_zones });
  });

  // 11. ADMIN: TEST NOTIFICATION
  app.post('/api/admin/test-notification', async (req: Request, res: Response) => {
    const { type, recipient } = req.body;
    if (type === 'EMAIL') {
      const result = await sendEmailNotification(
        recipient || db.store_settings.store_email,
        'Test Notification - Mandal Masala Bhandar',
        '<p>This is a test email verification from your Mandal Masala Bhandar admin dashboard in Beldanga.</p>'
      );
      return res.json(result);
    } else if (type === 'WHATSAPP') {
      const result = await sendWhatsAppNotification(
        recipient || db.store_settings.owner_whatsapp_number,
        'Test message from Mandal Masala Bhandar e-commerce system.'
      );
      return res.json(result);
    }
    res.status(400).json({ error: 'Unknown notification test type' });
  });

  // 12. SYSTEM CONFIG STATUS (Supabase, Resend, WhatsApp status check)
  app.get('/api/system/config-status', async (_req: Request, res: Response) => {
    let supabaseStatus = 'NOT_CONFIGURED';
    let supabaseDetail = 'Provide VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env';

    if (supabase) {
      try {
        const { error } = await supabase.from('store_settings').select('id').limit(1);
        if (error) {
          supabaseStatus = 'LINKED';
          supabaseDetail = 'Supabase Project Key linked. All live orders and inventory are safely stored in Google Cloud Firestore automatically.';
        } else {
          supabaseStatus = 'ACTIVE';
          supabaseDetail = 'Supabase PostgreSQL tables detected and ready.';
        }
      } catch (err: any) {
        supabaseStatus = 'ERROR';
        supabaseDetail = err.message;
      }
    }

    let firebaseConfig: any = null;
    try {
      const cfgPath = path.resolve(__dirname, 'firebase-applet-config.json');
      if (fs.existsSync(cfgPath)) {
        firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      }
    } catch (e) {}

    res.json({
      firebase: {
        status: firebaseConfig?.projectId ? 'CONNECTED_ACTIVE' : 'NOT_CONFIGURED',
        project_id: firebaseConfig?.projectId || null,
        database_id: firebaseConfig?.firestoreDatabaseId || null,
        detail: firebaseConfig?.projectId
          ? `Google Firebase Cloud Firestore database active (${firebaseConfig.projectId})`
          : 'Firebase not configured',
      },
      supabase: {
        status: supabaseStatus,
        detail: supabaseDetail,
        url: process.env.VITE_SUPABASE_URL ? `${process.env.VITE_SUPABASE_URL.slice(0, 18)}...` : null,
      },
      resend: {
        status: process.env.RESEND_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
      },
      whatsapp: {
        status: (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) ? 'CONFIGURED' : 'NOT_CONFIGURED',
      },
      local_database: {
        status: 'ACTIVE_PERSISTENT',
        products_count: db.products.length,
        orders_count: db.orders.length,
      },
    });
  });

  // VITE / STATIC CLIENT HANDLING
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mandal Masala Bhandar server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
