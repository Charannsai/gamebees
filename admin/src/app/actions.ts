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

export async function adminAddProduct(product: {
  name: string;
  category: string;
  price: number;
  description: string;
  image_url?: string;
}) {
  const isAuth = await verifyAdmin();
  if (!isAuth) return { success: false, error: "Unauthorized" };

  try {
    const { data, error } = await supabaseServer
      .from("items")
      .insert([
        {
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          image_url: product.image_url || null,
        },
      ])
      .select();

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
