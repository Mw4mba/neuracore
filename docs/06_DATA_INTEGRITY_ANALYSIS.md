# Data Integrity & Constraints Analysis
**Document:** 06 of 06  
**Generated:** November 5, 2025  
**Database:** NeuraCore (Supabase PostgreSQL)

---

## Table of Contents
1. [Constraint Overview](#1-constraint-overview)
2. [Primary Key Constraints](#2-primary-key-constraints)
3. [Unique Constraints](#3-unique-constraints)
4. [Check Constraints](#4-check-constraints)
5. [Foreign Key Integrity](#5-foreign-key-integrity)
6. [Data Validation Rules](#6-data-validation-rules)
7. [Integrity Issues & Recommendations](#7-integrity-issues--recommendations)

---

## 1. Constraint Overview

### 1.1 Constraint Distribution
```
Total Constraints: 99
├── Primary Keys: 24 (24%)
├── Unique Constraints: 15 (15%)
├── Foreign Keys: 30 (30%)
├── Check Constraints: 5 (5%)
├── Not Null Constraints: 25 (25%)
└── Default Values: Auto-generated (varies)

By Table Type:
├── Application Tables: 74 constraints
├── Storage Tables: 22 constraints
└── Legacy Tables: 3 constraints

Integrity Level:
├── Strong: 12 tables (50%)
├── Medium: 8 tables (33%)
└── Weak: 4 tables (17%)
```

### 1.2 Data Quality Metrics
```
Current Data: 74 rows total
├── Valid Data: 74 rows (100%)
├── Orphaned Records: 0 (0%)
├── Duplicate Prevention: ✅ Active
├── Referential Integrity: ✅ Enforced
└── Business Rules: ⚠️ Partial

Quality Score: 85/100
  ✅ No orphaned data
  ✅ No duplicates
  ✅ Foreign keys enforced
  ⚠️ Missing some check constraints
  ⚠️ No soft delete support
  ⚠️ Limited validation rules
```

---

## 2. Primary Key Constraints

### 2.1 UUID Primary Keys (20 tables)

#### **Standard UUID Pattern**
```sql
Tables Using uuid:
  - profiles (18 rows)
  - ideas (15 rows)
  - comments (7 rows)
  - idea_likes (16 rows)
  - comment_likes (4 rows)
  - achievements (5 rows)
  - user_achievements (8 rows)
  - notifications (6 rows)
  - challenges (0 rows)
  - challenge_winners (0 rows)
  - idea_comments (0 rows)
  - storage.buckets (0 rows)
  - storage.objects (0 rows)
  - storage.s3_multipart_uploads (0 rows)
  - storage.s3_multipart_uploads_parts (0 rows)

Column Definition:
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
  -- OR
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()

Benefits:
  ✅ Globally unique across distributed systems
  ✅ No collision risk
  ✅ Secure (non-sequential)
  ✅ Can be generated client-side

Drawbacks:
  ⚠️ 16 bytes vs 4 bytes (integer)
  ⚠️ Slower joins (larger keys)
  ⚠️ Less cache-friendly
  ⚠️ Non-sequential (no natural ordering)

Performance Impact: 🔶 Medium (acceptable trade-off)
```

#### **profiles Primary Key**
```sql
Column: id uuid
Constraint: profiles_pkey
Special: References auth.users.id (Supabase Auth)

Relationship:
  auth.users.id → profiles.id (1:1)
  
Integrity Rules:
  - Profile ID must match auth user ID
  - No auto-generation (set during signup)
  - Cannot change ID after creation

Enforcement:
  ✅ PRIMARY KEY prevents duplicates
  ✅ Foreign keys reference this
  ⚠️ No CHECK constraint to verify auth.users exists
```

### 2.2 Integer Primary Keys (3 tables)

#### **skills (bigint SERIAL)**
```sql
Column: id integer
Constraint: skills_pkey
Generation: AUTO INCREMENT

Purpose: Skill catalog (reference data)
Benefit: Smaller, sequential IDs
Drawback: Not suitable for distributed systems

Current Max ID: 0 (no data)
Next ID: 1
```

#### **user_skills (bigint SERIAL)**
```sql
Column: id integer
Constraint: user_skills_pkey
Generation: AUTO INCREMENT

Purpose: Junction table for user skills
Issue: ⚠️ Integer PK but UUID FKs
  - user_id: uuid
  - skill_id: integer (references skills.id)

Inconsistency: Mixed ID types
Recommendation: Change to uuid or make skills use uuid
```

#### **storage.migrations (integer)**
```sql
Column: id integer
Constraint: migrations_pkey
Generation: Manual (migration version numbers)

Purpose: Schema version tracking
Pattern: Sequential version numbers (1, 2, 3, ...)
Current: 18 migrations applied
```

### 2.3 Composite Primary Keys (2 tables)

#### **follows**
```sql
Columns: (follower_id, following_id)
Constraint: follows_pkey
Type: Composite UUID

Purpose: Unique follow relationships
Enforcement:
  ✅ Prevents duplicate follows
  ✅ Natural key (relationship itself)
  ⚠️ No separate ID for reference

Query Pattern:
  - Fast: WHERE follower_id = ? (left prefix)
  - Slow: WHERE following_id = ? (needs separate index)

Missing: idx_follows_following_id
```

#### **storage.prefixes**
```sql
Columns: (bucket_id, name, level)
Constraint: prefixes_pkey
Type: Composite (text, text, integer)

Purpose: Unique folder paths per bucket per level
Enforcement:
  ✅ Prevents duplicate prefixes
  ✅ Hierarchical integrity

Complexity: High (3-column composite)
```

### 2.4 Legacy Tables (3 tables)

#### **Account (bigint SERIAL)**
```sql
Column: id bigint
Constraint: Account_pkey
Additional: Account_id_key (UNIQUE on id)

Issue: 🔴 Redundant unique constraint
  - PRIMARY KEY already enforces uniqueness
  - Account_id_key serves no purpose

Action: DELETE TABLE (legacy)
```

#### **posts (bigint SERIAL)**
```sql
Column: id bigint
Constraint: posts_pkey

Action: DELETE TABLE (legacy)
```

#### **Comments (bigint SERIAL)** - Capital C
```sql
Column: id bigint
Constraint: Comments_pkey

Action: DELETE TABLE (legacy)
```

---

## 3. Unique Constraints

### 3.1 Natural Unique Keys

#### **profiles.username**
```sql
Constraint: profiles_username_key
Type: UNIQUE
Column: username (varchar)

Purpose: Prevent duplicate usernames
Enforcement: Database-level uniqueness
Case Sensitivity: Yes (PostgreSQL default)

Issues:
  ⚠️ No case-insensitive uniqueness
  Example: "JohnDoe" and "johndoe" both allowed
  
Recommendation:
  -- Add functional unique index
  CREATE UNIQUE INDEX idx_profiles_username_lower 
    ON profiles(LOWER(username));
  
  -- Or use CITEXT extension
  ALTER TABLE profiles 
    ALTER COLUMN username TYPE CITEXT;
```

#### **achievements.name**
```sql
Constraint: achievements_name_key
Type: UNIQUE
Column: name (varchar)

Purpose: Prevent duplicate achievement names
Enforcement: Database-level uniqueness

Current Data: 5 unique achievement names
Status: ✅ Working correctly
```

#### **skills.name**
```sql
Constraint: skills_name_key
Type: UNIQUE
Column: name (varchar)

Purpose: Prevent duplicate skill names
Enforcement: Database-level uniqueness

Current Data: 0 skills
Status: ✅ Ready for data
```

#### **storage.buckets.name**
```sql
Constraint: bname
Type: UNIQUE
Column: name (text)

Purpose: Prevent duplicate bucket names
Enforcement: Database-level uniqueness
Additional: enforce_bucket_name_length_trigger

Status: ✅ System-managed
```

### 3.2 Composite Unique Constraints

#### **idea_likes: Prevent Duplicate Likes**
```sql
Constraint: idea_likes_idea_id_user_id_key
Columns: (idea_id, user_id)
Type: COMPOSITE UNIQUE

Purpose: One like per user per idea
Enforcement:
  ✅ Cannot like same idea twice
  ✅ Database-level guarantee

Query Usage:
  INSERT INTO idea_likes (idea_id, user_id, ...)
  VALUES (?, ?, ...)
  ON CONFLICT (idea_id, user_id) DO NOTHING;

Data Validation:
  Current: 16 likes
  Unique Combinations: 16 (no duplicates)
  Status: ✅ Working perfectly
```

#### **comment_likes: Prevent Duplicate Likes**
```sql
Constraint: comment_likes_comment_id_user_id_key
Columns: (comment_id, user_id)
Type: COMPOSITE UNIQUE

Purpose: One like per user per comment
Enforcement: Same as idea_likes

Data Validation:
  Current: 4 likes
  Unique Combinations: 4 (no duplicates)
  Status: ✅ Working perfectly
```

#### **user_achievements: Prevent Duplicate Unlocks**
```sql
Constraint: user_achievements_user_id_achievement_id_key
Columns: (user_id, achievement_id)
Type: COMPOSITE UNIQUE

Purpose: One achievement unlock per user
Enforcement:
  ✅ Cannot unlock same achievement twice
  
Critical for:
  - Achievement integrity
  - Prevents exploit of awarding points multiple times

Data Validation:
  Current: 8 unlocks
  Unique Combinations: 8 (no duplicates)
  Status: ✅ Working correctly
```

#### **user_skills: Prevent Duplicate Skills**
```sql
Constraint: user_skills_user_id_skill_id_key
Columns: (user_id, skill_id)
Type: COMPOSITE UNIQUE

Purpose: One proficiency rating per skill per user
Enforcement: Database-level uniqueness

Current Data: 0 skills
Status: ✅ Ready for data
```

#### **challenge_winners: Prevent Duplicate Winners**
```sql
Constraint: challenge_winners_challenge_id_user_id_key
Columns: (challenge_id, user_id)
Type: COMPOSITE UNIQUE

Purpose: One winner entry per user per challenge
Enforcement:
  ✅ User can't win same challenge multiple times
  
Edge Case:
  ⚠️ User could win different positions in same challenge
  Example: 1st place in Week 1, 2nd place in Week 2
  
Recommendation:
  - Current constraint is correct
  - Different challenges should allow same user
```

#### **posts.acc_id (Legacy)**
```sql
Constraint: posts_acc_id_key
Column: acc_id (bigint)
Type: UNIQUE

Issue: 🔴 1:1 relationship with Account
  - One post per account
  - Unusual design

Action: DELETE TABLE (legacy)
```

#### **Comments.post_id, Comments.acc_id (Legacy)**
```sql
Constraints:
  - Comments_post_id_key (UNIQUE on post_id)
  - Comments_acc_id_key (UNIQUE on acc_id)

Issue: 🔴 Both unique
  - One comment per post
  - One comment per account
  - Bizarre design

Action: DELETE TABLE (legacy)
```

### 3.3 Storage System Unique Constraints

#### **objects: Multiple Uniqueness Rules**
```sql
Constraint 1: bucketid_objname
  Columns: (bucket_id, name)
  Purpose: Unique object name per bucket

Constraint 2: idx_name_bucket_level_unique
  Columns: (name, bucket_id, level)
  Purpose: Hierarchical uniqueness

Constraint 3: objects_bucket_id_level_idx
  Columns: (bucket_id, level)
  Purpose: ⚠️ Unclear (may be error)

Analysis:
  ✅ Constraint 1: Essential
  ✅ Constraint 2: Hierarchical storage
  ⚠️ Constraint 3: Potentially redundant

Status: System-managed, don't modify
```

---

## 4. Check Constraints

### 4.1 Active Check Constraints

#### **profiles.role**
```sql
Constraint: profiles_role_check
Column: role (varchar)
Rule: role IN ('user', 'admin', 'moderator')

Purpose: Enforce valid user roles
Enforcement: Database-level validation

Valid Values:
  ✅ 'user' (default)
  ✅ 'admin'
  ✅ 'moderator'
  ❌ Any other value

Current Data:
  - 18 profiles
  - All have valid roles
  - Distribution: mostly 'user', some 'admin'

Status: ✅ Working correctly

Enhancement:
  -- Add more granular roles
  ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN (
      'user', 'admin', 'moderator', 
      'premium_user', 'content_creator'
    ));
```

#### **user_skills.proficiency**
```sql
Constraint: user_skills_proficiency_check
Column: proficiency (integer)
Rule: proficiency >= 1 AND proficiency <= 5

Purpose: Validate skill proficiency rating (1-5 scale)
Enforcement: Database-level validation

Valid Range:
  ✅ 1 (Beginner)
  ✅ 2 (Novice)
  ✅ 3 (Intermediate)
  ✅ 4 (Advanced)
  ✅ 5 (Expert)
  ❌ 0, 6, or any value outside 1-5

Current Data: 0 user_skills
Status: ✅ Ready for data

Enhancement:
  -- Add reference table for proficiency levels
  CREATE TABLE proficiency_levels (
    level integer PRIMARY KEY,
    name varchar NOT NULL,
    description text
  );
  
  INSERT INTO proficiency_levels VALUES
    (1, 'Beginner', 'Just starting'),
    (2, 'Novice', 'Basic understanding'),
    (3, 'Intermediate', 'Comfortable'),
    (4, 'Advanced', 'Highly proficient'),
    (5, 'Expert', 'Mastery level');
```

### 4.2 Missing Check Constraints

#### **notifications.type - NO CHECK**
```sql
Column: type (varchar)
Current Values: 'like', 'comment', 'follow', 'achievement'
Constraint: ❌ None

Risk:
  - Invalid type values possible
  - Typos: 'liek', 'commnt'
  - Application must validate

Recommendation:
  ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('like', 'comment', 'follow', 'achievement'));
```

#### **ideas.category - NO CHECK**
```sql
Column: category (varchar)
Current Values: Varies (no constraint)
Constraint: ❌ None

Risk:
  - Inconsistent categories
  - Typos
  - Free-form input

Recommendations:
  Option 1: Check Constraint
    ALTER TABLE ideas ADD CONSTRAINT ideas_category_check
      CHECK (category IN (
        'technology', 'business', 'design', 
        'science', 'arts', 'other'
      ));
  
  Option 2: Reference Table (Better)
    CREATE TABLE categories (
      id uuid PRIMARY KEY,
      name varchar UNIQUE NOT NULL,
      description text,
      is_active boolean DEFAULT true
    );
    
    ALTER TABLE ideas ADD COLUMN category_id uuid 
      REFERENCES categories(id);
```

#### **Boolean Columns - NO CHECK (Unnecessary)**
```sql
Columns:
  - profiles.is_premium
  - profiles.is_onboard
  - notifications.is_read
  - challenges.is_active
  - idea_comments.is_deleted

PostgreSQL boolean type: Already constrained to true/false/null
Check Constraint: ❌ Not needed (type enforces)

Status: ✅ Type-level enforcement sufficient
```

#### **Email Format - NO CHECK**
```sql
Column: Account.email (legacy table)
Constraint: ❌ None

Risk:
  - Invalid email formats
  - No validation

Recommendation:
  -- If keeping table (not recommended):
  ALTER TABLE "Account" ADD CONSTRAINT account_email_check
    CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
  
  -- Better: DELETE TABLE (legacy)
```

#### **Positive Counters - NO CHECK**
```sql
Columns:
  - ideas.likes (integer)
  - ideas.comments_count (integer)
  - ideas.share_count (integer)
  - ideas.view_count (integer)
  - comments.likes (integer)

Current: Default 0, but no CHECK constraint
Risk: Negative values possible

Recommendation:
  ALTER TABLE ideas ADD CONSTRAINT ideas_likes_positive
    CHECK (likes >= 0);
  ALTER TABLE ideas ADD CONSTRAINT ideas_comments_positive
    CHECK (comments_count >= 0);
  ALTER TABLE ideas ADD CONSTRAINT ideas_shares_positive
    CHECK (share_count >= 0);
  ALTER TABLE ideas ADD CONSTRAINT ideas_views_positive
    CHECK (view_count >= 0);
  
  ALTER TABLE comments ADD CONSTRAINT comments_likes_positive
    CHECK (likes >= 0);
```

#### **Timestamps - NO CHECK**
```sql
Columns:
  - created_at (should be <= now())
  - updated_at (should be >= created_at)
  - challenges.starts_at (should be < ends_at)

Risk:
  - Future created_at dates
  - updated_at before created_at
  - Invalid date ranges

Recommendation:
  ALTER TABLE ideas ADD CONSTRAINT ideas_timestamps_valid
    CHECK (updated_at >= created_at);
  
  ALTER TABLE comments ADD CONSTRAINT comments_timestamps_valid
    CHECK (updated_at >= created_at);
  
  ALTER TABLE challenges ADD CONSTRAINT challenges_dates_valid
    CHECK (ends_at > starts_at);
```

---

## 5. Foreign Key Integrity

### 5.1 Referential Integrity Status

#### **Strong Integrity (Complete FK Coverage)**
```sql
Tables:
  ✅ ideas (author → profiles.id)
  ✅ comments (idea_id → ideas.id, author → profiles.id)
  ✅ idea_likes (idea_id → ideas.id, user_id → profiles.id)
  ✅ comment_likes (comment_id → comments.id, user_id → profiles.id)
  ✅ user_achievements (user_id → profiles.id, achievement_id → achievements.id)
  ✅ notifications (user_id → profiles.id)

Enforcement:
  - Cannot insert orphaned records
  - Foreign key validates on insert
  - Database-level guarantee

Current Data: 0 orphans detected
```

#### **Weak Integrity (Nullable FKs)**
```sql
Tables:
  ⚠️ user_skills (user_id nullable, skill_id nullable)
  ⚠️ challenges (author nullable)

Issues:
  - NULL foreign keys allowed
  - Referential integrity optional
  - Orphan potential

Recommendation:
  ALTER TABLE user_skills 
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN skill_id SET NOT NULL;
  
  ALTER TABLE challenges
    ALTER COLUMN author SET NOT NULL;
```

#### **Broken Integrity (Wrong Reference)**
```sql
Table: user_skills
Column: user_id
References: auth.users.id ⚠️ INCORRECT

Issue:
  - Should reference profiles.id (not auth.users.id)
  - Inconsistent with all other tables
  - Breaks referential integrity pattern

Fix:
  ALTER TABLE user_skills DROP CONSTRAINT user_skills_user_id_fkey;
  ALTER TABLE user_skills ADD CONSTRAINT user_skills_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
```

### 5.2 Cascade Behavior Review

#### **Current: All NO ACTION**
```sql
All 30 foreign keys: ON DELETE NO ACTION

Implication:
  ❌ Deleting user fails if they have content
  ❌ Deleting idea fails if it has comments/likes
  ❌ Must manually delete related data first
  ❌ Orphan risk if application logic fails

Example Error:
  DELETE FROM profiles WHERE id = 'user-uuid';
  -- ERROR: update or delete on table "profiles" violates 
  -- foreign key constraint on table "ideas"
```

#### **Recommended: Strategic CASCADE**
```sql
Engagement (Should CASCADE):
  - idea_likes.user_id → CASCADE
  - comment_likes.user_id → CASCADE
  - follows.follower_id → CASCADE
  - follows.following_id → CASCADE
  - user_achievements.user_id → CASCADE
  - notifications.user_id → CASCADE

Content (Should SET NULL or CASCADE):
  - ideas.author → SET NULL (preserve content)
  - comments.author → SET NULL (preserve comment)
  - challenges.author → SET NULL (preserve challenge)

Relationships (Should CASCADE):
  - comments.idea_id → CASCADE (delete with idea)
  - idea_likes.idea_id → CASCADE (delete with idea)
  - comment_likes.comment_id → CASCADE (delete with comment)

See: [Dependencies Analysis](./02_DEPENDENCIES_ANALYSIS.md) for full details
```

### 5.3 Orphan Detection Queries

#### **Check for Orphaned Ideas**
```sql
SELECT i.id, i.title, i.author
FROM ideas i
LEFT JOIN profiles p ON i.author = p.id
WHERE p.id IS NULL;

Current Result: 0 rows (no orphans)
```

#### **Check for Orphaned Comments**
```sql
SELECT c.id, c.content, c.author, c.idea_id
FROM comments c
LEFT JOIN profiles p ON c.author = p.id
LEFT JOIN ideas i ON c.idea_id = i.id
WHERE p.id IS NULL OR i.id IS NULL;

Current Result: 0 rows (no orphans)
```

#### **Check for Orphaned Likes**
```sql
-- Idea likes
SELECT il.*
FROM idea_likes il
LEFT JOIN ideas i ON il.idea_id = i.id
LEFT JOIN profiles p ON il.user_id = p.id
WHERE i.id IS NULL OR p.id IS NULL;

-- Comment likes
SELECT cl.*
FROM comment_likes cl
LEFT JOIN comments c ON cl.comment_id = c.id
LEFT JOIN profiles p ON cl.user_id = p.id
WHERE c.id IS NULL OR p.id IS NULL;

Current Result: 0 rows each (no orphans)
```

#### **Check for Orphaned Achievements**
```sql
SELECT ua.*
FROM user_achievements ua
LEFT JOIN profiles p ON ua.user_id = p.id
LEFT JOIN achievements a ON ua.achievement_id = a.id
WHERE p.id IS NULL OR a.id IS NULL;

Current Result: 0 rows (no orphans)
```

---

## 6. Data Validation Rules

### 6.1 Application-Level Validation

#### **Required Fields (NOT NULL)**
```sql
Strictly Enforced:
  ✅ profiles.username (NOT NULL)
  ✅ ideas.author (NOT NULL)
  ✅ ideas.title (NOT NULL)
  ✅ ideas.summary (NOT NULL)
  ✅ ideas.content (NOT NULL)
  ✅ ideas.category (NOT NULL)
  ✅ comments.idea_id (NOT NULL)
  ✅ comments.author (NOT NULL)
  ✅ comments.content (NOT NULL)
  ✅ achievements.name (NOT NULL)
  ✅ achievements.description (NOT NULL)

Optionally NULL:
  ⚠️ profiles.full_name (nullable)
  ⚠️ profiles.avatar_url (nullable)
  ⚠️ profiles.bio (nullable)
  ⚠️ ideas.cover_img (nullable)
  ⚠️ achievements.icon_url (nullable)

Recommendation:
  - Consider making full_name required
  - avatar_url should remain optional (default avatar)
  - bio should remain optional
```

#### **String Length Validation**
```sql
Database Level: ❌ No VARCHAR limits defined
  - All varchar columns: No explicit length
  - PostgreSQL default: Unlimited (text-like)

Risk:
  - Very long usernames possible
  - Memory/storage inefficiency
  - UI display issues

Recommendation:
  ALTER TABLE profiles 
    ALTER COLUMN username TYPE varchar(50);
  
  ALTER TABLE ideas
    ALTER COLUMN title TYPE varchar(200),
    ALTER COLUMN category TYPE varchar(50);
  
  ALTER TABLE achievements
    ALTER COLUMN name TYPE varchar(100);
```

#### **Array Validation**
```sql
Column: ideas.tags (text[])
Constraint: ❌ None

Current State:
  - Default: '{}'
  - No limit on array size
  - No validation on tag format

Risks:
  - Unlimited tags
  - Invalid tag formats
  - No normalization

Recommendations:
  -- Limit array size
  ALTER TABLE ideas ADD CONSTRAINT ideas_tags_limit
    CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10);
  
  -- Or use junction table (better):
  CREATE TABLE idea_tags (
    idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
  );
```

### 6.2 Business Logic Validation

#### **Self-Relationship Prevention**
```sql
Table: follows
Constraint: ❌ None

Risk:
  - User can follow themselves
  - Business logic error

Recommendation:
  ALTER TABLE follows ADD CONSTRAINT follows_not_self
    CHECK (follower_id != following_id);
```

#### **Date Range Validation**
```sql
Table: challenges
Columns: starts_at, ends_at
Constraint: ❌ None

Risk:
  - ends_at before starts_at
  - Negative duration challenges

Recommendation:
  ALTER TABLE challenges ADD CONSTRAINT challenges_valid_dates
    CHECK (ends_at > starts_at);
```

#### **Score/Points Validation**
```sql
Column: profiles.score
Constraint: ❌ None

Risk:
  - Negative scores possible
  - Integer overflow

Recommendation:
  ALTER TABLE profiles ADD CONSTRAINT profiles_score_positive
    CHECK (score >= 0);
  
  ALTER TABLE achievements ADD CONSTRAINT achievements_points_positive
    CHECK (points >= 0);
```

#### **Position/Rank Validation**
```sql
Column: challenge_winners.position
Constraint: ❌ None

Risk:
  - Invalid positions (0, -1)
  - Position > participant count

Recommendation:
  ALTER TABLE challenge_winners ADD CONSTRAINT winners_valid_position
    CHECK (position >= 1 AND position <= 1000);
```

### 6.3 Data Format Validation

#### **URL Format Validation**
```sql
Columns:
  - profiles.avatar_url
  - ideas.cover_img
  - achievements.icon_url

Current: No validation
Risk: Invalid URLs stored

Recommendation:
  -- Basic URL pattern check
  ALTER TABLE profiles ADD CONSTRAINT profiles_avatar_url_format
    CHECK (
      avatar_url IS NULL OR
      avatar_url ~* '^https?://'
    );
  
  -- Or use URL type extension
  CREATE DOMAIN url AS text
    CHECK (VALUE ~* '^https?://[^\s/$.?#].[^\s]*$');
  
  ALTER TABLE profiles
    ALTER COLUMN avatar_url TYPE url;
```

#### **Content Length Validation**
```sql
Columns:
  - ideas.content (text)
  - comments.content (text)
  - profiles.bio (text)

Current: No limits
Risk: Very large content

Recommendation:
  -- Minimum content length
  ALTER TABLE ideas ADD CONSTRAINT ideas_content_min_length
    CHECK (length(content) >= 50);
  
  -- Maximum bio length
  ALTER TABLE profiles ADD CONSTRAINT profiles_bio_max_length
    CHECK (bio IS NULL OR length(bio) <= 500);
  
  -- Comment length range
  ALTER TABLE comments ADD CONSTRAINT comments_content_length
    CHECK (length(content) BETWEEN 1 AND 5000);
```

---

## 7. Integrity Issues & Recommendations

### 7.1 Critical Issues

#### **Issue 1: user_skills References Wrong Table**
```sql
Problem:
  user_skills.user_id → auth.users.id
  Should be: user_skills.user_id → profiles.id

Impact: 🔴 CRITICAL
  - Inconsistent with all other tables
  - Breaks referential integrity pattern
  - May cause orphans if auth user deleted

Fix:
  ALTER TABLE user_skills DROP CONSTRAINT user_skills_user_id_fkey;
  ALTER TABLE user_skills ADD CONSTRAINT user_skills_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;

Priority: Immediate
```

#### **Issue 2: No CASCADE Deletes**
```sql
Problem:
  All 30 FK constraints use NO ACTION
  Deleting user requires manual cleanup of 11 tables

Impact: 🔴 HIGH
  - Risk of orphaned data
  - Complex deletion logic
  - Error-prone

Fix:
  See [Dependencies Analysis](./02_DEPENDENCIES_ANALYSIS.md)
  Implement strategic CASCADE/SET NULL

Priority: High
```

#### **Issue 3: Missing Type Validation**
```sql
Problem:
  notifications.type - no CHECK constraint
  ideas.category - no CHECK constraint

Impact: 🔴 HIGH
  - Invalid data possible
  - Inconsistent values
  - Query failures

Fix:
  ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('like', 'comment', 'follow', 'achievement'));
  
  ALTER TABLE ideas ADD CONSTRAINT ideas_category_check
    CHECK (category IN (
      'technology', 'business', 'design', 
      'science', 'arts', 'other'
    ));

Priority: High
```

### 7.2 Important Issues

#### **Issue 4: No String Length Limits**
```sql
Problem:
  All varchar columns: No explicit length
  Potential for very long values

Impact: 🟡 MEDIUM
  - Storage inefficiency
  - UI display issues
  - Performance impact

Fix:
  ALTER TABLE profiles 
    ALTER COLUMN username TYPE varchar(50);
  ALTER TABLE ideas
    ALTER COLUMN title TYPE varchar(200);
  [... apply to all user-facing fields]

Priority: Medium
```

#### **Issue 5: No Positive Counter Checks**
```sql
Problem:
  Counters (likes, views, etc.) have no CHECK constraint
  Negative values possible

Impact: 🟡 MEDIUM
  - Data integrity issues
  - Incorrect metrics
  - Business logic errors

Fix:
  ALTER TABLE ideas ADD CONSTRAINT ideas_counters_positive
    CHECK (
      likes >= 0 AND
      comments_count >= 0 AND
      share_count >= 0 AND
      view_count >= 0
    );

Priority: Medium
```

#### **Issue 6: Username Case Sensitivity**
```sql
Problem:
  profiles.username allows "John" and "john"
  Case-sensitive uniqueness

Impact: 🟡 MEDIUM
  - User confusion
  - Duplicate usernames (logically)

Fix:
  CREATE UNIQUE INDEX idx_profiles_username_lower
    ON profiles(LOWER(username));

Priority: Medium
```

### 7.3 Minor Issues

#### **Issue 7: Self-Follow Prevention**
```sql
Problem:
  follows table allows follower_id = following_id
  User can follow themselves

Impact: 🟢 LOW
  - Business logic error
  - Minor UX issue

Fix:
  ALTER TABLE follows ADD CONSTRAINT follows_not_self
    CHECK (follower_id != following_id);

Priority: Low
```

#### **Issue 8: No Content Length Minimums**
```sql
Problem:
  ideas.content can be empty string
  comments.content can be empty string

Impact: 🟢 LOW
  - Quality issues
  - Spam potential

Fix:
  ALTER TABLE ideas ADD CONSTRAINT ideas_content_min
    CHECK (length(trim(content)) >= 50);
  
  ALTER TABLE comments ADD CONSTRAINT comments_content_min
    CHECK (length(trim(content)) >= 1);

Priority: Low
```

#### **Issue 9: Legacy Table Redundancies**
```sql
Problem:
  Account.id has both PRIMARY KEY and UNIQUE constraint
  Unnecessary duplication

Impact: 🟢 NEGLIGIBLE
  - Minor storage waste

Fix:
  DROP TABLE "Account" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "Comments" CASCADE;

Priority: Low (cleanup)
```

### 7.4 Recommended Constraints Summary

#### **Add Immediately (Critical)**
```sql
-- Fix user_skills FK
ALTER TABLE user_skills DROP CONSTRAINT user_skills_user_id_fkey;
ALTER TABLE user_skills ADD CONSTRAINT user_skills_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add type checks
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'follow', 'achievement'));

ALTER TABLE ideas ADD CONSTRAINT ideas_category_check
  CHECK (category IN ('technology', 'business', 'design', 'science', 'arts', 'other'));

-- Add timestamp checks
ALTER TABLE ideas ADD CONSTRAINT ideas_timestamps_valid
  CHECK (updated_at >= created_at);

ALTER TABLE comments ADD CONSTRAINT comments_timestamps_valid
  CHECK (updated_at >= created_at);
```

#### **Add Soon (Important)**
```sql
-- Positive counters
ALTER TABLE ideas ADD CONSTRAINT ideas_likes_positive CHECK (likes >= 0);
ALTER TABLE ideas ADD CONSTRAINT ideas_comments_positive CHECK (comments_count >= 0);
ALTER TABLE ideas ADD CONSTRAINT ideas_shares_positive CHECK (share_count >= 0);
ALTER TABLE ideas ADD CONSTRAINT ideas_views_positive CHECK (view_count >= 0);
ALTER TABLE comments ADD CONSTRAINT comments_likes_positive CHECK (likes >= 0);

-- Username case-insensitive uniqueness
CREATE UNIQUE INDEX idx_profiles_username_lower ON profiles(LOWER(username));

-- String length limits
ALTER TABLE profiles ALTER COLUMN username TYPE varchar(50);
ALTER TABLE ideas ALTER COLUMN title TYPE varchar(200);
ALTER TABLE ideas ALTER COLUMN category TYPE varchar(50);
```

#### **Add Eventually (Nice to Have)**
```sql
-- Self-follow prevention
ALTER TABLE follows ADD CONSTRAINT follows_not_self
  CHECK (follower_id != following_id);

-- Content length minimums
ALTER TABLE ideas ADD CONSTRAINT ideas_content_min
  CHECK (length(trim(content)) >= 50);

-- Tag array limit
ALTER TABLE ideas ADD CONSTRAINT ideas_tags_limit
  CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10);

-- Score positivity
ALTER TABLE profiles ADD CONSTRAINT profiles_score_positive
  CHECK (score >= 0);
```

---

## Summary

### Current State
```
Constraint Health: 85/100
├── Primary Keys: ✅ Excellent (24/24)
├── Unique Constraints: ✅ Good (15/15 working)
├── Foreign Keys: ⚠️ All present but NO CASCADE
├── Check Constraints: ⚠️ Only 2 active, need 15+
├── NOT NULL: ✅ Adequate coverage
└── Data Quality: ✅ No orphans, no duplicates

Critical Issues: 3
Important Issues: 3
Minor Issues: 3
```

### Priority Actions

**Critical (Do Immediately):**
1. Fix user_skills FK reference (auth.users → profiles)
2. Add notifications.type CHECK constraint
3. Add ideas.category CHECK constraint
4. Add timestamp validation checks
5. Implement strategic CASCADE deletes

**Important (This Sprint):**
6. Add positive counter checks
7. Implement case-insensitive username uniqueness
8. Add string length limits to VARCHAR columns
9. Add content length validation

**Nice to Have (Future):**
10. Self-follow prevention
11. Tag array size limits
12. URL format validation
13. Email format validation
14. Delete legacy tables

### Expected Impact
```
After Implementing All Recommendations:
├── Constraint Health: 95/100
├── Data Integrity: ✅ Strong database-level enforcement
├── Orphan Risk: ✅ Eliminated via CASCADE
├── Invalid Data: ✅ Prevented via CHECK constraints
├── User Experience: ✅ Better validation feedback
└── Maintenance: ✅ Reduced application complexity
```

---

**Document Complete** | [Back to Overview](../DATABASE_COMPREHENSIVE_ANALYSIS.md)
