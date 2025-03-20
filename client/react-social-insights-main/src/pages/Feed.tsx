
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { microserviceAPI } from '../services/microservice';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../components/posts/PostCard';
import PageTransition from '../components/layout/PageTransition';

const INITIAL_POSTS_COUNT = 6; // Number of posts to load initially
const POSTS_PER_LOAD = 3; // Number of posts to load on each scroll

const Feed = () => {
  const { users, comments, loading: generalLoading, refetchData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visiblePostsCount, setVisiblePostsCount] = useState(INITIAL_POSTS_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Fetch latest posts using microservice endpoint
  const { 
    data: latestPosts = [], 
    isLoading,
    error,
    refetch: refetchLatestPosts
  } = useQuery({
    queryKey: ['latestPosts'],
    queryFn: () => microserviceAPI.getLatestPosts('latest'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Use either specific loading state or general loading state
  const loading = isLoading || (generalLoading && latestPosts.length === 0);

  // Create current visible posts slice
  const visiblePosts = latestPosts.slice(0, visiblePostsCount);
  
  // Function to load more posts
  const loadMorePosts = useCallback(() => {
    if (visiblePostsCount < latestPosts.length && !isLoadingMore) {
      setIsLoadingMore(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setVisiblePostsCount(prev => Math.min(prev + POSTS_PER_LOAD, latestPosts.length));
        setIsLoadingMore(false);
      }, 500);
    }
  }, [visiblePostsCount, latestPosts.length, isLoadingMore]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!loaderRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMorePosts, loading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Reset visible posts count
    setVisiblePostsCount(INITIAL_POSTS_COUNT);
    
    // Refresh microservice data
    Promise.all([
      refetchLatestPosts(),
      refetchData()
    ]).finally(() => {
      // Simulate refresh duration for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    });
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Feed</h1>
            <p className="text-muted-foreground mt-1">
              Latest posts from our community
            </p>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="bg-card border rounded-xl overflow-hidden shadow-sm h-[400px] animate-pulse"
              >
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {visiblePosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 staggered-fade-in">
                {visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    userId={post.userId}
                    title={post.title}
                    body={post.body}
                    users={users}
                    comments={comments}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium">No posts found</h3>
                <p className="text-muted-foreground mt-2">
                  There are no posts to display right now.
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Refresh Feed
                </button>
              </div>
            )}
            
            {/* Loading indicator and intersection observer trigger */}
            {visiblePostsCount < latestPosts.length && (
              <div 
                ref={loaderRef} 
                className="mt-8 pb-6 flex justify-center"
              >
                <div className={`h-8 w-8 rounded-full border-2 border-primary border-t-transparent ${isLoadingMore ? 'animate-spin' : ''}`}></div>
              </div>
            )}
            
            {/* End of feed indicator */}
            {visiblePostsCount >= latestPosts.length && latestPosts.length > 0 && (
              <div className="text-center mt-8 py-6">
                <p className="text-muted-foreground">You've reached the end of the feed</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Feed;
