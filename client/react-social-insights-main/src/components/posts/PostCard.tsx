
import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, ArrowUpRight } from 'lucide-react';
import { User as UserType, Comment } from '../../services/api';
import { getRandomPlaceholderImage } from '../../services/api';
import { cn } from '@/lib/utils';

interface PostCardProps {
  id: number;
  userId: number;
  title: string;
  body: string;
  users: UserType[];
  comments: Comment[];
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  userId,
  title,
  body,
  users,
  comments,
  className = '',
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullBody, setShowFullBody] = useState(false);
  
  // Find user data
  const user = users.find(u => u.id === userId);
  const postComments = comments.filter(c => c.postId === id);
  
  // Generate random date within the last week
  const randomDate = new Date(
    Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
  );
  
  // Format the date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(randomDate);

  // Get a random image on initial render
  useEffect(() => {
    setImageUrl(getRandomPlaceholderImage());
  }, [id]);

  const truncatedBody = body.length > 120 ? `${body.substring(0, 120)}...` : body;

  return (
    <article className={cn(
      "group bg-card border rounded-xl overflow-hidden shadow-sm transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-md",
      className
    )}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            "group-hover:scale-105",
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold block">{user?.name || 'Unknown User'}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-3 leading-tight group-hover:text-primary transition-colors">{title}</h3>
        
        <p className="text-muted-foreground text-sm mb-5">
          {showFullBody ? body : truncatedBody}
          {body.length > 120 && (
            <button
              onClick={() => setShowFullBody(!showFullBody)}
              className="ml-1 text-primary hover:underline font-medium"
            >
              {showFullBody ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
        
        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{postComments.length} comments</span>
          </div>
          
          <button className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View details</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
