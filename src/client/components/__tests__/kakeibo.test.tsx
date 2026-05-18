// @vitest-environment happy-dom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Kakeibo from '@/client/components/kakeibo';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => [],
  });
  vi.stubGlobal('fetch', mockFetch);
});

describe('Kakeibo', () => {
  describe('初期表示', () => {
    it('金額・日付の入力フィールドが表示される', async () => {
      render(<Kakeibo />);
      expect(screen.getByLabelText('金額')).toBeInTheDocument();
      expect(screen.getByLabelText('日付')).toBeInTheDocument();
    });

    it('トランザクションがない場合は月間支出が¥0と表示される', async () => {
      render(<Kakeibo />);
      await waitFor(() => {
        expect(screen.getByText(/月間支出.*¥0/)).toBeInTheDocument();
      });
    });

    it('追加ボタンが表示される', () => {
      render(<Kakeibo />);
      expect(screen.getByRole('button', { name: /追加/ })).toBeInTheDocument();
    });

    it('マウント時にAPIを呼び出す', async () => {
      render(<Kakeibo />);
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/transactions')
        );
      });
    });
  });

  describe('フォーム入力', () => {
    it('金額フィールドに入力できる', async () => {
      const user = userEvent.setup();
      render(<Kakeibo />);

      const amountInput = screen.getByLabelText('金額');
      await user.type(amountInput, '1500');
      expect(amountInput).toHaveValue(1500);
    });

    it('フォーム送信時にPOSTリクエストを送る', async () => {
      const user = userEvent.setup();
      render(<Kakeibo />);

      await user.type(screen.getByLabelText('金額'), '1000');
      await user.click(screen.getByRole('button', { name: /追加/ }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/transactions',
          expect.objectContaining({ method: 'POST' })
        );
      });
    });
  });

  describe('取引一覧', () => {
    it('APIから取得した取引が表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            amount: 800,
            description: '外食',
            date: new Date().toISOString().split('T')[0],
            genre: 'food',
          },
        ],
      });

      render(<Kakeibo />);

      await waitFor(() => {
        // 取引行の金額表示で確認（"-¥800" は取引一覧にのみ現れる）
        expect(screen.getByText(/-¥800/)).toBeInTheDocument();
      });
    });

    it('取得した取引の月間合計が表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            amount: 1200,
            description: 'ランチ',
            date: new Date().toISOString().split('T')[0],
            genre: 'food',
          },
        ],
      });

      render(<Kakeibo />);

      await waitFor(() => {
        expect(screen.getByText(/月間支出.*¥1,200/)).toBeInTheDocument();
      });
    });
  });
});
