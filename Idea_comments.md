Idea Comments Feature Documentation
Overview

This document details the implementation of the Idea Comments feature in a React/Next.js application using Supabase as the backend. The feature includes:

Displaying comments for an idea.

Liking/unliking comments.

Showing whether the current user has liked a comment.

Deleting comments (visible only to the comment author).

Frontend
Components
IdeaComments.tsx

Props

interface Comment {
  id: string;
  initials: string;
  author: string; // User ID of comment author
  timeAgo: string;
  content: string;
  likes: number;
}

interface IdeaCommentsProps {
  comments: Comment[];
  currentUserId?: string; // Pass from parent component
}


Functionality

Render Comments:

Maps through comments and renders each comment with:

Avatar (initials)

Author name

Timestamp (timeAgo)

Content

Likes count

Like/Dislike buttons

Delete button (if comment.author === currentUserId)

Toggle Likes:

const handleLike = async (commentId: string) => {
  // Optimistic UI: increase like count
  // Call API: /api/comments/toggle-like
  // Update likes count with response from backend
};


Delete Comment:

const handleDelete = async (commentId: string) => {
  // Call API: /api/comments/delete?comment_id=<id>&author_id=<currentUserId>
  // Remove comment from UI on success
};


Fetch Liked Status:

On component mount, fetch which comments are liked by the current user from:
/api/comments/liked?comment_ids=<comma-separated-ids>

Updates UI to display filled ThumbsUpIcon if liked.

Like Icon Styling

Conditional rendering: filled if liked, outline if not.

Use fill="true" and style={{ color: "white", fill: "white" }} to display white color on fill.

Backend
Comments Table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  author UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Comment Likes Table
CREATE TABLE public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

API Endpoints
1. Toggle Like

Route: /api/comments/toggle-like
Method: POST
Query Parameter: comment_id=<uuid>

Functionality:

Calls PostgreSQL function toggle_comment_like(comment_id) which:

Checks if the user has already liked the comment.

Deletes like if already liked, otherwise inserts a new like.

Updates the likes count in the comments table.

Returns updated likes count.

2. Check Liked Comments

Route: /api/comments/liked
Method: GET
Query Parameter: comment_ids=<comma-separated-uuids>

Functionality:

Returns a mapping of comment IDs to true/false indicating whether the current user has liked each comment.

3. Delete Comment

Route: /api/comments/delete
Method: DELETE
Query Parameters:

comment_id=<uuid>

author_id=<uuid> (passed from frontend)

Functionality:

Deletes a comment only if the provided author_id matches the author of the comment in the database.

Returns success message if deleted.

Example Fetch Call from Frontend:

await fetch(`/api/comments/delete?comment_id=${commentId}&author_id=${currentUserId}`, {
  method: "DELETE",
});

Notes

Optimistic UI: Likes are incremented instantly on click and then confirmed with the backend.

Current User Handling: currentUserId is passed from the parent component to determine:

Visibility of the delete button.

Correct toggling of liked status.

Icons: Uses lucide-react for ThumbsUpIcon and ThumbsDownIcon.

Conditional Rendering:

Filled ThumbsUpIcon if liked by current user.

Delete button only visible for the author of the comment.