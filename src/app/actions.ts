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
    // 1. Seed items
    const defaultItems = [
      { name: "PlayStation 5 Pro Console", category: "Consoles", price: 12, description: "Ultimate performance with advanced ray tracing, 60fps/120fps gaming, and 2TB high-speed SSD." },
      { name: "Extra DualSense Controller", category: "Accessories", price: 3, description: "Haptic feedback and adaptive triggers for immersive secondary player action." },
      { name: "Pulse 3D Wireless Headset", category: "Audio", price: 2, description: "Fine-tuned for 3D Audio on PS5 consoles for maximum acoustic immersion." },
      { name: "Premium Travel Case", category: "Accessories", price: 1, description: "Hard-shell impact proof travel case with custom cutouts for console, cables, and controllers." },
      { name: "Xbox Series X Console Bundle", category: "Consoles", price: 10, description: "12 teraflops of raw processing power, true 4K gaming, and preloaded Game Pass access." },
      { name: "Nintendo Switch OLED Bundle", category: "Consoles", price: 6, description: "Vibrant 7-inch OLED screen, adjustable stand, and Mario Kart 8 Deluxe pre-installed." }
    ];

    // Check if items already exist
    const { data: existingItems } = await supabaseServer.from("items").select("id");
    if (!existingItems || existingItems.length === 0) {
      const { error: insertError } = await supabaseServer.from("items").insert(defaultItems);
      if (insertError) throw insertError;
    }

    // 2. Seed Admin User in Supabase Auth
    // Email: admin@gamebees.com
    // Password: GamebeesAdmin2026!
    const { data: userList } = await supabaseServer.auth.admin.listUsers();
    
    // Check if admin user already exists
    const adminExists = userList?.users.some(u => u.email === "admin@gamebees.com");
    
    if (!adminExists) {
      const { error: authError } = await supabaseServer.auth.admin.createUser({
        email: "admin@gamebees.com",
        password: "GamebeesAdmin2026!",
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
