
import React, { useState, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { microserviceAPI } from '../services/microservice';
import { useQuery } from '@tanstack/react-query';
import UserCard from '../components/users/UserCard';
import PageTransition from '../components/layout/PageTransition';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from '../components/ui/pagination';
import { ScrollArea } from '../components/ui/scroll-area';

const USERS_PER_PAGE = 5; // Set the number of users to display per page

const TopUsers = () => {
  const { loading: generalLoading, posts } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedUsers, setPaginatedUsers] = useState<any[]>([]);
  
  // Fetch all top users using microservice endpoint
  const { 
    data: allTopUsers = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['allTopUsers'],
    queryFn: () => microserviceAPI.getTopFiveUsers(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Use either specific loading state or general loading state
  const loading = isLoading || (generalLoading && posts.length === 0);

  // Calculate total pages
  const totalPages = Math.ceil(allTopUsers.length / USERS_PER_PAGE);

  // Update paginated users when data or current page changes
  useEffect(() => {
    if (allTopUsers.length > 0) {
      const startIndex = (currentPage - 1) * USERS_PER_PAGE;
      const endIndex = startIndex + USERS_PER_PAGE;
      setPaginatedUsers(allTopUsers.slice(startIndex, endIndex));
    }
  }, [allTopUsers, currentPage]);

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
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">Top Users</h1>
          </div>
          <p className="text-muted-foreground">
            Users with the highest number of posts
          </p>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="bg-card border rounded-xl overflow-hidden shadow-sm h-32 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {paginatedUsers.length > 0 ? (
              <ScrollArea className="max-h-[600px] overflow-auto pr-3">
                <div className="space-y-4 staggered-fade-in">
                  {paginatedUsers.map((user, index) => {
                    // Calculate post count from posts data (microservice already has these sorted)
                    const userPosts = posts.filter(post => post.userId === user.id);
                    const userRank = ((currentPage - 1) * USERS_PER_PAGE) + index + 1;
                    
                    return (
                      <UserCard
                        key={user.id}
                        user={user}
                        postCount={userPosts.length}
                        rank={userRank}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 border rounded-xl bg-card">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No user data available</h3>
                <p className="text-muted-foreground mt-2">
                  We couldn't find any users to display.
                </p>
              </div>
            )}
            
            {paginatedUsers.length > 0 && totalPages > 1 && (
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
        )}
        
        <div className="mt-10 p-5 bg-secondary rounded-xl">
          <h3 className="font-medium mb-2">About Top Users</h3>
          <p className="text-muted-foreground text-sm">
            This page displays the top users based on the number of posts they've created.
            The ranking is automatically updated as new posts are added to the platform.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default TopUsers;
