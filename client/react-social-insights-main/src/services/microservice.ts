
import { User, Post, Comment, fetchUsers, fetchPosts, fetchComments } from './api';
import { toast } from "sonner";

// Cache for microservice data with expiration
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class MicroserviceAPI {
  private cache: {
    topFiveUsers?: CacheItem<User[]>;
    popularPosts?: CacheItem<Post[]>;
    latestPosts?: CacheItem<Post[]>;
    users?: CacheItem<User[]>;
    posts?: CacheItem<Post[]>;
    comments?: CacheItem<Comment[]>;
  } = {};
  
  private cacheTTL = 30000; // 30 seconds cache TTL by default
  
  // Fetch and cache raw data from test server API
  private async fetchAndCacheUsers(): Promise<User[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.users && (now - this.cache.users.timestamp < this.cacheTTL)) {
      return this.cache.users.data;
    }
    
    // Fetch fresh data
    const users = await fetchUsers();
    if (users) {
      this.cache.users = { data: users, timestamp: now };
      return users;
    }
    
    // Return empty array if fetch failed
    return [];
  }
  
  private async fetchAndCachePosts(): Promise<Post[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.posts && (now - this.cache.posts.timestamp < this.cacheTTL)) {
      return this.cache.posts.data;
    }
    
    // Fetch fresh data
    const posts = await fetchPosts();
    if (posts) {
      this.cache.posts = { data: posts, timestamp: now };
      return posts;
    }
    
    // Return empty array if fetch failed
    return [];
  }
  
  private async fetchAndCacheComments(): Promise<Comment[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.comments && (now - this.cache.comments.timestamp < this.cacheTTL)) {
      return this.cache.comments.data;
    }
    
    // Fetch fresh data
    const comments = await fetchComments();
    if (comments) {
      this.cache.comments = { data: comments, timestamp: now };
      return comments;
    }
    
    // Return empty array if fetch failed
    return [];
  }
  
  // Fetch top 5 users with highest post count
  async getTopFiveUsers(): Promise<User[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.topFiveUsers && (now - this.cache.topFiveUsers.timestamp < this.cacheTTL)) {
      return this.cache.topFiveUsers.data;
    }
    
    try {
      // Fetch required data
      const [users, posts] = await Promise.all([
        this.fetchAndCacheUsers(),
        this.fetchAndCachePosts()
      ]);
      
      // Calculate post counts and sort
      const userPostCounts = users.map(user => {
        const userPosts = posts.filter(post => post.userId === user.id);
        return {
          user,
          postCount: userPosts.length
        };
      });
      
      // Sort by post count in descending order
      const sortedUsers = [...userPostCounts]
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 5) // Get top 5
        .map(item => item.user);
      
      // Cache results
      this.cache.topFiveUsers = { data: sortedUsers, timestamp: now };
      
      return sortedUsers;
    } catch (error) {
      console.error("Error fetching top five users:", error);
      toast.error("Failed to fetch top users data");
      return [];
    }
  }
  
  // Fetch posts with type parameter
  async getLatestPosts(type: 'popular' | 'latest'): Promise<Post[]> {
    const now = Date.now();
    const cacheKey = type === 'popular' ? 'popularPosts' : 'latestPosts';
    
    // Return cached data if still valid
    if (this.cache[cacheKey] && (now - this.cache[cacheKey]!.timestamp < this.cacheTTL)) {
      return this.cache[cacheKey]!.data;
    }
    
    try {
      if (type === 'popular') {
        // Fetch popular posts (with highest comment count)
        const [posts, comments] = await Promise.all([
          this.fetchAndCachePosts(),
          this.fetchAndCacheComments()
        ]);
        
        // Calculate comment counts for each post
        const postWithCommentCounts = posts.map(post => {
          const postComments = comments.filter(comment => comment.postId === post.id);
          return {
            ...post,
            commentCount: postComments.length
          };
        });
        
        // Sort by comment count in descending order
        const sortedPosts = [...postWithCommentCounts].sort((a, b) => b.commentCount - a.commentCount);
        
        // Find the highest comment count
        const highestCommentCount = sortedPosts.length > 0 ? sortedPosts[0].commentCount : 0;
        
        // Get all posts with the highest comment count
        const popularPosts = sortedPosts
          .filter(post => post.commentCount === highestCommentCount)
          .map(({ commentCount, ...post }) => post); // Remove the added commentCount property
        
        // Cache results
        this.cache.popularPosts = { data: popularPosts, timestamp: now };
        
        return popularPosts;
      } else {
        // Fetch latest posts
        const posts = await this.fetchAndCachePosts();
        
        // Sort posts by ID in descending order (assuming newer posts have higher IDs)
        const latestPosts = [...posts]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5); // Get latest 5
        
        // Cache results
        this.cache.latestPosts = { data: latestPosts, timestamp: now };
        
        return latestPosts;
      }
    } catch (error) {
      console.error(`Error fetching ${type} posts:`, error);
      toast.error(`Failed to fetch ${type} posts data`);
      return [];
    }
  }
  
  // Force refresh all cached data
  async refreshAllData(): Promise<void> {
    try {
      // Clear cache timestamps to force new fetches
      Object.keys(this.cache).forEach(key => {
        const cacheKey = key as keyof typeof this.cache;
        if (this.cache[cacheKey]) {
          this.cache[cacheKey]!.timestamp = 0;
        }
      });
      
      // Fetch all data types
      await Promise.all([
        this.getTopFiveUsers(),
        this.getLatestPosts('latest'),
        this.getLatestPosts('popular')
      ]);
      
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  }
  
  // Set custom cache TTL
  setCacheTTL(milliseconds: number): void {
    this.cacheTTL = milliseconds;
  }
}

// Export singleton instance
export const microserviceAPI = new MicroserviceAPI();
