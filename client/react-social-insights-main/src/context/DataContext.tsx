
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Post, Comment, fetchUsers, fetchPosts, fetchComments } from '../services/api';
import { microserviceAPI } from '../services/microservice';
import { toast } from 'sonner';

interface DataContextType {
  users: User[];
  posts: Post[];
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  refetchData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  pollingInterval?: number;
}

export const DataProvider: React.FC<DataProviderProps> = ({ 
  children, 
  pollingInterval = 60000 // Default: 1 minute
}) => {
  // Set the cache TTL to match our polling interval
  useEffect(() => {
    microserviceAPI.setCacheTTL(pollingInterval);
  }, [pollingInterval]);
  
  // Fetch users data through microservice
  const { 
    data: users = [], 
    isLoading: isLoadingUsers, 
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Fetch posts data with polling
  const { 
    data: posts = [], 
    isLoading: isLoadingPosts, 
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    refetchInterval: pollingInterval, // Enable polling
  });

  // Fetch comments data with polling
  const { 
    data: comments = [], 
    isLoading: isLoadingComments, 
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchComments,
    refetchInterval: pollingInterval, // Enable polling
  });

  // Derived loading and error states
  const loading = isLoadingUsers || isLoadingPosts || isLoadingComments;
  const error = usersError || postsError || commentsError || null;

  // Notify on new data (you could expand this to be more specific)
  const [prevPostsLength, setPrevPostsLength] = useState(0);
  
  useEffect(() => {
    // Skip initial load notification
    if (prevPostsLength > 0 && posts && posts.length > prevPostsLength) {
      toast.success(`New posts available!`);
    }
    
    if (posts) {
      setPrevPostsLength(posts.length);
    }
  }, [posts, prevPostsLength]);

  // Combined refetch function
  const refetchData = () => {
    refetchUsers();
    refetchPosts();
    refetchComments();
    microserviceAPI.refreshAllData(); // Also refresh microservice cache
    toast.info("Refreshing data...");
  };

  return (
    <DataContext.Provider
      value={{
        users: users || [],
        posts: posts || [],
        comments: comments || [],
        loading,
        error: error as Error,
        refetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
