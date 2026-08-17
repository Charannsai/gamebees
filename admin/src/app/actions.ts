"use server";

import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

// Auth Verification helper
async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  const { data: { user }, error } = await supabaseServer.auth.getUser(token);
  if (error || !user) return false;

  // Additional role check
  return user.user_metadata?.role === "admin" || user.email === "gamebeesofficial@gmail.com";
}

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const cookieStore = await cookies();
    cookieStore.set("admin_token", data.session?.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("adminLogin error:", error);
    return { success: false, error: error.message };
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return { success: true };
}

export async function getAdminSession() {
  const isAuth = await verifyAdmin();
  return { isAuthenticated: isAuth };
}

// Item Management Actions
export async function adminFetchItems() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUploadProductImage(formData: FormData) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File;
    const fileList = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    if (fileList.length === 0) {
      return { success: false, error: "No image file provided" };
    }

    // Ensure bucket exists
    try {
      await supabaseServer.storage.createBucket("product-images", { public: true });
    } catch (e) {
      // Ignore if bucket already exists
    }

    const uploadedUrls: string[] = [];

    for (const file of fileList) {
      if (!file || typeof file.arrayBuffer !== "function") continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name ? file.name.split(".").pop()?.toLowerCase() || "png" : "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabaseServer.storage
        .from("product-images")
        .upload(filePath, buffer, {
          contentType: file.type || `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabaseServer.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    return { success: true, urls: uploadedUrls };
  } catch (error: any) {
    console.error("adminUploadProductImage error:", error);
    return { success: false, error: error.message };
  }
}

export async function adminAddProduct(product: {
  name: string;
  category: string;
  price: number;
  description: string;
  image_url?: string;
  image_urls?: string[];
  quantity?: number;
  price_3_days?: number;
  price_extra_day?: number;
}) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const urlsArr = product.image_urls || (product.image_url ? [product.image_url] : []);
    const primaryUrl = urlsArr[0] || product.image_url || null;

    const itemPayload: any = {
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image_url: primaryUrl,
      image_urls: urlsArr,
      quantity: product.quantity || 1,
      price_3_days: product.price_3_days || (product.price * 3),
      price_extra_day: product.price_extra_day || product.price,
    };

    let { data, error } = await supabaseServer
      .from("items")
      .insert([itemPayload])
      .select();

    if (error && (error.message.includes("schema cache") || error.message.includes("column") || error.message.includes("image_urls"))) {
      delete itemPayload.image_urls;
      delete itemPayload.quantity;
      delete itemPayload.price_3_days;
      delete itemPayload.price_extra_day;

      const retryRes = await supabaseServer
        .from("items")
        .insert([itemPayload])
        .select();

      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateProduct(id: string, product: {
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  quantity?: number;
  price_3_days?: number;
  price_extra_day?: number;
}) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const urlsArr = product.image_urls || (product.image_url ? [product.image_url] : undefined);
    const primaryUrl = urlsArr ? (urlsArr[0] || null) : product.image_url;

    const payload: any = { ...product };
    if (primaryUrl !== undefined) payload.image_url = primaryUrl;
    if (urlsArr !== undefined) payload.image_urls = urlsArr;

    let { data, error } = await supabaseServer
      .from("items")
      .update(payload)
      .eq("id", id)
      .select();

    if (error && (error.message.includes("schema cache") || error.message.includes("column") || error.message.includes("image_urls"))) {
      delete payload.image_urls;
      delete payload.quantity;
      delete payload.price_3_days;
      delete payload.price_extra_day;

      const retryRes = await supabaseServer
        .from("items")
        .update(payload)
        .eq("id", id)
        .select();

      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteProduct(id: string) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { error } = await supabaseServer
      .from("items")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminFetchRentalDiscounts() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { data, error } = await supabaseServer.from("rental_discount_settings").select("days, discount_percent").in("days", [14, 30]).order("days");
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function adminUpdateRentalDiscount(days: number, discountPercent: number) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  if (![14, 30].includes(Number(days))) return { success: false, error: "Only 14-day and 30-day discounts are configurable." };
  try {
    const { data, error } = await supabaseServer.from("rental_discount_settings").upsert({ days: Number(days), discount_percent: Math.max(0, Math.min(100, Number(discountPercent) || 0)), updated_at: new Date().toISOString() }, { onConflict: "days" }).select();
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) { return { success: false, error: error.message }; }
}

// Landing Page "Pick Your Choice" Management
const DEFAULT_LANDING_GEAR = [
  { name: "PlayStation 5 Pro Console", price: 12, image_url: "/ps5.png", description: "PlayStation 5 Pro console rental.", required: true, is_active: true, sort_order: 1 },
  { name: "Extra DualSense Controller", price: 3, image_url: "/controller.png", description: "Add an extra DualSense controller.", required: false, is_active: true, sort_order: 2 },
  { name: "Pulse 3D Wireless Headset", price: 2, image_url: "/controller.png", description: "Wireless gaming headset for immersive audio.", required: false, is_active: true, sort_order: 3 },
  { name: "Premium Travel Case", price: 1, image_url: "/ps5.png", description: "Protective travel case for your gaming setup.", required: false, is_active: true, sort_order: 4 },
];

export async function adminEnsureLandingDefaults() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { data, error } = await supabaseServer.from("landing_gear_options").select("id").limit(1);
    if (error) throw error;
    if ((data || []).length > 0) return { success: true, created: false };
    const { error: insertError } = await supabaseServer.from("landing_gear_options").insert(DEFAULT_LANDING_GEAR.map((item) => ({ ...item, updated_at: new Date().toISOString() })));
    if (insertError) throw insertError;
    return { success: true, created: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminFetchLandingGear() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { data, error } = await supabaseServer
      .from("landing_gear_options")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminAddLandingGear(item: { name: string; price: number; image_url?: string; description?: string; required?: boolean; is_active?: boolean; sort_order?: number }) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { data, error } = await supabaseServer.from("landing_gear_options").insert([{
      name: item.name.trim(), price: Number(item.price) || 0, image_url: item.image_url || null,
      description: item.description || null, required: !!item.required, is_active: item.is_active ?? true,
      sort_order: Number(item.sort_order) || 0, updated_at: new Date().toISOString()
    }]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function adminUpdateLandingGear(id: string, item: Partial<{ name: string; price: number; image_url: string | null; description: string | null; required: boolean; is_active: boolean; sort_order: number }>) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const payload: any = { ...item, updated_at: new Date().toISOString() };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.price !== undefined) payload.price = Number(payload.price) || 0;
    if (payload.sort_order !== undefined) payload.sort_order = Number(payload.sort_order) || 0;
    const { data, error } = await supabaseServer.from("landing_gear_options").update(payload).eq("id", id).select();
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function adminDeleteLandingGear(id: string) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { error } = await supabaseServer.from("landing_gear_options").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

// Booking Management Actions
export async function adminFetchBookings() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("bookings")
      .select(`
        *,
        items (
          name,
          price,
          category
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateBookingStatus(
  bookingId: string,
  status: string,
  trackingStatus: string
) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("bookings")
      .update({
        status,
        tracking_status: trackingStatus,
      })
      .eq("id", bookingId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminFetchKycProfiles() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminApproveKyc(userId: string) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("profiles")
      .update({
        kyc_status: "approved",
        aadhaar_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select();

    if (error) throw error;

    // Also update any bookings from this user to mark them verified if required
    await supabaseServer
      .from("bookings")
      .update({ aadhaar_verified: true })
      .eq("user_id", userId);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeclineKyc(userId: string) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("profiles")
      .update({
        kyc_status: "declined",
        aadhaar_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select();

    if (error) throw error;

    // Also update bookings
    await supabaseServer
      .from("bookings")
      .update({ aadhaar_verified: false })
      .eq("user_id", userId);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminFetchCoupons() {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { data, error } = await supabaseServer.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminAddCoupon(coupon: {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const payload = {
      ...coupon,
      code: coupon.code.trim().toUpperCase(),
      min_order_amount: Number(coupon.min_order_amount || 0),
      max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
      usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : null,
      is_active: coupon.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseServer.from("coupons").insert([payload]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateCoupon(id: string, coupon: Partial<Parameters<typeof adminAddCoupon>[0]>) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const payload: any = { ...coupon, updated_at: new Date().toISOString() };
    if (payload.code) payload.code = payload.code.trim().toUpperCase();
    const { data, error } = await supabaseServer.from("coupons").update(payload).eq("id", id).select();
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteCoupon(id: string) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };
  try {
    const { error } = await supabaseServer.from("coupons").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
