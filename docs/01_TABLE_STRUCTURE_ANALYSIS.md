# Table Structure & Contents Analysis
**Document:** 01 of 06  
**Generated:** November 5, 2025  
**Database:** NeuraCore (Supabase PostgreSQL)

---

## Table of Contents
1. [Active Application Tables](#1-active-application-tables)
2. [Legacy Tables](#2-legacy-tables)
3. [Storage System Tables](#3-storage-system-tables)
4. [Data Distribution Summary](#4-data-distribution-summary)

---

## 1. Active Application Tables

### 1.1 Core Tables

#### **profiles** (18 rows)
```sql
Table: public.profiles
Purpose: User profile management with gamification
RLS: ✅ ENABLED
Size: 48 kB

Columns:
├── id                 uuid         PRIMARY KEY (→ auth.users.id)
├── username           varchar      UNIQUE, NOT NULL
├── full_name          varchar      nullable
├── avatar_url         text         nullable
├── bio                text         nullable
├── role               varchar      DEFAULT 'user'
│                                   CHECK: 'user'|'admin'|'moderator'
├── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP
├── updated_at         timestamptz  DEFAULT CURRENT_TIMESTAMP
├── score              integer      DEFAULT 0
├── is_premium         boolean      DEFAULT false
└── is_onboard         boolean      DEFAULT false

Indexes:
  1. profiles_pkey (PRIMARY KEY on id)
  2. profiles_username_key (UNIQUE on username)

Triggers:
  1. update_profiles_updated_at (BEFORE UPDATE)
     - Auto-updates updated_at timestamp

Referenced By:
  - ideas.author → profiles.id
  - comments.author → profiles.id
  - idea_likes.user_id → profiles.id
  - comment_likes.user_id → profiles.id
  - follows.follower_id → profiles.id
  - follows.following_id → profiles.id
  - user_achievements.user_id → profiles.id
  - notifications.user_id → profiles.id
  - challenges.author → profiles.id
  - challenge_winners.user_id → profiles.id
  - idea_comments.author → profiles.id

Data Sample (18 users):
  - Active users with profiles created
  - Mix of premium and free users
  - Onboarding status varies
```

#### **ideas** (15 rows)
```sql
Table: public.ideas
Purpose: User-generated idea content
RLS: ✅ ENABLED
Size: 160 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── author             uuid         NOT NULL (FK → profiles.id)
├── title              varchar      NOT NULL
├── summary            text         NOT NULL
├── content            text         NOT NULL
├── category           varchar      NOT NULL
├── tags               text[]       DEFAULT '{}'
├── cover_img          text         nullable (⚠️ broken - no bucket)
├── likes              integer      DEFAULT 0
├── comments_count     integer      DEFAULT 0
├── share_count        integer      DEFAULT 0
├── view_count         integer      DEFAULT 0
├── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP
└── updated_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. ideas_pkey (PRIMARY KEY on id)
  2. idx_ideas_author (btree on author)
  3. idx_ideas_category (btree on category)
  4. idx_ideas_created_at (btree on created_at DESC)

Triggers:
  1. update_ideas_updated_at (BEFORE UPDATE)
     - Auto-updates updated_at timestamp

Foreign Keys:
  - author → profiles.id (NO CASCADE)

Referenced By:
  - comments.idea_id → ideas.id
  - idea_likes.idea_id → ideas.id
  - idea_comments.idea_id → ideas.id

Data Distribution:
  - 15 ideas posted
  - Total likes: aggregated via idea_likes
  - Total comments: 7 via comments table
  - Categories: varies by content
```

#### **comments** (7 rows)
```sql
Table: public.comments
Purpose: Comments on ideas
RLS: ✅ ENABLED
Size: 64 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── idea_id            uuid         NOT NULL (FK → ideas.id)
├── author             uuid         NOT NULL (FK → profiles.id)
├── content            text         NOT NULL
├── likes              integer      DEFAULT 0
├── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP
└── updated_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. comments_pkey (PRIMARY KEY on id)
  2. idx_comments_idea_id (btree on idea_id)
  3. idx_comments_author (btree on author)

Triggers:
  1. trg_notify_on_comment (AFTER INSERT)
     - Creates notification for idea author
  2. update_comments_updated_at (BEFORE UPDATE)
     - Auto-updates updated_at timestamp

Foreign Keys:
  - idea_id → ideas.id (NO CASCADE)
  - author → profiles.id (NO CASCADE)

Referenced By:
  - comment_likes.comment_id → comments.id

Data Distribution:
  - 7 comments across ideas
  - Engagement varies per comment
```

### 1.2 Engagement Tables

#### **idea_likes** (16 rows)
```sql
Table: public.idea_likes
Purpose: Track likes on ideas
RLS: ✅ ENABLED
Size: 72 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── idea_id            uuid         NOT NULL (FK → ideas.id)
├── user_id            uuid         NOT NULL (FK → profiles.id)
└── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. idea_likes_pkey (PRIMARY KEY on id)
  2. idea_likes_idea_id_user_id_key (UNIQUE on idea_id, user_id)
  3. idx_idea_likes_idea_id (btree on idea_id)
  4. idx_idea_likes_user_id (btree on user_id)

Triggers:
  1. trg_notify_idea_like (AFTER INSERT)
     - Creates notification for idea author

Foreign Keys:
  - idea_id → ideas.id (NO CASCADE)
  - user_id → profiles.id (NO CASCADE)

Unique Constraint:
  - One like per user per idea
  - Prevents duplicate likes

Data Distribution:
  - 16 likes total
  - Distributed across 15 ideas
  - Average: ~1 like per idea
```

#### **comment_likes** (4 rows)
```sql
Table: public.comment_likes
Purpose: Track likes on comments
RLS: ✅ ENABLED
Size: 72 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── comment_id         uuid         NOT NULL (FK → comments.id)
├── user_id            uuid         NOT NULL (FK → profiles.id)
└── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. comment_likes_pkey (PRIMARY KEY on id)
  2. comment_likes_comment_id_user_id_key (UNIQUE on comment_id, user_id)
  3. idx_comment_likes_comment_id (btree on comment_id)
  4. idx_comment_likes_user_id (btree on user_id)

Triggers:
  1. trg_notify_comment_like (AFTER INSERT)
     - Creates notification for comment author

Foreign Keys:
  - comment_id → comments.id (NO CASCADE)
  - user_id → profiles.id (NO CASCADE)

Unique Constraint:
  - One like per user per comment
  - Prevents duplicate likes

Data Distribution:
  - 4 likes total
  - Distributed across 7 comments
  - Average: ~0.57 likes per comment
```

### 1.3 Gamification Tables

#### **achievements** (5 rows)
```sql
Table: public.achievements
Purpose: Achievement badge definitions
RLS: ✅ ENABLED
Size: 48 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── name               varchar      UNIQUE, NOT NULL
├── description        text         NOT NULL
├── icon_url           text         nullable
├── points             integer      DEFAULT 0
└── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. achievements_pkey (PRIMARY KEY on id)
  2. achievements_name_key (UNIQUE on name)

Referenced By:
  - user_achievements.achievement_id → achievements.id

Data Sample (5 achievements):
  - Badge catalog for user rewards
  - Points vary by achievement
  - Icons for display
```

#### **user_achievements** (8 rows)
```sql
Table: public.user_achievements
Purpose: User-earned achievements
RLS: ✅ ENABLED
Size: 56 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── user_id            uuid         NOT NULL (FK → profiles.id)
├── achievement_id     uuid         NOT NULL (FK → achievements.id)
└── unlocked_at        timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. user_achievements_pkey (PRIMARY KEY on id)
  2. user_achievements_user_id_achievement_id_key (UNIQUE on user_id, achievement_id)
  3. idx_user_achievements_user_id (btree on user_id)

Foreign Keys:
  - user_id → profiles.id (NO CASCADE)
  - achievement_id → achievements.id (NO CASCADE)

Unique Constraint:
  - One achievement instance per user
  - Prevents duplicate unlocks

Data Distribution:
  - 8 achievements unlocked
  - Distributed across users
  - Tracks gamification progress
```

#### **notifications** (6 rows)
```sql
Table: public.notifications
Purpose: User notification system
RLS: ✅ ENABLED
Size: 48 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT uuid_generate_v4()
├── user_id            uuid         NOT NULL (FK → profiles.id)
├── type               varchar      NOT NULL
│                                   CHECK: 'like'|'comment'|'follow'|'achievement'
├── content            text         NOT NULL
├── is_read            boolean      DEFAULT false
└── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Indexes:
  1. notifications_pkey (PRIMARY KEY on id)
  2. idx_notifications_user_id (btree on user_id)

Foreign Keys:
  - user_id → profiles.id (NO CASCADE)

Data Distribution:
  - 6 notifications total
  - Types: like, comment, achievement
  - Read status varies
```

### 1.4 Experimental Features (Empty Tables)

#### **follows** (0 rows) ⚠️ NO RLS
```sql
Table: public.follows
Purpose: User follow relationships
RLS: ❌ DISABLED
Size: 8192 bytes

Columns:
├── follower_id        uuid         NOT NULL (FK → profiles.id)
├── following_id       uuid         NOT NULL (FK → profiles.id)
└── created_at         timestamptz  DEFAULT CURRENT_TIMESTAMP

Primary Key: (follower_id, following_id)

Indexes:
  1. follows_pkey (PRIMARY KEY on follower_id, following_id)

Foreign Keys:
  - follower_id → profiles.id (NO CASCADE)
  - following_id → profiles.id (NO CASCADE)

Security Risk:
  - No RLS policies
  - Anyone can insert follows
  - Anyone can view all follows
```

#### **skills** (0 rows) ⚠️ NO RLS
```sql
Table: public.skills
Purpose: Skill catalog
RLS: ❌ DISABLED
Size: 16 kB

Columns:
├── id                 integer      PRIMARY KEY, AUTO INCREMENT
└── name               varchar      UNIQUE, NOT NULL

Indexes:
  1. skills_pkey (PRIMARY KEY on id)
  2. skills_name_key (UNIQUE on name)

Referenced By:
  - user_skills.skill_id → skills.id
```

#### **user_skills** (0 rows) ⚠️ NO RLS
```sql
Table: public.user_skills
Purpose: User skill proficiency
RLS: ❌ DISABLED
Size: 16 kB

Columns:
├── id                 integer      PRIMARY KEY, AUTO INCREMENT
├── user_id            uuid         nullable (FK → auth.users.id)
├── skill_id           integer      nullable (FK → skills.id)
└── proficiency        integer      nullable
                                    CHECK: proficiency >= 1 AND proficiency <= 5

Indexes:
  1. user_skills_pkey (PRIMARY KEY on id)
  2. user_skills_user_id_skill_id_key (UNIQUE on user_id, skill_id)

Foreign Keys:
  - user_id → auth.users.id (NO CASCADE)
  - skill_id → skills.id (NO CASCADE)

Security Risk:
  - No RLS policies
  - Direct reference to auth.users (not profiles)
```

#### **challenges** (0 rows) ⚠️ NO RLS
```sql
Table: public.challenges
Purpose: Community challenges
RLS: ❌ DISABLED
Size: 16 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT gen_random_uuid()
├── title              varchar      NOT NULL
├── description        text         nullable
├── author             uuid         nullable (FK → profiles.id)
├── starts_at          timestamptz  nullable
├── ends_at            timestamptz  nullable
├── is_active          boolean      DEFAULT true
├── created_at         timestamptz  DEFAULT now()
└── updated_at         timestamptz  DEFAULT now()

Indexes:
  1. challenges_pkey (PRIMARY KEY on id)

Foreign Keys:
  - author → profiles.id (NO CASCADE)

Referenced By:
  - challenge_winners.challenge_id → challenges.id
```

#### **challenge_winners** (0 rows) ⚠️ NO RLS
```sql
Table: public.challenge_winners
Purpose: Challenge leaderboard
RLS: ❌ DISABLED
Size: 24 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT gen_random_uuid()
├── challenge_id       uuid         NOT NULL (FK → challenges.id)
├── user_id            uuid         NOT NULL (FK → profiles.id)
├── position           integer      nullable
├── prize_awarded      text         nullable
└── created_at         timestamptz  DEFAULT now()

Indexes:
  1. challenge_winners_pkey (PRIMARY KEY on id)
  2. challenge_winners_challenge_id_user_id_key (UNIQUE on challenge_id, user_id)

Foreign Keys:
  - challenge_id → challenges.id (NO CASCADE)
  - user_id → profiles.id (NO CASCADE)
```

#### **idea_comments** (0 rows) ⚠️ NO RLS
```sql
Table: public.idea_comments
Purpose: Alternative comment system (duplicate?)
RLS: ❌ DISABLED
Size: 16 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT gen_random_uuid()
├── idea_id            uuid         NOT NULL (FK → ideas.id)
├── author             uuid         NOT NULL (FK → profiles.id)
├── content            text         NOT NULL
├── created_at         timestamptz  DEFAULT now()
├── updated_at         timestamptz  DEFAULT now()
└── is_deleted         boolean      DEFAULT false

Indexes:
  1. idea_comments_pkey (PRIMARY KEY on id)

Foreign Keys:
  - idea_id → ideas.id (NO CASCADE)
  - author → profiles.id (NO CASCADE)

Note:
  - Duplicates 'comments' table functionality
  - Possibly experimental or migration artifact
```

---

## 2. Legacy Tables

### 2.1 Account (0 rows)
```sql
Table: public.Account
Purpose: Unknown (legacy)
RLS: ✅ ENABLED (but unused)
Size: 24 kB
Comment: "Holds account information"

Columns:
├── id                 bigint       PRIMARY KEY, AUTO INCREMENT, UNIQUE
├── created_at         timestamptz  DEFAULT now()
├── email              text         nullable
├── pic_url            text         nullable
├── pwd                varchar      nullable
├── role               integer      nullable
├── bio                text         nullable
├── acc_status         integer      nullable
└── post_id            bigint       nullable (FK → posts.acc_id)

Indexes:
  1. Account_pkey (PRIMARY KEY on id)
  2. Account_id_key (UNIQUE on id)

Foreign Keys:
  - id → posts.acc_id (CIRCULAR REFERENCE ⚠️)

Issues:
  - Capital case naming (inconsistent)
  - Circular FK with posts
  - Integer role/status (no enum)
  - Plain text password field (pwd)
  - Not integrated with auth.users
```

### 2.2 posts (0 rows)
```sql
Table: public.posts
Purpose: Unknown (legacy)
RLS: ✅ ENABLED (but unused)
Size: 24 kB

Columns:
├── id                 bigint       PRIMARY KEY, AUTO INCREMENT
├── created_at         timestamptz  DEFAULT now()
├── post_details       json         nullable
├── caption            text         nullable
└── acc_id             bigint       nullable, UNIQUE (FK → Account.id)

Indexes:
  1. posts_pkey (PRIMARY KEY on id)
  2. posts_acc_id_key (UNIQUE on acc_id)

Foreign Keys:
  - acc_id → Account.id (CIRCULAR REFERENCE ⚠️)

Issues:
  - Lowercase naming (inconsistent)
  - Circular FK with Account
  - JSON field (should be JSONB)
  - Not integrated with ideas system
```

### 2.3 Comments (0 rows) - DIFFERENT FROM comments
```sql
Table: public.Comments
Purpose: Unknown (legacy)
RLS: ✅ ENABLED (but unused)
Size: 32 kB

Columns:
├── id                 bigint       PRIMARY KEY, AUTO INCREMENT
├── created_at         timestamptz  DEFAULT now()
├── content            text         nullable
├── post_id            bigint       NOT NULL, UNIQUE
├── acc_id             bigint       NOT NULL, UNIQUE
├── like_count         bigint       nullable
└── liked_by           bigint[]     nullable

Indexes:
  1. Comments_pkey (PRIMARY KEY on id)
  2. Comments_post_id_key (UNIQUE on post_id)
  3. Comments_acc_id_key (UNIQUE on acc_id)

Issues:
  - Capital case naming (inconsistent)
  - No FK constraints (orphan risk)
  - Array for liked_by (should be junction table)
  - Denormalized like_count (should be computed)
```

---

## 3. Storage System Tables

### 3.1 buckets (0 rows) ⚠️ CRITICAL
```sql
Table: storage.buckets
Purpose: Storage bucket configuration
RLS: ✅ ENABLED
Size: 24 kB

Columns:
├── id                 text         PRIMARY KEY
├── name               text         UNIQUE, NOT NULL
├── owner              uuid         nullable (deprecated)
├── created_at         timestamptz  DEFAULT now()
├── updated_at         timestamptz  DEFAULT now()
├── public             boolean      DEFAULT false
├── avif_autodetection boolean      DEFAULT false
├── file_size_limit    bigint       nullable
├── allowed_mime_types text[]       nullable
├── owner_id           text         nullable
└── type               buckettype   DEFAULT 'STANDARD'
                                    ENUM: 'STANDARD'|'ANALYTICS'

Indexes:
  1. buckets_pkey (PRIMARY KEY on id)
  2. bname (UNIQUE on name)

Triggers:
  1. enforce_bucket_name_length_trigger (BEFORE INSERT OR UPDATE)

Referenced By:
  - objects.bucket_id → buckets.id
  - prefixes.bucket_id → buckets.id
  - s3_multipart_uploads.bucket_id → buckets.id
  - s3_multipart_uploads_parts.bucket_id → buckets.id

Critical Issue:
  - 0 buckets configured
  - File uploads will fail
  - ideas.cover_img references non-existent bucket
```

### 3.2 objects (0 rows)
```sql
Table: storage.objects
Purpose: Stored file metadata
RLS: ✅ ENABLED
Size: 64 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT gen_random_uuid()
├── bucket_id          text         nullable (FK → buckets.id)
├── name               text         nullable
├── owner              uuid         nullable (deprecated)
├── created_at         timestamptz  DEFAULT now()
├── updated_at         timestamptz  DEFAULT now()
├── last_accessed_at   timestamptz  DEFAULT now()
├── metadata           jsonb        nullable
├── path_tokens        text[]       GENERATED (from name)
├── version            text         nullable
├── owner_id           text         nullable
├── user_metadata      jsonb        nullable
└── level              integer      nullable

Indexes (7):
  1. objects_pkey (PRIMARY KEY on id)
  2. bucketid_objname (UNIQUE on bucket_id, name)
  3. idx_name_bucket_level_unique (UNIQUE on name, bucket_id, level)
  4. idx_objects_bucket_id_name (btree)
  5. idx_objects_lower_name (btree with expression)
  6. name_prefix_search (btree text_pattern_ops)
  7. objects_bucket_id_level_idx (UNIQUE)

Triggers (4):
  1. objects_insert_create_prefix (BEFORE INSERT)
  2. objects_update_create_prefix (BEFORE UPDATE)
  3. objects_delete_delete_prefix (AFTER DELETE)
  4. update_objects_updated_at (BEFORE UPDATE)
```

### 3.3 migrations (18 rows)
```sql
Table: storage.migrations
Purpose: Storage schema version tracking
RLS: ✅ ENABLED
Size: 40 kB

Columns:
├── id                 integer      PRIMARY KEY
├── name               varchar      UNIQUE, NOT NULL
├── hash               varchar      NOT NULL
└── executed_at        timestamp    DEFAULT CURRENT_TIMESTAMP

Data:
  - 18 migration records
  - Storage system version history
```

### 3.4 s3_multipart_uploads (0 rows)
```sql
Table: storage.s3_multipart_uploads
Purpose: Multi-part upload tracking
RLS: ✅ ENABLED
Size: 24 kB

Columns:
├── id                 text         PRIMARY KEY
├── in_progress_size   bigint       DEFAULT 0
├── upload_signature   text         NOT NULL
├── bucket_id          text         NOT NULL (FK → buckets.id)
├── key                text         NOT NULL
├── version            text         NOT NULL
├── owner_id           text         nullable
├── created_at         timestamptz  DEFAULT now()
└── user_metadata      jsonb        nullable

Referenced By:
  - s3_multipart_uploads_parts.upload_id → s3_multipart_uploads.id
```

### 3.5 s3_multipart_uploads_parts (0 rows)
```sql
Table: storage.s3_multipart_uploads_parts
Purpose: Multi-part upload chunks
RLS: ✅ ENABLED
Size: 16 kB

Columns:
├── id                 uuid         PRIMARY KEY, DEFAULT gen_random_uuid()
├── upload_id          text         NOT NULL (FK → s3_multipart_uploads.id)
├── size               bigint       DEFAULT 0
├── part_number        integer      NOT NULL
├── bucket_id          text         NOT NULL (FK → buckets.id)
├── key                text         NOT NULL
├── etag               text         NOT NULL
├── owner_id           text         nullable
├── version            text         NOT NULL
└── created_at         timestamptz  DEFAULT now()

Foreign Keys:
  - upload_id → s3_multipart_uploads.id
  - bucket_id → buckets.id
```

### 3.6 prefixes (0 rows)
```sql
Table: storage.prefixes
Purpose: Storage folder hierarchy
RLS: ✅ ENABLED
Size: 24 kB

Columns:
├── bucket_id          text         NOT NULL (FK → buckets.id)
├── name               text         NOT NULL
├── level              integer      GENERATED (from name)
├── created_at         timestamptz  DEFAULT now()
└── updated_at         timestamptz  DEFAULT now()

Primary Key: (bucket_id, name, level)

Triggers (2):
  1. prefixes_create_hierarchy (BEFORE INSERT)
  2. prefixes_delete_hierarchy (AFTER DELETE)
```

### 3.7 buckets_analytics (0 rows)
```sql
Table: storage.buckets_analytics
Purpose: Analytics bucket configuration
RLS: ✅ ENABLED
Size: 16 kB

Columns:
├── id                 text         PRIMARY KEY
├── type               buckettype   DEFAULT 'ANALYTICS'
├── format             text         DEFAULT 'ICEBERG'
├── created_at         timestamptz  DEFAULT now()
└── updated_at         timestamptz  DEFAULT now()

Note:
  - Specialized for analytics workloads
  - Iceberg table format support
```

---

## 4. Data Distribution Summary

### 4.1 By Row Count
```
Most Active:
  1. profiles: 18 rows (user base)
  2. idea_likes: 16 rows (engagement)
  3. ideas: 15 rows (content)
  4. user_achievements: 8 rows (gamification)
  5. comments: 7 rows (discussions)
  6. notifications: 6 rows (alerts)
  7. achievements: 5 rows (badges)
  8. comment_likes: 4 rows (engagement)

System:
  9. storage.migrations: 18 rows (version history)

Empty (9 tables):
  - Legacy: Account, Comments, posts
  - Features: follows, skills, user_skills
  - Challenges: challenges, challenge_winners
  - Experimental: idea_comments
  - Storage: All except migrations
```

### 4.2 By Storage Size
```
Largest Tables:
  1. ideas: 160 kB (content + metadata)
  2. idea_likes: 72 kB (engagement data)
  3. comment_likes: 72 kB (engagement data)
  4. comments: 64 kB (discussions)
  5. storage.objects: 64 kB (file metadata structure)
  6. user_achievements: 56 kB (gamification)

Medium Tables:
  7-11. profiles, achievements, notifications: 48 kB each
  12. storage.migrations: 40 kB

Small Tables:
  13-24. All others: 8-32 kB
```

### 4.3 Engagement Metrics
```
Content:
  - Ideas Posted: 15
  - Comments Written: 7
  - Comments per Idea: 0.47 avg

Engagement:
  - Idea Likes: 16
  - Comment Likes: 4
  - Total Likes: 20
  - Likes per Idea: 1.07 avg

Users:
  - Total Profiles: 18
  - Active Users: ~18 (all have data)
  - Premium Users: calculated from is_premium field
  - Onboarded Users: calculated from is_onboard field

Gamification:
  - Total Achievements: 5
  - Unlocked Achievements: 8
  - Avg Achievements per User: 0.44
  - Notifications Sent: 6
```

### 4.4 Feature Adoption
```
✅ Active Features (8):
  - User Profiles (18 users)
  - Ideas Platform (15 ideas)
  - Comments (7 comments)
  - Likes System (20 total likes)
  - Achievements (8 unlocked)
  - Notifications (6 sent)

⏸️ Planned Features (4):
  - Follows System (0 follows)
  - Skills System (0 skills)
  - Challenges (0 challenges)
  - Secondary Comments (0 idea_comments)

🗑️ Legacy Features (3):
  - Old Account System
  - Old Posts System
  - Old Comments System
```

---

## Critical Observations

### Data Integrity Issues
1. **No Cascade Deletes**
   - All FK constraints use RESTRICT or SET NULL
   - Deleting a user won't delete their content
   - Manual cleanup required

2. **Circular References**
   - Account ↔ posts (mutual FK)
   - Should be one-directional

3. **Orphan Risk**
   - No CASCADE on ideas, comments, likes
   - Deleted users leave orphaned data

### Performance Observations
1. **Good Index Coverage**
   - All PKs indexed
   - Foreign keys indexed
   - Common queries supported

2. **Missing Indexes**
   - No composite indexes for multi-column queries
   - follows table only has PK index

3. **Efficient Data Types**
   - UUID for distributed IDs
   - JSONB for flexible data (except legacy tables)
   - Arrays where appropriate

### Security Observations
1. **Good RLS Coverage**
   - 13/17 tables protected (76.5%)
   - Core features secured

2. **Unprotected Tables**
   - follows, skills, user_skills (4 tables)
   - No permission checks

3. **Legacy Security**
   - Old tables have RLS but unused
   - Password field in plaintext (Account.pwd)

---

**Document Complete** | Next: [Dependencies Analysis](./02_DEPENDENCIES_ANALYSIS.md)
