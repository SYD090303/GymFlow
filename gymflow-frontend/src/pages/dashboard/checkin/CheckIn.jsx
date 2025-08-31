import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMembers } from '../../../services/memberService';
import { checkIn as checkInApi, checkOut as checkOutApi, listByMember } from '../../../services/attendanceService';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../../utils/errors';
import { FiLogIn, FiLogOut, FiX, FiSearch, FiCheckSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, list } from '../../../ui/motionPresets';
import PageHeader from '../../../components/dashboard/PageHeader';
import ConfirmationModal from '../../../components/dashboard/members/ConfirmationModal';
import Spinner from '../../../ui/Spinner';

const CheckIn = () => {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: null, confirmText: 'Confirm' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingMembers(true);
        const data = await getMembers();
        if (mounted) setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(extractErrorMessage(err, 'Failed to load members'));
      } finally {
        if (mounted) setLoadingMembers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members.slice(0, 8);
    return members
      .filter((m) => {
        const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
        return (
          name.includes(q) || (m.email || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [members, query]);

  const doCheckIn = (member) => {
    if (!member) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConfirmConfig({
      title: 'Confirm Check-in',
      description: `This will record a check-in for ${member.firstName} at ${time}. Continue?`,
      confirmText: 'Check-in',
      onConfirm: async () => {
        try {
          setActionLoadingId(member.id);
          await checkInApi(member.id, {});
          const done = new Date();
          const doneTime = done.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          toast.success(`Checked in ${member.firstName} at ${doneTime}`);
        } catch (e) {
          toast.error(extractErrorMessage(e, 'Check-in failed'));
        } finally {
          setActionLoadingId(null);
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const doCheckOut = (member) => {
    if (!member) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConfirmConfig({
      title: 'Confirm Check-out',
      description: `This will record a check-out for ${member.firstName} at ${time}. Continue?`,
      confirmText: 'Check-out',
      onConfirm: async () => {
        try {
          setActionLoadingId(member.id);
          // Front-end guard: ensure there is an open session
          const logs = await listByMember(member.id);
          const hasOpen = Array.isArray(logs) && logs.some(l => !l.checkOutTime);
          if (!hasOpen) {
            toast.error('No active session to check out');
            return;
          }
          await checkOutApi(member.id, {});
          const done = new Date();
          const doneTime = done.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          toast.success(`Checked out ${member.firstName} at ${doneTime}`);
        } catch (e) {
          toast.error(extractErrorMessage(e, 'Check-out failed'));
        } finally {
          setActionLoadingId(null);
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader icon={<FiCheckSquare />} title="Member Check-in/Check-out" subtitle="Search members and perform quick check-in/out actions." />
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

      <div className="relative" ref={containerRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
            type="text"
            placeholder={loadingMembers ? 'Loading members…' : 'Search members by name or email'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSelected(null); setShowSuggestions(false); }}
              className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && (
            <motion.div {...variants.fadeDown} className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-auto">
              {loadingMembers ? (
                <div className="p-3 text-sm text-gray-500">
                  <Spinner label="Loading members…" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No matches</div>
              ) : (
                filtered.map((m, i) => (
                  <motion.div key={m.id} variants={list.item} initial="initial" animate="animate" exit="exit" transition={{ delay: i * 0.03 }} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50">
                  <button
                    type="button"
                    className="text-left flex-1"
                    onClick={() => { setSelected(m); setQuery(`${m.firstName || ''} ${m.lastName || ''} <${m.email}>`); setShowSuggestions(false); }}
                  >
                    <div className="font-medium text-gray-800">{m.firstName} {m.lastName}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === m.id}
                      onClick={() => doCheckIn(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700"
                      title="Check-in"
                    >
                      <FiLogIn /> In
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === m.id}
                      onClick={() => doCheckOut(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-amber-600 text-white disabled:opacity-50 hover:bg-amber-700"
                      title="Check-out"
                    >
                      <FiLogOut /> Out
                    </button>
                  </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
  </div>

    <AnimatePresence>
    {selected && (
  <motion.div {...variants.cardIn} className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-800">{selected.firstName} {selected.lastName}</div>
              <div className="text-sm text-gray-600">{selected.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={actionLoadingId === selected.id}
                onClick={() => doCheckIn(selected)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700"
              >
                <FiLogIn /> Check-in
              </button>
              <button
                type="button"
                disabled={actionLoadingId === selected.id}
                onClick={() => doCheckOut(selected)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-amber-600 text-white disabled:opacity-50 hover:bg-amber-700"
              >
                <FiLogOut /> Check-out
              </button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText || 'Confirm'}
      />
    </div>
  );
};

export default CheckIn;
