import { describe, it, expect } from 'vitest';
import { genres } from '@/client/components/genre';
import { items } from '@/client/components/item';

describe('genres', () => {
  it('7ジャンルが定義されている', () => {
    expect(genres).toHaveLength(7);
  });

  it('各ジャンルはvalue・label・colorを持つ', () => {
    for (const g of genres) {
      expect(g).toHaveProperty('value');
      expect(g).toHaveProperty('label');
      expect(g).toHaveProperty('color');
    }
  });

  it('valueはすべてユニーク', () => {
    const values = genres.map((g) => g.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('items', () => {
  it('全ジャンルに対応するアイテムが存在する', () => {
    for (const g of genres) {
      expect(items[g.value]).toBeDefined();
      expect(items[g.value].length).toBeGreaterThan(0);
    }
  });

  it('各アイテムはvalue・labelを持つ', () => {
    for (const list of Object.values(items)) {
      for (const item of list) {
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('label');
      }
    }
  });
});
