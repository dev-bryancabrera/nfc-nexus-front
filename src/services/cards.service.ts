// ═══════════════════════════════════════════════════════
//  CARDS SERVICE
// ═══════════════════════════════════════════════════════
import { apiClient } from '../lib/api-client';
import type { Card, CardBlock } from '../types';
import type { CardsListResponse, CardResponse, PublishCardResponse, CardUrlResponse } from '../interfaces/api.interfaces';

export const cardsService = {
  async list(): Promise<Card[]> {
    const { data } = await apiClient.get<CardsListResponse>('/cards');
    return data.cards;
  },

  async get(id: string): Promise<Card> {
    const { data } = await apiClient.get<CardResponse>(`/cards/${id}`);
    return data.card;
  },

  async create(payload: Partial<Card>): Promise<Card> {
    const { data } = await apiClient.post<CardResponse>('/cards', payload);
    return data.card;
  },

  async update(id: string, payload: Partial<Card>): Promise<Card> {
    const { data } = await apiClient.put<CardResponse>(`/cards/${id}`, payload);
    return data.card;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cards/${id}`);
  },

  async publish(id: string): Promise<PublishCardResponse> {
    const { data } = await apiClient.post<PublishCardResponse>(`/cards/${id}/publish`);
    return data;
  },

  async duplicate(id: string): Promise<Card> {
    const { data } = await apiClient.post<CardResponse>(`/cards/${id}/duplicate`);
    return data.card;
  },

  async updateBlocks(id: string, blocks: CardBlock[]): Promise<Card> {
    const { data } = await apiClient.put<CardResponse>(`/cards/${id}/blocks`, { blocks });
    return data.card;
  },

  async getUrl(id: string): Promise<CardUrlResponse> {
    const { data } = await apiClient.get<CardUrlResponse>(`/cards/${id}/url`);
    return data;
  },
};
