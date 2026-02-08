import { create } from 'zustand';
import api from '../services/api';
import { format } from 'date-fns';

const useTrackerStore = create((set, get) => ({
    monthlyLogs: {}, // { "dateStr": log }
    loading: false,

    fetchMonthlyLogs: async (customerId, month) => {
        set({ loading: true });
        try {
            const { data } = await api.get(`/monthly-log/${customerId}?month=${month}`);
            const logsMap = {};
            data.forEach(log => {
                // Use local date format for mapping
                const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
                logsMap[dateKey] = log;
            });
            set({ monthlyLogs: logsMap });
        } catch (err) {
            console.error('Failed to fetch monthly logs', err);
        } finally {
            set({ loading: false });
        }
    },

    updateLog: async (customerId, date, logData) => {
        // Optimistic update
        const dateKey = format(new Date(date), 'yyyy-MM-dd');
        const previousLogs = { ...get().monthlyLogs };
        const newLogs = { ...previousLogs, [dateKey]: { ...previousLogs[dateKey], ...logData, date } };

        set({ monthlyLogs: newLogs });

        try {
            const { data } = await api.put(`/monthly-log/${customerId}/${date}`, logData);
            // Update with actual data from server
            set((state) => ({
                monthlyLogs: { ...state.monthlyLogs, [dateKey]: data }
            }));
        } catch (err) {
            console.error('Failed to update log', err);
            // Rollback on error
            set({ monthlyLogs: previousLogs });
            throw err;
        }
    }
}));

export default useTrackerStore;
