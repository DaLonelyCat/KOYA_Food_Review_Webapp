import {
  PrismaClient,
  MediaType,
  NotificationType,
} from "@prisma/client";
import { randomBytes } from "crypto";
import { UTApi } from "uploadthing/server";
import config from "../src/lib/env";

const prisma = new PrismaClient();

// Helper function to generate random ID
function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Helper function to get random element from array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random elements from array
function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to extract file key from UploadThing URL
function extractFileKey(url: string): string | null {
  if (!url) return null;

  // Handle URLs with /a/{appId}/ format
  const appIdPattern = `/a/${config.uploadthing.appId}/`;
  if (url.includes(appIdPattern)) {
    return url.split(appIdPattern)[1];
  }

  // Handle URLs with /f/ format (utfs.io or ufs.sh)
  if (url.includes("/f/")) {
    const parts = url.split("/f/");
    if (parts.length > 1) {
      return parts[1];
    }
  }

  return null;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Delete all files from UploadThing
  console.log("🗑️  Deleting files from UploadThing...");
  try {
    const utApi = new UTApi();

    // Get all media URLs
    const mediaFiles = await prisma.media.findMany({
      select: { url: true },
    });

    // Get all user avatar URLs
    const userAvatars = await prisma.user.findMany({
      where: {
        avatarUrl: { not: null },
      },
      select: { avatarUrl: true },
    });

    // Extract file keys from all URLs
    const fileKeys: string[] = [];

    for (const media of mediaFiles) {
      const key = extractFileKey(media.url);
      if (key) fileKeys.push(key);
    }

    for (const user of userAvatars) {
      if (user.avatarUrl) {
        const key = extractFileKey(user.avatarUrl);
        if (key) fileKeys.push(key);
      }
    }

    // Delete all files in batches (UploadThing API may have limits)
    if (fileKeys.length > 0) {
      console.log(`   Found ${fileKeys.length} files to delete...`);
      // Delete files in batches of 50
      for (let i = 0; i < fileKeys.length; i += 50) {
        const batch = fileKeys.slice(i, i + 50);
        await utApi.deleteFiles(batch);
      }
      console.log(`   ✅ Deleted ${fileKeys.length} files from UploadThing`);
    } else {
      console.log("   ℹ️  No files found to delete");
    }
  } catch (error) {
    console.error("   ⚠️  Error deleting files from UploadThing:", error);
    // Continue with seed even if file deletion fails
  }

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.restaurantVisited.deleteMany();
  await prisma.restaurantFavorite.deleteMany();
  await prisma.restaurantBookmark.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.media.deleteMany();
  await prisma.review.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Create Users (25+)
  console.log("👥 Creating users...");
  const users = [];
  const usernames = [
    "foodie_alice",
    "chef_bob",
    "taste_master",
    "hungry_harry",
    "gourmet_grace",
    "spice_lover",
    "pasta_paul",
    "sushi_sam",
    "burger_ben",
    "pizza_pete",
    "dessert_diana",
    "vegan_victor",
    "bbq_betty",
    "ramen_rachel",
    "taco_tom",
    "wine_wendy",
    "coffee_carl",
    "brunch_bella",
    "street_food_stan",
    "fine_dining_frank",
    "food_blogger_fiona",
    "restaurant_reviewer_rick",
    "culinary_cathy",
    "foodie_fred",
    "gastronomy_gina",
  ];

  const displayNames = [
    "Alice Chen",
    "Bob Martinez",
    "Taste Master",
    "Harry Johnson",
    "Grace Lee",
    "Spice Lover",
    "Paul Anderson",
    "Sam Kim",
    "Ben Wilson",
    "Pete Brown",
    "Diana Taylor",
    "Victor Green",
    "Betty White",
    "Rachel Davis",
    "Tom Miller",
    "Wendy Garcia",
    "Carl Rodriguez",
    "Bella Martinez",
    "Stan Lopez",
    "Frank Harris",
    "Fiona Clark",
    "Rick Lewis",
    "Cathy Walker",
    "Fred Hall",
    "Gina Allen",
  ];

  const bios = [
    "Food enthusiast exploring the culinary world one bite at a time 🍽️",
    "Professional chef sharing my passion for cooking",
    "Always on the hunt for the best flavors",
    "Love trying new restaurants and cuisines",
    "Food photographer and blogger",
    "Vegetarian foodie discovering plant-based delights",
    "BBQ master and grill enthusiast",
    "Ramen connoisseur",
    "Taco Tuesday every day",
    "Wine and dine enthusiast",
    "Coffee addict and brunch lover",
    "Street food explorer",
    "Fine dining aficionado",
    "Food blogger documenting my culinary journey",
    "Restaurant reviewer and critic",
    "Home cook sharing recipes",
    "Dessert specialist",
    "Asian cuisine expert",
    "Italian food lover",
    "Mexican food enthusiast",
    "Seafood specialist",
    "Bakery and pastry lover",
    "Healthy eating advocate",
    "Comfort food connoisseur",
    "International cuisine explorer",
  ];

  for (let i = 0; i < 25; i++) {
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        username: usernames[i],
        displayName: displayNames[i],
        email: `user${i + 1}@example.com`,
        bio: bios[i],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[i]}`,
      },
    });
    users.push(user);
  }

  // Helper function to convert price range string to integer
  function parsePriceRange(priceRangeStr: string): number {
    const normalized = priceRangeStr.replace(/Rp\.?\s*/g, "").trim();
    
    if (normalized.includes("1 - 25.000") || normalized.includes("1-25.000")) {
      return 1; // Budget
    } else if (normalized.includes("25.000 - 50.000") || normalized.includes("25.000-50.000") || normalized.includes("1 - 50.000")) {
      return 2; // Moderate
    } else if (normalized.includes("50.000 - 75.000") || normalized.includes("50.000-75.000")) {
      return 3; // Expensive
    } else if (normalized.includes("75.000") || normalized.includes("100.000")) {
      return 4; // Very Expensive
    }
    
    // Default to moderate if unclear
    return 2;
  }

  // Helper function to parse address and extract city/province
  function parseAddress(address: string): { city: string; province: string } {
    // Most addresses follow pattern: "... RT.X/RW.Y, City, Kec. ..., Kota/Province, ..."
    const parts = address.split(",").map(p => p.trim());
    
    let city = "Jakarta";
    let province = "DKI Jakarta";
    
    // Try to find city (usually after RT/RW or Kec.)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes("Kec.") && i + 1 < parts.length) {
        // City is often the same as kecamatan or the part after it
        const nextPart = parts[i + 1];
        if (!nextPart.includes("Kota") && !nextPart.includes("Daerah")) {
          city = nextPart;
        }
      }
      if (part.includes("Kota")) {
        const kotaPart = part.replace("Kota", "").trim();
        if (kotaPart) {
          city = kotaPart;
        }
      }
      if (part.includes("Daerah Khusus Ibukota Jakarta") || part.includes("DKI Jakarta")) {
        province = "DKI Jakarta";
        city = city || "Jakarta";
      }
    }
    
    // Common cities in the data
    if (address.includes("Palmerah")) {
      city = "Palmerah";
      province = "DKI Jakarta";
    } else if (address.includes("Kb. Jeruk") || address.includes("Kebon Jeruk")) {
      city = "Kebon Jeruk";
      province = "DKI Jakarta";
    } else if (address.includes("Kemanggisan")) {
      city = "Kemanggisan";
      province = "DKI Jakarta";
    }
    
    return { city, province };
  }

  // Helper function to generate slug from name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Create Restaurants from CSV data
  console.log("🍽️  Creating restaurants...");
  const restaurants = [];
  const restaurantData = [
    {
      name: "Ayam Geprek Ongkel Kemanggisan",
      address: "Jl. KH. Syahdan Gg. H. Senin No.58D, RT.6/RW.12, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipOgTKBEJyxDofw8KXYM0h5AiX4qqD_WG9pGjDHQ=w408-h408-k-no",
      cuisineType: "Ayam Penyet Restaurant",
      priceRangeStr: "Rp 1 - 25.000",
    },
    {
      name: "Sky Pasta Binus",
      address: "Jl. Rw. Belong No.38-34, RT.7/RW.15, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11540",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyU_vWW3VZdMZRWHHznxuIjG6V4Rvqn3nR4lNZWUswjNJh4cWTHvjTHPJZu2FTW_G8WDLdhrIlo-cAMFwyZ-oIgeEki4b4oK_UVv433B2XA0v42zssEoGQiVYQJ6EQpEssX3D9j=w426-h240-k-no",
      cuisineType: "Italian Restaurant",
      priceRangeStr: "Rp  25.000 - 50.000",
    },
    {
      name: "Rocky Rooster Binus",
      address: "8, Jl. Rw. Belong No.82B, RT.9/RW.15, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSynD73ljfZIELk46Fen1-YHyE2vKEfM9bWWzfgxqtQonU1b8RD6GwlLhH2mXShsY5twReIHgpotk2x5TYWt0zdMQwXrk-5Xe84Qlsy21FJQWst8q2JPqh-s3fkaiL5RoJ5W8vDS6_sY1MSN=w408-h544-k-no",
      cuisineType: "Fast Food Restaurant",
      priceRangeStr: "Rp 25.000 - 50.000",
    },
    {
      name: "Fish Bite",
      address: "Jl. Keluarga No.36 6, RT.6/RW.12, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSy7Gn3BL5wCdKwzmh0hrmQcAcL1YOkoFuFXEkkuY_N0qlE4zkHH2U8qY_on2YXVje7-zFWkplE63NWHy3ouHwcvPkXemGxgXzKNWGb8QY6aS3141VXZcpbn42HxnK2KIuEthJmR0A=w408-h544-k-no",
      cuisineType: "Fish & Chips Restaurant",
      priceRangeStr: "Rp 50.000 - 75.000",
    },
    {
      name: "Nasi Goreng Legend",
      address: "Jl. H. Sennin No.51, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwsIH03oPw8euc6nkeSYOyzlv0qqmLwnmeLJUQV5DW0JEncbwiqcml0omd5BgbHTXQ5QFjMaTMKkN84cd18gYBpq8u9e6dCTO9vlUa8e7-WNJaO4RHv1ee5Kma_dx_pyXEUDpIdyg=w408-h544-k-no",
      cuisineType: "Indonesian Restaurant",
      priceRangeStr: "Rp 25.000 - 50.000",
    },
    {
      name: "Chickin-san",
      address: "Jl. Kyai H. Syahdan No.64B, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyYsPzlAxRDH5n1d-dcJavFW6d27N3SCuyNoC5K1HUefkVsCiR5PNG3xZfIRwiOVW0wQqiwm93J2Ja-RFMD0-PJ9C2NEODjUNUU7Ivc36f8TF5cPL1QLqzNsn_zgX43BO7aDUkbcw=w408-h306-k-no",
      cuisineType: "Fast Food Restaurant",
      priceRangeStr: "Rp 25.000 - 50.000",
    },
    {
      name: "KUALI",
      address: "Jl. Kyai H. Syahdan No.2, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwaz4jRVdHoa7bVPQILNpv9zbL0wyMix6ImMLn1OpTfqeljSUgFOJplH5NHLx8V8VbGuPUupm3v7jksOsZSv2ApwbOI2_rWtZNFkBH5wMSiluvvo7uOLxzQKy-ZKDnhH2nFXNvP=w520-h240-k-no",
      cuisineType: "Japanese Restaurant",
      priceRangeStr: "Rp 1 - 25.000",
    },
    {
      name: "Kedai Telor Tjap Naga",
      address: "Jl. U Raya No.28, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxa2EQdMzGnOhHmHfBt1cQyYpgAk9jhNVid14dwYQGODSoSB46sONuGYwz4_Cs07qXR0tQRcPrzhtO5tbkKxEYBIcysotrjZZRnrdZiPlJW0nG71riTiIX-d3hK1TXK6BpszJo=w408-h725-k-no",
      cuisineType: "Chinese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Paradise Kitchen",
      address: "Jl. U Raya No.6 F 2, RT.2/RW.11, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipNBKJGRNTBouvmhbiBnsCNCBKcENXtf9thyYAwo=w506-h240-k-no",
      cuisineType: "Chinese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Pho Real",
      address: "Jl. U Raya Jl. U No.30 B, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipMq3ax35iJg_lj_bgGIUr2FabE9LsZDCsQl_zmY=w408-h501-k-no",
      cuisineType: "Vietnamese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Ciz n Chic",
      address: "8, Jl. U Raya No.24, RT.8/RW.15, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxTgz9Hw4hpdJn6IsZrTpLszaTK8Bo3ujmDUXjt7BEXhXYl4gqrXEGcjOzKwNRQkZFznLO1IldlDk_F5UPNuaCpkbL1cYsYc2r95HnGEfQG5iy6hvJ6JgdRw_Bdw9dvxYCvK_7U=w426-h240-k-no",
      cuisineType: "Western Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Kodaigiri",
      address: "Jl. Mandala.5, kios unit 5E, Kb. Jeruk, Daerah Khusus Ibukota Jakarta 11530",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyFNKfT3nxOmKGpyjsnNR_SdaJ3ClxM14_qsNxEQAc6RTqNmoJ4lSR-CAi6sojNCWXTtssc0kIr87VZwuv1Us_fNmkb4q4ugj3EO0I6vVHZImNiZgQnwRYbJRgj8Q0ornIUa7Hc=w408-h544-k-no",
      cuisineType: "Japanese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Okaasan Kare Katsu",
      address: "Jl. Kyai H. Syahdan No 2 8A, RT.2/RW.11, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipOtcxYB1XaC_bq00mVFoX2TNTwhtdkH332ufByb=w408-h725-k-no",
      cuisineType: "Japanese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Koka Ramen Express",
      address: "DEPAN BINUS SYAHDAN, Jl. Kyai H. Syahdan No.105 2, RT.2/RW.11, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx_u6FF8J4e3R4L-NDA0T9frbBp7XQeZI8URZfjw1wLY9iMnoM4bMo-yKbKNDAPA86GVlyze9zKS03Wfqrs8V2mEyboF008QudgBjCN1E0anAcpI6PhSaq6aZf6-MXE3tkZmhpp=w408-h712-k-no",
      cuisineType: "Japanese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Fortune Corner Binus",
      address: "Jl. U No.17d, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSymkauSmWB70aOhhlHIeYotKIpj2xN8xphuE7ZCpU11fzpGdKzBnOmxtvkmdLGVi7fwC-y3cjuOIC2bCn1vJJZPp0kksz9_mRMxvVRsoMhMjzymO0ENVYnls0vhzz75V3Quuxs2VQ=w408-h544-k-no",
      cuisineType: "Vegan Chinese Restaurant",
      priceRangeStr: "Rp 1 - 25.000",
    },
    {
      name: "Kwetiau 79",
      address: "Jalan Anggrek cakra no 17 Kemanggisan, RT.4/RW.6, Sukabumi Utara, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11450",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipPnLV4Cr7M3F17YiiBKIYaZN_oIbL5LC_VQ7swm=w408-h544-k-no",
      cuisineType: "Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Tsuka Ramen Kemanggisan",
      address: "Jl. Kemanggisan Raya No.5, RT.2/RW.13, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwl84hcZRn2WPSM6kUYeQkZoIOUL9juSPTevI-8nfcLOYWebjEvbUtOMxzvPDz4n0hARTRCcWNu9UuEXjMxpr7yo7ArEMK0TlIJ8w3iIfqSdk0YzC57XKMpZYSDDNKDyRAyRQzO=w408-h544-k-no",
      cuisineType: "Ramen Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Fried Chicken Master",
      address: "7, Jl. Kyai H. Syahdan No.1a, RT.6/RW.12, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyH48rNW1YDzx1cC0jOL1QZr8newdG1gc7wmuINmzzyNzUj90XvmgTxf8CJ-b5ZXvtxR-SAoBW6agHVaVRX2H3yJdRk1bESHucATIFlnUl62va00S1Wo9CQegSD-UaCiBGEn34M=w408-h306-k-no",
      cuisineType: "Fried Chicken Restaurant",
      priceRangeStr: "Rp 50.000 - 75.000",
    },
    {
      name: "Kantin Jos 88",
      address: "5, Jl. H. Sennin No.61C, RT.5/RW.12, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSzWwiYKrBjTHC5h2vqWOq46XAFjukk-A9U42I9sp69A32XMzLlNxdKY9_lwP6v2yh9DuSlzWfe3FRw34cGBJ3m8tHTrn6LRrhYmjOxUDfpfh6riZ2TMwuKzr4GVw8vME8AS49bGDw=w408-h328-k-no",
      cuisineType: "Restaurant",
      priceRangeStr: "Rp 1 - 50.000",
    },
    {
      name: "PAPAPASTA",
      address: "Jl. Anggrek Cakra No.1B, Sukabumi Utara, Kec. Kb. Jeruk, Jakarta, Daerah Khusus Ibukota Jakarta 12410",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxlM6Bllge8rSsJYj7KZqd9lu_2y7zjYbVj0S-ljaS_z0r6bE_rLiLvAMmP5ag7QbXCqA0nav7B-YvcZXEG0rY_nHSwtR1KlXTmFOl_0nk-B4rzAMWelYqquQwJ4-5gDbQhFjC-xkQUWWYO=w408-h544-k-no",
      cuisineType: "Italian Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Sate Madura & Taichan",
      address: "Jl. U Raya No.2 8, RT.8/RW.15, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx9pnxXEC_QMikse64Gdbdq4zzpW6o8lps6XeajqyOM3jNi2thzCQSmZIyPvmYlPYUWZ2lSdhvyLdphWs16Dw6uGhgrmmsqrCDK67JCwf9ClDGqypbDlRnub12hM5A5l_DzpcHn=w426-h240-k-no",
      cuisineType: "Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "King Pangsit",
      address: "Jl. U Raya Blok U no 2, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipOxcj5Mv3YV4heStM0KeIBARspTT03Hhlj05_DX=w408-h293-k-no",
      cuisineType: "Chinese Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Mie Ayam Bangka Ongky",
      address: "9, Jl. U Raya No.9a, RT.9/RW.15, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwm5LdFfiLpZGEpadHR3CWtqTFWw5JD3ZlYx4MsbS7Km5pUSIYZKKzj5Nf_4g98sV0ZITpxVek8u0T6fzzscLeaSu0OZrBAiQS7ZD6aOAL_WIfWuj-1ywoqDqPjwg5sC2IVc_z4=w408-h544-k-no",
      cuisineType: "Indonesian Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Sego Dadar Lombok",
      address: "Jl. Kyai H. Taisir No.1, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSzhp-xbqpQd06OijKYQSP83CjX2j-SjL36Dbw2nkEqr21UMItdB_mzi8tpdSBHR2_wvDR6fP5AsKCU91Q7wNybUZTfB4CP652bBF3b-UjUKxKEXLcctNbCBTOdclvWRSkUHYV77BA=w408-h306-k-no",
      cuisineType: "Indonesian Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Bakmi Melawaai 77",
      address: "Jl. Kemanggisan Ilir III No.L12, Kemanggisan, Kec. Palmerah, Jakarta, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxAE1alCRhXABrlEHVNkg6Bl4lZKaOm-VTb__labvh1pXTF5wb821wbT9Sdiv7T3256sBfCcoYf4OEsYQTG5i4BVYhu3p19vuXYEabG2_1MXTBXF5sX1PnAWat45Cycsk_wQ5IT=w408-h408-k-no",
      cuisineType: "Indonesian Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Mie Pinangsia Amei",
      address: "Jl. Anggrek Cakra No.1 4, RT.4/RW.6, Sukabumi Utara, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11540",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyZNH293yIoXpYzEO-UEyuflFKTIOBXNKmkO2Pu3CLMzokO5I6tE11twEASwExSYv3vf8VbnKvM5a6WNB-xsc4_EoDxhwZ74KcdKeNsDA9OcaHdk01wTF7CvIfSKySqebb49nib6Q=w408-h725-k-no",
      cuisineType: "Chinese Restaurant",
      priceRangeStr: "Rp 1 - 25.000",
    },
    {
      name: "RM Spices Nasi Bakar & Ayam Penyet",
      address: "6 Jalan Keluarga No.37z, RT.6/RW.12, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxmkAXSvheKJszBJTX6uxgoNOtUflLLXvteDSslDJyu0aqp9vQWes5mtMaR96rQa0aaj4byvPgXEqjN959DR87URRfJgRamMkRx8YG2zhCPwlq6p4vGO_BV3gaBDR9heeHopMRf=w408-h544-k-no",
      cuisineType: "Chicken Restaurant",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "DOREI Donuts, Pizza & Coffeee",
      address: "Jl. Rw. Belong No.22, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipMrcXhmuI7mCUGMfLmHdcph0F8F5kbXLipo8193=w408-h541-k-no",
      cuisineType: "Coffee Shop",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "TUKU Kemanggisan",
      address: "Jl. Kemanggisan Raya No.9, Kb. Jeruk, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSycBEH5K4_rCASeaz1cj_DrvZi2lwxXCJq01McGWDa3BEgoIzF3xX5Z4PXkQMPdYGEVtt31Qg_ahyGiV1qfHaELAPKY_-Xnz9YEKESVHYoHxpC42hwkaIFtZO13hAzVPVO_qLij=w408-h544-k-no",
      cuisineType: "Coffee Shop",
      priceRangeStr: "Rp. 25.000 - 50.000",
    },
    {
      name: "Cotti Coffee Kemanggisan",
      address: "Jl. Kyai H. Syahdan No.8ar, RT.6/RW.12, Palmerah, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxtUjAQvsoRsQZTdVhtKwulYE0IQq_wy3XQeZwnORMXPinuMQWu6jhaGdrjqVft5jdpqbf1dPQcOkRfA04vrS0oqfsMVIL7s3ZeNJN4fenBABP4j7VFI5uR4zn4SjXHpsoBkfSKHYsT9KHa=w408-h306-k-no",
      cuisineType: "Coffee Shop",
      priceRangeStr: "Rp 1 - 25.000",
    },
  ];

  for (const data of restaurantData) {
    const { city, province } = parseAddress(data.address);
    const priceRange = parsePriceRange(data.priceRangeStr);
    const slug = generateSlug(data.name);
    
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        slug,
        cuisineType: data.cuisineType,
        city,
        province,
        priceRange,
        description: `Authentic ${data.cuisineType} cuisine in ${city}, ${province}. A must-visit for food lovers!`,
        address: data.address,
        imageUrl: data.imageUrl,
        latitude: null, // Can be extracted from Google Maps URL if needed
        longitude: null, // Can be extracted from Google Maps URL if needed
        isActive: true,
      },
    });
    restaurants.push(restaurant);
  }

  // Create Reviews (50+)
  console.log("📝 Creating reviews...");
  const reviews = [];
  const reviewContents = [
    "Amazing food! The flavors were incredible and the presentation was beautiful.",
    "Great experience overall. The staff was friendly and the ambiance was perfect.",
    "Highly recommend this place! The dishes were authentic and delicious.",
    "One of the best meals I've had in a while. Will definitely come back!",
    "The food was good but service was a bit slow. Still worth a visit.",
    "Perfect for a date night! Romantic atmosphere and excellent cuisine.",
    "Great value for money. Portions were generous and flavors were on point.",
    "The chef really knows what they're doing. Every dish was a masterpiece.",
    "Loved the variety of options. Something for everyone!",
    "The presentation was Instagram-worthy! Food tasted as good as it looked.",
    "Authentic flavors that reminded me of home. Truly exceptional!",
    "The service was outstanding. Staff went above and beyond.",
    "A hidden gem! So glad we discovered this place.",
    "The ambiance was cozy and welcoming. Perfect for family dinners.",
    "Fresh ingredients and creative combinations. Very impressed!",
    "The dessert menu is to die for! Don't skip it.",
    "Great for groups. We had a wonderful time celebrating here.",
    "The wine selection was impressive. Great pairings available.",
    "Vegetarian options were excellent. Even my meat-loving friends enjoyed them.",
    "The portion sizes were perfect. Left feeling satisfied but not stuffed.",
    "Fast service without compromising quality. Great for lunch breaks.",
    "The outdoor seating area is beautiful. Perfect for nice weather.",
    "The chef's special was incredible. Ask about it when you visit!",
    "The prices are reasonable for the quality you get. Great value!",
    "The atmosphere is lively and fun. Great place to hang out with friends.",
    "The menu has something for every dietary restriction. Very accommodating.",
    "The cocktails were creative and delicious. Great bar program!",
    "The bread basket alone is worth the visit. Everything is fresh.",
    "The staff was knowledgeable about the menu and gave great recommendations.",
    "The restaurant has a great vibe. Music was perfect, not too loud.",
    "The ingredients are clearly high quality. You can taste the difference.",
    "The plating was artistic. Each dish was a work of art.",
    "Great for special occasions. They made our celebration memorable.",
    "The flavors were bold and well-balanced. Nothing was overpowering.",
    "The restaurant is clean and well-maintained. Attention to detail shows.",
    "The wait time was reasonable even on a busy night.",
    "The menu changes seasonally which keeps things interesting.",
    "The chef came out to greet us. Personal touch was appreciated.",
    "The location is convenient and parking was easy to find.",
    "The restaurant has great reviews for a reason. Lived up to the hype!",
    "The portion control was perfect. Quality over quantity.",
    "The restaurant sources local ingredients. Supporting local is important.",
    "The dessert was the perfect ending to a great meal.",
    "The restaurant has a great selection of craft beers.",
    "The staff handled our dietary restrictions perfectly.",
    "The restaurant has a warm and inviting atmosphere.",
    "The food came out hot and fresh. Timing was perfect.",
    "The restaurant has a great happy hour. Good deals!",
    "The presentation was beautiful. Food photography heaven!",
    "The restaurant exceeded all our expectations. Can't wait to return!",
  ];

  for (let i = 0; i < 50; i++) {
    const user = randomElement(users);
    const restaurant = Math.random() > 0.3 ? randomElement(restaurants) : null; // 70% have restaurant, 30% don't
    const rating = restaurant ? (Math.random() * 2 + 3).toFixed(1) : null; // 3-5 rating if restaurant exists

    const review = await prisma.review.create({
      data: {
        content: randomElement(reviewContents),
        userId: user.id,
        restaurantId: restaurant?.id,
        rating: rating ? parseFloat(rating) : null,
      },
    });
    reviews.push(review);
  }

  // Create Media (100+)
  console.log("📸 Creating media...");
  const mediaUrls = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    "https://images.unsplash.com/photo-1565958011703-26f16269dc1a?w=800",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  ];

  for (let i = 0; i < 100; i++) {
    const review = randomElement(reviews);
    await prisma.media.create({
      data: {
        reviewId: review.id,
        type: Math.random() > 0.1 ? MediaType.IMAGE : MediaType.VIDEO, // 90% images, 10% videos
        url: randomElement(mediaUrls),
      },
    });
  }

  // Create Comments (50+)
  console.log("💬 Creating comments...");
  const commentContents = [
    "Looks delicious! I need to try this place.",
    "Great review! Thanks for sharing.",
    "I totally agree with your assessment.",
    "This place is on my list now!",
    "The food looks amazing in the photos.",
    "I had a similar experience there.",
    "Thanks for the detailed review!",
    "Can't wait to visit this restaurant.",
    "Your photos are making me hungry!",
    "I've been meaning to try this place.",
    "Great recommendation!",
    "The presentation looks beautiful.",
    "I love this restaurant too!",
    "Thanks for the tip!",
    "This looks incredible!",
    "I'm adding this to my must-visit list.",
    "Great write-up!",
    "The food looks so good!",
    "I had an amazing time there as well.",
    "Thanks for sharing your experience!",
  ];

  for (let i = 0; i < 50; i++) {
    const user = randomElement(users);
    const review = randomElement(reviews);
    await prisma.comment.create({
      data: {
        content: randomElement(commentContents),
        userId: user.id,
        reviewId: review.id,
      },
    });
  }

  // Create Likes (100+)
  console.log("❤️  Creating likes...");
  const likedReviews = randomElements(reviews, 40);
  for (const review of likedReviews) {
    const likers = randomElements(users, Math.floor(Math.random() * 10) + 1);
    for (const user of likers) {
      try {
        await prisma.like.create({
          data: {
            userId: user.id,
            reviewId: review.id,
          },
        });
      } catch (e) {
        // Skip if like already exists
      }
    }
  }

  // Create Bookmarks (50+)
  console.log("🔖 Creating bookmarks...");
  const bookmarkedReviews = randomElements(reviews, 30);
  for (const review of bookmarkedReviews) {
    const bookmarkers = randomElements(
      users,
      Math.floor(Math.random() * 5) + 1,
    );
    for (const user of bookmarkers) {
      try {
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            reviewId: review.id,
          },
        });
      } catch (e) {
        // Skip if bookmark already exists
      }
    }
  }

  // Create Follows (50+)
  console.log("👥 Creating follows...");
  for (let i = 0; i < 50; i++) {
    const follower = randomElement(users);
    const following = randomElement(users.filter((u) => u.id !== follower.id));
    try {
      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: following.id,
        },
      });
    } catch (e) {
      // Skip if follow relationship already exists
    }
  }

  // Create Notifications (50+)
  console.log("🔔 Creating notifications...");
  for (let i = 0; i < 50; i++) {
    const recipient = randomElement(users);
    const issuer = randomElement(users.filter((u) => u.id !== recipient.id));
    const review = Math.random() > 0.3 ? randomElement(reviews) : null;
    const type = randomElement([
      NotificationType.LIKE,
      NotificationType.FOLLOW,
      NotificationType.COMMENT,
    ]);

    await prisma.notification.create({
      data: {
        recipientId: recipient.id,
        issuerId: issuer.id,
        reviewId: review?.id,
        type,
        read: Math.random() > 0.5,
      },
    });
  }

  // Create Restaurant Bookmarks (50+)
  console.log("🔖 Creating restaurant bookmarks...");
  for (let i = 0; i < 50; i++) {
    const user = randomElement(users);
    const restaurant = randomElement(restaurants);
    try {
      await prisma.restaurantBookmark.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
        },
      });
    } catch (e) {
      // Skip if bookmark already exists
    }
  }

  // Create Restaurant Favorites (50+)
  console.log("⭐ Creating restaurant favorites...");
  for (let i = 0; i < 50; i++) {
    const user = randomElement(users);
    const restaurant = randomElement(restaurants);
    try {
      await prisma.restaurantFavorite.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
        },
      });
    } catch (e) {
      // Skip if favorite already exists
    }
  }

  // Create Restaurant Visited (50+)
  console.log("📍 Creating restaurant visited records...");
  for (let i = 0; i < 50; i++) {
    const user = randomElement(users);
    const restaurant = randomElement(restaurants);
    try {
      await prisma.restaurantVisited.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
        },
      });
    } catch (e) {
      // Skip if visited already exists
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${restaurants.length} restaurants`);
  console.log(`   - ${reviews.length} reviews`);
  console.log(`   - 100 media items`);
  console.log(`   - 50 comments`);
  console.log(`   - 100+ likes`);
  console.log(`   - 50+ bookmarks`);
  console.log(`   - 50+ follows`);
  console.log(`   - 50 notifications`);
  console.log(`   - 50+ restaurant bookmarks`);
  console.log(`   - 50+ restaurant favorites`);
  console.log(`   - 50+ restaurant visited records`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
