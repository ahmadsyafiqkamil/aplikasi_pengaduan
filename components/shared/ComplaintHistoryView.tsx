
import React from 'react';
import { ComplaintHistoryEntry, User, UserRole } from '../../types';
import { formatDate } from '../../utils/helpers';
import { ROLES_CONFIG } from '../../constants';

interface ComplaintHistoryViewProps {
  history: ComplaintHistoryEntry[];
  users: User[]; // To map userId to name if needed
}

const ComplaintHistoryView: React.FC<ComplaintHistoryViewProps> = ({ history, users }) => {
  if (!history || history.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada histori untuk pengaduan ini.</p>;
  }

  const getUserDisplay = (entry: ComplaintHistoryEntry): string => {
    if (entry.userName) { // Prefer pre-filled userName
        return `${entry.userName} ${entry.userRole ? `(${ROLES_CONFIG[entry.userRole]?.name || entry.userRole})` : ''}`;
    }
    if (entry.userId) {
        const user = users.find(u => u.id === entry.userId);
        if (user) return `${user.name} (${ROLES_CONFIG[user.role]?.name || user.role})`;
    }
    return "Sistem/Tidak Diketahui";
  };


  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {history.slice().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== history.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ring-4 ring-white">
                    {/* Placeholder Icon, can be specific based on role or action */}
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      {event.action}
                    </p>
                    <p className="text-xs text-gray-500">
                        Oleh: {getUserDisplay(event)}
                    </p>
                    {event.notes && <p className="mt-1 text-xs text-gray-500 italic">"{event.notes}"</p>}
                     {event.oldStatus && event.newStatus && event.oldStatus !== event.newStatus && (
                        <p className="text-xs text-gray-500">Status: {event.oldStatus} → {event.newStatus}</p>
                     )}
                     {event.assignedToAgentName && (
                        <p className="text-xs text-gray-500">Ditugaskan ke: {event.assignedToAgentName}</p>
                     )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-gray-500">
                    <time dateTime={event.timestamp}>{formatDate(event.timestamp)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComplaintHistoryView;
