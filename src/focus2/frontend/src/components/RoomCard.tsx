
import React from 'react';
import { Room } from '../utils/types';
import { Badge, Button, Modal } from './Common';

interface RoomCardProps {
  room: Room;
  onEnter: (room: Room) => void;
  onDelete: (room: Room) => void;
  currentUserId: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onEnter, onDelete, currentUserId }) => {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  
  const isCreator = Number(room.createdBy) === Number(currentUserId);

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
        </div>
        {isCreator && (
          <div className="absolute top-2 right-2">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-2 bg-earth-danger/10 text-earth-danger rounded-full hover:bg-earth-danger hover:text-white transition-all cursor-pointer"
              title="Delete Room"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
        <div className="absolute inset-0 bg-earth-text/0 group-hover:bg-earth-text/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
           <Button variant="primary" onClick={() => onEnter(room)} className="text-sm px-4 py-2 uppercase tracking-widest font-black">
             Enter Room
           </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-earth-text line-clamp-1 uppercase text-xs tracking-wider">{room.title}</h4>
          <span className="text-[10px] font-black text-earth-text-sec flex items-center whitespace-nowrap bg-white/50 px-2 py-0.5 rounded-full">
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
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="text-center p-4">
          <p className="text-earth-text-sec mb-6">Are you sure you want to delete this room?</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                onDelete(room);
                setShowDeleteModal(false);
              }}
              className="flex-1 bg-earth-danger hover:bg-earth-danger/80"
            >
              Delete Room
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
