import React, { useEffect, useMemo, useState } from 'react';
import { getReceptionists, createReceptionist, updateReceptionist, deleteReceptionist, activateReceptionist, deactivateReceptionist } from '../../../services/receptionistService';
import toast from 'react-hot-toast';
import ReceptionistModal from '../../../components/dashboard/receptionists/ReceptionistModal';

const ReceptionistsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const load = async (signal) => {
    setLoading(true);
    try {
      const data = await getReceptionists();
      if (!signal?.aborted) setList(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!signal?.aborted) toast.error('Failed to load receptionists');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const onToggleStatus = async (r) => {
    try {
      if (r.status === 'ACTIVE') {
        await deactivateReceptionist(r.id);
        toast.success('Receptionist deactivated');
      } else {
        await activateReceptionist(r.id);
        toast.success('Receptionist activated');
      }
  load(new AbortController().signal);
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this receptionist?')) return;
    try {
      await deleteReceptionist(id);
      toast.success('Receptionist deleted');
  load(new AbortController().signal);
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(r => `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.shift || '').toLowerCase().includes(q));
  }, [list, search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Receptionists</h1>
        <button onClick={() => { setEditing(null); setIsOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Receptionist</button>
      </div>
      <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name, email, or shift" className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-56">Name</th>
              <th className="p-3 text-left w-64">Email</th>
              <th className="p-3 text-left w-28">Status</th>
              <th className="p-3 text-left w-28">Shift</th>
              <th className="p-3 text-left w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="p-4" colSpan={5}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-4" colSpan={5}>No receptionists found</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-3 truncate">{r.firstName} {r.lastName}</td>
                  <td className="p-3 truncate">{r.email}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span></td>
                  <td className="p-3">{r.shift}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => { setEditing(r); setIsOpen(true); }} className="px-2 py-1 text-sm bg-indigo-600 text-white rounded">Edit</button>
                    <button onClick={() => onToggleStatus(r)} className="px-2 py-1 text-sm bg-blue-600 text-white rounded">{r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => onDelete(r.id)} className="px-2 py-1 text-sm bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReceptionistModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initial={editing}
        onSubmit={async (payload) => {
          try {
            if (editing) {
              const updated = await updateReceptionist(editing.id, payload);
              setList(prev => prev.map(r => r.id === editing.id ? updated : r));
              toast.success('Receptionist updated');
            } else {
              const created = await createReceptionist(payload);
              setList(prev => [created, ...prev]);
              toast.success('Receptionist created');
            }
          } catch (e) {
            toast.error('Save failed');
          } finally {
            setIsOpen(false);
            setEditing(null);
          }
        }}
      />
    </div>
  );
};

export default ReceptionistsPage;
