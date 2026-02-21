import { useEffect, useRef } from 'react';

const CHANNEL_NAME = 'civic-flow-sync';
const STORAGE_KEY = 'civic-flow-issues';

export function useSync(issues, setIssues) {
    const channelRef = useRef(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        // Initialize BroadcastChannel for cross-tab communication
        try {
            channelRef.current = new BroadcastChannel(CHANNEL_NAME);

            channelRef.current.onmessage = (event) => {
                const { type, payload } = event.data;

                if (type === 'NEW_ISSUE') {
                    setIssues(prev => {
                        // Avoid duplicates
                        if (prev.some(i => i.id === payload.id)) return prev;
                        return [payload, ...prev];
                    });
                }

                if (type === 'UPDATE_ISSUE') {
                    setIssues(prev => prev.map(issue =>
                        issue.id === payload.id ? { ...issue, ...payload.changes } : issue
                    ));
                }

                if (type === 'FULL_SYNC') {
                    setIssues(prev => {
                        const existingIds = new Set(prev.map(i => i.id));
                        const newIssues = payload.filter(i => !existingIds.has(i.id));
                        return newIssues.length > 0 ? [...newIssues, ...prev] : prev;
                    });
                }
            };
        } catch (e) {
            // BroadcastChannel not supported, fall back to localStorage only
            console.warn('BroadcastChannel not supported, using localStorage fallback');
        }

        // Load from localStorage on first mount
        if (!isInitializedRef.current) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setIssues(prev => {
                            const existingIds = new Set(prev.map(i => i.id));
                            const newOnes = parsed.filter(i => !existingIds.has(i.id));
                            return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
                        });
                    }
                }
            } catch (e) { /* ignore */ }
            isInitializedRef.current = true;
        }

        // Listen for localStorage changes from other tabs (fallback)
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) {
                        setIssues(prev => {
                            const existingIds = new Set(prev.map(i => i.id));
                            const newOnes = parsed.filter(i => !existingIds.has(i.id));
                            return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
                        });
                    }
                } catch (e) { /* ignore */ }
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            if (channelRef.current) channelRef.current.close();
            window.removeEventListener('storage', onStorage);
        };
    }, [setIssues]);

    // Persist issues to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
        } catch (e) { /* ignore */ }
    }, [issues]);

    // Broadcast a new issue to other tabs
    const broadcastNewIssue = (issue) => {
        if (channelRef.current) {
            channelRef.current.postMessage({ type: 'NEW_ISSUE', payload: issue });
        }
        // Also update localStorage to trigger storage event for tabs without BroadcastChannel
        try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            localStorage.setItem(STORAGE_KEY, JSON.stringify([issue, ...current]));
        } catch (e) { /* ignore */ }
    };

    // Broadcast an issue update to other tabs
    const broadcastUpdateIssue = (id, changes) => {
        if (channelRef.current) {
            channelRef.current.postMessage({ type: 'UPDATE_ISSUE', payload: { id, changes } });
        }
    };

    return { broadcastNewIssue, broadcastUpdateIssue };
}
