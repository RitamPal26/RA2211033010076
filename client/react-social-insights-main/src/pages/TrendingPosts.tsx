
import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart, MessageSquare, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { microserviceAPI } from '../services/microservice';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../components/posts/PostCard';
import PageTransition from '../components/layout/PageTransition';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from '../components/ui/pagination';

const POSTS_PER_PAGE = 3; // Set the number of posts to display per page

const TrendingPosts = () => {
  const { users, comments, loading: generalLoading, refetchData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedPosts, setPaginatedPosts] = useState<any[]>([]);
  
  // Fetch popular posts using microservice endpoint
  const { 
    data: allTrendingPosts = [], 
    isLoading,
    error,
    refetch: refetchTrendingPosts
  } = useQuery({
    queryKey: ['popularPosts'],
    queryFn: () => microserviceAPI.getLatestPosts('popular'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Use either specific loading state or general loading state
  const loading = isLoading || generalLoading;
  
  // Calculate highest comment count
  const highestCommentCount = allTrendingPosts.length > 0 
    ? comments.filter(comment => comment.postId === allTrendingPosts[0].id).length 
    : 0;

  // Calculate total pages
  const totalPages = Math.ceil(allTrendingPosts.length / POSTS_PER_PAGE);

  // Update paginated posts when data or current page changes
  useEffect(() => {
    if (allTrendingPosts.length > 0) {
      const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      setPaginatedPosts(allTrendingPosts.slice(startIndex, endIndex));
    }
  }, [allTrendingPosts, currentPage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Refresh microservice data
    Promise.all([
      refetchTrendingPosts(),
      refetchData()
    ]).finally(() => {
      // Simulate refresh duration for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    });
  };

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/30 dark:from-primary/20 dark:to-secondary/40 mb-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="relative z-10 px-8 py-12 sm:px-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <TrendingUp size={32} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Trending Posts</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Discover the most discussed content in our community, ranked by engagement and comment activity.
                </p>
              </div>
            </div>
            
            {!loading && allTrendingPosts.length > 0 && (
              <div className="bg-background/70 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center gap-3 border shadow-sm">
                <MessageSquare size={20} className="text-primary" />
                <span>
                  <strong>{allTrendingPosts.length}</strong> post{allTrendingPosts.length !== 1 && 's'} with{' '}
                  <strong>{highestCommentCount}</strong> comment{highestCommentCount !== 1 && 's'}
                </span>
              </div>
            )}
            
            <button 
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh Trends</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(POSTS_PER_PAGE)].map((_, i) => (
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
            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 staggered-fade-in">
                  {paginatedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      userId={post.userId}
                      title={post.title}
                      body={post.body}
                      users={users}
                      comments={comments}
                      className="md:col-span-1 hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={goToPreviousPage} 
                            disabled={currentPage === 1} 
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <div className="flex items-center h-9 px-4">
                            <span className="text-sm">
                              Page {currentPage} of {totalPages}
                            </span>
                          </div>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext 
                            onClick={goToNextPage} 
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 border rounded-xl bg-card shadow">
                <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp size={48} className="text-primary" />
                </div>
                <h3 className="text-2xl font-medium mb-2">No trending posts found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any posts with comments to display. Check back later as more users engage with content.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Info Section */}
        <div className="mt-16 rounded-xl overflow-hidden border bg-card shadow-sm">
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart size={20} className="text-primary" />
              About Trending Posts
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This page displays posts with the highest number of comments. If multiple posts have 
                  the same number of comments, all of them will be shown. The trending posts are 
                  automatically updated as new comments are added.
                </p>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">How we rank posts</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Total number of comments</li>
                    <li>Comment frequency and recency</li>
                    <li>User engagement patterns</li>
                    <li>Post freshness score</li>
                  </ul>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-6">
                <h4 className="font-medium mb-3">Real-time updates</h4>
                <p className="text-sm text-muted-foreground">
                  Our trending algorithm refreshes every 30 seconds to ensure you always see the most 
                  relevant and engaging content from our community. You can also manually refresh the 
                  data anytime using the refresh button.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TrendingPosts;
