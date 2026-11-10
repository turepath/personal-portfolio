
import React, { useState } from 'react';
import { Button } from '../Common';

export const HelpSupportPanel: React.FC = () => {
  const [feedback, setFeedback] = useState({ category: 'General', content: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-earth-text">Help & Support</h3>
        <p className="text-earth-text-sec text-sm">Resources, feedback, and about Focus Companion.</p>
      </div>

      <section className="space-y-8">
        {/* FAQ Search */}
        <div className="space-y-4">
           <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Search FAQ</label>
           <div className="relative">
              <input type="text" placeholder="Search resources..." className="w-full bg-earth-card border border-earth-border rounded-xl px-10 py-3 text-sm focus:border-earth-accent outline-none" />
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-earth-text-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
           <div className="space-y-2">
              {['How do Pro rooms work?', 'Adjusting camera permissions', 'Troubleshooting audio lag'].map(q => (
                <button key={q} className="w-full text-left p-3 rounded-lg text-sm text-earth-text hover:bg-earth-card transition-colors flex justify-between items-center group">
                  {q}
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              ))}
           </div>
        </div>

        {/* Feedback Form */}
        <div className="space-y-4">
           <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Send Feedback</label>
           <form onSubmit={handleSubmit} className="p-6 bg-earth-card rounded-xl border border-earth-border space-y-4">
              {submitted ? (
                <div className="text-center py-10 animate-in zoom-in">
                   <div className="w-16 h-16 bg-earth-success/20 text-earth-success rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <p className="text-sm font-bold text-earth-text">Thank you for your feedback!</p>
                   <p className="text-xs text-earth-text-sec mt-1">Our team will review it shortly.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-earth-text-sec mb-1 uppercase">Category</label>
                    <select 
                      value={feedback.category}
                      onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                      className="w-full bg-earth-bg border border-earth-border rounded-lg p-2 text-sm"
                    >
                      <option>General</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                      <option>Pro Access Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-earth-text-sec mb-1 uppercase">Your thoughts</label>
                    <textarea 
                      value={feedback.content}
                      onChange={(e) => setFeedback({ ...feedback, content: e.target.value })}
                      className="w-full bg-earth-bg border border-earth-border rounded-lg p-3 text-sm h-32 resize-none"
                      placeholder="Be as descriptive as possible..."
                      required
                    ></textarea>
                  </div>
                  <Button variant="primary" className="w-full py-3" type="submit">Submit Feedback</Button>
                </>
              )}
           </form>
        </div>

        {/* About */}
        <div className="text-center space-y-4 pt-8">
           <div className="flex justify-center gap-6 text-[10px] font-bold text-earth-text-sec uppercase tracking-widest">
              <a href="#" className="hover:text-earth-accent underline decoration-earth-border underline-offset-4">Terms of Service</a>
              <a href="#" className="hover:text-earth-accent underline decoration-earth-border underline-offset-4">Privacy Policy</a>
           </div>
           <div>
              <p className="text-xs text-earth-text font-bold">Focus Companion v2.4.0-Optimized</p>
              <p className="text-[10px] text-earth-text-sec mt-1">Made with care for deep workers everywhere.</p>
           </div>
        </div>
      </section>
    </div>
  );
};
