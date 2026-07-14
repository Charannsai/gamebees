"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

export async function createBooking(formData: {
  fullName: string;
  phone: string;
  address: string;
  mapLink: string;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  selfieUrl: string;
  itemId: string;
  durationDays: number;
  totalPrice: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabaseServer
      .from("bookings")
      .insert([
        {
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
          total_price: formData.totalPrice,
          status: "booked",
          tracking_status: "preparing",
        },
      ])
      .select();

    if (error) throw error;
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
          aadhaar_verified: true
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
      })
      .select();

    if (error) {
      console.warn("Profiles table upsert failed (checking fallback):", error.message);
      return { 
        success: false, 
        error: error.message, 
        isTableMissing: error.code === "P0001" || error.message.includes("does not exist") 
      };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("saveKyc error:", error);
    return { success: false, error: error.message };
  }
}
