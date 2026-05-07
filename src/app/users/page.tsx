import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UsersPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center space-x-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <CardTitle className="text-2xl font-bold">ユーザー管理</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
          準備中
        </CardContent>
      </Card>
    </main>
  )
}
