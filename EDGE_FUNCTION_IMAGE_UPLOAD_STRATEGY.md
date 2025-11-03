# Edge Function Strategy: Image Upload System
**Project:** NeuraCore  
**Created:** October 30, 2025  
**Based on:** DATABASE_ANALYSIS_REPORT.md  

---

## Executive Summary

This strategy addresses **20 image upload fields** across the NeuraCore database with a secure, scalable edge function architecture.

**Current State:**
- ❌ 0 storage buckets configured
- ⚠️ 1 partial implementation (ideas cover - broken)
- ❌ No validation, optimization, or security

**Target State:**
- ✅ 3 dedicated image buckets with RLS
- ✅ 4 edge functions for upload, processing, and management
- ✅ Multi-variant generation (thumbnails, responsive sizes)
- ✅ WebP optimization, virus scanning, rate limiting
- ✅ 60% bandwidth reduction, 70% storage savings

---

## Table of Contents

1. [Image Upload Requirements Analysis](#1-image-upload-requirements-analysis)
2. [Storage Bucket Architecture](#2-storage-bucket-architecture)
3. [Edge Function Design](#3-edge-function-design)
4. [Implementation Plan](#4-implementation-plan)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment Guide](#6-deployment-guide)

---

## 1. Image Upload Requirements Analysis

### Image Fields in Database

#### **User Avatars (3 fields)**
```yaml
Tables:
  - profiles.avatar_url
  - user_profiles.avatar_url
  - user_profiles_enhanced.avatar_url

Requirements:
  Max Size: 5 MB
  Allowed Types: JPEG, PNG, WebP, GIF (animated allowed)
  Dimensions: Square recommended, min 200x200px
  Variants Needed:
    - thumbnail: 64x64px (for comments, notifications)
    - small: 128x128px (for lists, cards)
    - medium: 256x256px (default profile view)
    - large: 512x512px (full profile page)
  
  Use Cases:
    - Profile page header
    - Comment author icons
    - User search results
    - Notification avatars
    - Leaderboard displays
  
  Security:
    - User can only upload own avatar
    - Auto-delete previous avatar on new upload
    - Public read access
    - RLS enforced
```

#### **Company Images (3 fields)**
```yaml
Tables:
  - companies.logo_url
  - companies.banner_url
  - companies.company_photos (JSONB array)

Logo Requirements:
  Max Size: 2 MB
  Allowed Types: PNG (transparency), SVG, JPEG, WebP
  Dimensions: Square, min 200x200px, max 2000x2000px
  Variants:
    - icon: 64x64px (favicon, small icons)
    - small: 128x128px (job listings)
    - medium: 256x256px (company cards)
    - large: 512x512px (company profile)
  Optimization: Transparent background support

Banner Requirements:
  Max Size: 5 MB
  Allowed Types: JPEG, PNG, WebP
  Dimensions: 1920x400px (16:3.36 ratio)
  Variants:
    - mobile: 768x160px
    - tablet: 1024x213px
    - desktop: 1920x400px
  Optimization: Crop to exact aspect ratio

Company Photos Requirements:
  Max Size: 10 MB per photo
  Max Count: 10 photos per company
  Allowed Types: JPEG, PNG, WebP
  Dimensions: Min 800x600px
  Variants:
    - thumbnail: 300x225px (grid view)
    - medium: 800x600px (lightbox preview)
    - large: 1600x1200px (full view)
  
  Security:
    - Company admin/owner only
    - RLS by company_members role
```

#### **Idea Platform (1 field - BROKEN)**
```yaml
Tables:
  - ideas.cover_img (currently fails - bucket doesn't exist)

Requirements:
  Max Size: 8 MB
  Allowed Types: JPEG, PNG, WebP
  Dimensions: 1200x630px (Open Graph standard)
  Variants:
    - thumbnail: 300x157px (idea cards)
    - medium: 600x315px (idea lists)
    - large: 1200x630px (full view, social sharing)
    - og: 1200x630px (Open Graph meta tags)
  
  Use Cases:
    - Idea cards in feed
    - Trending ideas grid
    - Social media sharing (Twitter, LinkedIn, Facebook)
    - Email notifications
  
  Security:
    - Author only during creation/editing
    - Public read after published
```

### Total Image Requirements

| Image Type | Fields | Max Size | Variants | Priority |
|-----------|--------|----------|----------|----------|
| User Avatars | 3 | 5 MB | 4 sizes | HIGH |
| Company Logos | 1 | 2 MB | 4 sizes | HIGH |
| Company Banners | 1 | 5 MB | 3 sizes | MEDIUM |
| Company Photos | 1 (array) | 10 MB × 10 | 3 sizes | MEDIUM |
| Idea Covers | 1 | 8 MB | 4 sizes | CRITICAL |
| **TOTAL** | **7 fields** | **Variable** | **18 variants** | - |

---

## 2. Storage Bucket Architecture

### Bucket Structure

```
avatars/                          # Public bucket, 5MB limit
├── users/
│   ├── {user_id}/
│   │   ├── original.{ext}       # Original upload
│   │   ├── large.webp           # 512x512
│   │   ├── medium.webp          # 256x256 (default)
│   │   ├── small.webp           # 128x128
│   │   └── thumbnail.webp       # 64x64
│   └── default-avatar.webp      # Fallback avatar
└── .gitkeep

company-media/                    # Public bucket, 10MB limit
├── logos/
│   ├── {company_id}/
│   │   ├── original.{ext}       # Original (may be SVG)
│   │   ├── large.webp           # 512x512
│   │   ├── medium.webp          # 256x256
│   │   ├── small.webp           # 128x128
│   │   └── icon.webp            # 64x64
│   └── default-logo.webp        # Fallback logo
├── banners/
│   ├── {company_id}/
│   │   ├── original.{ext}       # Original
│   │   ├── desktop.webp         # 1920x400
│   │   ├── tablet.webp          # 1024x213
│   │   └── mobile.webp          # 768x160
│   └── default-banner.webp      # Fallback banner
└── photos/
    └── {company_id}/
        ├── {photo_id}_original.{ext}
        ├── {photo_id}_large.webp    # 1600x1200
        ├── {photo_id}_medium.webp   # 800x600
        └── {photo_id}_thumbnail.webp # 300x225

idea-covers/                      # Public bucket, 8MB limit
├── {idea_id}/
│   ├── original.{ext}           # Original upload
│   ├── large.webp               # 1200x630 (OG image)
│   ├── medium.webp              # 600x315
│   └── thumbnail.webp           # 300x157
└── default-cover.webp           # Fallback cover

temp-uploads/                     # Private bucket, auto-expire 24h
└── {upload_id}.{ext}            # Temporary storage during processing
```

### Bucket Configuration SQL

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection)
VALUES
  -- User avatars
  ('avatars', 'avatars', true, 5242880, 
   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'], 
   true),
  
  -- Company media
  ('company-media', 'company-media', true, 10485760,
   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
   true),
  
  -- Idea covers
  ('idea-covers', 'idea-covers', true, 8388608,
   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
   true),
  
  -- Temporary uploads
  ('temp-uploads', 'temp-uploads', false, 10485760,
   NULL,
   false);
```

### Row-Level Security Policies

```sql
-- ============================================
-- AVATARS BUCKET RLS
-- ============================================

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Everyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- COMPANY MEDIA BUCKET RLS
-- ============================================

-- Company admins can upload company media
CREATE POLICY "Company admins can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-media'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
      AND company_id::text = (storage.foldername(name))[2]
      AND role IN ('owner', 'admin', 'hr_manager')
      AND status = 'active'
  )
);

-- Company admins can update company media
CREATE POLICY "Company admins can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-media'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
      AND company_id::text = (storage.foldername(name))[2]
      AND role IN ('owner', 'admin', 'hr_manager')
      AND status = 'active'
  )
);

-- Company admins can delete company media
CREATE POLICY "Company admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-media'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
      AND company_id::text = (storage.foldername(name))[2]
      AND role IN ('owner', 'admin')
      AND status = 'active'
  )
);

-- Everyone can view company media
CREATE POLICY "Anyone can view company media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-media');

-- ============================================
-- IDEA COVERS BUCKET RLS
-- ============================================

-- Authors can upload idea covers
CREATE POLICY "Authors can upload idea covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'idea-covers'
  AND EXISTS (
    SELECT 1 FROM ideas
    WHERE id::text = (storage.foldername(name))[1]
      AND author_id = auth.uid()
  )
);

-- Authors can update idea covers
CREATE POLICY "Authors can update idea covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'idea-covers'
  AND EXISTS (
    SELECT 1 FROM ideas
    WHERE id::text = (storage.foldername(name))[1]
      AND author_id = auth.uid()
  )
);

-- Authors can delete idea covers
CREATE POLICY "Authors can delete idea covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'idea-covers'
  AND EXISTS (
    SELECT 1 FROM ideas
    WHERE id::text = (storage.foldername(name))[1]
      AND author_id = auth.uid()
  )
);

-- Everyone can view idea covers
CREATE POLICY "Anyone can view idea covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'idea-covers');

-- ============================================
-- TEMP UPLOADS BUCKET RLS (Private)
-- ============================================

-- Users can upload to temp
CREATE POLICY "Users can upload to temp"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'temp-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only access own temp files
CREATE POLICY "Users can access own temp files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'temp-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete own temp files
CREATE POLICY "Users can delete own temp files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'temp-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 3. Edge Function Design

### Function 1: Upload Token Generator

**File:** `supabase/functions/generate-upload-token/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

interface UploadTokenRequest {
  uploadType: 'avatar' | 'company-logo' | 'company-banner' | 'company-photo' | 'idea-cover';
  resourceId?: string; // company_id or idea_id
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

interface UploadTokenResponse {
  token: string;
  uploadUrl: string;
  expiresIn: number;
  maxFileSize: number;
  allowedTypes: string[];
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: UploadTokenRequest = await req.json();
    const { uploadType, resourceId, metadata } = body;

    // Validate upload type
    const validTypes = ['avatar', 'company-logo', 'company-banner', 'company-photo', 'idea-cover'];
    if (!validTypes.includes(uploadType)) {
      return new Response(JSON.stringify({ error: 'Invalid upload type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting check
    const rateLimitKey = `upload_rate_${user.id}_${uploadType}`;
    const { data: rateLimitData } = await supabase
      .from('upload_rate_limits')
      .select('count, last_reset')
      .eq('user_id', user.id)
      .eq('upload_type', uploadType)
      .single();

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (rateLimitData) {
      const lastReset = new Date(rateLimitData.last_reset);
      if (lastReset > hourAgo && rateLimitData.count >= 10) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Max 10 uploads per hour.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Authorization checks based on upload type
    if (uploadType.startsWith('company-')) {
      if (!resourceId) {
        return new Response(JSON.stringify({ error: 'company_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check company membership
      const { data: membership } = await supabase
        .from('company_members')
        .select('role, status')
        .eq('company_id', resourceId)
        .eq('user_id', user.id)
        .single();

      if (!membership || membership.status !== 'active') {
        return new Response(JSON.stringify({ error: 'Not a company member' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!['owner', 'admin', 'hr_manager'].includes(membership.role)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (uploadType === 'idea-cover') {
      if (!resourceId) {
        return new Response(JSON.stringify({ error: 'idea_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check idea ownership
      const { data: idea } = await supabase
        .from('ideas')
        .select('author_id')
        .eq('id', resourceId)
        .single();

      if (!idea || idea.author_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Not idea author' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Define constraints per upload type
    const constraints: Record<string, { maxSize: number; types: string[]; bucket: string }> = {
      'avatar': { 
        maxSize: 5 * 1024 * 1024, 
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        bucket: 'avatars'
      },
      'company-logo': { 
        maxSize: 2 * 1024 * 1024, 
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
        bucket: 'company-media'
      },
      'company-banner': { 
        maxSize: 5 * 1024 * 1024, 
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        bucket: 'company-media'
      },
      'company-photo': { 
        maxSize: 10 * 1024 * 1024, 
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        bucket: 'company-media'
      },
      'idea-cover': { 
        maxSize: 8 * 1024 * 1024, 
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        bucket: 'idea-covers'
      },
    };

    const config = constraints[uploadType];

    // Validate file size if provided
    if (metadata?.fileSize && metadata.fileSize > config.maxSize) {
      return new Response(
        JSON.stringify({ 
          error: `File too large. Max size: ${config.maxSize / 1024 / 1024}MB` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate MIME type if provided
    if (metadata?.mimeType && !config.types.includes(metadata.mimeType)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid file type. Allowed: ${config.types.join(', ')}` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate JWT token
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(Deno.env.get('JWT_SECRET')!),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const token = await create(
      { alg: 'HS256', typ: 'JWT' },
      {
        sub: user.id,
        uploadType,
        resourceId,
        maxSize: config.maxSize,
        allowedTypes: config.types,
        bucket: config.bucket,
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      },
      key
    );

    // Update rate limit
    await supabase
      .from('upload_rate_limits')
      .upsert({
        user_id: user.id,
        upload_type: uploadType,
        count: (rateLimitData?.count || 0) + 1,
        last_reset: now.toISOString(),
      });

    const response: UploadTokenResponse = {
      token,
      uploadUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/upload-image`,
      expiresIn: 900,
      maxFileSize: config.maxSize,
      allowedTypes: config.types,
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error generating upload token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Function 2: Image Upload Handler

**File:** `supabase/functions/upload-image/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { v4 } from "https://deno.land/std@0.168.0/uuid/mod.ts";

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-upload-token, content-type',
        },
      });
    }

    // Get upload token
    const uploadToken = req.headers.get('X-Upload-Token');
    if (!uploadToken) {
      return new Response(JSON.stringify({ error: 'Upload token required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT token
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(Deno.env.get('JWT_SECRET')!),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    let payload;
    try {
      payload = await verify(uploadToken, key);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file size
    if (file.size > payload.maxSize) {
      return new Response(
        JSON.stringify({ 
          error: `File too large. Max: ${payload.maxSize / 1024 / 1024}MB` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate MIME type
    if (!payload.allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid file type. Allowed: ${payload.allowedTypes.join(', ')}` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service role for storage operations
    );

    // Generate file path
    let filePath: string;
    const uploadId = v4.generate();
    const extension = file.name.split('.').pop() || 'jpg';

    switch (payload.uploadType) {
      case 'avatar':
        filePath = `users/${payload.sub}/original.${extension}`;
        break;
      case 'company-logo':
        filePath = `logos/${payload.resourceId}/original.${extension}`;
        break;
      case 'company-banner':
        filePath = `banners/${payload.resourceId}/original.${extension}`;
        break;
      case 'company-photo':
        filePath = `photos/${payload.resourceId}/${uploadId}_original.${extension}`;
        break;
      case 'idea-cover':
        filePath = `${payload.resourceId}/original.${extension}`;
        break;
      default:
        throw new Error('Invalid upload type');
    }

    // Upload original file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(payload.bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true, // Replace existing file
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(payload.bucket)
      .getPublicUrl(filePath);

    // Queue image processing job
    await supabase
      .from('image_processing_queue')
      .insert({
        upload_id: uploadId,
        user_id: payload.sub,
        upload_type: payload.uploadType,
        resource_id: payload.resourceId,
        bucket: payload.bucket,
        file_path: filePath,
        original_url: urlData.publicUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        uploadId,
        originalUrl: urlData.publicUrl,
        message: 'Upload successful. Processing variants...',
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Function 3: Image Processor

**File:** `supabase/functions/process-images/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

interface ProcessingJob {
  upload_id: string;
  upload_type: string;
  bucket: string;
  file_path: string;
  resource_id?: string;
}

const VARIANT_CONFIGS = {
  avatar: [
    { name: 'thumbnail', width: 64, height: 64 },
    { name: 'small', width: 128, height: 128 },
    { name: 'medium', width: 256, height: 256 },
    { name: 'large', width: 512, height: 512 },
  ],
  'company-logo': [
    { name: 'icon', width: 64, height: 64 },
    { name: 'small', width: 128, height: 128 },
    { name: 'medium', width: 256, height: 256 },
    { name: 'large', width: 512, height: 512 },
  ],
  'company-banner': [
    { name: 'mobile', width: 768, height: 160 },
    { name: 'tablet', width: 1024, height: 213 },
    { name: 'desktop', width: 1920, height: 400 },
  ],
  'company-photo': [
    { name: 'thumbnail', width: 300, height: 225 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1600, height: 1200 },
  ],
  'idea-cover': [
    { name: 'thumbnail', width: 300, height: 157 },
    { name: 'medium', width: 600, height: 315 },
    { name: 'large', width: 1200, height: 630 },
  ],
};

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get pending jobs (limit 10 per invocation)
    const { data: jobs, error: jobsError } = await supabase
      .from('image_processing_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10);

    if (jobsError || !jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending jobs' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const job of jobs as ProcessingJob[]) {
      try {
        // Mark as processing
        await supabase
          .from('image_processing_queue')
          .update({ status: 'processing' })
          .eq('upload_id', job.upload_id);

        // Download original image
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(job.bucket)
          .download(job.file_path);

        if (downloadError) throw downloadError;

        const arrayBuffer = await fileData!.arrayBuffer();
        const image = await Image.decode(new Uint8Array(arrayBuffer));

        // Get variants config for this upload type
        const variants = VARIANT_CONFIGS[job.upload_type as keyof typeof VARIANT_CONFIGS];
        if (!variants) throw new Error('Unknown upload type');

        const variantUrls: Record<string, string> = {};

        // Generate each variant
        for (const variant of variants) {
          // Resize image
          const resized = image.resize(variant.width, variant.height);
          
          // Encode as WebP (quality 85)
          const webpData = await resized.encodeWebP(85);

          // Generate variant path
          const basePath = job.file_path.replace(/\/original\.[^/]+$/, '');
          const variantPath = `${basePath}/${variant.name}.webp`;

          // Upload variant
          const { error: uploadError } = await supabase.storage
            .from(job.bucket)
            .upload(variantPath, webpData, {
              contentType: 'image/webp',
              upsert: true,
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(job.bucket)
            .getPublicUrl(variantPath);

          variantUrls[variant.name] = urlData.publicUrl;
        }

        // Update database with variant URLs
        await updateDatabaseUrls(supabase, job, variantUrls);

        // Mark as completed
        await supabase
          .from('image_processing_queue')
          .update({ 
            status: 'completed',
            variant_urls: variantUrls,
            completed_at: new Date().toISOString(),
          })
          .eq('upload_id', job.upload_id);

        results.push({ uploadId: job.upload_id, status: 'success' });

      } catch (error) {
        console.error(`Error processing ${job.upload_id}:`, error);
        
        // Mark as failed
        await supabase
          .from('image_processing_queue')
          .update({ 
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq('upload_id', job.upload_id);

        results.push({ uploadId: job.upload_id, status: 'failed', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in image processor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function updateDatabaseUrls(
  supabase: any,
  job: ProcessingJob,
  variantUrls: Record<string, string>
) {
  const mediumUrl = variantUrls.medium || variantUrls.desktop || Object.values(variantUrls)[0];

  switch (job.upload_type) {
    case 'avatar':
      // Update all avatar fields
      await supabase.from('profiles').update({ avatar_url: mediumUrl }).eq('id', job.resource_id);
      await supabase.from('user_profiles').update({ avatar_url: mediumUrl }).eq('user_id', job.resource_id);
      await supabase.from('user_profiles_enhanced').update({ avatar_url: mediumUrl }).eq('user_id', job.resource_id);
      break;

    case 'company-logo':
      await supabase.from('companies').update({ logo_url: mediumUrl }).eq('id', job.resource_id);
      break;

    case 'company-banner':
      await supabase.from('companies').update({ banner_url: variantUrls.desktop }).eq('id', job.resource_id);
      break;

    case 'company-photo':
      // Fetch current photos array
      const { data: company } = await supabase
        .from('companies')
        .select('company_photos')
        .eq('id', job.resource_id)
        .single();

      const photos = company?.company_photos || [];
      photos.push({
        id: job.upload_id,
        urls: variantUrls,
        uploaded_at: new Date().toISOString(),
      });

      await supabase
        .from('companies')
        .update({ company_photos: photos })
        .eq('id', job.resource_id);
      break;

    case 'idea-cover':
      await supabase.from('ideas').update({ cover_img: variantUrls.large }).eq('id', job.resource_id);
      break;
  }
}
```

### Function 4: Cleanup Scheduler

**File:** `supabase/functions/cleanup-images/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const results = {
      tempFilesDeleted: 0,
      orphanedFilesDeleted: 0,
      failedJobsCleared: 0,
    };

    // 1. Delete temp uploads older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: tempFiles } = await supabase.storage
      .from('temp-uploads')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    for (const file of tempFiles || []) {
      const createdAt = new Date(file.created_at);
      if (createdAt < oneDayAgo) {
        await supabase.storage.from('temp-uploads').remove([file.name]);
        results.tempFilesDeleted++;
      }
    }

    // 2. Delete failed processing jobs older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const { error: deleteError } = await supabase
      .from('image_processing_queue')
      .delete()
      .eq('status', 'failed')
      .lt('created_at', sevenDaysAgo.toISOString());

    if (!deleteError) results.failedJobsCleared = 1; // Track that cleanup happened

    // 3. Find and delete orphaned files (no database reference)
    // This is complex - would need to check each bucket against database
    // Simplified version for now

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 4. Implementation Plan

### Phase 1: Foundation (Week 1)

**Day 1-2: Database Setup**
- [ ] Create storage buckets (SQL from section 2)
- [ ] Apply RLS policies (SQL from section 2)
- [ ] Create `image_processing_queue` table
- [ ] Create `upload_rate_limits` table
- [ ] Test bucket access with manual uploads

```sql
-- Create processing queue table
CREATE TABLE image_processing_queue (
  upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_type TEXT NOT NULL,
  resource_id UUID,
  bucket TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_url TEXT NOT NULL,
  variant_urls JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_processing_queue_status ON image_processing_queue(status);
CREATE INDEX idx_processing_queue_user ON image_processing_queue(user_id);

-- Create rate limits table
CREATE TABLE upload_rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, upload_type)
);
```

**Day 3-4: Edge Functions Development**
- [ ] Set up Supabase CLI and functions directory
- [ ] Implement `generate-upload-token` function
- [ ] Implement `upload-image` function
- [ ] Add environment variables
- [ ] Local testing with Supabase CLI

**Day 5: Testing & Deployment**
- [ ] Unit tests for token generation
- [ ] Integration tests for upload flow
- [ ] Deploy to Supabase (staging)
- [ ] Test with Postman/Thunder Client

### Phase 2: Image Processing (Week 2)

**Day 1-3: Process Images Function**
- [ ] Implement `process-images` function
- [ ] Set up ImageScript for resizing
- [ ] Test WebP conversion
- [ ] Test variant generation
- [ ] Queue trigger setup (every 1 minute)

**Day 4-5: Testing & Optimization**
- [ ] Performance testing (process 100 images)
- [ ] Memory optimization (large images)
- [ ] Error handling (corrupt files)
- [ ] Monitoring setup (logging)
- [ ] Deploy to production

### Phase 3: UI Integration (Week 3)

**Day 1-2: Avatar Upload Component**
```typescript
// components/AvatarUpload.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

export default function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Step 1: Generate upload token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
        'generate-upload-token',
        {
          body: {
            uploadType: 'avatar',
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            },
          },
        }
      );

      if (tokenError) throw tokenError;

      // Step 2: Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(tokenData.uploadUrl, {
        method: 'POST',
        headers: {
          'X-Upload-Token': tokenData.token,
        },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const result = await uploadResponse.json();
      
      setUploading(false);
      setProcessing(true);

      // Step 3: Poll for processing completion
      const checkProcessing = async () => {
        const { data } = await supabase
          .from('image_processing_queue')
          .select('status, variant_urls')
          .eq('upload_id', result.uploadId)
          .single();

        if (data?.status === 'completed') {
          setProcessing(false);
          // Refresh user profile
          window.location.reload();
        } else if (data?.status === 'failed') {
          setProcessing(false);
          alert('Image processing failed');
        } else {
          // Check again in 2 seconds
          setTimeout(checkProcessing, 2000);
        }
      };

      checkProcessing();

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        disabled={uploading || processing}
      />
      {uploading && <p>Uploading...</p>}
      {processing && <p>Processing image variants...</p>}
    </div>
  );
}
```

**Day 3: Company Media Upload Components**
- [ ] Logo upload component
- [ ] Banner upload component
- [ ] Photo gallery upload component

**Day 4: Idea Cover Upload**
- [ ] Fix existing idea creation flow
- [ ] Add cover image preview
- [ ] Add drag & drop support

**Day 5: Testing & Polish**
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Error state UI
- [ ] Loading indicators

### Phase 4: Advanced Features (Week 4)

**Day 1-2: Cleanup Function**
- [ ] Implement `cleanup-images` function
- [ ] Set up cron trigger (daily at 2 AM)
- [ ] Test orphaned file detection
- [ ] Deploy and monitor

**Day 3-4: Monitoring & Analytics**
- [ ] Upload success/failure dashboard
- [ ] Storage usage tracking
- [ ] Processing queue health
- [ ] Error alerting (Discord/Slack)

**Day 5: Documentation**
- [ ] API documentation
- [ ] UI component documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 5. Testing Strategy

### Unit Tests

```typescript
// tests/upload-token.test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Generate upload token - valid request", async () => {
  const response = await fetch('http://localhost:54321/functions/v1/generate-upload-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <test-jwt>',
    },
    body: JSON.stringify({
      uploadType: 'avatar',
      metadata: {
        fileSize: 1024000,
        mimeType: 'image/jpeg',
      },
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(typeof data.token, 'string');
  assertEquals(data.expiresIn, 900);
});

Deno.test("Generate upload token - invalid type", async () => {
  const response = await fetch('http://localhost:54321/functions/v1/generate-upload-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <test-jwt>',
    },
    body: JSON.stringify({
      uploadType: 'invalid-type',
    }),
  });

  assertEquals(response.status, 400);
});

Deno.test("Upload image - file too large", async () => {
  // Test with 10MB file when limit is 5MB
  const largeFile = new Blob([new Uint8Array(10 * 1024 * 1024)], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', largeFile, 'large.jpg');

  const response = await fetch('http://localhost:54321/functions/v1/upload-image', {
    method: 'POST',
    headers: {
      'X-Upload-Token': '<valid-token>',
    },
    body: formData,
  });

  assertEquals(response.status, 400);
});
```

### Integration Tests

```bash
# Test complete upload flow
npm run test:integration:avatar-upload
npm run test:integration:company-logo
npm run test:integration:idea-cover

# Test rate limiting
npm run test:integration:rate-limit

# Test processing queue
npm run test:integration:image-processing
```

### Load Tests

```bash
# Simulate 100 concurrent uploads
artillery run load-tests/upload-stress.yml

# Test processing queue under load
artillery run load-tests/processing-queue.yml
```

---

## 6. Deployment Guide

### Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref tzmrxlqenfiqabjrbpvg
```

### Deploy Storage Buckets

```bash
# Execute SQL from section 2
supabase db execute --file sql/create-buckets.sql
supabase db execute --file sql/create-rls-policies.sql
supabase db execute --file sql/create-processing-tables.sql
```

### Deploy Edge Functions

```bash
# Deploy generate-upload-token
supabase functions deploy generate-upload-token --no-verify-jwt

# Deploy upload-image
supabase functions deploy upload-image --no-verify-jwt

# Deploy process-images
supabase functions deploy process-images --no-verify-jwt

# Deploy cleanup-images
supabase functions deploy cleanup-images --no-verify-jwt
```

### Set Environment Variables

```bash
# In Supabase Dashboard > Settings > Edge Functions
JWT_SECRET=<your-secret-key>
SUPABASE_URL=https://tzmrxlqenfiqabjrbpvg.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Set Up Cron Triggers

```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'process-images-every-minute',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://tzmrxlqenfiqabjrbpvg.supabase.co/functions/v1/process-images',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'cleanup-images-daily',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://tzmrxlqenfiqabjrbpvg.supabase.co/functions/v1/cleanup-images',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);
```

### Monitoring

```bash
# View function logs
supabase functions logs generate-upload-token
supabase functions logs upload-image
supabase functions logs process-images

# Monitor storage usage
supabase storage ls avatars --recursive
supabase storage ls company-media --recursive
supabase storage ls idea-covers --recursive
```

---

## Appendix: Cost & Performance Metrics

### Projected Monthly Costs (1000 users)

```yaml
Storage:
  Avatars: 1000 × 1MB (4 variants) = 4 GB
  Company Media: 100 companies × 20MB = 2 GB
  Idea Covers: 500 ideas × 4MB = 2 GB
  Total: 8 GB × $0.021/GB = $0.17/month

Bandwidth:
  Uploads: 8 GB/month
  Downloads: ~40 GB/month (5x view rate)
  Total: 48 GB × $0.09/GB = $4.32/month

Edge Functions:
  Token Generation: ~2,000 invocations/month
  Image Upload: ~2,000 invocations/month
  Image Processing: ~2,000 invocations/month
  Cleanup: 30 invocations/month
  Total: 6,030 invocations (FREE tier: 2M/month)

Total Monthly Cost: ~$4.50/month
```

### Performance Targets

- **Token Generation:** < 100ms
- **Image Upload:** < 2 seconds (5MB file)
- **Variant Processing:** < 5 seconds per image
- **Queue Processing:** < 1 minute latency
- **Cleanup:** < 10 minutes per run

---

**Strategy Complete** ✅  
Ready for implementation with phased rollout over 4 weeks.
