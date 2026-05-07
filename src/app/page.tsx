import Link from 'next/link'
import { BookOpen, BarChart2, Users, Settings } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

const menuItems = [
  {
    href: '/kakeibo',
    icon: BookOpen,
    label: '登録',
    description: '支出の入力・一覧確認',
  },
  {
    href: '/monthly',
    icon: BarChart2,
    label: '月次分析',
    description: '月別支出グラフの確認',
  },
  {
    href: '/users',
    icon: Users,
    label: 'ユーザー管理',
    description: 'ユーザーの追加・編集・削除',
  },
  {
    href: '/settings',
    icon: Settings,
    label: '設定',
    description: 'アプリの設定変更',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">家計簿アプリ</h1>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map(({ href, icon: Icon, label, description }) => (
            <Link key={href} href={href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-8">
                  <Icon className="h-10 w-10 text-primary" />
                  <span className="text-lg font-semibold">{label}</span>
                  <span className="text-sm text-muted-foreground text-center">{description}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
