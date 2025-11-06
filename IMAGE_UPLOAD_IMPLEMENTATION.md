# Image Upload Implementation Guide

## Overview

This document describes the complete image upload and retrieval system implemented for the NeuraCore Ideas Social Platform using Supabase Storage.

**Storage Bucket:** `Image+posts`  
**Created:** November 6, 2025  
**Access:** Public (images are publicly accessible via URL)

---

## Architecture

### Components

```
src/
├── lib/
│   └── storage/
│       └── image-upload.ts          # Core upload utilities
├── hooks/
│   └── useImageUpload.ts            # React hooks for uploads
├── components/
│   ├── ImageUpload/
│   │   ├── ImageUpload.tsx          # Base upload component
│   │   └── index.ts
│   ├── Avatar/
│   │   ├── Avatar.tsx               # Avatar display component
│   │   ├── AvatarUpload.tsx         # Avatar upload with preview
│   │   └── index.ts
│   └── Idea/
│       └── IdeaCoverUpload.tsx      # Idea cover upload
└── app/
    └── api/
        ├── ideas/
        │   ├── create/route.ts      # ✅ Updated - uses uploadIdeaCover()
        │   └── delete/route.ts      # ✅ Updated - cleans up images
        └── profile/
            └── avatar/route.ts      # ✅ New - avatar upload/delete
```

---

## Storage Structure

All images are stored in the `Image+posts` bucket with organized folder structure:

```
Image+posts/
├── avatars/
│   ├── {userId}/
│   │   └── {timestamp}_{random}_{filename}
│   └── ...
├── idea-covers/
│   └── {timestamp}_{random}_{filename}
└── achievement-icons/
    └── {timestamp}_{random}_{filename}
```

### File Naming Convention

Format: `{timestamp}_{random}_{sanitized-filename}`

Example: `1730897257955_a3f9d2_my-awesome-idea.jpg`

- **timestamp**: Current time in milliseconds
- **random**: 6-character random string
- **sanitized-filename**: Original filename with special chars removed

---

## Core Utilities (`src/lib/storage/image-upload.ts`)

### Validation

```typescript
validateImage(file: File, options?: ImageUploadOptions): string | null
```

Validates image file type and size before upload.

**Supported formats:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

**Default limits:**
- Max size: 10MB (configurable)

### Upload Functions

#### Generic Upload
```typescript
uploadImage(
  file: File,
  options?: ImageUploadOptions
): Promise<ImageUploadResult>
```

**Options:**
- `bucket`: Storage bucket name (default: "Image+posts")
- `folder`: Subfolder in bucket (e.g., "avatars/user123")
- `maxSize`: Maximum file size in MB (default: 10)
- `allowedTypes`: Array of MIME types (default: all images)

**Returns:**
```typescript
{
  url: string;     // Public URL
  path: string;    // Storage path
  bucket: string;  // Bucket name
}
```

#### Specialized Upload Functions

```typescript
// Upload user avatar (5MB limit, avatars/{userId}/)
uploadAvatar(file: File, userId: string): Promise<ImageUploadResult>

// Upload idea cover (10MB limit, idea-covers/)
uploadIdeaCover(file: File): Promise<ImageUploadResult>

// Upload achievement icon (2MB limit, achievement-icons/)
uploadAchievementIcon(file: File): Promise<ImageUploadResult>
```

### Deletion

```typescript
deleteImage(filePath: string, bucket?: string): Promise<void>
```

Removes an image from storage.

**Example:**
```typescript
await deleteImage('idea-covers/1730897257955_a3f9d2_cover.jpg');
```

### URL Utilities

```typescript
extractFilePathFromUrl(
  url: string,
  bucket?: string
): string | null
```

Extracts the storage file path from a public URL.

**Example:**
```typescript
const url = 'https://tzmrxlqenfiqabjrbpvg.supabase.co/storage/v1/object/public/Image+posts/avatars/user123/file.jpg';
const path = extractFilePathFromUrl(url); 
// Returns: 'avatars/user123/file.jpg'
```

---

## React Hooks (`src/hooks/useImageUpload.ts`)

### useImageUpload

Generic hook for any image upload.

```typescript
const {
  upload,
  deleteFile,
  isUploading,
  progress,
  error,
  result,
  reset
} = useImageUpload({
  bucket: 'Image+posts',
  folder: 'custom-folder',
  maxSize: 5,
  onSuccess: (result) => console.log('Uploaded:', result.url),
  onError: (error) => console.error('Error:', error)
});

// Upload
await upload(file);

// Delete
await deleteFile(filePath);
```

### useAvatarUpload

Specialized hook for avatar uploads.

```typescript
const { upload, isUploading, error, result } = useAvatarUpload(userId, {
  onSuccess: (result) => {
    // Update UI with new avatar URL
    setAvatarUrl(result.url);
  }
});
```

### useIdeaCoverUpload

Specialized hook for idea cover uploads.

```typescript
const { upload, isUploading, error } = useIdeaCoverUpload({
  onSuccess: (result) => {
    // Set cover URL in form
    setCoverUrl(result.url);
  }
});
```

---

## React Components

### ImageUpload Component

Base drag-and-drop image upload component.

**Props:**
```typescript
{
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  maxSize?: number;              // MB (default: 10)
  accept?: string;               // MIME types
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;         // Show image preview
  previewClassName?: string;     // Custom preview styles
  className?: string;
}
```

**Usage:**
```tsx
<ImageUpload
  onImageSelect={(file) => setCoverImage(file)}
  onImageRemove={() => setCoverImage(null)}
  currentImageUrl={idea?.cover_img}
  maxSize={10}
  showPreview={true}
  placeholder="Drop your cover image here"
/>
```

### Avatar Component

Display component for user avatars with fallbacks.

**Props:**
```typescript
{
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackText?: string;  // Shows initial letter
  showBorder?: boolean;
}
```

**Sizes:**
- `xs`: 24px (6x6)
- `sm`: 32px (8x8)
- `md`: 40px (10x10) - default
- `lg`: 64px (16x16)
- `xl`: 96px (24x24)

**Usage:**
```tsx
{/* With image */}
<Avatar src={user.avatar_url} alt={user.username} size="lg" />

{/* With fallback initial */}
<Avatar fallbackText={user.username} size="md" />

{/* No image - shows user icon */}
<Avatar size="sm" />
```

### AvatarUpload Component

Complete avatar upload interface with preview and actions.

**Props:**
```typescript
{
  userId: string;
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  fallbackText?: string;
  className?: string;
}
```

**Features:**
- Live avatar preview (XL size)
- Drag-and-drop upload
- Upload button (disabled until file selected)
- Remove avatar button
- Loading states
- Error handling

**Usage:**
```tsx
<AvatarUpload
  userId={user.id}
  currentAvatarUrl={user.avatar_url}
  fallbackText={user.username}
  onUploadSuccess={(url) => {
    // Refresh user data or update local state
    refreshProfile();
  }}
/>
```

### IdeaCoverUpload Component

Specialized component for idea cover images.

**Props:**
```typescript
{
  onCoverSelect: (file: File) => void;
  onCoverRemove?: () => void;
  currentCoverUrl?: string;
  className?: string;
}
```

**Features:**
- Optimized aspect ratio (1200:630)
- Helpful tips for cover images
- 10MB size limit
- Preview with remove option

**Usage:**
```tsx
<IdeaCoverUpload
  onCoverSelect={(file) => setFormData({ ...formData, coverImg: file })}
  onCoverRemove={() => setFormData({ ...formData, coverImg: null })}
  currentCoverUrl={formData.coverImgPreview}
/>
```

---

## API Routes

### Create Idea (`POST /api/ideas/create`)

**Updated Implementation:**

```typescript
import { uploadIdeaCover } from '@/lib/storage/image-upload';

// Extract cover image from FormData
const coverImg = formData.get("coverImg") as File | null;

// Upload if provided
let coverImgUrl: string | null = null;
if (coverImg && coverImg instanceof File) {
  const uploadResult = await uploadIdeaCover(coverImg);
  coverImgUrl = uploadResult.url;
}

// Save to database
await supabase.from("ideas").insert([{
  ...ideaData,
  cover_img: coverImgUrl
}]);
```

**Request:**
```javascript
const formData = new FormData();
formData.append('title', 'My Idea');
formData.append('content', 'Idea content...');
formData.append('coverImg', imageFile); // File object

const response = await fetch('/api/ideas/create', {
  method: 'POST',
  body: formData
});
```

### Delete Idea (`DELETE /api/ideas/delete?id={ideaId}`)

**Updated Implementation:**

Now automatically deletes cover image from storage before removing the idea record.

```typescript
import { deleteImage, extractFilePathFromUrl } from '@/lib/storage/image-upload';

// Get idea with cover_img
const { data: idea } = await supabase
  .from("ideas")
  .select("cover_img, author")
  .eq("id", ideaId)
  .single();

// Delete cover image if exists
if (idea.cover_img) {
  const filePath = extractFilePathFromUrl(idea.cover_img);
  if (filePath) {
    await deleteImage(filePath);
  }
}

// Delete idea record
await supabase.from("ideas").delete().eq("id", ideaId);
```

### Upload Avatar (`POST /api/profile/avatar`)

**New Endpoint**

Uploads or updates user avatar.

**Request:**
```javascript
const formData = new FormData();
formData.append('avatar', avatarFile);

const response = await fetch('/api/profile/avatar', {
  method: 'POST',
  body: formData
});

const { data } = await response.json();
console.log(data.avatar_url); // New avatar URL
```

**Features:**
- Validates user authentication
- Deletes old avatar before uploading new one
- Updates `profiles.avatar_url` in database
- Rolls back on failure (deletes uploaded file)

**Response:**
```json
{
  "message": "Avatar updated successfully",
  "data": {
    "avatar_url": "https://...storage.../avatars/user123/1730897257955_a3f9d2_avatar.jpg",
    "profile": { /* updated profile record */ }
  }
}
```

### Remove Avatar (`DELETE /api/profile/avatar`)

**New Endpoint**

Removes user avatar from storage and database.

**Request:**
```javascript
const response = await fetch('/api/profile/avatar', {
  method: 'DELETE'
});
```

**Features:**
- Deletes avatar file from storage
- Sets `profiles.avatar_url` to `null`
- Graceful error handling

---

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,  -- ✅ Stores avatar image URL
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Ideas Table

```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  cover_img TEXT,  -- ✅ Stores cover image URL
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Achievements Table

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,  -- ✅ Stores achievement icon URL (optional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Storage Policies (RLS)

### Bucket Configuration

```sql
-- Bucket: Image+posts
-- Public: true
-- File size limit: null (unlimited, validated in code)
-- Allowed MIME types: null (validated in code)
```

### Recommended Policies

**Enable authenticated users to upload:**
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Image+posts');
```

**Enable public read access:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Image+posts');
```

**Enable users to delete their own files:**
```sql
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'Image+posts' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
```

**Enable users to delete their idea covers:**
```sql
CREATE POLICY "Users can delete own idea covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'Image+posts'
  AND (storage.foldername(name))[1] = 'idea-covers'
  AND EXISTS (
    SELECT 1 FROM ideas
    WHERE cover_img LIKE '%' || name || '%'
    AND author = auth.uid()
  )
);
```

---

## Integration Examples

### Submit Idea Page

```tsx
'use client';

import { useState } from 'react';
import { IdeaCoverUpload } from '@/components/Idea/IdeaCoverUpload';

export default function SubmitIdeaPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    coverImg: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', formData.category);
    
    if (formData.coverImg) {
      data.append('coverImg', formData.coverImg);
    }

    const response = await fetch('/api/ideas/create', {
      method: 'POST',
      body: data,
    });

    if (response.ok) {
      // Success - redirect to idea page
      const { data: idea } = await response.json();
      router.push(`/idea/${idea.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title, Content, Category inputs */}
      
      <IdeaCoverUpload
        onCoverSelect={(file) => setFormData({ ...formData, coverImg: file })}
        onCoverRemove={() => setFormData({ ...formData, coverImg: null })}
      />

      <button type="submit">Submit Idea</button>
    </form>
  );
}
```

### Profile Settings Page

```tsx
'use client';

import { AvatarUpload } from '@/components/Avatar';
import { useState } from 'react';

export default function ProfileSettings({ user }: { user: User }) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <AvatarUpload
        userId={user.id}
        currentAvatarUrl={avatarUrl}
        fallbackText={user.username}
        onUploadSuccess={(url) => {
          setAvatarUrl(url);
          // Optionally refresh user data
          router.refresh();
        }}
        onUploadError={(error) => {
          console.error('Upload failed:', error);
        }}
      />

      {/* Other profile settings */}
    </div>
  );
}
```

### Display Avatar in Comments

```tsx
import { Avatar } from '@/components/Avatar';

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar
        src={comment.author.avatar_url}
        fallbackText={comment.author.username}
        size="sm"
        showBorder
      />
      <div className="flex-1">
        <p className="font-semibold">{comment.author.username}</p>
        <p className="text-gray-600">{comment.content}</p>
      </div>
    </div>
  );
}
```

### Display Idea Cover

```tsx
import Image from 'next/image';

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {idea.cover_img ? (
        <div className="relative aspect-video w-full">
          <Image
            src={idea.cover_img}
            alt={idea.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-blue-500 to-purple-600" />
      )}
      
      <div className="p-4">
        <h3 className="font-bold text-lg">{idea.title}</h3>
        <p className="text-gray-600">{idea.summary}</p>
      </div>
    </div>
  );
}
```

---

## Error Handling

### Common Errors

**File too large:**
```
Error: File size must be less than 10MB
```

**Invalid file type:**
```
Error: Invalid file type. Please select an image (JPEG, PNG, GIF, or WebP)
```

**Upload failed:**
```
Error: Failed to upload image to storage
```

**Permission denied:**
```
Error: Authentication required
```

### Best Practices

1. **Always validate on client AND server**
   - Client: Immediate feedback
   - Server: Security validation

2. **Handle cleanup on errors**
   ```typescript
   try {
     const result = await uploadImage(file);
     await saveToDatabase(result.url);
   } catch (error) {
     // Clean up uploaded file if database save fails
     if (result?.path) {
       await deleteImage(result.path);
     }
     throw error;
   }
   ```

3. **Delete old images before uploading new ones**
   ```typescript
   if (currentAvatarUrl) {
     const oldPath = extractFilePathFromUrl(currentAvatarUrl);
     await deleteImage(oldPath);
   }
   await uploadNewAvatar(file);
   ```

4. **Use Next.js Image component for optimization**
   ```tsx
   <Image
     src={imageUrl}
     alt="Description"
     fill
     className="object-cover"
     sizes="(max-width: 768px) 100vw, 50vw"
     priority={false} // Only true for above-fold images
   />
   ```

---

## Performance Optimization

### Image Optimization

1. **Use Next.js Image component** (automatic optimization)
2. **Lazy load images** (use `loading="lazy"` or Next.js default)
3. **Blur placeholder** for better UX
   ```tsx
   <Image
     src={url}
     alt="..."
     placeholder="blur"
     blurDataURL="data:image/..." // Generate with plaiceholder
   />
   ```

### Storage Optimization

1. **Delete old images** when uploading new ones
2. **Clean up orphaned files** (idea/comment deletion)
3. **Compress images** before upload (client-side)
   ```typescript
   import imageCompression from 'browser-image-compression';

   const compressedFile = await imageCompression(file, {
     maxSizeMB: 1,
     maxWidthOrHeight: 1920,
   });
   ```

### Caching

Images are cached with `cache-control: max-age=3600` (1 hour).

To bust cache, use versioned URLs:
```typescript
const filePath = `avatars/${userId}/${Date.now()}_${randomString()}_${fileName}`;
```

---

## Security Considerations

### Validation

✅ **File type validation** (client + server)  
✅ **File size limits** (client + server)  
✅ **Authentication required** for uploads  
✅ **User can only delete own files** (RLS policies)

### Content Security

⚠️ **Consider implementing:**
- Image scanning for inappropriate content (AWS Rekognition, Google Vision API)
- Virus scanning for uploads (ClamAV)
- Rate limiting on upload endpoints (10 uploads/hour per user)

### Privacy

- User avatars: Public (needed for display)
- Idea covers: Public (needed for display)
- Achievement icons: Public (needed for display)

**No sensitive data should be uploaded to this bucket.**

---

## Testing Checklist

### Upload Tests

- [ ] Upload avatar (JPEG, PNG, GIF, WebP)
- [ ] Upload idea cover
- [ ] File too large (should fail with error)
- [ ] Invalid file type (should fail with error)
- [ ] Upload without authentication (should fail)
- [ ] Upload duplicate filename (should create unique path)

### Display Tests

- [ ] Avatar displays correctly (all sizes)
- [ ] Avatar fallback shows initial
- [ ] Avatar fallback shows icon when no image/text
- [ ] Idea cover displays in card
- [ ] Idea cover displays on detail page
- [ ] Image optimization working (check Network tab)

### Deletion Tests

- [ ] Remove avatar (storage + database)
- [ ] Delete idea (removes cover image)
- [ ] Delete comment author (doesn't break comments)
- [ ] Verify no orphaned files in storage

### Error Handling Tests

- [ ] Network error during upload
- [ ] Database error after upload (should rollback)
- [ ] Invalid URL format
- [ ] Missing file path in URL

---

## Monitoring & Maintenance

### Storage Metrics

Check Supabase dashboard for:
- Total storage usage
- Number of files
- Bandwidth usage
- Failed uploads

### Cleanup Scripts

**Find orphaned files:**
```typescript
// Get all cover_img URLs from database
const { data: ideas } = await supabase
  .from('ideas')
  .select('cover_img');

// Get all files in idea-covers/
const { data: files } = await supabase.storage
  .from('Image+posts')
  .list('idea-covers');

// Find files not referenced in database
const orphaned = files.filter(file => {
  const fullPath = `idea-covers/${file.name}`;
  return !ideas.some(idea => idea.cover_img?.includes(file.name));
});

// Delete orphaned files
for (const file of orphaned) {
  await deleteImage(`idea-covers/${file.name}`);
}
```

---

## Migration Notes

### From Old System

If migrating from the old "idea-covers" bucket:

1. **Create new bucket** (already done: "Image+posts")
2. **Copy existing files:**
   ```typescript
   const { data: files } = await supabase.storage
     .from('idea-covers')
     .list();

   for (const file of files) {
     // Download from old bucket
     const { data } = await supabase.storage
       .from('idea-covers')
       .download(file.name);

     // Upload to new bucket
     await supabase.storage
       .from('Image+posts')
       .upload(`idea-covers/${file.name}`, data);
   }
   ```
3. **Update database URLs:**
   ```sql
   UPDATE ideas
   SET cover_img = REPLACE(
     cover_img,
     '/idea-covers/',
     '/Image+posts/idea-covers/'
   )
   WHERE cover_img IS NOT NULL;
   ```
4. **Delete old bucket** (after verification)

---

## Future Enhancements

### Planned Features

- [ ] Image cropping/resizing UI
- [ ] Multiple image upload (galleries)
- [ ] Video upload support
- [ ] CDN integration for faster delivery
- [ ] Image moderation (AI-powered)
- [ ] Bulk upload for admins
- [ ] Image analytics (views, downloads)
- [ ] Watermarking option

### Optimization Ideas

- [ ] Client-side image compression before upload
- [ ] Progressive image loading
- [ ] WebP conversion on upload
- [ ] Thumbnail generation (multiple sizes)
- [ ] Lazy loading with intersection observer
- [ ] Image placeholder generation (blurhash)

---

## Support & Troubleshooting

### Common Issues

**Issue: Images not displaying**
- Check if URL is valid (starts with `https://`)
- Verify bucket is public
- Check RLS policies on storage.objects
- Inspect Network tab for 404/403 errors

**Issue: Upload fails silently**
- Check browser console for errors
- Verify authentication token is valid
- Check file size and type
- Inspect Network tab for API errors

**Issue: Old images not deleted**
- Verify `extractFilePathFromUrl()` returns valid path
- Check storage RLS policies for DELETE
- Ensure file path matches exactly (case-sensitive)

### Debug Mode

Enable debug logging:
```typescript
// In image-upload.ts, add:
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Uploading file:', {
    name: file.name,
    size: file.size,
    type: file.type,
    path: filePath,
  });
}
```

---

## Changelog

### v1.0.0 (November 2025)

**Initial Implementation:**
- ✅ Core upload utilities (`image-upload.ts`)
- ✅ React hooks (`useImageUpload.ts`)
- ✅ UI components (ImageUpload, Avatar, AvatarUpload, IdeaCoverUpload)
- ✅ API endpoints (avatar upload/delete)
- ✅ Updated idea creation API
- ✅ Updated idea deletion API (cleanup)
- ✅ Documentation

**Features:**
- Drag-and-drop upload
- Image preview
- File validation (type, size)
- Unique file naming
- Organized folder structure
- Avatar support (5MB limit)
- Idea cover support (10MB limit)
- Achievement icon support (2MB limit)
- Automatic cleanup on deletion
- Error handling & loading states

**Database Schema:**
- `profiles.avatar_url` (TEXT)
- `ideas.cover_img` (TEXT)
- `achievements.icon_url` (TEXT)

**Storage:**
- Bucket: `Image+posts`
- Folders: `avatars/`, `idea-covers/`, `achievement-icons/`
- Access: Public
- Size limit: Validated in code
- MIME types: Validated in code

---

## Contact

For questions or issues with the image upload system:

1. Check this documentation first
2. Review error logs in browser console
3. Check Supabase dashboard for storage errors
4. Review RLS policies if permissions issues
5. Contact development team for assistance

---

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Author:** NeuraCore Development Team
