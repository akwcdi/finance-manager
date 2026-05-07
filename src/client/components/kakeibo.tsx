'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, Download, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as Toast from '@radix-ui/react-toast'
import { genres } from '@/client/components/genre'
import { items } from '@/client/components/item'

interface Transaction {
  id: number;
  amount: number;
  date: string;
  genre: string;
  item: string;
}

interface ApiTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  genre: string;
}

export default function Kakeibo() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [genre, setGenre] = useState(genres[0].value)
  const [item, setItem] = useState(items[genre][0].label)
  const [editingAmount, setEditingAmount] = useState('')
  const [editingGenre, setEditingGenre] = useState(genres[0].value)
  const [editingItem, setEditingItem] = useState(items[genre][0].label)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '' })

  useEffect(() => {
    if (items[genre] && items[genre].length > 0) {
      setItem(items[genre][0].label)
    } else {
      setItem('')
    }
  }, [genre])

  useEffect(() => {
    if (items[editingGenre] && items[editingGenre].length > 0) {
      setEditingItem(items[editingGenre][0].label)
    } else {
      setEditingItem('')
    }
  }, [editingGenre])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({ month: selectedMonth })
      const response = await fetch(`/api/transactions?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiTransaction[] = await response.json()
      const mappedData: Transaction[] = data.map((transaction) => ({
        ...transaction,
        item: transaction.description,  // Map description to item
        description: ''  // Clear the description field
      }))
      setTransactions(mappedData)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showToast("エラー", "データの取得中にエラーが発生しました")
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [selectedMonth])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const selectedItem = item || (items[genre] && items[genre][0]?.value) || ''
    const newTransaction: Omit<Transaction, 'id'> = {
      amount: parseFloat(amount),
      date,
      genre,
      item: selectedItem
    }
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      fetchTransactions()
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setGenre(genres[0].value)
      setItem(items[genres[0].value][0].value)
      showToast("成功", "データが追加されました")
    } catch (error) {
      console.error('Error adding transaction:', error)
      showToast("エラー", "データの追加中にエラーが発生しました")
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditingAmount(transaction.amount.toString())
    setEditingGenre(transaction.genre)
    setEditingItem(transaction.item)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editingTransaction) {
      try {
        const updatedTransaction = {
          ...editingTransaction,
          genre: editingGenre,
          item: editingItem
        }
        const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTransaction),
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        fetchTransactions()
        setEditingTransaction(null)
        setIsEditDialogOpen(false)
        showToast("成功", "データが更新されました")
      } catch (error) {
        console.error('Error updating transaction:', error)
        showToast("エラー", "データの更新中にエラーが発生しました")
      }
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      fetchTransactions()
      showToast("成功", "データが削除されました")
    } catch (error) {
      console.error('Error deleting transaction:', error)
      showToast("エラー", "データの削除中にエラーが発生しました")
    }
  }

  const filteredTransactions = useMemo(() => {
    const [year, month] = selectedMonth.split('-')
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === parseInt(year) && transactionDate.getMonth() === parseInt(month) - 1
    })
  }, [transactions, selectedMonth])

  const monthlyExpenses = useMemo(() => {
    const total = filteredTransactions.reduce((acc, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    return Math.round(total);
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    // Create an array for all days in the month
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    // Define the type for expenses
    type Expenses = { [key: string]: number };
    
    // Initialize data array with all days
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      expenses: genres.reduce<Expenses>((acc, genre) => ({ ...acc, [genre.value]: 0 }), {})
    }));
    
    // Add transaction data
    filteredTransactions.forEach(t => {
      const day = new Date(t.date).getDate();
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      if (!isNaN(amount) && day >= 1 && day <= daysInMonth) {
        data[day - 1].expenses[t.genre] = (data[day - 1].expenses[t.genre] || 0) + amount;
      }
    });
    
    return data;
  }, [filteredTransactions, selectedMonth, genres]);

  const maxAmount = useMemo(() => {
    if (chartData.length === 0) return 1000;
    const max = Math.max(...chartData.map(d => 
      Object.values(d.expenses as { [key: string]: number }).reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0)
    ));
    return max === 0 ? 1000 : max;
  }, [chartData]);

  const groupedTransactions = useMemo(() => {
    const grouped = filteredTransactions.reduce((acc, transaction) => {
      const dateKey = transaction.date
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(transaction)
      return acc
    }, {} as { [key: string]: Transaction[] })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
  }, [filteredTransactions])

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description })
    setOpen(true)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const generateCSV = () => {
    const headers = ['日付', 'ジャンル', '項目', '金額']
    const csvData = filteredTransactions.map(t => 
      `${formatDate(t.date)},${t.genre},${t.item},${t.amount}`
    )
    return [headers.join(','), ...csvData].join('\n')
  }

  const downloadCSV = () => {
    const csv = generateCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `kakeibo_${selectedMonth}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <>
      <Toast.Provider swipeDirection="right">
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-full m-0 list-none z-[2147483647] outline-none" />
        <Toast.Root className="bg-white rounded-md shadow-lg p-4 grid grid-cols-[auto_max-content] gap-x-4 items-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full" open={open} onOpenChange={setOpen}>
          <Toast.Title className="text-sm font-medium mb-1">{toastMessage.title}</Toast.Title>
          <Toast.Description className="text-sm text-gray-500">{toastMessage.description}</Toast.Description>
          <Toast.Action className="inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" asChild altText="Close">
            <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md" onClick={() => setOpen(false)}>
              閉じる
            </button>
          </Toast.Action>
        </Toast.Root>
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-4xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <CardTitle className="text-2xl font-bold">登録</CardTitle>
              </div>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link href="/monthly">月次分析</Link>
                </Button>
                <Button onClick={downloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  CSVエクスポート
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold">
                  月間支出: ¥{monthlyExpenses.toLocaleString()}
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="月を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(new Date().getFullYear(), i, 1)
                      return (
                        <SelectItem key={i} value={`${date.getFullYear()}-${String(i + 1).padStart(2, '0')}`}>
                          {date.toLocaleString('ja-JP', { year: 'numeric', month: 'long' })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">金額</Label>
                  <Input
                    id="amount"
                    type="number"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="1000"
                    className="font-sans"
                  />
                </div>
                <div>
                  <Label htmlFor="genre">ジャンル</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="ジャンルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                <Label htmlFor="item">項目</Label>
                <Select value={item} onValueChange={setItem}>
                  <SelectTrigger>
                    <SelectValue placeholder={`${items[genre]?.[0].label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {items[genre]?.map((item) => (
                      <SelectItem key={item.value} value={item.label}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                <div>
                  <Label htmlFor="date">日付</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> 追加
                </Button>
              </form>
              <div className="h-64 w-full">
                <svg width="100%" height="100%" viewBox="0 0 846 200">
                  {chartData.map((data, index) => {
                    let totalHeight = 0;
                    const barWidth = Math.min(20, (846 / chartData.length) - 2);
                    const x = (index * (846 / chartData.length)) + ((846 / chartData.length) - barWidth) / 2;
                    
                    return (
                      <g key={data.day} transform={`translate(${x}, 0)`}>
                        {genres.map((genre) => {
                          const height = ((data.expenses[genre.value] || 0) / maxAmount) * 180;
                          const y = 180 - totalHeight - height;
                          totalHeight += height;
                          return (
                            <rect
                              key={genre.value}
                              x="0"
                              y={y}
                              width={barWidth}
                              height={Math.max(height, 0)}
                              fill={genre.color}
                            />
                          );
                        })}
                        <text x={barWidth/2} y="195" textAnchor="middle" fontSize="12">{data.day}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-center space-x-4">
                {genres.map((genre) => (
                  <div key={genre.value} className="flex items-center">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: genre.color }}></div>
                    <span>{genre.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3  className="text-lg font-semibold mb-2">支出内訳</h3>
                {groupedTransactions.map(([date, transactions]) => (
                  <div key={date} className="mb-4">
                    <h4 className="font-semibold">{new Date(date).toLocaleDateString('ja-JP')}</h4>
                    <ul className="space-y-1">
                      {transactions.map(transaction => (
                        <li key={transaction.id} className="flex justify-between items-center">
                          <span>{transaction.item}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">
                              -¥{transaction.amount.toLocaleString()}
                            </span>
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => handleEdit(transaction)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>取引を編集</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-amount">金額</Label>
                                    <Input
                                      id="edit-amount"
                                      type="number"
                                      inputMode="numeric"
                                      value={editingAmount || ''}
                                      onChange={(e) => setEditingTransaction(prev => prev ? {...prev, amount: parseFloat(e.target.value)} : null)}
                                      required
                                      className="font-sans"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-genre">ジャンル</Label>
                                    <Select value={editingGenre} onValueChange={setEditingGenre}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="ジャンルを選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {genres.map((g) => (
                                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-item">項目</Label>
                                    <Select value={editingItem} onValueChange={setEditingItem}>
                                      <SelectTrigger>
                                        <SelectValue placeholder={`${items[genre]?.[0].label}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {items[editingGenre]?.map((i) => (
                                          <SelectItem key={i.value} value={i.label}>{i.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button type="submit">保存</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>
      </Toast.Provider>
    </>
  )
}