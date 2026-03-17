import { create } from 'zustand';
import type { Card } from '../types';
import { cardsService } from '../services/cards.service';

interface CardsState {
  cards: Card[];
  loading: boolean;
  fetchCards: () => Promise<void>;
  addCard: (c: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
}

export const useCardsStore = create<CardsState>((set) => ({
  cards: [], loading: false,
  fetchCards: async () => {
    set({ loading: true });
    try { set({ cards: await cardsService.list() }); }
    finally { set({ loading: false }); }
  },
  addCard: c => set(s => ({ cards: [c, ...s.cards] })),
  updateCard: (id, u) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, ...u } : c) })),
  removeCard: id => set(s => ({ cards: s.cards.filter(c => c.id !== id) })),
}));
