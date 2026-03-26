'use client';

import { useState } from 'react';
import { Check, Edit, RefreshCw, Send } from 'lucide-react';

interface Props {
  onApprove: () => void;
  onApproveWithEdit: (request: string) => void;
  onKeepTrying: () => void;
  onReadyToSend: () => void;
  hasCredits: boolean;
}

export default function DecisionModal({ onApprove, onApproveWithEdit, onKeepTrying, onReadyToSend, hasCredits }: Props) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editRequest, setEditRequest] = useState('');

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full text-center space-y-6">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Image Generated!</h2>
          <p className="text-gray-600 mb-6 font-medium">How would you like to proceed?</p>

          {!showEditForm ? (
            <div className="flex flex-col gap-4">
              <button onClick={onApprove} className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition flex items-center justify-center gap-2">
                <Check className="w-5 h-5"/> Approve & Continue
              </button>

              <button onClick={() => setShowEditForm(true)} className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition flex items-center justify-center gap-2">
                <Edit className="w-5 h-5"/> Approve with Edit Request (Free)
              </button>

              <button onClick={onKeepTrying} className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-2xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" /> Keep Trying (New Prompt)
              </button>

              {!hasCredits && (
                 <button onClick={onReadyToSend} className="w-full py-4 bg-pink-50 text-pink-600 font-bold rounded-2xl hover:bg-pink-100 transition flex items-center justify-center gap-2">
                   <Send className="w-5 h-5" /> Ready-to-Send Template (from $6.49)
                 </button>
              )}
            </div>
          ) : (
             <div className="text-left space-y-4 animate-in fade-in duration-300">
                 <p className="font-semibold text-gray-700">Tell us what you'd like to see fixed and we'll handle it for free within 24 hours. We'll notify you when it's done.</p>
                 <textarea 
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-blue-500 text-gray-800" 
                    rows={4}
                    placeholder="e.g. Make the background slightly lighter, correct the spelling of..."
                    value={editRequest}
                    onChange={(e) => setEditRequest(e.target.value)}
                 />
                 <div className="flex gap-3 pt-2">
                   <button onClick={() => setShowEditForm(false)} className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold flex-1 hover:bg-gray-200 transition">Cancel</button>
                   <button 
                      onClick={() => onApproveWithEdit(editRequest)} 
                      disabled={!editRequest.trim()}
                      className="px-6 py-4 bg-blue-500 text-white rounded-xl font-bold flex-1 hover:bg-blue-600 transition disabled:opacity-50"
                   >
                       Submit Request
                   </button>
                 </div>
             </div>
          )}
        </div>
      </div>
  );
}
