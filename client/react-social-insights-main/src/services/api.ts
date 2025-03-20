
import { toast } from "sonner";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

// API base URLs
const API_BASE_URL = "https://jsonplaceholder.typicode.com";

// Helper function for error handling
const handleApiError = (error: unknown, message = "Failed to fetch data") => {
  console.error(error);
  toast.error(message);
  return null;
};

// Fetch all users
export const fetchUsers = async (): Promise<User[] | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load users");
  }
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[] | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load posts");
  }
};

// Fetch all comments
export const fetchComments = async (): Promise<Comment[] | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load comments");
  }
};

// Fetch comments for a specific post
export const fetchCommentsForPost = async (postId: number): Promise<Comment[] | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleApiError(error, `Failed to load comments for post #${postId}`);
  }
};

// Placeholder image URLs
const placeholderImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
];

// Get a random placeholder image URL
export const getRandomPlaceholderImage = () => {
  const randomIndex = Math.floor(Math.random() * placeholderImages.length);
  return placeholderImages[randomIndex];
};
