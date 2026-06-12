import { createIdStore } from "@/lib/storage/id-store";

const store = createIdStore("fut26:watchlist:v1");

export const useWatchlist = store.useStore;
export const watchlist = store;
