type ItemType = {
    [key: string]: Array<{ value: string; label: string; }>
  }
  
  export const items: ItemType = {
    food: [
      { value: 'grocery', label: '食料品' },
      { value: 'eating_out', label: '外食' },
      { value: 'snacks', label: 'お菓子' },
      { value: 'alcohol', label: 'お酒' },
    ],
    transportation: [
      { value: 'train', label: '電車' },
      { value: 'bus', label: 'バス' },
      { value: 'taxi', label: 'タクシー' },
      { value: 'gas', label: 'ガソリン' },
      { value: 'parking', label: '駐車場' },
    ],
    entertainment: [
      { value: 'movies', label: '映画' },
      { value: 'books', label: '本' },
      { value: 'games', label: 'ゲーム' },
      { value: 'music', label: '音楽' },
      { value: 'sports', label: 'スポーツ' },
    ],
    utilities: [
      { value: 'electricity', label: '電気' },
      { value: 'gas', label: 'ガス' },
      { value: 'water', label: '水道' },
      { value: 'internet', label: 'インターネット' },
      { value: 'phone', label: '携帯電話' },
    ],
    consumables: [
      { value: 'daily_necessities', label: '日用品' },
      { value: 'clothing', label: '衣類' },
      { value: 'cosmetics', label: '化粧品' },
      { value: 'medicine', label: '医薬品' },
      { value: 'stationery', label: '文具' },
    ],
    pets: [
      { value: 'food', label: 'ペットフード' },
      { value: 'supplies', label: '用品' },
      { value: 'medical', label: '医療費' },
      { value: 'grooming', label: 'トリミング' },
      { value: 'insurance', label: '保険' },
    ],
    other: [
      { value: 'gift', label: 'ギフト' },
      { value: 'donation', label: '寄付' },
      { value: 'subscription', label: 'サブスクリプション' },
      { value: 'misc', label: 'その他' },
    ],
  }