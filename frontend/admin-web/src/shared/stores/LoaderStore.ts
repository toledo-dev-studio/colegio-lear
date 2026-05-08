import { create } from 'zustand'

type LoaderState = {
    // Properties
    isLoading: boolean;
    title?: string;
    subTitle?: string;

    // Actions
    showLoading: (title?: string, subTitle?: string) => void;
    hideLoading: () => void;
}

export const useLoaderStore = create<LoaderState>()((set) => ({
    // Properties
    isLoading: false,
    title: "",
    subTitle: "",

    // Actions
    showLoading: (title: string = "Cargando", subTitle: string = "Por favor espere...") => {
        set({ isLoading: true, title, subTitle });
    },
    hideLoading: () => {
        set({ isLoading: false });
    }
}));
