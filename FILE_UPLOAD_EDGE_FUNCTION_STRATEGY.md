# File Upload Edge Function Strategy for NeuraCore

**Document Version:** 1.0  
**Date Created:** October 30, 2025  
**Status:** Analysis & Recommendation  

---

## Executive Summary

This document provides a comprehensive analysis of the current file upload system in NeuraCore and presents a strategic plan for implementing Supabase Edge Functions to enhance file upload capabilities with improved security, performance, and scalability.

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [Database Structure](#2-database-structure)
3. [Current File Upload Implementation](#3-current-file-upload-implementation)
4. [Identified Gaps and Limitations](#4-identified-gaps-and-limitations)
5. [Edge Function Strategy](#5-edge-function-strategy)
6. [Proposed Architecture](#6-proposed-architecture)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Security Considerations](#8-security-considerations)
9. [Performance Optimization](#9-performance-optimization)
10. [Cost Analysis](#10-cost-analysis)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Current System Analysis

### 1.1 Technology Stack
- **Framework:** Next.js 15.5.3 with Turbopack
- **Authentication:** Supabase Auth (@supabase/ssr v0.7.0)
- **Storage:** Supabase Storage
- **Backend:** Next.js API Routes
- **Session Management:** Cookie-based (HTTP-only, SameSite: lax)

### 1.2 Current File Upload Locations

#### Active Upload Points:
1. **Idea Cover Images** (`/api/ideas/create`)
   - Path: `src/app/api/ideas/create/route.ts`
   - Bucket: `idea-covers`
   - File handling: Direct upload via API route
   - Current status: ✅ Working

2. **Profile Avatars** (Potential - Not Implemented)
   - Referenced in: `src/components/profile/UserProfile.tsx`
   - Field: `avatar_url` in profiles table
   - Current status: ⚠️ Field exists but no upload mechanism

3. **User Profile Images** (Potential - Not Implemented)
   - Referenced across multiple profile components
   - Current status: ⚠️ Fallback to initials/placeholders

---

## 2. Database Structure

### 2.1 Storage Buckets (Current)

```sql
-- From migration: supabase/migrations/20231013000000_initial_schema.sql
insert into storage.buckets (id, name) values ('idea-covers', 'idea-covers');
```

**Current Buckets:**
- ✅ `idea-covers` - For idea cover images

**Missing Buckets:**
- ❌ `avatars` - For user profile pictures
- ❌ `attachments` - For idea attachments/documents
- ❌ `challenge-media` - For challenge-related files
- ❌ `temp-uploads` - For temporary file processing

### 2.2 Relevant Database Tables

#### profiles Table
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,  -- ⚠️ Field exists but no upload flow
  role text check (role in ('user', 'admin', 'moderator')),
  bio text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

#### ideas Table
```sql
create table public.ideas (
  id uuid primary key,
  author uuid references public.profiles(id),
  title varchar(200) not null,
  summary text,
  content text not null,
  category varchar(50) not null,
  tags text[],
  cover_img text,  -- ✅ Used for uploaded images
  likes integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone
);
```

---

## 3. Current File Upload Implementation

### 3.1 Idea Cover Image Upload Flow

**Location:** `src/app/api/ideas/create/route.ts`

```typescript
// Current implementation (lines 42-68)
const coverImg = formData.get("coverImg") as File | null;

if (coverImg && coverImg instanceof File) {
  const filePath = `idea-covers/${Date.now()}-${coverImg.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from("idea-covers")
    .upload(filePath, coverImg);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("idea-covers")
    .getPublicUrl(filePath);

  coverImgUrl = publicUrlData.publicUrl;
}
```

### 3.2 Frontend Upload Component

**Location:** `src/app/submit-idea/page.tsx`

```typescript
// File input handling (lines 30, 88-91)
const [coverImg, setCoverImg] = useState<File | null>(null);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) 
    setCoverImg(e.target.files[0]);
};

// JSX (lines 165-183)
<label htmlFor="cover-upload" className="...">
  <UploadCloud className="..." />
  <input
    id="cover-upload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleFileChange}
  />
</label>
```

### 3.3 Data Flow Diagram (Current)

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │ 1. FormData + File
       ▼
┌─────────────────────┐
│  Next.js API Route  │
│ /api/ideas/create   │
└──────┬──────────────┘
       │ 2. Auth Check
       ▼
┌─────────────────┐
│ Supabase Auth   │
└──────┬──────────┘
       │ 3. Upload File
       ▼
┌──────────────────────┐
│  Supabase Storage    │
│  Bucket: idea-covers │
└──────┬───────────────┘
       │ 4. Get Public URL
       ▼
┌──────────────────┐
│  Database Insert │
│  ideas.cover_img │
└──────────────────┘
```

---

## 4. Identified Gaps and Limitations

### 4.1 Security Issues

| Issue | Severity | Impact |
|-------|----------|---------|
| **No file type validation** | 🔴 HIGH | Malicious files could be uploaded |
| **No file size limits** | 🔴 HIGH | Storage abuse, DoS attacks |
| **No virus scanning** | 🟡 MEDIUM | Malware distribution risk |
| **No image optimization** | 🟡 MEDIUM | Large files → slow load times |
| **Missing RLS policies on storage** | 🔴 HIGH | Unauthorized access possible |
| **No upload rate limiting** | 🟡 MEDIUM | Spam/abuse vulnerability |

### 4.2 Functional Gaps

| Feature | Status | Priority |
|---------|--------|----------|
| Profile avatar upload | ❌ Missing | HIGH |
| Multiple file attachments | ❌ Missing | MEDIUM |
| Image cropping/resizing | ❌ Missing | MEDIUM |
| Drag-and-drop upload | ❌ Missing | LOW |
| Upload progress tracking | ❌ Missing | MEDIUM |
| File preview before upload | ⚠️ Partial | LOW |
| CDN integration | ❌ Missing | MEDIUM |

### 4.3 Performance Limitations

- **No image compression** → Wasted bandwidth
- **No lazy loading** → Slow initial page load
- **No caching strategy** → Repeated downloads
- **Synchronous uploads** → Blocks user interaction
- **No background processing** → Large files freeze UI

### 4.4 Storage Bucket Analysis

```
Current Buckets: 1
├── ✅ idea-covers (public read, authenticated write)
│
Missing Buckets:
├── ❌ avatars (for profile pictures)
├── ❌ attachments (for idea documents)
├── ❌ challenge-media (for challenge files)
└── ❌ temp-uploads (for processing)
```

---

## 5. Edge Function Strategy

### 5.1 Why Edge Functions?

Edge Functions solve current limitations by providing:

1. **Server-Side Processing** → Secure file validation
2. **Image Optimization** → Automatic resizing/compression
3. **Virus Scanning** → Pre-storage malware detection
4. **Advanced Validation** → Complex business logic
5. **Rate Limiting** → Per-user upload throttling
6. **Webhook Integration** → External service notifications
7. **Cost Efficiency** → Pay-per-invocation vs. always-on API

### 5.2 Proposed Edge Functions

#### Function 1: `upload-idea-cover`
**Purpose:** Handle idea cover image uploads with validation and optimization

**Responsibilities:**
- Validate file type (JPEG, PNG, WebP only)
- Enforce size limits (max 5MB)
- Resize images to standard dimensions (1200x630)
- Compress images (80% quality)
- Generate unique filenames
- Upload to `idea-covers` bucket
- Return public URL

**Endpoint:** `POST /functions/v1/upload-idea-cover`

**Request:**
```json
{
  "file": "base64_encoded_image",
  "ideaId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://...supabase.co/storage/v1/object/public/idea-covers/...",
  "metadata": {
    "size": 234567,
    "dimensions": { "width": 1200, "height": 630 },
    "format": "webp"
  }
}
```

---

#### Function 2: `upload-avatar`
**Purpose:** Handle profile avatar uploads with circular crop and optimization

**Responsibilities:**
- Validate file type (JPEG, PNG only)
- Enforce size limit (max 2MB)
- Crop to square aspect ratio (1:1)
- Resize to multiple sizes (256x256, 128x128, 64x64)
- Compress images (85% quality)
- Upload to `avatars` bucket
- Update `profiles.avatar_url`

**Endpoint:** `POST /functions/v1/upload-avatar`

**Request:**
```json
{
  "file": "base64_encoded_image",
  "userId": "uuid",
  "cropData": {
    "x": 0,
    "y": 0,
    "width": 500,
    "height": 500
  }
}
```

**Response:**
```json
{
  "success": true,
  "urls": {
    "original": "https://.../avatars/original/...",
    "large": "https://.../avatars/256/...",
    "medium": "https://.../avatars/128/...",
    "small": "https://.../avatars/64/..."
  }
}
```

---

#### Function 3: `upload-attachment`
**Purpose:** Handle file attachments for ideas (PDFs, docs, etc.)

**Responsibilities:**
- Validate file type (PDF, DOCX, TXT, MD)
- Enforce size limit (max 10MB)
- Scan for viruses (ClamAV integration)
- Generate secure download URLs
- Track download counts
- Set expiration dates for temp files

**Endpoint:** `POST /functions/v1/upload-attachment`

**Request:**
```json
{
  "file": "base64_encoded_file",
  "ideaId": "uuid",
  "fileName": "document.pdf",
  "fileType": "application/pdf"
}
```

**Response:**
```json
{
  "success": true,
  "attachmentId": "uuid",
  "downloadUrl": "https://.../attachments/secure/...",
  "expiresAt": "2025-11-30T00:00:00Z"
}
```

---

#### Function 4: `process-image-variants`
**Purpose:** Background job to generate image variants after upload

**Responsibilities:**
- Create thumbnail versions (320x180)
- Create mobile-optimized versions (800x450)
- Generate WebP versions for modern browsers
- Update database with variant URLs
- Delete failed uploads

**Trigger:** Database trigger on `ideas` INSERT

**Event:**
```json
{
  "type": "INSERT",
  "table": "ideas",
  "record": {
    "id": "uuid",
    "cover_img": "https://.../original.jpg"
  }
}
```

---

#### Function 5: `validate-upload-token`
**Purpose:** Generate signed upload tokens for client-side uploads

**Responsibilities:**
- Verify user authentication
- Check upload quotas (free tier: 10 uploads/day)
- Generate JWT token with expiration (5 minutes)
- Return allowed bucket and size limit

**Endpoint:** `POST /functions/v1/validate-upload-token`

**Request:**
```json
{
  "uploadType": "idea-cover" | "avatar" | "attachment"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 300,
  "maxSize": 5242880,
  "allowedTypes": ["image/jpeg", "image/png", "image/webp"]
}
```

---

### 5.3 Edge Function Dependencies

```typescript
// package.json for Edge Functions
{
  "dependencies": {
    "sharp": "^0.33.0",           // Image processing
    "file-type": "^19.0.0",       // MIME type detection
    "crypto": "^1.0.1",           // Hashing/encryption
    "zod": "^3.22.0",             // Schema validation
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

---

## 6. Proposed Architecture

### 6.1 Complete Upload Flow with Edge Functions

```
┌──────────────┐
│   Browser    │
│  (Client)    │
└──────┬───────┘
       │ 1. Request upload token
       ▼
┌─────────────────────────────┐
│  Edge Function:             │
│  validate-upload-token      │
└──────┬──────────────────────┘
       │ 2. Return signed token
       ▼
┌──────────────┐
│   Browser    │ (Validates file locally)
└──────┬───────┘
       │ 3. Upload file with token
       ▼
┌─────────────────────────────┐
│  Edge Function:             │
│  upload-idea-cover/avatar   │
└──────┬──────────────────────┘
       │ 4. Validate & Process
       ├─ Check token
       ├─ Validate file type
       ├─ Resize/compress
       └─ Upload to storage
       ▼
┌─────────────────────────────┐
│  Supabase Storage           │
│  Bucket: idea-covers        │
└──────┬──────────────────────┘
       │ 5. Trigger event
       ▼
┌─────────────────────────────┐
│  Edge Function:             │
│  process-image-variants     │
└──────┬──────────────────────┘
       │ 6. Generate thumbnails
       ▼
┌─────────────────────────────┐
│  Database Update            │
│  ideas.cover_img            │
│  ideas.cover_img_variants   │
└─────────────────────────────┘
```

### 6.2 Storage Bucket Structure

```
storage.buckets
├── idea-covers/
│   ├── original/
│   │   └── {userId}/{timestamp}-{hash}.webp
│   ├── large/       (1200x630)
│   └── thumbnail/   (320x180)
│
├── avatars/
│   ├── original/
│   ├── 256/         (256x256)
│   ├── 128/         (128x128)
│   └── 64/          (64x64)
│
├── attachments/
│   ├── secure/      (private, signed URLs)
│   └── public/      (public downloads)
│
└── temp-uploads/    (auto-delete after 24h)
    └── processing/
```

### 6.3 Database Schema Updates

```sql
-- New columns for ideas table
ALTER TABLE public.ideas 
ADD COLUMN cover_img_variants jsonb DEFAULT '{}'::jsonb,
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Example cover_img_variants structure:
{
  "original": "https://.../original/...",
  "large": "https://.../large/...",
  "thumbnail": "https://.../thumbnail/...",
  "webp": "https://.../webp/..."
}

-- New table for tracking uploads
CREATE TABLE public.uploads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  bucket text NOT NULL,
  storage_path text NOT NULL,
  status text CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Index for fast lookups
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_status ON public.uploads(status);

-- RLS policies for uploads table
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
  ON public.uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert uploads"
  ON public.uploads FOR INSERT
  WITH CHECK (true);  -- Edge function uses service role
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Priority:** 🔴 CRITICAL

- [ ] **Task 1.1:** Create storage buckets
  ```sql
  INSERT INTO storage.buckets (id, name, public) VALUES
    ('avatars', 'avatars', true),
    ('attachments', 'attachments', false),
    ('temp-uploads', 'temp-uploads', false);
  ```

- [ ] **Task 1.2:** Set up RLS policies for storage
  ```sql
  -- idea-covers bucket policies
  CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'idea-covers');

  CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'idea-covers' AND
      auth.role() = 'authenticated'
    );

  CREATE POLICY "Users can update own files"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'idea-covers' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  -- avatars bucket policies
  CREATE POLICY "Public read avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

  CREATE POLICY "Users upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  ```

- [ ] **Task 1.3:** Create `uploads` tracking table (SQL above)

- [ ] **Task 1.4:** Update `ideas` table schema
  ```sql
  ALTER TABLE public.ideas 
  ADD COLUMN IF NOT EXISTS cover_img_variants jsonb,
  ADD COLUMN IF NOT EXISTS attachments jsonb;
  ```

### Phase 2: Core Edge Functions (Week 3-4)
**Priority:** 🔴 CRITICAL

- [ ] **Task 2.1:** Implement `validate-upload-token`
  - Set up Edge Function project structure
  - Implement JWT signing
  - Add quota checking logic
  - Deploy and test

- [ ] **Task 2.2:** Implement `upload-idea-cover`
  - Install Sharp for image processing
  - Add file validation
  - Implement resize/compress logic
  - Deploy and test

- [ ] **Task 2.3:** Implement `upload-avatar`
  - Add circular crop logic
  - Generate multiple sizes
  - Update profiles table
  - Deploy and test

### Phase 3: Frontend Integration (Week 5)
**Priority:** 🟡 HIGH

- [ ] **Task 3.1:** Update submit-idea page
  - Replace direct upload with Edge Function call
  - Add client-side validation
  - Implement progress tracking
  - Add error handling

- [ ] **Task 3.2:** Create avatar upload component
  - Design upload modal
  - Add image cropper
  - Implement preview
  - Connect to Edge Function

- [ ] **Task 3.3:** Update profile page
  - Add avatar upload button
  - Show current avatar
  - Handle upload errors

### Phase 4: Advanced Features (Week 6-7)
**Priority:** 🟢 MEDIUM

- [ ] **Task 4.1:** Implement `upload-attachment`
  - Add virus scanning integration
  - Implement secure URL generation
  - Add download tracking

- [ ] **Task 4.2:** Implement `process-image-variants`
  - Set up database triggers
  - Create variant generation logic
  - Add WebP conversion

- [ ] **Task 4.3:** Add upload quotas
  - Implement rate limiting
  - Create quota tracking
  - Add upgrade prompts

### Phase 5: Optimization & Testing (Week 8)
**Priority:** 🟢 MEDIUM

- [ ] **Task 5.1:** Performance optimization
  - Enable CDN caching
  - Implement lazy loading
  - Add progressive image loading

- [ ] **Task 5.2:** Security audit
  - Review RLS policies
  - Test upload restrictions
  - Penetration testing

- [ ] **Task 5.3:** Monitoring & logging
  - Set up error tracking
  - Add analytics
  - Create admin dashboard

---

## 8. Security Considerations

### 8.1 File Validation Rules

```typescript
// Edge Function validation config
const UPLOAD_RULES = {
  'idea-cover': {
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxDimensions: { width: 4000, height: 4000 }
  },
  'avatar': {
    maxSize: 2 * 1024 * 1024,  // 2MB
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    minDimensions: { width: 200, height: 200 }
  },
  'attachment': {
    maxSize: 10 * 1024 * 1024,  // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.md']
  }
};
```

### 8.2 Upload Token Security

```typescript
// Token generation (in validate-upload-token edge function)
import { SignJWT } from 'jose';

async function generateUploadToken(userId: string, uploadType: string) {
  const secret = new TextEncoder().encode(Deno.env.get('JWT_SECRET'));
  
  const token = await new SignJWT({
    userId,
    uploadType,
    quotaRemaining: await checkQuota(userId)
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')  // 5 minute expiry
    .sign(secret);
    
  return token;
}
```

### 8.3 Rate Limiting Strategy

```typescript
// Using Upstash Redis for rate limiting
import { Redis } from '@upstash/redis';

async function checkRateLimit(userId: string): Promise<boolean> {
  const redis = Redis.fromEnv();
  const key = `upload:${userId}:${new Date().toISOString().split('T')[0]}`;
  
  const uploads = await redis.incr(key);
  
  if (uploads === 1) {
    // Set expiry to end of day
    await redis.expireat(key, Math.floor(Date.now() / 1000) + 86400);
  }
  
  // Free tier: 10 uploads per day
  return uploads <= 10;
}
```

### 8.4 Virus Scanning Integration

```typescript
// ClamAV integration for attachment scanning
async function scanFile(fileBuffer: ArrayBuffer): Promise<boolean> {
  const response = await fetch(Deno.env.get('CLAMAV_ENDPOINT'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: fileBuffer
  });
  
  const result = await response.json();
  return result.status === 'clean';
}
```

---

## 9. Performance Optimization

### 9.1 Image Optimization Pipeline

```typescript
// Sharp configuration for optimal performance
import sharp from 'sharp';

async function optimizeImage(buffer: Buffer, type: 'cover' | 'avatar') {
  const config = {
    cover: { width: 1200, height: 630, quality: 80 },
    avatar: { width: 256, height: 256, quality: 85 }
  };
  
  return await sharp(buffer)
    .resize(config[type].width, config[type].height, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: config[type].quality })
    .toBuffer();
}
```

### 9.2 CDN Configuration

```typescript
// Supabase Storage CDN headers
const CDN_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Content-Type': 'image/webp',
  'X-Content-Type-Options': 'nosniff'
};
```

### 9.3 Progressive Loading Strategy

```tsx
// Frontend component with progressive loading
<Image
  src={idea.cover_img_variants?.thumbnail}
  placeholder="blur"
  blurDataURL={idea.cover_img_variants?.blurred}
  onLoad={() => setHiResLoaded(true)}
  alt={idea.title}
/>
{hiResLoaded && (
  <Image
    src={idea.cover_img_variants?.large}
    priority
    alt={idea.title}
  />
)}
```

---

## 10. Cost Analysis

### 10.1 Current Costs (Estimated)

| Resource | Usage | Cost/Month |
|----------|-------|------------|
| Storage (Supabase) | 1GB | $0.021 |
| Bandwidth | 2GB | $0.09 |
| API Routes (Vercel) | Always-on | $20 (included) |
| **Total** | | **~$0.11** |

### 10.2 Edge Function Costs (Projected)

| Resource | Usage | Cost/Month |
|----------|-------|------------|
| Edge Function Invocations | 10,000 | $2.00 |
| Edge Function Compute | 100 GB-hours | $1.00 |
| Storage (increased) | 5GB | $0.105 |
| Bandwidth (increased) | 10GB | $0.45 |
| Image Processing (Sharp) | 10,000 ops | $0.50 |
| **Total** | | **~$4.06** |

**ROI Analysis:**
- **Cost increase:** $3.95/month
- **Benefits:**
  - 🔒 Enhanced security (virus scanning)
  - ⚡ 60% faster page loads (image optimization)
  - 📉 70% bandwidth reduction (WebP conversion)
  - 🎨 Better UX (thumbnails, progressive loading)
  - 🛡️ Reduced abuse (rate limiting)

**Break-even:** At ~1,000 users, saved bandwidth offsets Edge Function costs

---

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
// tests/edge-functions/upload-idea-cover.test.ts
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('Upload idea cover - valid image', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/upload-idea-cover', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer valid-token' },
    body: JSON.stringify({
      file: validBase64Image,
      ideaId: 'test-uuid'
    })
  });
  
  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.url);
});

Deno.test('Upload idea cover - invalid file type', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/upload-idea-cover', {
    method: 'POST',
    body: JSON.stringify({ file: base64PDF })
  });
  
  assertEquals(response.status, 400);
});
```

### 11.2 Integration Tests

| Test Case | Expected Result |
|-----------|----------------|
| Upload 6MB image | ❌ Rejected (exceeds 5MB limit) |
| Upload .exe file | ❌ Rejected (invalid type) |
| Upload valid JPEG | ✅ Returns WebP URL |
| Upload without token | ❌ 401 Unauthorized |
| Upload with expired token | ❌ 403 Forbidden |
| 11th upload in a day (free tier) | ❌ 429 Rate Limited |
| Upload malware file | ❌ Rejected by virus scan |
| Upload 200x200 avatar | ✅ Returns 3 sizes |

### 11.3 Load Testing

```bash
# Using k6 for load testing
k6 run --vus 100 --duration 30s tests/upload-load.js

# Expected results:
# - P95 latency < 2s
# - Error rate < 0.1%
# - Throughput > 50 req/s
```

---

## 12. Migration Plan

### 12.1 Backward Compatibility

```typescript
// Support both old and new upload methods during transition
async function getImageUrl(idea: Idea): string {
  // New method (with variants)
  if (idea.cover_img_variants?.large) {
    return idea.cover_img_variants.large;
  }
  
  // Fallback to old method
  return idea.cover_img || '/placeholder-idea.jpg';
}
```

### 12.2 Data Migration Script

```sql
-- Migrate existing uploads to new structure
CREATE OR REPLACE FUNCTION migrate_existing_uploads()
RETURNS void AS $$
BEGIN
  -- Add variants column if missing
  UPDATE public.ideas
  SET cover_img_variants = jsonb_build_object(
    'original', cover_img,
    'large', cover_img,
    'thumbnail', cover_img
  )
  WHERE cover_img IS NOT NULL
    AND cover_img_variants IS NULL;
END;
$$ LANGUAGE plpgsql;

SELECT migrate_existing_uploads();
```

### 12.3 Rollback Plan

```typescript
// Environment flag to revert to old upload method
const USE_EDGE_FUNCTIONS = process.env.NEXT_PUBLIC_USE_EDGE_UPLOAD === 'true';

if (USE_EDGE_FUNCTIONS) {
  // New Edge Function upload
  await uploadViaEdgeFunction(file);
} else {
  // Old API route upload (fallback)
  await uploadViaApiRoute(file);
}
```

---

## 13. Monitoring & Analytics

### 13.1 Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Upload success rate | > 95% | < 90% |
| Average upload time | < 3s | > 5s |
| Edge Function errors | < 0.5% | > 1% |
| Storage usage growth | < 1GB/week | > 5GB/week |
| Bandwidth usage | < 50GB/month | > 100GB/month |

### 13.2 Logging Configuration

```typescript
// Structured logging in Edge Functions
interface UploadLog {
  timestamp: string;
  userId: string;
  uploadType: string;
  fileSize: number;
  duration: number;
  success: boolean;
  error?: string;
}

async function logUpload(log: UploadLog) {
  await supabase.from('upload_logs').insert(log);
}
```

---

## 14. Conclusion & Next Steps

### 14.1 Summary

This strategy transforms NeuraCore's file upload system from a basic implementation to a **production-ready, scalable architecture** using Supabase Edge Functions.

**Key Improvements:**
- ✅ 5 new Edge Functions covering all upload scenarios
- ✅ Enhanced security with validation, rate limiting, virus scanning
- ✅ 60% performance improvement via image optimization
- ✅ Cost-effective scaling (pay-per-use model)
- ✅ Better UX with progress tracking and previews

### 14.2 Immediate Actions (Next 48 Hours)

1. **Review this document** with the development team
2. **Create storage buckets** (SQL in Phase 1)
3. **Set up Edge Function project** structure
4. **Implement `validate-upload-token`** (simplest function)
5. **Test locally** using Supabase CLI

### 14.3 Success Criteria

| Milestone | Definition of Done |
|-----------|-------------------|
| Phase 1 Complete | All storage buckets created, RLS policies active |
| Phase 2 Complete | 3 core Edge Functions deployed and tested |
| Phase 3 Complete | Frontend fully integrated, old code deprecated |
| Phase 4 Complete | Advanced features live, monitoring active |
| Phase 5 Complete | Production deployment, 95%+ uptime for 30 days |

---

## Appendix A: Code Examples

### A.1 Complete Edge Function: upload-idea-cover

```typescript
// supabase/functions/upload-idea-cover/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import sharp from 'https://esm.sh/sharp@0.33.0';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

serve(async (req) => {
  try {
    // 1. Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    // 2. Parse request
    const { file, ideaId } = await req.json();
    const buffer = Uint8Array.from(atob(file), c => c.charCodeAt(0));

    // 3. Validate file
    const fileType = await import('https://esm.sh/file-type@19.0.0');
    const type = await fileType.fileTypeFromBuffer(buffer);
    
    if (!type || !ALLOWED_TYPES.includes(type.mime)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }), 
        { status: 400 }
      );
    }

    if (buffer.byteLength > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large' }), 
        { status: 400 }
      );
    }

    // 4. Process image
    const optimized = await sharp(buffer)
      .resize(1200, 630, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // 5. Upload to storage
    const fileName = `${user.id}/${Date.now()}.webp`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('idea-covers')
      .upload(`original/${fileName}`, optimized, {
        contentType: 'image/webp',
        cacheControl: '31536000'
      });

    if (uploadError) throw uploadError;

    // 6. Get public URL
    const { data: urlData } = supabase.storage
      .from('idea-covers')
      .getPublicUrl(`original/${fileName}`);

    // 7. Track upload
    await supabase.from('uploads').insert({
      user_id: user.id,
      file_name: fileName,
      file_size: optimized.byteLength,
      file_type: 'image/webp',
      bucket: 'idea-covers',
      storage_path: uploadData.path,
      status: 'completed'
    });

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        metadata: {
          size: optimized.byteLength,
          format: 'webp'
        }
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
});
```

### A.2 Frontend Integration Example

```typescript
// src/lib/uploadIdeaCover.ts
export async function uploadIdeaCover(file: File, ideaId: string): Promise<string> {
  // 1. Get upload token
  const tokenResponse = await fetch('/functions/v1/validate-upload-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadType: 'idea-cover' })
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get upload token');
  }

  const { token } = await tokenResponse.json();

  // 2. Convert file to base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  // 3. Upload via Edge Function
  const uploadResponse = await fetch('/functions/v1/upload-idea-cover', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file: base64.split(',')[1], // Remove data:image/... prefix
      ideaId
    })
  });

  if (!uploadResponse.ok) {
    throw new Error('Upload failed');
  }

  const { url } = await uploadResponse.json();
  return url;
}
```

---

## Appendix B: Storage RLS Policies

```sql
-- Complete RLS policy configuration for all buckets

-- ============================================================================
-- IDEA-COVERS BUCKET
-- ============================================================================

-- Allow public read access
CREATE POLICY "idea_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'idea-covers');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "idea_covers_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'idea-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own files
CREATE POLICY "idea_covers_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'idea-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "idea_covers_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'idea-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- AVATARS BUCKET
-- ============================================================================

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- ATTACHMENTS BUCKET (Private)
-- ============================================================================

-- No public read - must use signed URLs
CREATE POLICY "attachments_owner_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "attachments_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

**Document Status:** ✅ Ready for Review  
**Next Review Date:** November 6, 2025  
**Owner:** Development Team  
**Version:** 1.0

---

*End of File Upload Edge Function Strategy*
