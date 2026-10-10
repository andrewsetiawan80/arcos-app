import { useSyncExternalStore } from 'react';
import { load, subscribe } from '../store';
export default function usePublicData() { return useSyncExternalStore(subscribe, load, load); }
