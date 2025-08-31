import React, { useEffect, useState } from 'react';
import SectionCard from '../../../components/common/SectionCard';
import { FiRefreshCcw, FiCheck } from 'react-icons/fi';
import Spinner from '../../../ui/Spinner';

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const mod = await import('../../../services/notificationService');
      const data = await mod.getMyNotifications();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4">
      <SectionCard title="Notifications" actions={
        <div className="flex items-center gap-2">
          <button className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50 inline-flex items-center gap-2" onClick={load}>
            <FiRefreshCcw /> Refresh
          </button>
          {items.length > 0 && (
            <button
              className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50"
              onClick={async () => {
                const mod = await import('../../../services/notificationService');
                if (mod.markAllRead) {
                  await mod.markAllRead();
                } else {
                  // Fallback: mark individually
                  await Promise.all(items.map(n => mod.markNotificationRead(n.id)));
                }
                setItems([]);
              }}
            >
              Mark all read
            </button>
          )}
        </div>
      }>
        {loading ? (
          <div className="p-6 grid place-items-center">
            <Spinner label="Loading…" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">You're all caught up.</div>
        ) : (
          <ul className="divide-y">
            {items.map(n => (
              <li key={n.id} className="py-3 flex items-start gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{n.title}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-line">{n.message}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                </div>
                {!n.read && (
                  <button
                    className="ml-auto text-xs border rounded-md px-2 py-1 hover:bg-gray-50 inline-flex items-center gap-1"
                    onClick={async () => {
                      const mod = await import('../../../services/notificationService');
                      await mod.markNotificationRead(n.id);
                      setItems(prev => prev.filter(x => x.id !== n.id));
                    }}
                  >
                    <FiCheck /> Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
};

export default NotificationsPage;
