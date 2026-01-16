# Rooms & Roommates Admin Feature - Complete Setup Guide

## Overview
This document provides the complete SQL migration, API setup, and admin panel implementation for managing Rooms and Roommates listings.

---

## SQL Migration

### File Location
`backend/supabase/migrations/002_add_rooms_roommates_features.sql`

### Migration Content

```sql
-- ====================================================
-- MIGRATION 002: Add Rooms & Roommates Admin Features
-- ====================================================

-- 1. Alter rooms table to add admin-friendly fields
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT,
ADD COLUMN IF NOT EXISTS room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'shared')),
ADD COLUMN IF NOT EXISTS furnishing TEXT CHECK (furnishing IN ('unfurnished', 'semi-furnished', 'fully-furnished')),
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;

-- 2. Create roommates_admin table (for admin to manage roommate requirements)
CREATE TABLE IF NOT EXISTS public.roommates_admin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'any')),
    budget INTEGER,
    preferences TEXT,
    contact TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON public.rooms(available);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_owner ON public.roommates_admin(owner_id);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_available ON public.roommates_admin(available);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_gender ON public.roommates_admin(gender);

-- 4. Enable RLS on new table
ALTER TABLE public.roommates_admin ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for roommates_admin table
-- Anyone can view available roommate listings
CREATE POLICY "Anyone can view available roommates" ON public.roommates_admin
    FOR SELECT USING (available = TRUE);

-- Admin/Owner can view their own roommate listings
CREATE POLICY "Owners can view own roommate listings" ON public.roommates_admin
    FOR SELECT USING (auth.uid() = owner_id);

-- Owners can create roommate listings
CREATE POLICY "Owners can create roommate listings" ON public.roommates_admin
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own listings
CREATE POLICY "Owners can update own roommate listings" ON public.roommates_admin
    FOR UPDATE USING (auth.uid() = owner_id);

-- Owners can delete their own listings
CREATE POLICY "Owners can delete own roommate listings" ON public.roommates_admin
    FOR DELETE USING (auth.uid() = owner_id);

-- 6. Update rooms table RLS policies
DROP POLICY IF EXISTS "Owners can manage own rooms" ON public.rooms;

CREATE POLICY "Owners can manage own rooms" ON public.rooms
    FOR ALL USING (auth.uid() = owner_id);

-- 7. Create updated_at trigger for roommates_admin
CREATE OR REPLACE FUNCTION public.update_roommates_admin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_roommates_admin_updated_at ON public.roommates_admin;
CREATE TRIGGER update_roommates_admin_updated_at
    BEFORE UPDATE ON public.roommates_admin
    FOR EACH ROW
    EXECUTE FUNCTION public.update_roommates_admin_updated_at();

-- 8. Storage policies for room images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('roommate-images', 'roommate-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for room-images bucket
CREATE POLICY "Anyone can view room images" ON storage.objects
    FOR SELECT USING (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can upload room images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'room-images' 
        AND auth.role() = 'authenticated'
    );

-- RLS policies for roommate-images bucket
CREATE POLICY "Anyone can view roommate images" ON storage.objects
    FOR SELECT USING (bucket_id = 'roommate-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can upload roommate images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'roommate-images' 
        AND auth.role() = 'authenticated'
    );
```

### How to Run the Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the SQL content above
5. Click **Run** to execute the migration
6. Verify the tables are created by checking the **Table Editor**

---

## Database Schema

### Rooms Table (Enhanced)
```
id              UUID (Primary Key)
title           TEXT (Required)
description     TEXT
rent            INTEGER (Required) - Monthly rent in ₹
distance_km     DOUBLE PRECISION - Distance from campus
amenities       TEXT[] - Array of amenities
contact         TEXT (Required) - Contact number
image_url       TEXT - URL of room image
map_link        TEXT - Google Maps link
room_type       TEXT - 'single', 'double', 'triple', 'shared'
furnishing      TEXT - 'unfurnished', 'semi-furnished', 'fully-furnished'
available       BOOLEAN (Default: TRUE)
owner_id        UUID (Foreign Key) - Admin/Owner ID
created_at      TIMESTAMP
```

### Roommates Admin Table (New)
```
id              UUID (Primary Key)
name            TEXT (Required) - Roommate name
gender          TEXT - 'male', 'female', 'any'
budget          INTEGER - Monthly budget in ₹
preferences     TEXT - Roommate preferences
contact         TEXT (Required) - Contact number
location        TEXT - Preferred location/area
image_url       TEXT - Profile image URL
available       BOOLEAN (Default: TRUE)
owner_id        UUID (Foreign Key) - Admin/Owner ID
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## Frontend Implementation

### 1. Admin Page Components

**File:** `frontend/src/app/admin/page.tsx`

#### Features:
- **Rooms Tab**: Manage room listings with image upload
- **Roommates Tab**: Manage roommate listings with image upload
- **Actions**: Add, Edit, Toggle availability, Delete

#### Room Form Fields:
- Room Title
- Description
- Monthly Rent
- Distance from campus
- Room Type (Single, Double, Triple, Shared)
- Furnishing (Unfurnished, Semi-Furnished, Fully-Furnished)
- Amenities (Comma-separated)
- Contact Number
- Google Maps Link
- Image Upload

#### Roommate Form Fields:
- Name
- Gender (Male, Female, Any)
- Budget
- Preferred Location
- Preferences
- Contact Number
- Profile Image Upload

### 2. API Routes

#### Add Room
**File:** `frontend/src/app/api/admin/add-room/route.ts`
```typescript
POST /api/admin/add-room
{
  title: string (required)
  description?: string
  rent: number (required)
  distance_km?: number
  amenities?: string[]
  contact: string (required)
  image_url?: string
  map_link?: string
  room_type?: 'single' | 'double' | 'triple' | 'shared'
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished'
  available?: boolean
  owner_id: string (required)
}
```

#### Add Roommate
**File:** `frontend/src/app/api/admin/add-roommate/route.ts`
```typescript
POST /api/admin/add-roommate
{
  name: string (required)
  gender?: 'male' | 'female' | 'any'
  budget?: number
  location?: string
  preferences?: string
  contact: string (required)
  image_url?: string
  available?: boolean
  owner_id: string (required)
}
```

#### Image Upload (Reusable)
**File:** `frontend/src/app/api/admin/upload-image/route.ts`
```typescript
POST /api/admin/upload-image
{
  file: File (required)
  bucket: 'room-images' | 'roommate-images' (default: 'service-images')
}

Response: { url: string }
```

### 3. Supabase API Integration

**File:** `frontend/src/lib/supabaseAPI.ts`

#### Rooms API
```typescript
roomsAPI = {
  getRooms(): Promise<{data: {success: true, data: Room[]}}>
  getRoomsByOwner(): Promise<{data: {success: true, data: Room[]}}>
  createRoom(roomData): Promise<{data: {success: true, data: Room}}>
  updateRoom(roomId, updates): Promise<{data: {success: true, data: Room}}>
  deleteRoom(roomId): Promise<{data: {success: true}}>
}
```

#### Roommates API
```typescript
roommatesAPI = {
  getRoommates(): Promise<{data: {success: true, data: Roommate[]}}>
  getRoommatesByOwner(): Promise<{data: {success: true, data: Roommate[]}}>
  createRoommate(roommateData): Promise<{data: {success: true, data: Roommate}}>
  updateRoommate(roommateId, updates): Promise<{data: {success: true, data: Roommate}}>
  deleteRoommate(roommateId): Promise<{data: {success: true}}>
}
```

---

## Storage Buckets

Two new public buckets are created:

### 1. room-images
- **Purpose**: Store room listing images
- **Access**: Public (anyone can view)
- **Uploads**: Admin/Owner only (authenticated users)
- **Max File Size**: 5MB
- **Format**: Image files only

### 2. roommate-images
- **Purpose**: Store roommate profile images
- **Access**: Public (anyone can view)
- **Uploads**: Admin/Owner only (authenticated users)
- **Max File Size**: 5MB
- **Format**: Image files only

---

## Step-by-Step Setup Instructions

### 1. Database Setup
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy entire migration SQL
5. Execute the query
6. Verify tables in Table Editor
```

### 2. Environment Configuration
Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Restart Development Server
```bash
cd frontend
npm run dev
```

### 4. Access Admin Dashboard
```
1. Go to http://localhost:3000/admin
2. Login with admin email (rjdhav67@gmail.com)
3. You'll see new "Rooms" and "Roommates" tabs
```

### 5. Test Functionality
**Add a Room:**
- Click "Rooms" tab
- Fill form with room details
- Upload image (optional)
- Click "Add Room"
- Room appears in the list

**Add a Roommate:**
- Click "Roommates" tab
- Fill form with roommate details
- Upload profile image (optional)
- Click "Add Roommate"
- Listing appears in the list

---

## User-Facing Pages

### Rooms Page
**File:** `frontend/src/app/rooms/page.tsx`

Displays all available rooms with:
- Room image (if available)
- Title and description
- Rent and distance
- Room type and furnishing
- Contact button
- Map link button
- Amenities list

### Roommates Page
**File:** `frontend/src/app/services/[type]/page.tsx` (Reference)

Can create similar page for roommate listings:
- Roommate profile image
- Name and gender
- Budget and preferences
- Location
- Contact button

---

## Error Handling

### Common Issues

**1. "Bucket not found" error**
- Solution: Ensure storage buckets are created (room-images, roommate-images)
- Both should be marked as PUBLIC

**2. "Row violates RLS policy" error**
- Solution: Check SUPABASE_SERVICE_ROLE_KEY is in .env.local
- Verify RLS policies are created correctly

**3. "Not authenticated" error**
- Solution: Ensure user is logged in before adding items
- Check auth token in browser console

**4. Image not displaying**
- Solution: Verify image_url is saved in database
- Check bucket permissions are PUBLIC
- Ensure file path is correct

---

## Data Flow

```
Admin Dashboard
    ↓
Upload Image → /api/admin/upload-image
    ↓ (returns URL)
API Route → /api/admin/add-room or /api/admin/add-roommate
    ↓
Supabase Insert
    ↓
Database Update
    ↓
User Pages (Display)
    ↓
Storage Bucket (Image Display)
```

---

## Feature Comparison

| Feature | Services | Events | Rooms | Roommates |
|---------|----------|--------|-------|-----------|
| Image Upload | ✅ | ✅ | ✅ | ✅ |
| Description | ✅ | ✅ | ✅ | ✅ |
| Price/Budget | ✅ | ❌ | ✅ | ✅ |
| Map Link | ✅ | ✅ | ✅ | ❌ |
| Registration Link | ❌ | ✅ | ❌ | ❌ |
| Availability Toggle | ✅ | ❌ | ✅ | ✅ |
| Delete | ✅ | ❌ | ✅ | ✅ |
| Location/Area | ❌ | ✅ | ❌ | ✅ |

---

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Storage buckets created (room-images, roommate-images)
- [ ] Admin can access Rooms and Roommates tabs
- [ ] Room form submits successfully
- [ ] Roommate form submits successfully
- [ ] Images upload to Supabase Storage
- [ ] Image URLs save to database
- [ ] List shows newly added rooms
- [ ] List shows newly added roommates
- [ ] Toggle availability works
- [ ] Delete functionality works
- [ ] Room data displays on user page
- [ ] Roommate data displays correctly

---

## Next Steps

1. ✅ Run SQL migration
2. ✅ Create storage buckets
3. ✅ Restart dev server
4. ✅ Test admin panel
5. ✅ Create user-facing pages
6. ✅ Test full workflow
7. Deploy to production

---

## Support

For issues or questions:
1. Check error messages in browser console
2. Verify database schema matches migration
3. Check RLS policies in Supabase
4. Verify API routes are accessible
5. Check environment variables are set

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
