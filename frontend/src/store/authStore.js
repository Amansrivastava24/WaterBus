import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('userInfo')) || null,
    login: (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        set({ user: userData });
    },
    updateUser: (newData) => {
        set((state) => {
            const updatedUser = { ...state.user, ...newData };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            return { user: updatedUser };
        });
    },
    logout: () => {
        localStorage.removeItem('userInfo');
        set({ user: null });
    },
}));

export default useAuthStore;
