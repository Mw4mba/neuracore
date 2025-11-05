# Indexes & Performance Analysis
**Document:** 04 of 06  
**Generated:** November 5, 2025  
**Database:** NeuraCore (Supabase PostgreSQL)

---

## Table of Contents
1. [Index Overview](#1-index-overview)
2. [Index Inventory](#2-index-inventory)
3. [Performance Analysis](#3-performance-analysis)
4. [Missing Indexes](#4-missing-indexes)
5. [Redundant Indexes](#5-redundant-indexes)
6. [Optimization Recommendations](#6-optimization-recommendations)

---

## 1. Index Overview

### 1.1 Index Distribution
```
Total Indexes: 54
├── Primary Keys: 24 (44.4%)
├── Unique Constraints: 15 (27.8%)
├── Foreign Key Indexes: 8 (14.8%)
├── Performance Indexes: 2 (3.7%)
└── Storage System Indexes: 5 (9.3%)

By Schema:
├── public: 40 indexes (74%)
└── storage: 14 indexes (26%)

By Type:
├── btree: 47 indexes (87%)
├── btree (DESC): 1 index (2%)
├── btree (text_pattern_ops): 1 index (2%)
└── btree (functional): 5 indexes (9%)
```

### 1.2 Index Size Analysis
```
Total Database: 1.04 MB
Index Overhead: ~40% of database size

Largest Indexed Tables:
├── ideas: 160 kB (4 indexes)
├── idea_likes: 72 kB (4 indexes)
├── comment_likes: 72 kB (4 indexes)
├── storage.objects: 64 kB (7 indexes)
└── comments: 64 kB (3 indexes)
```

---

## 2. Index Inventory

### 2.1 Core Application Tables

#### **profiles (2 indexes)**
```sql
Table Size: 48 kB
Row Count: 18

Index 1: profiles_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (all FK references)

Index 2: profiles_username_key
  Type: btree (UNIQUE)
  Column: username
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (login, profile lookup)
  
Missing Indexes:
  ⚠️ No index on role (for admin queries)
  ⚠️ No index on is_premium (for premium features)
  ⚠️ No composite index on (is_deleted, created_at) if soft deletes added
```

#### **ideas (4 indexes)**
```sql
Table Size: 160 kB
Row Count: 15

Index 1: ideas_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (FK references, direct lookups)

Index 2: idx_ideas_author
  Type: btree
  Column: author
  Size: ~8 kB
  Selectivity: Good (18 users, 15 ideas)
  Usage: ⚡ High (user's ideas query)
  Query: SELECT * FROM ideas WHERE author = ?

Index 3: idx_ideas_category
  Type: btree
  Column: category
  Size: ~8 kB
  Selectivity: Medium (depends on categories)
  Usage: ⚡ High (category browsing)
  Query: SELECT * FROM ideas WHERE category = ?

Index 4: idx_ideas_created_at
  Type: btree DESC
  Column: created_at
  Size: ~8 kB
  Selectivity: Good (time-based)
  Usage: ⚡ High (feed sorting)
  Query: SELECT * FROM ideas ORDER BY created_at DESC

Missing Indexes:
  ⚠️ No full-text search on title/content
  ⚠️ No index on tags (GIN index for array)
  ⚠️ No composite index (category, created_at DESC)
  ⚠️ No composite index (author, created_at DESC)
```

#### **comments (3 indexes)**
```sql
Table Size: 64 kB
Row Count: 7

Index 1: comments_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (FK references)

Index 2: idx_comments_idea_id
  Type: btree
  Column: idea_id
  Size: ~8 kB
  Selectivity: Good (7 comments, 15 ideas)
  Usage: ⚡ High (fetching idea comments)
  Query: SELECT * FROM comments WHERE idea_id = ?

Index 3: idx_comments_author
  Type: btree
  Column: author
  Size: ~8 kB
  Selectivity: Good (7 comments, 18 users)
  Usage: 🔶 Medium (user's comments)
  Query: SELECT * FROM comments WHERE author = ?

Missing Indexes:
  ⚠️ No composite index (idea_id, created_at DESC)
  ⚠️ No index on updated_at (if editing is common)
```

#### **idea_likes (4 indexes)**
```sql
Table Size: 72 kB
Row Count: 16

Index 1: idea_likes_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: 🔶 Medium (rarely queried by id)

Index 2: idea_likes_idea_id_user_id_key
  Type: btree (UNIQUE COMPOSITE)
  Columns: (idea_id, user_id)
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (prevent duplicate likes)
  Query: INSERT ... ON CONFLICT (idea_id, user_id)

Index 3: idx_idea_likes_idea_id
  Type: btree
  Column: idea_id
  Size: ~8 kB
  Selectivity: Good (16 likes, 15 ideas)
  Usage: ⚡ High (counting likes per idea)
  Query: SELECT COUNT(*) FROM idea_likes WHERE idea_id = ?

Index 4: idx_idea_likes_user_id
  Type: btree
  Column: user_id
  Size: ~8 kB
  Selectivity: Good (16 likes, 18 users)
  Usage: 🔶 Medium (user's liked ideas)
  Query: SELECT * FROM idea_likes WHERE user_id = ?

Redundancy Analysis:
  ⚠️ idx_idea_likes_idea_id redundant with composite index
  ⚠️ idx_idea_likes_user_id redundant with composite index
  Note: Composite (idea_id, user_id) can serve both queries
  Keep: If query planner doesn't use composite efficiently
```

#### **comment_likes (4 indexes)** - Same as idea_likes
```sql
Table Size: 72 kB
Row Count: 4

Index 1: comment_likes_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)

Index 2: comment_likes_comment_id_user_id_key
  Type: btree (UNIQUE COMPOSITE)
  Columns: (comment_id, user_id)
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (prevent duplicate likes)

Index 3: idx_comment_likes_comment_id
  Type: btree
  Column: comment_id
  Size: ~8 kB
  Selectivity: Good (4 likes, 7 comments)
  Usage: ⚡ High (counting likes per comment)

Index 4: idx_comment_likes_user_id
  Type: btree
  Column: user_id
  Size: ~8 kB
  Selectivity: Good (4 likes, 18 users)
  Usage: 🔶 Medium (user's liked comments)

Redundancy Analysis:
  ⚠️ Same redundancy as idea_likes
  Consider: Drop single-column indexes if composite works
```

#### **achievements (2 indexes)**
```sql
Table Size: 48 kB
Row Count: 5

Index 1: achievements_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (FK references)

Index 2: achievements_name_key
  Type: btree (UNIQUE)
  Column: name
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: 🔶 Medium (achievement lookup by name)

Missing Indexes:
  🔶 Consider index on points (for leaderboards)
```

#### **user_achievements (3 indexes)**
```sql
Table Size: 56 kB
Row Count: 8

Index 1: user_achievements_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: 🔶 Medium

Index 2: user_achievements_user_id_achievement_id_key
  Type: btree (UNIQUE COMPOSITE)
  Columns: (user_id, achievement_id)
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (prevent duplicate unlocks)

Index 3: idx_user_achievements_user_id
  Type: btree
  Column: user_id
  Size: ~8 kB
  Selectivity: Good (8 unlocks, 18 users)
  Usage: ⚡ High (user's achievements)
  Query: SELECT * FROM user_achievements WHERE user_id = ?

Redundancy Analysis:
  ⚠️ idx_user_achievements_user_id redundant with composite
  Note: Composite (user_id, achievement_id) can serve user queries
```

#### **notifications (2 indexes)**
```sql
Table Size: 48 kB
Row Count: 6

Index 1: notifications_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: 🔶 Medium

Index 2: idx_notifications_user_id
  Type: btree
  Column: user_id
  Size: ~8 kB
  Selectivity: Good (6 notifications, 18 users)
  Usage: ⚡ High (user's notifications)
  Query: SELECT * FROM notifications WHERE user_id = ?

Missing Indexes:
  ⚠️ No index on is_read (for unread count)
  ⚠️ No composite index (user_id, is_read, created_at DESC)
  ⚠️ No index on created_at (for sorting)
```

#### **follows (1 index)**
```sql
Table Size: 8192 bytes
Row Count: 0

Index 1: follows_pkey
  Type: btree (PRIMARY KEY - COMPOSITE)
  Columns: (follower_id, following_id)
  Size: ~8 kB
  Selectivity: Perfect (unique)
  Usage: ⚡ High (when feature launches)

Missing Indexes:
  🔴 No index on following_id alone
  Query: SELECT * FROM follows WHERE following_id = ?
  Impact: Full table scan for "who follows user X"
  
  CREATE INDEX idx_follows_following_id 
    ON follows(following_id);
```

#### **skills (2 indexes)**
```sql
Table Size: 16 kB
Row Count: 0

Index 1: skills_pkey
  Type: btree (PRIMARY KEY)
  Column: id (integer)
  Size: ~8 kB

Index 2: skills_name_key
  Type: btree (UNIQUE)
  Column: name
  Size: ~8 kB

Status: ✅ Adequate for catalog table
```

#### **user_skills (2 indexes)**
```sql
Table Size: 16 kB
Row Count: 0

Index 1: user_skills_pkey
  Type: btree (PRIMARY KEY)
  Column: id (integer)
  Size: ~8 kB

Index 2: user_skills_user_id_skill_id_key
  Type: btree (UNIQUE COMPOSITE)
  Columns: (user_id, skill_id)
  Size: ~8 kB

Missing Indexes:
  ⚠️ No index on user_id alone (for user's skills)
  Query: SELECT * FROM user_skills WHERE user_id = ?
  
  CREATE INDEX idx_user_skills_user_id 
    ON user_skills(user_id);
```

#### **challenges (1 index)**
```sql
Table Size: 16 kB
Row Count: 0

Index 1: challenges_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB

Missing Indexes:
  🔴 No index on is_active (for active challenges)
  🔴 No index on ends_at (for expiring challenges)
  🔴 No composite index (is_active, ends_at)
  
  CREATE INDEX idx_challenges_active 
    ON challenges(is_active, ends_at DESC) 
    WHERE is_active = true;
```

#### **challenge_winners (2 indexes)**
```sql
Table Size: 24 kB
Row Count: 0

Index 1: challenge_winners_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB

Index 2: challenge_winners_challenge_id_user_id_key
  Type: btree (UNIQUE COMPOSITE)
  Columns: (challenge_id, user_id)
  Size: ~8 kB

Missing Indexes:
  ⚠️ No index on position (for leaderboard sorting)
  
  CREATE INDEX idx_challenge_winners_position 
    ON challenge_winners(challenge_id, position);
```

#### **idea_comments (1 index)** - Duplicate table?
```sql
Table Size: 16 kB
Row Count: 0

Index 1: idea_comments_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  Size: ~8 kB

Missing Indexes:
  🔴 No index on idea_id (critical for fetching comments)
  🔴 No index on author
  
  -- If keeping table:
  CREATE INDEX idx_idea_comments_idea_id 
    ON idea_comments(idea_id);
  CREATE INDEX idx_idea_comments_author 
    ON idea_comments(author);
```

### 2.2 Legacy Tables (Empty)

#### **Account (2 indexes)**
```sql
Index 1: Account_pkey (PRIMARY KEY on id)
Index 2: Account_id_key (UNIQUE on id)

Note: UNIQUE index redundant with PRIMARY KEY
Action: Delete table
```

#### **posts (2 indexes)**
```sql
Index 1: posts_pkey (PRIMARY KEY on id)
Index 2: posts_acc_id_key (UNIQUE on acc_id)

Action: Delete table
```

#### **Comments (3 indexes)** - Capital C
```sql
Index 1: Comments_pkey (PRIMARY KEY on id)
Index 2: Comments_post_id_key (UNIQUE on post_id)
Index 3: Comments_acc_id_key (UNIQUE on acc_id)

Action: Delete table
```

### 2.3 Storage System Tables

#### **buckets (2 indexes)**
```sql
Table Size: 24 kB
Row Count: 0

Index 1: buckets_pkey
  Type: btree (PRIMARY KEY)
  Column: id (text)
  Size: ~8 kB

Index 2: bname
  Type: btree (UNIQUE)
  Column: name
  Size: ~8 kB
  Usage: Bucket lookup by name

Status: ✅ System-managed, appropriate
```

#### **objects (7 indexes)** ⚠️ MOST INDEXES
```sql
Table Size: 64 kB
Row Count: 0

Index 1: objects_pkey
  Type: btree (PRIMARY KEY)
  Column: id
  
Index 2: bucketid_objname
  Type: btree (UNIQUE COMPOSITE)
  Columns: (bucket_id, name)
  Usage: Prevent duplicate object names in bucket

Index 3: idx_name_bucket_level_unique
  Type: btree (UNIQUE COMPOSITE)
  Columns: (name, bucket_id, level)
  Usage: Hierarchical storage uniqueness

Index 4: idx_objects_bucket_id_name
  Type: btree (COMPOSITE)
  Columns: (bucket_id, name)
  Usage: ⚠️ Redundant with bucketid_objname?

Index 5: idx_objects_lower_name
  Type: btree (FUNCTIONAL)
  Expression: lower(name)
  Usage: Case-insensitive name search

Index 6: name_prefix_search
  Type: btree text_pattern_ops
  Column: name
  Usage: LIKE 'prefix%' queries

Index 7: objects_bucket_id_level_idx
  Type: btree (UNIQUE COMPOSITE)
  Columns: (bucket_id, level)
  Usage: Hierarchical navigation

Analysis:
  ⚠️ 7 indexes for 0 rows (over-indexed)
  ⚠️ idx_objects_bucket_id_name likely redundant
  ✅ System-managed, don't modify
```

#### **migrations (2 indexes)**
```sql
Index 1: migrations_pkey (PRIMARY KEY on id)
Index 2: migrations_name_key (UNIQUE on name)

Status: ✅ System table, appropriate
```

#### **s3_multipart_uploads (1 index)**
```sql
Index 1: s3_multipart_uploads_pkey (PRIMARY KEY on id)

Status: ✅ System-managed
```

#### **s3_multipart_uploads_parts (1 index)**
```sql
Index 1: s3_multipart_uploads_parts_pkey (PRIMARY KEY on id)

Status: ✅ System-managed
```

#### **prefixes (1 index)**
```sql
Index 1: prefixes_pkey
  Type: btree (PRIMARY KEY - COMPOSITE)
  Columns: (bucket_id, name, level)

Status: ✅ System-managed
```

#### **buckets_analytics (1 index)**
```sql
Index 1: buckets_analytics_pkey (PRIMARY KEY on id)

Status: ✅ System-managed
```

---

## 3. Performance Analysis

### 3.1 Query Pattern Analysis

#### **Common Query: Ideas Feed**
```sql
-- Query: Get recent ideas
SELECT * FROM ideas 
ORDER BY created_at DESC 
LIMIT 20;

Indexes Used:
  ✅ idx_ideas_created_at (DESC)
Performance: ⚡ Excellent (index-only scan)
```

#### **Common Query: Category Feed**
```sql
-- Query: Ideas by category, recent first
SELECT * FROM ideas 
WHERE category = 'technology'
ORDER BY created_at DESC 
LIMIT 20;

Indexes Available:
  🔶 idx_ideas_category (partial)
  🔶 idx_ideas_created_at (partial)
Performance: ⚠️ Two-step: filter then sort
Optimization: CREATE INDEX idx_ideas_category_created 
                ON ideas(category, created_at DESC);
```

#### **Common Query: User's Ideas**
```sql
-- Query: Get user's ideas
SELECT * FROM ideas 
WHERE author = 'user-uuid'
ORDER BY created_at DESC;

Indexes Available:
  🔶 idx_ideas_author (partial)
  🔶 idx_ideas_created_at (partial)
Performance: ⚠️ Two-step: filter then sort
Optimization: CREATE INDEX idx_ideas_author_created 
                ON ideas(author, created_at DESC);
```

#### **Common Query: Idea Comments**
```sql
-- Query: Get idea's comments
SELECT * FROM comments 
WHERE idea_id = 'idea-uuid'
ORDER BY created_at DESC;

Indexes Available:
  ✅ idx_comments_idea_id
  ❌ No index on created_at
Performance: ⚠️ Filter efficient, sort requires scan
Optimization: CREATE INDEX idx_comments_idea_created 
                ON comments(idea_id, created_at DESC);
```

#### **Common Query: Like Count**
```sql
-- Query: Count likes on idea
SELECT COUNT(*) FROM idea_likes 
WHERE idea_id = 'idea-uuid';

Indexes Used:
  ✅ idx_idea_likes_idea_id
Performance: ⚡ Excellent (index-only count)
```

#### **Common Query: User's Notifications**
```sql
-- Query: Get unread notifications
SELECT * FROM notifications 
WHERE user_id = 'user-uuid' 
  AND is_read = false
ORDER BY created_at DESC;

Indexes Available:
  🔶 idx_notifications_user_id (partial)
  ❌ No index on is_read
  ❌ No index on created_at
Performance: 🔴 Poor (filter then scan)
Optimization: CREATE INDEX idx_notifications_unread 
                ON notifications(user_id, is_read, created_at DESC)
                WHERE is_read = false;
```

#### **Common Query: User's Achievements**
```sql
-- Query: Get user's achievements
SELECT ua.*, a.name, a.icon_url 
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = 'user-uuid'
ORDER BY ua.unlocked_at DESC;

Indexes Used:
  ✅ idx_user_achievements_user_id (or composite)
  ✅ achievements_pkey (join)
Performance: ⚡ Good
Optimization: Add ORDER BY index
  CREATE INDEX idx_user_achievements_user_unlocked 
    ON user_achievements(user_id, unlocked_at DESC);
```

### 3.2 Index Usage Statistics (Hypothetical)

Based on query patterns, estimated index usage:

```
High Usage (>1000 queries/day):
  ✅ ideas_pkey
  ✅ idx_ideas_created_at
  ✅ idx_comments_idea_id
  ✅ idx_idea_likes_idea_id
  ✅ profiles_pkey

Medium Usage (100-1000 queries/day):
  🔶 idx_ideas_author
  🔶 idx_ideas_category
  🔶 idx_notifications_user_id
  🔶 profiles_username_key

Low Usage (<100 queries/day):
  🔶 idx_comments_author
  🔶 idx_comment_likes_comment_id
  🔶 achievements_name_key

Rarely Used:
  ⚠️ idea_likes_pkey (only for direct id lookup)
  ⚠️ comment_likes_pkey (only for direct id lookup)
  ⚠️ user_achievements_pkey (only for direct id lookup)
```

### 3.3 Index Bloat Analysis

```
Potentially Bloated:
  ⚠️ storage.objects (7 indexes, 0 rows)
  ⚠️ Legacy tables (indexes on empty tables)

Healthy:
  ✅ ideas (4 indexes, 15 rows, all used)
  ✅ comments (3 indexes, 7 rows, all used)
  ✅ profiles (2 indexes, 18 rows, high usage)
```

---

## 4. Missing Indexes

### 4.1 Critical Missing Indexes

#### **1. ideas: Full-Text Search**
```sql
-- Current: No text search capability
-- Query: Search ideas by title/content

CREATE INDEX idx_ideas_fulltext_search 
  ON ideas 
  USING GIN (to_tsvector('english', title || ' ' || content));

-- Query usage:
SELECT * FROM ideas 
WHERE to_tsvector('english', title || ' ' || content) 
      @@ to_tsquery('english', 'search terms');
```

#### **2. ideas: Tags Array Search**
```sql
-- Current: No index on tags array
-- Query: Find ideas by tag

CREATE INDEX idx_ideas_tags 
  ON ideas 
  USING GIN (tags);

-- Query usage:
SELECT * FROM ideas 
WHERE tags && ARRAY['ai', 'machine-learning'];
```

#### **3. notifications: Unread Composite**
```sql
-- Current: Only user_id indexed
-- Query: Unread notifications query is slow

CREATE INDEX idx_notifications_unread 
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

-- Partial index for efficiency (only unread)
```

#### **4. follows: Reverse Lookup**
```sql
-- Current: Only composite PK (follower_id, following_id)
-- Query: Who follows user X? (slow)

CREATE INDEX idx_follows_following_id 
  ON follows(following_id);

-- Enables: SELECT * FROM follows WHERE following_id = ?
```

#### **5. challenges: Active Challenges**
```sql
-- Current: No index on is_active or dates
-- Query: Get active challenges

CREATE INDEX idx_challenges_active 
  ON challenges(is_active, ends_at DESC)
  WHERE is_active = true;

-- Partial index for active only
```

### 4.2 Important Missing Indexes

#### **6. ideas: Category + Date Composite**
```sql
-- Current: Separate indexes, no composite
-- Query: Category feed with date sorting

CREATE INDEX idx_ideas_category_created 
  ON ideas(category, created_at DESC);
```

#### **7. ideas: Author + Date Composite**
```sql
-- Current: Separate indexes, no composite
-- Query: User's ideas sorted by date

CREATE INDEX idx_ideas_author_created 
  ON ideas(author, created_at DESC);
```

#### **8. comments: Idea + Date Composite**
```sql
-- Current: Only idea_id indexed
-- Query: Idea comments sorted by date

CREATE INDEX idx_comments_idea_created 
  ON comments(idea_id, created_at DESC);
```

#### **9. user_skills: User Lookup**
```sql
-- Current: Only composite unique index
-- Query: Get user's skills

CREATE INDEX idx_user_skills_user_id 
  ON user_skills(user_id);
```

#### **10. idea_comments: Idea Lookup**
```sql
-- Current: No index on idea_id
-- Query: Get idea's comments (if table is used)

CREATE INDEX idx_idea_comments_idea_id 
  ON idea_comments(idea_id);
```

### 4.3 Nice-to-Have Indexes

#### **11. profiles: Role Filter**
```sql
-- Query: Get all admins/moderators

CREATE INDEX idx_profiles_role 
  ON profiles(role)
  WHERE role IN ('admin', 'moderator');
```

#### **12. profiles: Premium Users**
```sql
-- Query: Get premium users

CREATE INDEX idx_profiles_premium 
  ON profiles(is_premium)
  WHERE is_premium = true;
```

#### **13. user_achievements: Date Sorting**
```sql
-- Query: User achievements sorted by unlock date

CREATE INDEX idx_user_achievements_user_unlocked 
  ON user_achievements(user_id, unlocked_at DESC);
```

---

## 5. Redundant Indexes

### 5.1 Identified Redundancies

#### **1. idea_likes: Single-column redundant with composite**
```sql
Composite: idea_likes_idea_id_user_id_key (idea_id, user_id)
Redundant: idx_idea_likes_idea_id (idea_id)
Redundant: idx_idea_likes_user_id (user_id)

Analysis:
  - PostgreSQL can use composite for left-prefix queries
  - idx_idea_likes_idea_id redundant with composite
  - idx_idea_likes_user_id NOT redundant (right-side of composite)

Action:
  DROP INDEX idx_idea_likes_idea_id; -- Safe to drop
  KEEP idx_idea_likes_user_id; -- Not covered by composite
```

#### **2. comment_likes: Same as idea_likes**
```sql
Composite: comment_likes_comment_id_user_id_key (comment_id, user_id)
Redundant: idx_comment_likes_comment_id (comment_id)
Redundant: idx_comment_likes_user_id (user_id)

Action:
  DROP INDEX idx_comment_likes_comment_id; -- Safe to drop
  KEEP idx_comment_likes_user_id; -- Not covered by composite
```

#### **3. user_achievements: User ID redundant**
```sql
Composite: user_achievements_user_id_achievement_id_key (user_id, achievement_id)
Redundant: idx_user_achievements_user_id (user_id)

Analysis:
  - Composite covers user_id queries (left prefix)
  
Action:
  DROP INDEX idx_user_achievements_user_id; -- Safe to drop
```

#### **4. Account: Duplicate unique**
```sql
PRIMARY KEY: Account_pkey (id)
UNIQUE: Account_id_key (id)

Analysis:
  - PRIMARY KEY already enforces uniqueness
  - UNIQUE index redundant

Action:
  DROP TABLE "Account"; -- Delete entire legacy table
```

#### **5. storage.objects: Potential redundancy**
```sql
Index 1: bucketid_objname (bucket_id, name)
Index 2: idx_objects_bucket_id_name (bucket_id, name)

Analysis:
  - Appears to be duplicate
  - Don't modify storage system indexes (Supabase-managed)

Action:
  🔶 Monitor only, don't modify
```

### 5.2 Redundancy Cleanup SQL
```sql
-- Safe to drop (composite covers)
DROP INDEX IF EXISTS idx_idea_likes_idea_id;
DROP INDEX IF EXISTS idx_comment_likes_comment_id;
DROP INDEX IF EXISTS idx_user_achievements_user_id;

-- Keep these (not covered by composite):
-- ✅ idx_idea_likes_user_id (right-side of composite)
-- ✅ idx_comment_likes_user_id (right-side of composite)

-- Total space saved: ~24 kB
```

---

## 6. Optimization Recommendations

### 6.1 Immediate Actions (High Impact)

#### **1. Add Critical Missing Indexes**
```sql
-- Ideas full-text search
CREATE INDEX idx_ideas_fulltext_search 
  ON ideas 
  USING GIN (to_tsvector('english', title || ' ' || content));

-- Ideas tags search
CREATE INDEX idx_ideas_tags 
  ON ideas 
  USING GIN (tags);

-- Notifications unread (partial index)
CREATE INDEX idx_notifications_unread 
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

-- Follows reverse lookup
CREATE INDEX idx_follows_following_id 
  ON follows(following_id);

-- Challenges active (partial index)
CREATE INDEX idx_challenges_active 
  ON challenges(is_active, ends_at DESC)
  WHERE is_active = true;
```

#### **2. Remove Redundant Indexes**
```sql
-- Drop redundant single-column indexes
DROP INDEX idx_idea_likes_idea_id;
DROP INDEX idx_comment_likes_comment_id;
DROP INDEX idx_user_achievements_user_id;
```

#### **3. Add Composite Indexes for Common Queries**
```sql
-- Category feed sorting
CREATE INDEX idx_ideas_category_created 
  ON ideas(category, created_at DESC);

-- User's ideas sorting
CREATE INDEX idx_ideas_author_created 
  ON ideas(author, created_at DESC);

-- Idea comments sorting
CREATE INDEX idx_comments_idea_created 
  ON comments(idea_id, created_at DESC);
```

### 6.2 Short-term Improvements

#### **4. Add Table Partitioning** (For future growth)
```sql
-- When ideas table > 100k rows
-- Partition by created_at (monthly)

CREATE TABLE ideas_partitioned (
  LIKE ideas INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE ideas_2025_11 PARTITION OF ideas_partitioned
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Migrate data
-- Create partitions for each month
```

#### **5. Implement Index Maintenance**
```sql
-- Regular VACUUM and ANALYZE
VACUUM ANALYZE ideas;
VACUUM ANALYZE comments;
VACUUM ANALYZE idea_likes;

-- Reindex if bloat detected
REINDEX TABLE ideas;
```

#### **6. Add Covering Indexes** (Include columns)
```sql
-- Ideas feed with like count (avoid table lookup)
CREATE INDEX idx_ideas_created_with_likes 
  ON ideas(created_at DESC) 
  INCLUDE (title, author, likes, comments_count);

-- Notifications with content (avoid table lookup)
CREATE INDEX idx_notifications_user_unread_content 
  ON notifications(user_id, is_read, created_at DESC)
  INCLUDE (type, content)
  WHERE is_read = false;
```

### 6.3 Long-term Optimizations

#### **7. Implement Materialized Views**
```sql
-- Pre-aggregated like counts
CREATE MATERIALIZED VIEW idea_stats AS
SELECT 
  i.id,
  i.title,
  i.author,
  COUNT(DISTINCT il.id) as like_count,
  COUNT(DISTINCT c.id) as comment_count
FROM ideas i
LEFT JOIN idea_likes il ON i.id = il.idea_id
LEFT JOIN comments c ON i.id = c.idea_id
GROUP BY i.id, i.title, i.author;

CREATE UNIQUE INDEX ON idea_stats(id);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY idea_stats;
```

#### **8. Add Partial Indexes for Specific Queries**
```sql
-- Premium user profiles
CREATE INDEX idx_profiles_premium 
  ON profiles(id, username, avatar_url)
  WHERE is_premium = true;

-- Active ideas (not deleted, if soft deletes added)
CREATE INDEX idx_ideas_active 
  ON ideas(created_at DESC)
  WHERE deleted_at IS NULL;
```

#### **9. Implement Index Usage Monitoring**
```sql
-- Query to find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 6.4 Performance Testing Plan

#### **Before/After Benchmarks**
```sql
-- Test 1: Ideas feed query
EXPLAIN ANALYZE 
SELECT * FROM ideas 
ORDER BY created_at DESC 
LIMIT 20;

-- Test 2: Category feed
EXPLAIN ANALYZE 
SELECT * FROM ideas 
WHERE category = 'technology'
ORDER BY created_at DESC 
LIMIT 20;

-- Test 3: Unread notifications
EXPLAIN ANALYZE 
SELECT * FROM notifications 
WHERE user_id = 'test-uuid' 
  AND is_read = false
ORDER BY created_at DESC;

-- Test 4: Full-text search
EXPLAIN ANALYZE 
SELECT * FROM ideas 
WHERE to_tsvector('english', title || ' ' || content) 
      @@ to_tsquery('english', 'artificial & intelligence');
```

---

## Summary

### Current State
```
Total Indexes: 54
├── Necessary: 39 (72%)
├── Redundant: 3 (5.5%)
├── Missing (Critical): 5 (9%)
└── Missing (Important): 8 (15%)

Index Health:
├── Well-Indexed: ideas, comments, profiles
├── Under-Indexed: notifications, follows, challenges
└── Over-Indexed: storage.objects (system-managed)
```

### Action Plan

**Immediate (Do Now):**
1. ✅ Add full-text search index (ideas)
2. ✅ Add tags GIN index (ideas)
3. ✅ Add unread notifications index
4. ✅ Add follows reverse lookup index
5. ✅ Drop 3 redundant indexes

**Short-term (This Sprint):**
6. Add composite indexes for common queries
7. Add challenges active index
8. Add user_skills user_id index
9. Implement index monitoring

**Long-term (Future):**
10. Materialized views for aggregations
11. Table partitioning for large tables
12. Covering indexes for hot queries
13. Regular maintenance schedule

**Expected Impact:**
- Query performance: 50-300% improvement
- Storage saved: ~24 kB from redundant indexes
- New indexes cost: ~200 kB
- Net impact: Faster queries, minimal space increase

---

**Document Complete** | Next: [Triggers & Automation Analysis](./05_TRIGGERS_AUTOMATION_ANALYSIS.md)
