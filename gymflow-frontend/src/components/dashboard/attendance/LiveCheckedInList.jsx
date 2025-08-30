import React from 'react';
import AvatarInitial from '../../common/AvatarInitial';
import { formatTime, durationSince } from '../../../utils/date';

const LiveCheckedInList = ({ openSessions = [], memberById }) => {
  if (!openSessions || openSessions.length === 0) {
    return <div className="text-sm text-gray-500">No one is currently checked in.</div>;
  }
  return (
    <ul className="divide-y">
      {openSessions.slice(0, 8).map((l) => {
        const m = memberById?.get(l.memberId) || {};
        const name = `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown';
        return (
          <li key={l.id} className="py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <AvatarInitial name={m.firstName} className="flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-gray-800 truncate">{name}</div>
                <div className="text-xs text-gray-500">In at {formatTime(l.checkInTime)} • <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{durationSince(l.checkInTime)} live</span></div>
              </div>
            </div>
            <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Live</span>
          </li>
        );
      })}
    </ul>
  );
};

export default LiveCheckedInList;
