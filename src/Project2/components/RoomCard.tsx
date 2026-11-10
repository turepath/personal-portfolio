
import React from 'react';
import { Room } from '../types';
import { Badge, Button } from './Common';

interface RoomCardProps {
  room: Room;
  onEnter: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onEnter }) => {
  return (
    <div className="group bg-earth-card rounded-lg overflow-hidden border border-earth-border hover:border-earth-accent transition-all duration-300 shadow-sm hover:shadow-default">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={room.thumbnail} 
          alt={room.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {room.status === 'live' && <Badge color="success">Live</Badge>}
          {room.status === 'scheduled' && <Badge color="warning">Scheduled</Badge>}
          {room.isPaid && <Badge color="accent">Pro</Badge>}
        </div>
        <div className="absolute inset-0 bg-earth-text/0 group-hover:bg-earth-text/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
           <Button variant="primary" onClick={() => onEnter(room)} className="text-sm px-4 py-2">
             {room.isPaid ? 'Unlock' : 'Join Room'}
           </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-earth-text line-clamp-1">{room.title}</h4>
          <span className="text-xs text-earth-text-sec flex items-center whitespace-nowrap">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
            {room.participants}/{room.maxParticipants}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          <Badge>{room.type}</Badge>
          <Badge color={room.virtualAllowed ? 'neutral' : 'danger'}>
            {room.virtualAllowed ? 'Avatar OK' : 'No Avatars'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
