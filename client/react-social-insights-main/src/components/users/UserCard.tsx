
import React from 'react';
import { User, FileText, MailIcon } from 'lucide-react';
import { User as UserType } from '../../services/api';

interface UserCardProps {
  user: UserType;
  postCount: number;
  rank: number;
}

const UserCard: React.FC<UserCardProps> = ({ user, postCount, rank }) => {
  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center p-5">
        {/* Rank */}
        <div className="mr-4 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
          {rank}
        </div>
        
        {/* User Avatar */}
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <User size={24} className="text-muted-foreground" />
        </div>
        
        {/* User Info */}
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
        </div>
        
        {/* Post Count */}
        <div className="flex flex-col items-center bg-secondary rounded-lg px-3 py-2">
          <span className="text-xl font-bold">{postCount}</span>
          <span className="text-xs text-muted-foreground">posts</span>
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="bg-muted/50 px-5 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <MailIcon size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{user.company.name}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
