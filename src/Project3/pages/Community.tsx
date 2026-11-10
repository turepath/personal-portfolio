
import React, { useState } from 'react';
import { MOCK_POSTS } from '../constants';
import { Badge, Button } from '../components/Common';

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Feed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 w-full">
      {/* Left Column: Feed */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-earth-card p-4 rounded-lg border border-earth-border">
          <div className="flex gap-4">
            <img src="https://picsum.photos/seed/current/100/100" alt="Me" className="w-10 h-10 rounded-full" />
            <input 
              type="text" 
              placeholder="What's on your mind? Share a win or ask for help..." 
              className="flex-1 bg-earth-bg border border-earth-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-earth-accent"
            />
          </div>
          <div className="flex justify-between mt-4 items-center">
             <div className="flex gap-2">
               <button className="p-2 text-earth-text-sec hover:text-earth-accent transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </button>
               <button className="p-2 text-earth-text-sec hover:text-earth-accent transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </button>
             </div>
             <Button variant="primary" className="px-4 py-1.5 text-xs">Post</Button>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_POSTS.map(post => (
            <div key={post.id} className="bg-earth-card p-6 rounded-lg border border-earth-border hover:shadow-default transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-earth-border" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-earth-text">{post.author.name}</span>
                      {post.author.isPro && <Badge color="accent">Pro</Badge>}
                    </div>
                    <span className="text-xs text-earth-text-sec">{post.timestamp}</span>
                  </div>
                </div>
                <button className="text-earth-text-sec hover:text-earth-text">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                </button>
              </div>
              <p className="text-earth-text text-sm leading-relaxed mb-6">
                {post.content}
              </p>
              <div className="flex items-center gap-6 pt-4 border-t border-earth-border">
                <button className="flex items-center gap-1.5 text-xs text-earth-text-sec hover:text-earth-danger transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  {post.likes} Likes
                </button>
                <button className="flex items-center gap-1.5 text-xs text-earth-text-sec hover:text-earth-accent transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  {post.comments} Comments
                </button>
                <button className="flex items-center gap-1.5 text-xs text-earth-text-sec hover:text-earth-accent transition-colors ml-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Widgets */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-earth-card p-6 rounded-lg border border-earth-border">
          <h4 className="font-bold text-sm text-earth-text mb-4 uppercase tracking-wider">Top Focused Today</h4>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 text-xs font-bold text-earth-text-sec">#{i}</div>
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} className="w-8 h-8 rounded-full" alt="User" />
                  <span className="text-sm font-medium text-earth-text">StudyPro_{i}</span>
                </div>
                <span className="text-xs font-bold text-earth-accent">{(12 - i) * 1.5}h</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-earth-border rounded-md text-xs font-bold text-earth-text-sec hover:bg-earth-bg transition-colors">View Leaderboard</button>
        </div>

        {/* Chat Placeholder Widget */}
        <div className="bg-earth-card rounded-lg border border-earth-border overflow-hidden h-96 flex flex-col">
          <div className="bg-earth-accent p-3 flex justify-between items-center text-white">
            <span className="text-xs font-bold uppercase tracking-wider">Lobby Chat</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px]">1,245 online</span>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
            <div className="bg-earth-bg p-3 rounded-lg rounded-tl-none self-start max-w-[85%] border border-earth-border">
              <p className="text-xs text-earth-text-sec mb-1 font-bold">Bot_Advisor</p>
              <p className="text-xs">Welcome to the community lounge! How is everyone's focus today?</p>
            </div>
            <div className="bg-earth-accent/10 p-3 rounded-lg rounded-tr-none self-end ml-auto max-w-[85%] border border-earth-accent/20">
               <p className="text-xs">Just started! Going to do 2 hours of Python. 🐍</p>
            </div>
            <div className="bg-earth-bg p-3 rounded-lg rounded-tl-none self-start max-w-[85%] border border-earth-border">
              <p className="text-xs text-earth-text-sec mb-1 font-bold">Emily_98</p>
              <p className="text-xs">Room 4 is great right now, very quiet.</p>
            </div>
          </div>
          <div className="p-3 border-t border-earth-border bg-earth-bg">
            <input type="text" placeholder="Type a message..." className="w-full text-xs bg-earth-card border border-earth-border rounded-full px-4 py-2 focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
