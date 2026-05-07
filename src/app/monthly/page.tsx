'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from 'lucide-react'
import { genres } from '@/client/components/genre'

interface MonthlyData {
  month: number;
  genreAmounts: {
    [key: string]: number;
  };
  total: number;
}

interface Transaction {
  id: number;
  amount: string;
  description: string;
  date: string;
  genre: string;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  genre: string;
  amount: number;
}

export default function MonthlyPage() {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString())
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData>({ visible: false, x: 0, y: 0, genre: '', amount: 0 })

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  }, [])

  const fetchMonthlyData = async (year: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const monthlyDataPromises = Array.from({ length: 12 }, async (_, i) => {
        const month = String(i + 1).padStart(2, '0')
        const params = new URLSearchParams({ month: `${year}-${month}` })
        const response = await fetch(`/api/transactions?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const data: Transaction[] = await response.json()
        return data
      })

      const allMonthsData = await Promise.all(monthlyDataPromises)
      
      const transformedData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        genreAmounts: genres.reduce((acc, genre) => ({
          ...acc,
          [genre.value]: 0
        }), {}),
        total: 0
      }))

      allMonthsData.forEach((monthTransactions, monthIndex) => {
        monthTransactions.forEach(transaction => {
          const amount = parseFloat(transaction.amount)
          if (!isNaN(amount)) {
            transformedData[monthIndex].genreAmounts[transaction.genre] += amount
            transformedData[monthIndex].total += amount
          }
        })
      })

      setMonthlyData(transformedData)
    } catch (error) {
      console.error('Error fetching monthly data:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyData(selectedYear)
  }, [selectedYear])

  const maxAmount = useMemo(() => {
    if (monthlyData.length === 0) return 1000;
    const max = Math.max(...monthlyData.map(d => d.total));
    return max === 0 ? 1000 : max;
  }, [monthlyData]);

  const handleMouseEnter = (event: React.MouseEvent<SVGRectElement>, genre: string, amount: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
    if (svgRect) {
      const x = rect.left - svgRect.left;
      const y = rect.top - svgRect.top;
      setTooltip({
        visible: true,
        x: x + rect.width,
        y: y + (rect.height / 2),
        genre,
        amount
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const generateCSV = () => {
    const headers = ['月', ...genres.map(g => g.label), '合計']
    const csvData = monthlyData.map(data => 
      [
        data.month,
        ...genres.map(g => data.genreAmounts[g.value] || 0),
        data.total
      ].join(',')
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
      link.setAttribute('download', `monthly_expenses_${selectedYear}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <CardTitle className="text-2xl font-bold">月別支出グラフ</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="年を選択" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSVエクスポート
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && <div className="text-center">データを読み込んでいます...</div>}
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          {!isLoading && !error && (
            <>
              <div className="h-64 w-full relative">
                <svg width="100%" height="100%" viewBox="0 0 846 200">
                  {monthlyData.map((data, index) => {
                    let totalHeight = 0;
                    const barWidth = Math.min(60, (846 / monthlyData.length) - 2);
                    const x = (index * (846 / monthlyData.length)) + ((846 / monthlyData.length) - barWidth) / 2;
                    const monthTotalHeight = (data.total / maxAmount) * 180;
                    
                    return (
                      <g key={data.month} transform={`translate(${x}, 0)`}>
                        {genres.map((genre) => {
                          const genreAmount = data.genreAmounts[genre.value] || 0;
                          const height = genreAmount > 0 ? (genreAmount / data.total) * monthTotalHeight : 0;
                          const y = Math.max(0, 180 - totalHeight - height);
                          totalHeight += height;
                          
                          return (
                            <rect
                              key={genre.value}
                              x="0"
                              y={y.toString()}
                              width={barWidth}
                              height={Math.max(height, 0).toString()}
                              fill={genre.color}
                              onMouseEnter={(e) => handleMouseEnter(e, genre.label, genreAmount)}
                              onMouseLeave={handleMouseLeave}
                            />
                          );
                        })}
                        <text x={barWidth/2} y="195" textAnchor="middle" fontSize="12">{data.month}月</text>
                      </g>
                    );
                  })}
                </svg>
                {tooltip.visible && (
                  <div
                    className="absolute bg-white border border-gray-200 rounded p-2 shadow-md text-sm z-50 min-w-[70px] whitespace-nowrap"
                    style={{
                      left: `${tooltip.x}px`,
                      top: `${tooltip.y}px`,
                      transform: 'translate(10px, -50%)',
                    }}
                  >
                    <p className="font-semibold mb-1">{tooltip.genre}</p>
                    <p>¥{tooltip.amount.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-4">
                {genres.map((genre) => (
                  <div key={genre.value} className="flex items-center">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: genre.color }}></div>
                    <span>{genre.label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="border-b pb-2">
                    <h3 className="font-semibold">{data.month}月 合計: ¥{data.total.toLocaleString()}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map((genre) => (
                        <div key={genre.value} className="flex justify-between">
                          <span>{genre.label}:</span>
                          <span className="font-medium">¥{(data.genreAmounts[genre.value] || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}