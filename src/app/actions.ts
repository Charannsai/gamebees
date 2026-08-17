"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendBookingNotificationEmail, sendKycNotificationEmail } from "@/lib/email";

export async function fetchRentalDiscountSettings() {
  try {
    const { data, error } = await supabaseServer
      .from("rental_discount_settings")
      .select("days, discount_percent")
      .in("days", [14, 30]);
    if (error) throw error;
    const settings: Record<number, number> = { 14: 0.10, 30: 0.20 };
    (data || []).forEach((row: any) => { settings[Number(row.days)] = Number(row.discount_percent) / 100; });
    return { success: true, data: settings };
  } catch (error: any) {
    console.error("fetchRentalDiscountSettings error:", error);
    return { success: false, error: error.message, data: { 14: 0.10, 30: 0.20 } };
  }
}

export async function fetchLandingGearOptions() {
  try {
    const { data, error } = await supabaseServer
      .from("landing_gear_options")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("fetchLandingGearOptions error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function fetchItems() {
  try {
    const { data, error } = await supabaseServer
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchItems error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchBookings() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabaseServer
      .from("bookings")
      .select(`
        *,
        items (
          name,
          price,
          category,
          image_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchBookings error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchItemAvailability(itemId: string) {
  try {
    // 1. Fetch item details (including quantity and price tiers)
    const { data: item, error: itemError } = await supabaseServer
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError) throw itemError;

    // 2. Fetch active bookings for this item
    const { data: bookings, error: bookingsError } = await supabaseServer
      .from("bookings")
      .select("*")
      .eq("item_id", itemId)
      .not("status", "in", '("cancelled","declined","returned","discarded","completed")');

    if (bookingsError) {
      console.warn("fetchItemAvailability bookings lookup warn:", bookingsError.message);
    }

    return {
      success: true,
      item: {
        ...item,
        quantity: item?.quantity || 1,
        price_3_days: item?.price_3_days || (item?.price ? item.price * 3 : 1497),
        price_extra_day: item?.price_extra_day || item?.price || 400,
      },
      bookings: bookings || [],
    };
  } catch (error: any) {
    console.error("fetchItemAvailability error:", error);
    return { success: false, error: error.message };
  }
}

export async function createBooking(formData: {
  fullName: string;
  phone: string;
  address: string;
  mapLink: string;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  selfieUrl: string;
  itemId: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  totalPrice: number;
  subtotalPrice?: number;
  discountAmount?: number;
  couponCode?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const bookingPayload: any = {
      user_id: userId,
      full_name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      map_link: formData.mapLink,
      aadhaar_number: formData.aadhaarNumber,
      aadhaar_verified: formData.aadhaarVerified,
      selfie_url: formData.selfieUrl,
      item_id: formData.itemId,
      duration_days: formData.durationDays,
      total_price: Number(formData.totalPrice) + 100,
      delivery_fee: 100,
      subtotal_price: Number(formData.subtotalPrice ?? formData.totalPrice),
      discount_amount: Math.max(0, Number(formData.discountAmount) || 0),
      coupon_code: formData.couponCode || null,
      status: "booked",
      tracking_status: "preparing",
    };

    console.log("[DEBUG] createBooking started with:", formData);

    console.log("[DEBUG] createBooking started with:", formData);

    if (formData.startDate) bookingPayload.start_date = formData.startDate;
    if (formData.endDate) bookingPayload.end_date = formData.endDate;

    let { data, error } = await supabaseServer
      .from("bookings")
      .insert([bookingPayload])
      .select();

    console.log("[DEBUG] First insert attempt. Data:", data, "Error:", error);

    console.log("[DEBUG] First insert attempt. Data:", data, "Error:", error);

    // Fallback: If DB table schema doesn't have start_date/end_date columns yet
    if (error && (error.message.includes("end_date") || error.message.includes("start_date") || error.message.includes("schema cache") || error.message.includes("column") || error.message.includes("subtotal_price") || error.message.includes("discount_amount") || error.message.includes("coupon_code"))) {
      console.warn("Retrying insert without start_date/end_date columns due to DB schema cache:", error.message);
      delete bookingPayload.start_date;
      delete bookingPayload.end_date;
      delete bookingPayload.subtotal_price;
      delete bookingPayload.discount_amount;
      delete bookingPayload.coupon_code;

      const retryRes = await supabaseServer
        .from("bookings")
        .insert([bookingPayload])
        .select();

      data = retryRes.data;
      error = retryRes.error;
      console.log("[DEBUG] Retry insert attempt. Data:", data, "Error:", error);
      console.log("[DEBUG] Retry insert attempt. Data:", data, "Error:", error);
    }

    if (error) {
      console.error("[DEBUG] Insert failed with error:", error);
      throw error;
    }

    console.log("[DEBUG] Booking insert succeeded. Row:", data?.[0]);
    if (error) {
      console.error("[DEBUG] Insert failed with error:", error);
      throw error;
    }

    console.log("[DEBUG] Booking insert succeeded. Row:", data?.[0]);

    // Fetch item name for email notification
    let itemName = "Unknown Item";
    try {
      const { data: itemData } = await supabaseServer
        .from("items")
        .select("name")
        .eq("id", formData.itemId)
        .single();
      if (itemData) {
        itemName = itemData.name;
      }
      console.log("[DEBUG] Fetched item name:", itemName);
      console.log("[DEBUG] Fetched item name:", itemName);
    } catch (err) {
      console.warn("[DEBUG] Could not fetch item name for email:", err);
      console.warn("[DEBUG] Could not fetch item name for email:", err);
    }

    // Trigger admin email notification (awaited for serverless environment durability)
    if (data && data.length > 0) {
      console.log("[DEBUG] Triggering booking notification email...");
      try {
        const emailRes = await sendBookingNotificationEmail(data[0], itemName);
        console.log(`[DEBUG] sendBookingNotificationEmail result: ${JSON.stringify(emailRes)}`);
      } catch (err: any) {
        console.error(`[DEBUG] Error sending booking email: ${err.message || err}`);
      }
    } else {
      console.warn("[DEBUG] No data returned from insert. Email notification skipped.");
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("createBooking error:", error);
    return { success: false, error: error.message };
  }
}

export async function seedDatabase() {
  try {
    // 1. Seed Admin User in Supabase Auth
    // Email: gamebeesofficial@gmail.com
    // Password: Iamnithish@02
    const { data: userList } = await supabaseServer.auth.admin.listUsers();

    // Check if admin user already exists
    const adminExists = userList?.users.some(u => u.email === "gamebeesofficial@gmail.com");

    if (!adminExists) {
      const { error: authError } = await supabaseServer.auth.admin.createUser({
        email: "gamebeesofficial@gmail.com",
        password: "Iamnithish@02",
        email_confirm: true,
        user_metadata: { role: "admin" }
      });
      if (authError) throw authError;
    }

    return { success: true, message: "Database seeded successfully!" };
  } catch (error: any) {
    console.error("seedDatabase error:", error);
    return { success: false, error: error.message };
  }
}

export async function getKycStatus() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Try fetching from profiles table
    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profileError && profile) {
      return { success: true, verified: profile.aadhaar_verified, profile };
    }

    // 2. Fallback: check if the user has any booking that is verified
    const { data: bookings, error: bookingsError } = await supabaseServer
      .from("bookings")
      .select("aadhaar_verified, full_name, phone, aadhaar_number")
      .eq("user_id", userId)
      .eq("aadhaar_verified", true)
      .limit(1);

    if (!bookingsError && bookings && bookings.length > 0) {
      return {
        success: true,
        verified: true,
        profile: {
          full_name: bookings[0].full_name,
          phone: bookings[0].phone,
          aadhaar_number: bookings[0].aadhaar_number,
          aadhaar_verified: true,
          kyc_status: 'approved'
        }
      };
    }

    return { success: true, verified: false, profile: null };
  } catch (error: any) {
    console.error("getKycStatus error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveKyc(formData: {
  fullName: string;
  phone: string;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  selfieUrl: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabaseServer
      .from("profiles")
      .upsert({
        id: userId,
        full_name: formData.fullName,
        phone: formData.phone,
        aadhaar_number: formData.aadhaarNumber,
        aadhaar_verified: formData.aadhaarVerified,
        selfie_url: formData.selfieUrl,
        aadhaar_front_url: formData.aadhaarFrontUrl || null,
        aadhaar_back_url: formData.aadhaarBackUrl || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        kyc_status: formData.aadhaarVerified ? 'approved' : 'pending',
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.warn("Profiles table upsert failed:", error.message);
      return {
        success: false,
        error: error.message
      };
    }

    // Trigger admin KYC notification email (awaited for serverless environment durability)
    if (data && data.length > 0) {
      try {
        await sendKycNotificationEmail(data[0]);
      } catch (err: any) {
        console.error("Error sending KYC email:", err);
      }
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("saveKyc error:", error);
    return { success: false, error: error.message };
  }
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { success: false, error: "Enter a promo code." };

    const { data: coupon, error } = await supabaseServer
      .from("coupons")
      .select("*")
      .eq("code", normalized)
      .maybeSingle();

    if (error) throw error;
    if (!coupon || !coupon.is_active) return { success: false, error: "Invalid or inactive promo code." };

    const now = Date.now();
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return { success: false, error: "This promo code is not active yet." };
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) return { success: false, error: "This promo code has expired." };
    if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.used_count >= coupon.usage_limit) return { success: false, error: "This promo code has reached its usage limit." };
    if (Number(subtotal) < Number(coupon.min_order_amount || 0)) return { success: false, error: `Minimum order value is ₹${Number(coupon.min_order_amount).toFixed(0)}.` };

    let discount = coupon.discount_type === "percent"
      ? Number(subtotal) * Number(coupon.discount_value) / 100
      : Number(coupon.discount_value);
    if (coupon.max_discount_amount) discount = Math.min(discount, Number(coupon.max_discount_amount));
    discount = Math.max(0, Math.min(Number(subtotal), Math.round(discount * 100) / 100));

    return {
      success: true,
      data: {
        code: normalized,
        discount,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
      }
    };
  } catch (error: any) {
    console.error("validateCoupon error:", error);
    return { success: false, error: "Promo codes are temporarily unavailable. Please try again." };
  }
}

export async function createBookings(formData: {
  fullName: string;
  phone: string;
  address: string;
  mapLink: string;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  selfieUrl: string;
  items: Array<{ itemId: string; durationDays: number; totalPrice: number; startDate?: string; endDate?: string }>;
  subtotalPrice: number;
  discountAmount: number;
  couponCode?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };
    if (!formData.items?.length) return { success: false, error: "Your cart is empty." };

    const orderId = crypto.randomUUID();
    const subtotal = Number(formData.subtotalPrice) || 0;
    const discount = Math.max(0, Number(formData.discountAmount) || 0);

    const rows = formData.items.map((item, index) => {
      const itemSubtotal = Number(item.totalPrice) || 0;
      const share = subtotal > 0 ? itemSubtotal / subtotal : 0;
      const itemDiscount = Math.round(discount * share * 100) / 100;
      const deliveryFee = index === 0 ? 100 : 0;
      return {
        user_id: userId,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        map_link: formData.mapLink,
        aadhaar_number: formData.aadhaarNumber,
        aadhaar_verified: formData.aadhaarVerified,
        selfie_url: formData.selfieUrl,
        item_id: item.itemId,
        duration_days: item.durationDays,
        total_price: Math.max(0, itemSubtotal - itemDiscount) + deliveryFee,
        delivery_fee: deliveryFee,
        subtotal_price: itemSubtotal,
        discount_amount: itemDiscount,
        coupon_code: formData.couponCode || null,
        order_id: orderId,
        status: "booked",
        tracking_status: "preparing",
        ...(item.startDate ? { start_date: item.startDate } : {}),
        ...(item.endDate ? { end_date: item.endDate } : {}),
      };
    });

    let { data, error } = await supabaseServer.from("bookings").insert(rows).select();
    if (error && (error.message.includes("start_date") || error.message.includes("end_date") || error.message.includes("schema cache"))) {
      const stripped = rows.map(({ start_date, end_date, ...row }) => row);
      const retry = await supabaseServer.from("bookings").insert(stripped).select();
      data = retry.data;
      error = retry.error;
    }
    if (error) throw error;

    if (formData.couponCode) {
      const { data: coupon } = await supabaseServer.from("coupons").select("id, used_count").eq("code", formData.couponCode).maybeSingle();
      if (coupon) await supabaseServer.from("coupons").update({ used_count: Number(coupon.used_count || 0) + 1, updated_at: new Date().toISOString() }).eq("id", coupon.id);
    }

    for (const row of data || []) {
      try {
        const { data: itemData } = await supabaseServer.from("items").select("name").eq("id", row.item_id).single();
        await sendBookingNotificationEmail(row, itemData?.name || "Rental Item");
      } catch (emailError) {
        console.warn("Booking notification email failed:", emailError);
      }
    }

    return { success: true, data, orderId };
  } catch (error: any) {
    console.error("createBookings error:", error);
    return { success: false, error: error.message };
  }
}
