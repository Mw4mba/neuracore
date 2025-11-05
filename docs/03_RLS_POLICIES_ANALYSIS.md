# Row Level Security (RLS) Policies Analysis
**Document:** 03 of 06  
**Generated:** November 5, 2025  
**Database:** NeuraCore (Supabase PostgreSQL)

---

## Table of Contents
1. [RLS Coverage Overview](#1-rls-coverage-overview)
2. [Policy Inventory](#2-policy-inventory)
3. [Security Model Analysis](#3-security-model-analysis)
4. [Duplicate Policies](#4-duplicate-policies)
5. [Missing Policies](#5-missing-policies)
6. [Policy Recommendations](#6-policy-recommendations)

---

## 1. RLS Coverage Overview

### 1.1 Protection Status
```
Total Tables: 24 (17 public + 7 storage)
RLS Enabled: 20 tables (83.3%)
RLS Disabled: 4 tables (16.7%)

Public Schema:
├── Protected: 13 tables (76.5%)
└── Unprotected: 4 tables (23.5%)

Storage Schema:
└── Protected: 7 tables (100%)

Total Policies: 40
├── Public Schema: 40 policies
└── Storage Schema: 0 policies (system-managed)
```

### 1.2 Unprotected Tables ⚠️
```sql
1. follows (0 rows)
   - RLS: ENABLED but NO POLICIES
   - Risk: Anyone can read/write all follows
   - Impact: Privacy breach, fake follows

2. skills (0 rows)
   - RLS: ENABLED but NO POLICIES
   - Risk: Anyone can modify skill catalog
   - Impact: Data integrity issues

3. user_skills (0 rows)
   - RLS: ENABLED but NO POLICIES
   - Risk: Anyone can modify user skills
   - Impact: Profile manipulation

4. challenges (0 rows)
   - RLS: ENABLED but NO POLICIES
   - Risk: Anyone can create/modify challenges
   - Impact: Platform abuse

5. challenge_winners (0 rows)
   - RLS: ENABLED but NO POLICIES
   - Risk: Anyone can declare winners
   - Impact: Fraudulent rewards

6. idea_comments (0 rows)
   - RLS: ENABLED but NO POLICIES
   - Risk: Anyone can read/write comments
   - Impact: Duplicate of comments table?
```

---

## 2. Policy Inventory

### 2.1 profiles (3 policies)

#### **Policy 1: public_select**
```sql
Policy: public_select
Table: profiles
Command: SELECT
Role: public
Using: true

Effect: Anyone can read all profiles
Use Case: Public profile browsing
Security: ✅ Appropriate for social platform
```

#### **Policy 2: users_insert_own**
```sql
Policy: users_insert_own
Table: profiles
Command: INSERT
Role: authenticated
Using: (SELECT auth.uid()) = id

Effect: Users can create their own profile
Use Case: User onboarding
Security: ✅ Prevents creating profiles for others
```

#### **Policy 3: users_update_own**
```sql
Policy: users_update_own
Table: profiles
Command: UPDATE
Role: authenticated
Using: (SELECT auth.uid()) = id

Effect: Users can update only their profile
Use Case: Profile editing
Security: ✅ Prevents unauthorized modifications
```

**Missing Policies:**
- ❌ DELETE policy (cannot delete profiles via SQL)
- Consider: Admin override policies

---

### 2.2 ideas (5 policies)

#### **Policy 1: Anyone can view ideas**
```sql
Policy: Anyone can view ideas
Table: ideas
Command: SELECT
Role: public
Using: true

Effect: Public read access to all ideas
Use Case: Browsing ideas feed
Security: ✅ Appropriate for content platform
```

#### **Policy 2: Authenticated users can create ideas**
```sql
Policy: Authenticated users can create ideas
Table: ideas
Command: INSERT
Role: authenticated
Using: true

Effect: Any logged-in user can post ideas
Use Case: Content creation
Security: ✅ Prevents anonymous posting
Note: No ownership check (user can set any author)
```

#### **Policy 3: Users can delete their own ideas**
```sql
Policy: Users can delete their own ideas
Table: ideas
Command: DELETE
Role: authenticated
Using: (SELECT auth.uid()) = author

Effect: Users can delete only their ideas
Use Case: Content management
Security: ✅ Ownership-based deletion
```

#### **Policy 4: Users can update their own ideas**
```sql
Policy: Users can update their own ideas
Table: ideas
Command: UPDATE
Role: authenticated
Using: (SELECT auth.uid()) = author

Effect: Users can edit only their ideas
Use Case: Content editing
Security: ✅ Ownership-based updates
```

#### **Policy 5: authenticated_insert_ideas**
```sql
Policy: authenticated_insert_ideas
Table: ideas
Command: INSERT
Role: authenticated
Check: (SELECT auth.uid()) = author

Effect: Duplicate of Policy 2 with CHECK clause
Use Case: Same as Policy 2
Security: ⚠️ DUPLICATE - should be merged
Note: CHECK ensures author matches auth.uid()
```

**Issues:**
- 🔁 Duplicate INSERT policies (#2 and #5)
- ⚠️ Policy #2 has no CHECK clause (can set wrong author)
- ✅ Policy #5 enforces author = auth.uid()

**Recommendation:**
```sql
-- Remove duplicate
DROP POLICY "Authenticated users can create ideas" ON ideas;

-- Keep the one with CHECK clause
-- Rename for clarity
ALTER POLICY "authenticated_insert_ideas" ON ideas
  RENAME TO "users_insert_own_ideas";
```

---

### 2.3 comments (4 policies)

#### **Policy 1: Anyone can view comments**
```sql
Policy: Anyone can view comments
Table: comments
Command: SELECT
Role: public
Using: true

Effect: Public read access to all comments
Use Case: Viewing discussions
Security: ✅ Appropriate for public content
```

#### **Policy 2: Authenticated users can create comments**
```sql
Policy: Authenticated users can create comments
Table: comments
Command: INSERT
Role: authenticated
Check: (SELECT auth.uid()) = author

Effect: Users can comment, must be author
Use Case: Posting comments
Security: ✅ Enforces ownership
```

#### **Policy 3: Users can delete their own comments**
```sql
Policy: Users can delete their own comments
Table: comments
Command: DELETE
Role: authenticated
Using: (SELECT auth.uid()) = author

Effect: Users can delete only their comments
Use Case: Comment management
Security: ✅ Ownership-based deletion
```

#### **Policy 4: Users can update their own comments**
```sql
Policy: Users can update their own comments
Table: comments
Command: UPDATE
Role: authenticated
Using: (SELECT auth.uid()) = author

Effect: Users can edit only their comments
Use Case: Comment editing
Security: ✅ Ownership-based updates
```

**Status:** ✅ Complete and correct

---

### 2.4 idea_likes (6 policies) ⚠️ DUPLICATES

#### **Policy 1: public_select**
```sql
Policy: public_select
Table: idea_likes
Command: SELECT
Role: public
Using: true

Effect: Anyone can see all likes
Use Case: Displaying like counts
Security: ✅ Appropriate for social engagement
```

#### **Policy 2: Public can view likes** 🔁 DUPLICATE
```sql
Policy: Public can view likes
Table: idea_likes
Command: SELECT
Role: public
Using: true

Effect: Same as Policy 1
Security: ⚠️ DUPLICATE of public_select
```

#### **Policy 3: authenticated_insert**
```sql
Policy: authenticated_insert
Table: idea_likes
Command: INSERT
Role: authenticated
Check: (SELECT auth.uid()) = user_id

Effect: Users can like as themselves
Use Case: Liking ideas
Security: ✅ Prevents fake likes
```

#### **Policy 4: Authenticated users can like ideas** 🔁 DUPLICATE
```sql
Policy: Authenticated users can like ideas
Table: idea_likes
Command: INSERT
Role: authenticated
Check: (SELECT auth.uid()) = user_id

Effect: Same as Policy 3
Security: ⚠️ DUPLICATE of authenticated_insert
```

#### **Policy 5: authenticated_delete_own**
```sql
Policy: authenticated_delete_own
Table: idea_likes
Command: DELETE
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Users can unlike their own likes
Use Case: Unliking ideas
Security: ✅ Ownership-based deletion
```

#### **Policy 6: Users can delete their own likes** 🔁 DUPLICATE
```sql
Policy: Users can delete their own likes
Table: idea_likes
Command: DELETE
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Same as Policy 5
Security: ⚠️ DUPLICATE of authenticated_delete_own
```

**Issues:**
- 🔁 3 pairs of duplicate policies
- ⚠️ Multiple SELECT policies (redundant)
- ⚠️ Multiple INSERT policies (redundant)
- ⚠️ Multiple DELETE policies (redundant)

**Cleanup Required:**
```sql
-- Remove duplicates (keep shorter names)
DROP POLICY "Public can view likes" ON idea_likes;
DROP POLICY "Authenticated users can like ideas" ON idea_likes;
DROP POLICY "Users can delete their own likes" ON idea_likes;

-- Keep these:
-- ✅ public_select
-- ✅ authenticated_insert
-- ✅ authenticated_delete_own
```

---

### 2.5 comment_likes (3 policies)

#### **Policy 1: public_select**
```sql
Policy: public_select
Table: comment_likes
Command: SELECT
Role: public
Using: true

Effect: Anyone can see comment likes
Use Case: Displaying like counts
Security: ✅ Appropriate
```

#### **Policy 2: authenticated_insert**
```sql
Policy: authenticated_insert
Table: comment_likes
Command: INSERT
Role: authenticated
Check: (SELECT auth.uid()) = user_id

Effect: Users can like comments as themselves
Use Case: Liking comments
Security: ✅ Prevents fake likes
```

#### **Policy 3: authenticated_delete_own**
```sql
Policy: authenticated_delete_own
Table: comment_likes
Command: DELETE
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Users can unlike their comment likes
Use Case: Unliking comments
Security: ✅ Ownership-based deletion
```

**Status:** ✅ Complete and correct (no duplicates)

---

### 2.6 achievements (6 policies) ⚠️ DUPLICATES

#### **Policy 1: public_select**
```sql
Policy: public_select
Table: achievements
Command: SELECT
Role: public
Using: true

Effect: Anyone can view achievement catalog
Use Case: Displaying available achievements
Security: ✅ Appropriate
```

#### **Policy 2: Public can view achievements** 🔁 DUPLICATE
```sql
Policy: Public can view achievements
Table: achievements
Command: SELECT
Role: public
Using: true

Effect: Same as Policy 1
Security: ⚠️ DUPLICATE of public_select
```

#### **Policy 3: admin_insert**
```sql
Policy: admin_insert
Table: achievements
Command: INSERT
Role: authenticated
Using: (
  SELECT role FROM profiles 
  WHERE id = auth.uid()
) = 'admin'

Effect: Only admins can create achievements
Use Case: Achievement catalog management
Security: ✅ Admin-only access
```

#### **Policy 4: Only admins can create achievements** 🔁 DUPLICATE
```sql
Policy: Only admins can create achievements
Table: achievements
Command: INSERT
Role: authenticated
Using: (
  SELECT role FROM profiles 
  WHERE id = auth.uid()
) = 'admin'

Effect: Same as Policy 3
Security: ⚠️ DUPLICATE of admin_insert
```

#### **Policy 5: admin_update**
```sql
Policy: admin_update
Table: achievements
Command: UPDATE
Role: authenticated
Using: (
  SELECT role FROM profiles 
  WHERE id = auth.uid()
) = 'admin'

Effect: Only admins can update achievements
Use Case: Editing achievement catalog
Security: ✅ Admin-only access
```

#### **Policy 6: Only admins can update achievements** 🔁 DUPLICATE
```sql
Policy: Only admins can update achievements
Table: achievements
Command: UPDATE
Role: authenticated
Using: (
  SELECT role FROM profiles 
  WHERE id = auth.uid()
) = 'admin'

Effect: Same as Policy 5
Security: ⚠️ DUPLICATE of admin_update
```

**Issues:**
- 🔁 3 pairs of duplicate policies
- ❌ No DELETE policy (admins can't delete achievements)

**Cleanup Required:**
```sql
-- Remove duplicates
DROP POLICY "Public can view achievements" ON achievements;
DROP POLICY "Only admins can create achievements" ON achievements;
DROP POLICY "Only admins can update achievements" ON achievements;

-- Add missing DELETE policy
CREATE POLICY "admin_delete" ON achievements
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

### 2.7 user_achievements (5 policies)

#### **Policy 1: Users can view their own achievements**
```sql
Policy: Users can view their own achievements
Table: user_achievements
Command: SELECT
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Users see only their achievements
Use Case: Profile achievement display
Security: ⚠️ Too restrictive (can't see others' achievements)
```

#### **Policy 2: Public can view all achievements** 
```sql
Policy: Public can view all achievements
Table: user_achievements
Command: SELECT
Role: public
Using: true

Effect: Anyone can see all unlocked achievements
Use Case: Public profile viewing
Security: ✅ Good for social gamification
Note: Conflicts with Policy 1 (redundant)
```

#### **Policy 3: System can award achievements**
```sql
Policy: System can award achievements
Table: user_achievements
Command: INSERT
Role: authenticated
Check: (SELECT auth.uid()) = user_id

Effect: Users can insert their own achievements
Use Case: Achievement unlocking
Security: ⚠️ CRITICAL FLAW - users can self-award
Problem: No admin check, anyone can give themselves achievements
```

#### **Policy 4: Admins can award achievements**
```sql
Policy: Admins can award achievements
Table: user_achievements
Command: INSERT
Role: authenticated
Check: (
  SELECT role FROM profiles 
  WHERE id = auth.uid()
) = 'admin'

Effect: Admins can award achievements to anyone
Use Case: Manual achievement granting
Security: ✅ Admin-only
Note: Redundant with Policy 3 if using triggers
```

#### **Policy 5: Users can view own achievements** 🔁 DUPLICATE
```sql
Policy: Users can view own achievements
Table: user_achievements
Command: SELECT
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Same as Policy 1
Security: ⚠️ DUPLICATE
```

**Critical Issues:**
- 🔴 Policy 3 allows self-awarding achievements
- 🔁 Duplicate SELECT policies (#1 and #5)
- ⚠️ Conflicting SELECT policies (own vs public)
- ❌ No DELETE policy

**Fix Required:**
```sql
-- Remove duplicates
DROP POLICY "Users can view own achievements" ON user_achievements;

-- Fix self-awarding vulnerability
DROP POLICY "System can award achievements" ON user_achievements;

-- Create proper trigger-based INSERT (no direct INSERT allowed)
CREATE POLICY "no_direct_insert" ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Only allow via trigger or admin
CREATE POLICY "admin_award_achievements" ON user_achievements
  FOR INSERT
  TO authenticated
  CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Keep public view
-- ✅ "Public can view all achievements" is correct
```

---

### 2.8 notifications (7 policies) ⚠️ DUPLICATES

#### **Policy 1: Users can view their own notifications**
```sql
Policy: Users can view their own notifications
Table: notifications
Command: SELECT
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Users see only their notifications
Use Case: Notification center
Security: ✅ Privacy-preserving
```

#### **Policy 2: Users can view own notifications** 🔁 DUPLICATE
```sql
Policy: Users can view own notifications
Table: notifications
Command: SELECT
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Same as Policy 1
Security: ⚠️ DUPLICATE
```

#### **Policy 3: Authenticated users can view their notifications** 🔁 DUPLICATE
```sql
Policy: Authenticated users can view their notifications
Table: notifications
Command: SELECT
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Same as Policy 1
Security: ⚠️ DUPLICATE
```

#### **Policy 4: System can create notifications**
```sql
Policy: System can create notifications
Table: notifications
Command: INSERT
Role: authenticated
Check: true

Effect: Any authenticated user can create any notification
Use Case: Notification system
Security: 🔴 CRITICAL FLAW - no user_id check
Problem: Users can create fake notifications for others
```

#### **Policy 5: Authenticated users can insert notifications** 🔁 DUPLICATE
```sql
Policy: Authenticated users can insert notifications
Table: notifications
Command: INSERT
Role: authenticated
Check: true

Effect: Same as Policy 4
Security: 🔴 DUPLICATE + CRITICAL FLAW
```

#### **Policy 6: Users can update their own notifications**
```sql
Policy: Users can update their own notifications
Table: notifications
Command: UPDATE
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Users can update only their notifications
Use Case: Marking as read
Security: ✅ Ownership-based
```

#### **Policy 7: Users can delete their own notifications**
```sql
Policy: Users can delete their own notifications
Table: notifications
Command: DELETE
Role: authenticated
Using: (SELECT auth.uid()) = user_id

Effect: Users can delete only their notifications
Use Case: Notification cleanup
Security: ✅ Ownership-based
```

**Critical Issues:**
- 🔴 Policies 4 & 5 allow creating fake notifications
- 🔁 3 duplicate SELECT policies (#1, #2, #3)
- 🔁 2 duplicate INSERT policies (#4, #5)

**Fix Required:**
```sql
-- Remove all duplicates
DROP POLICY "Users can view own notifications" ON notifications;
DROP POLICY "Authenticated users can view their notifications" ON notifications;
DROP POLICY "Authenticated users can insert notifications" ON notifications;

-- Remove vulnerable INSERT policies
DROP POLICY "System can create notifications" ON notifications;

-- Create secure INSERT policy (trigger-only)
CREATE POLICY "no_direct_insert" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Notifications should only be created via triggers
-- notify_on_idea_like(), notify_on_comment(), notify_on_comment_like()
```

---

### 2.9 Legacy Tables (RLS Enabled but Unused)

#### **Account (RLS enabled, 0 rows)**
```sql
No policies defined
Table is empty
Action: Delete table
```

#### **posts (RLS enabled, 0 rows)**
```sql
No policies defined
Table is empty
Action: Delete table
```

#### **Comments (RLS enabled, 0 rows)**
```sql
No policies defined
Table is empty
Action: Delete table
```

---

## 3. Security Model Analysis

### 3.1 Permission Patterns

#### **Public Read Pattern** (6 tables)
```sql
Tables: profiles, ideas, comments, idea_likes, comment_likes, achievements

Pattern:
  CREATE POLICY "public_select" ON [table]
    FOR SELECT TO public
    USING (true);

Use Case: Social platform with public content
Security: ✅ Appropriate for public-facing data
Privacy: Users know content is public
```

#### **Ownership Pattern** (4 tables)
```sql
Tables: profiles, ideas, comments, user_achievements (partial)

Pattern:
  CREATE POLICY "users_update_own" ON [table]
    FOR UPDATE TO authenticated
    USING (auth.uid() = [owner_column]);

Use Case: User-editable content
Security: ✅ Prevents unauthorized modifications
Implementation: Consistent across tables
```

#### **Admin-Only Pattern** (1 table)
```sql
Tables: achievements

Pattern:
  CREATE POLICY "admin_insert" ON [table]
    FOR INSERT TO authenticated
    USING (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

Use Case: Platform configuration
Security: ✅ Role-based access control
Performance: ⚠️ Subquery on every operation
```

#### **Engagement Pattern** (2 tables)
```sql
Tables: idea_likes, comment_likes

Pattern:
  - Public SELECT (anyone sees likes)
  - Authenticated INSERT (users can like)
  - Authenticated DELETE own (users can unlike)
  - No UPDATE (likes are immutable)

Security: ✅ Prevents like manipulation
Privacy: Public like counts
```

### 3.2 Authentication Checks

#### **Direct Auth Check** (Most policies)
```sql
Pattern: (SELECT auth.uid()) = [column]

Performance: ⚡ Fast (no table join)
Security: ✅ Direct user ID comparison
Used In: All ownership checks
```

#### **Role-Based Check** (Admin policies)
```sql
Pattern: 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'

Performance: ⚠️ Requires table join
Security: ✅ Role verification
Cache: Consider caching role in JWT claims
Optimization:
  -- Instead, store role in JWT custom claims
  auth.jwt()->>'role' = 'admin'
```

### 3.3 Policy Effectiveness

#### **Strong Protection** (3 tables)
```
✅ comments: Complete CRUD policies
✅ comment_likes: Complete policies (no duplicates)
✅ profiles: Appropriate policies for use case
```

#### **Good Protection with Issues** (3 tables)
```
⚠️ ideas: Duplicate INSERT policies
⚠️ idea_likes: 3 duplicate policy pairs
⚠️ achievements: 3 duplicate policy pairs
```

#### **Vulnerable** (2 tables)
```
🔴 user_achievements: Self-awarding exploit
🔴 notifications: Fake notification exploit
```

#### **Unprotected** (6 tables)
```
❌ follows: No policies
❌ skills: No policies
❌ user_skills: No policies
❌ challenges: No policies
❌ challenge_winners: No policies
❌ idea_comments: No policies
```

---

## 4. Duplicate Policies

### 4.1 Complete Duplicates

#### **idea_likes (3 duplicates)**
```sql
1. "public_select" + "Public can view likes"
2. "authenticated_insert" + "Authenticated users can like ideas"
3. "authenticated_delete_own" + "Users can delete their own likes"

Cleanup:
  DROP POLICY "Public can view likes" ON idea_likes;
  DROP POLICY "Authenticated users can like ideas" ON idea_likes;
  DROP POLICY "Users can delete their own likes" ON idea_likes;
```

#### **achievements (3 duplicates)**
```sql
1. "public_select" + "Public can view achievements"
2. "admin_insert" + "Only admins can create achievements"
3. "admin_update" + "Only admins can update achievements"

Cleanup:
  DROP POLICY "Public can view achievements" ON achievements;
  DROP POLICY "Only admins can create achievements" ON achievements;
  DROP POLICY "Only admins can update achievements" ON achievements;
```

#### **notifications (4 duplicates)**
```sql
1. "Users can view their own notifications" (original)
2. "Users can view own notifications" (duplicate)
3. "Authenticated users can view their notifications" (duplicate)

4. "System can create notifications" (original)
5. "Authenticated users can insert notifications" (duplicate)

Cleanup:
  DROP POLICY "Users can view own notifications" ON notifications;
  DROP POLICY "Authenticated users can view their notifications" ON notifications;
  DROP POLICY "Authenticated users can insert notifications" ON notifications;
```

#### **user_achievements (1 duplicate)**
```sql
1. "Users can view their own achievements" (original)
2. "Users can view own achievements" (duplicate)

Cleanup:
  DROP POLICY "Users can view own achievements" ON user_achievements;
```

### 4.2 Cleanup SQL Script
```sql
-- idea_likes duplicates
DROP POLICY IF EXISTS "Public can view likes" ON idea_likes;
DROP POLICY IF EXISTS "Authenticated users can like ideas" ON idea_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON idea_likes;

-- achievements duplicates
DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
DROP POLICY IF EXISTS "Only admins can create achievements" ON achievements;
DROP POLICY IF EXISTS "Only admins can update achievements" ON achievements;

-- notifications duplicates
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

-- user_achievements duplicates
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;

-- ideas duplicates
DROP POLICY IF EXISTS "Authenticated users can create ideas" ON ideas;

-- Total: 11 duplicate policies removed
```

---

## 5. Missing Policies

### 5.1 Critical Missing Policies

#### **follows** ⚠️ ZERO POLICIES
```sql
Required Policies:

-- Anyone can view follows (for public profiles)
CREATE POLICY "public_view_follows" ON follows
  FOR SELECT TO public
  USING (true);

-- Users can follow others
CREATE POLICY "users_can_follow" ON follows
  FOR INSERT TO authenticated
  CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "users_can_unfollow" ON follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- No UPDATE needed (immutable relationship)
```

#### **skills** ⚠️ ZERO POLICIES
```sql
Required Policies:

-- Anyone can view skills catalog
CREATE POLICY "public_view_skills" ON skills
  FOR SELECT TO public
  USING (true);

-- Only admins can create skills
CREATE POLICY "admin_create_skills" ON skills
  FOR INSERT TO authenticated
  CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can update skills
CREATE POLICY "admin_update_skills" ON skills
  FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can delete skills
CREATE POLICY "admin_delete_skills" ON skills
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

#### **user_skills** ⚠️ ZERO POLICIES
```sql
Required Policies:

-- Users can view all skills (for profile browsing)
CREATE POLICY "public_view_user_skills" ON user_skills
  FOR SELECT TO public
  USING (true);

-- Users can add their own skills
CREATE POLICY "users_add_own_skills" ON user_skills
  FOR INSERT TO authenticated
  CHECK (auth.uid() = user_id);

-- Users can update their skill proficiency
CREATE POLICY "users_update_own_skills" ON user_skills
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can remove their skills
CREATE POLICY "users_delete_own_skills" ON user_skills
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

#### **challenges** ⚠️ ZERO POLICIES
```sql
Required Policies:

-- Anyone can view active challenges
CREATE POLICY "public_view_challenges" ON challenges
  FOR SELECT TO public
  USING (true);

-- Authenticated users can create challenges
CREATE POLICY "users_create_challenges" ON challenges
  FOR INSERT TO authenticated
  CHECK (auth.uid() = author);

-- Users can update their own challenges
CREATE POLICY "users_update_own_challenges" ON challenges
  FOR UPDATE TO authenticated
  USING (auth.uid() = author);

-- Users can delete their own challenges
CREATE POLICY "users_delete_own_challenges" ON challenges
  FOR DELETE TO authenticated
  USING (auth.uid() = author);
```

#### **challenge_winners** ⚠️ ZERO POLICIES
```sql
Required Policies:

-- Anyone can view winners (public leaderboard)
CREATE POLICY "public_view_winners" ON challenge_winners
  FOR SELECT TO public
  USING (true);

-- Only challenge authors can declare winners
CREATE POLICY "authors_declare_winners" ON challenge_winners
  FOR INSERT TO authenticated
  CHECK (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE id = challenge_id AND author = auth.uid()
    )
  );

-- Only challenge authors can update winners
CREATE POLICY "authors_update_winners" ON challenge_winners
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE id = challenge_id AND author = auth.uid()
    )
  );

-- Only challenge authors can remove winners
CREATE POLICY "authors_delete_winners" ON challenge_winners
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE id = challenge_id AND author = auth.uid()
    )
  );
```

#### **idea_comments** ⚠️ ZERO POLICIES
```sql
Note: This table duplicates 'comments' functionality
Action: Delete table OR add policies

If keeping table:

-- Anyone can view comments
CREATE POLICY "public_view_idea_comments" ON idea_comments
  FOR SELECT TO public
  USING (true);

-- Users can create comments
CREATE POLICY "users_create_idea_comments" ON idea_comments
  FOR INSERT TO authenticated
  CHECK (auth.uid() = author);

-- Users can update own comments
CREATE POLICY "users_update_own_idea_comments" ON idea_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = author);

-- Users can delete own comments
CREATE POLICY "users_delete_own_idea_comments" ON idea_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = author);
```

### 5.2 Minor Missing Policies

#### **profiles - No DELETE policy**
```sql
-- Prevent direct deletion (use soft deletes instead)
CREATE POLICY "no_direct_delete" ON profiles
  FOR DELETE TO authenticated
  USING (false);

-- Or allow self-deletion
CREATE POLICY "users_delete_own_profile" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);
```

#### **achievements - No DELETE policy**
```sql
-- Only admins can delete achievements
CREATE POLICY "admin_delete_achievements" ON achievements
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

## 6. Policy Recommendations

### 6.1 Immediate Actions (Critical)

#### **1. Remove Duplicate Policies**
```sql
-- Run cleanup script (see Section 4.2)
-- Reduces policy count from 40 to 29
```

#### **2. Fix Security Vulnerabilities**
```sql
-- Fix user_achievements self-awarding
DROP POLICY "System can award achievements" ON user_achievements;
CREATE POLICY "no_direct_insert" ON user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- Fix notifications fake creation
DROP POLICY "System can create notifications" ON notifications;
CREATE POLICY "trigger_only_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (false);
```

#### **3. Add Missing Policies to Active Tables**
```sql
-- Add policies to follows (see Section 5.1)
-- Add policies to skills (see Section 5.1)
-- Add policies to user_skills (see Section 5.1)
```

### 6.2 Short-term Improvements

#### **1. Optimize Admin Checks**
```sql
-- Current: Subquery on every request
(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'

-- Better: Store in JWT custom claims
-- In Supabase Auth Hook:
{
  "role": "admin",  // from profiles.role
  "is_premium": true
}

-- In policies:
auth.jwt()->>'role' = 'admin'
```

#### **2. Add Soft Delete Support**
```sql
-- Add to profiles
ALTER TABLE profiles ADD COLUMN deleted_at timestamptz;

-- Update all SELECT policies
CREATE POLICY "public_view_active_profiles" ON profiles
  FOR SELECT TO public
  USING (deleted_at IS NULL);
```

#### **3. Standardize Policy Names**
```sql
-- Current: Mixed naming styles
-- "public_select", "Public can view likes", "users_insert_own"

-- Standardize to:
-- "[role]_[action]_[scope]"
-- Examples:
-- "public_select_all"
-- "authenticated_insert_own"
-- "admin_delete_any"
```

### 6.3 Long-term Enhancements

#### **1. Implement Policy Templates**
```sql
-- Create reusable policy functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin';
$$ LANGUAGE sql SECURITY DEFINER;

-- Use in policies
CREATE POLICY "admin_create" ON achievements
  FOR INSERT TO authenticated
  CHECK (is_admin());
```

#### **2. Add Audit Logging**
```sql
-- Log all policy violations
CREATE TABLE policy_violations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  table_name text,
  operation text,
  attempted_at timestamptz DEFAULT now()
);

-- Implement in policies with CHECK clauses
```

#### **3. Add Rate Limiting**
```sql
-- Prevent abuse of INSERT operations
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_id uuid,
  action text,
  limit_count int,
  time_window interval
)
RETURNS boolean AS $$
  SELECT COUNT(*) < limit_count
  FROM [action_log_table]
  WHERE user_id = $1
    AND action = $2
    AND created_at > now() - $4;
$$ LANGUAGE sql;

-- Use in INSERT policies
CREATE POLICY "rate_limited_insert" ON ideas
  FOR INSERT TO authenticated
  CHECK (
    auth.uid() = author AND
    check_rate_limit(auth.uid(), 'create_idea', 10, '1 hour'::interval)
  );
```

---

## Summary

### Current State
```
Total Policies: 40
├── Valid: 24 (60%)
├── Duplicates: 11 (27.5%)
└── Vulnerable: 5 (12.5%)

Coverage:
├── Fully Protected: 3 tables (12.5%)
├── Partially Protected: 7 tables (29%)
└── Unprotected: 6 tables (25%)
```

### Actions Required

**Critical (Do Immediately):**
1. Remove 11 duplicate policies
2. Fix user_achievements self-awarding vulnerability
3. Fix notifications fake creation vulnerability
4. Add policies to follows, skills, user_skills

**Important (This Sprint):**
5. Remove or add policies to idea_comments (duplicate table?)
6. Add DELETE policy to achievements (admin-only)
7. Optimize admin checks (JWT claims)

**Nice to Have (Future):**
8. Standardize policy naming
9. Add soft delete support
10. Implement policy templates
11. Add rate limiting

---

**Document Complete** | Next: [Indexes & Performance Analysis](./04_INDEXES_PERFORMANCE_ANALYSIS.md)
