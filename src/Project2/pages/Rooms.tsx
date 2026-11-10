
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ROOMS } from '../constants';
import { RoomCard } from '../components/RoomCard';
import { Modal, Button, PaymentUI } from '../components/Common';
import { Room } from '../types';

export const Rooms: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { title: 'Duo (1:1)', subtitle: 'Personal & Avatar OK', filter: (r: Room) => r.type === '1:1' && r.virtualAllowed && !r.isPaid },
    { title: 'Authentic (1:1)', subtitle: 'Real Faces Only', filter: (r: Room) => r.type === '1:1' && !r.virtualAllowed && !r.isPaid },
    { title: 'Public (Many)', subtitle: 'Open Community', filter: (r: Room) => r.type === '1:many' && r.virtualAllowed && !r.isPaid },
    { title: 'Serious (Many)', subtitle: 'High Accountability', filter: (r: Room) => r.type === '1:many' && !r.virtualAllowed && !r.isPaid },
    { title: 'Elite (Pro)', subtitle: 'Exclusive Access', filter: (r: Room) => r.isPaid },
  ];

  const handleEnterRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsUpgrading(room.isPaid);
  };

  const handleSessionEnter = () => {
    if (selectedRoom) {
      navigate(`/room/${selectedRoom.id}`);
    }
  };

  const handlePaymentComplete = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setIsUpgrading(false);
      if (selectedRoom) navigate(`/room/${selectedRoom.id}`);
      setSelectedRoom(null);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-earth-text">Available Rooms</h2>
          <p className="text-earth-text-sec text-sm">Find the perfect workspace for your current task.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {columns.map((col, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <div className="px-1 border-b border-earth-border pb-2">
              <h3 className="text-sm font-bold text-earth-text uppercase tracking-wider">{col.title}</h3>
              <p className="text-[10px] text-earth-text-sec uppercase font-medium">{col.subtitle}</p>
            </div>
            <div className="space-y-4">
              {MOCK_ROOMS.filter(col.filter).length > 0 ? (
                MOCK_ROOMS.filter(col.filter).map(room => (
                  <RoomCard key={room.id} room={room} onEnter={handleEnterRoom} />
                ))
              ) : (
                <div className="bg-earth-card/50 border border-dashed border-earth-border rounded-lg p-6 flex flex-col items-center justify-center text-center opacity-60">
                   <div className="w-8 h-8 rounded-full border border-earth-border flex items-center justify-center mb-2">
                     <svg className="w-4 h-4 text-earth-text-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                   </div>
                   <p className="text-[10px] font-bold text-earth-text-sec uppercase">No Live Sessions</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={!!selectedRoom} 
        onClose={() => { setSelectedRoom(null); setPurchaseSuccess(false); }} 
        title={isUpgrading ? "Premium Workspace" : "Join Focus Room"}
      >
        {isUpgrading ? (
          purchaseSuccess ? (
            <div className="text-center py-8 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-earth-success/20 text-earth-success rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <h3 className="text-xl font-bold text-earth-text mb-2">Payment Successful!</h3>
               <p className="text-sm text-earth-text-sec">Welcome to the Elite tier. Preparing your session...</p>
            </div>
          ) : (
            <PaymentUI onComplete={handlePaymentComplete} />
          )
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-earth-card-alt rounded-full flex items-center justify-center mx-auto mb-4 border border-earth-border shadow-inner">
              <svg className="w-8 h-8 text-earth-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h4 className="font-bold text-lg mb-2 text-earth-text">{selectedRoom?.title}</h4>
            <div className="flex justify-center gap-2 mb-6">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${selectedRoom?.virtualAllowed ? 'bg-earth-success/10 text-earth-success' : 'bg-earth-warning/10 text-earth-warning'}`}>
                {selectedRoom?.virtualAllowed ? 'Avatar Supported' : 'Authentic Video Only'}
              </span>
            </div>
            <p className="text-earth-text-sec text-sm mb-8 leading-relaxed">
              Joining this session will activate your camera. Please ensure your background is appropriate for a study environment.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedRoom(null)} className="flex-1">Back</Button>
              <Button variant="primary" className="flex-1" onClick={handleSessionEnter}>Enter Session</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
