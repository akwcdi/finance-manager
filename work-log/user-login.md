# ユーザーログイン機能の実装

## 作業情報
- ブランチ: feature/user-login
- 最終更新日: 2026-05-08
- 関連PR: （作成予定）

## 背景・問題

### 元々できなかったこと・問題点
- 家計簿アプリに認証機能がなく、誰でも全ページにアクセスできる状態だった
- ユーザーごとのデータ管理ができず、複数ユーザーで利用する場合にデータが混在する問題があった

## 実施した対応

### 修正後の状態
- メールアドレス/パスワードによる新規登録・ログインが可能になった
- 未ログイン状態でアクセスすると `/login` に自動リダイレクトされるようになった
- ヘッダー右上にログインユーザー名（未設定の場合はメールアドレス）とログアウトボタンが表示される
- DBに `users` テーブルが追加され、パスワードは bcrypt でハッシュ化して保存される

### 技術的なアプローチ
- **採用したアプローチ**: NextAuth.js v5 (beta) の Credentials Provider + JWT セッション戦略

- **変更したファイル**:
  - `src/auth.ts` — NextAuth 設定（Credentials プロバイダー、bcrypt 照合、JWT セッション）
  - `src/middleware.ts` — 未認証ユーザーを `/login` にリダイレクト
  - `src/app/api/auth/[...nextauth]/route.ts` — NextAuth ハンドラー
  - `src/app/api/auth/signup/route.ts` — 新規登録 API（Zod バリデーション、重複チェック）
  - `src/app/login/page.tsx` — ログインページ UI
  - `src/app/signup/page.tsx` — 新規登録ページ UI
  - `src/components/header.tsx` — ログインユーザー表示・ログアウトボタン
  - `src/components/providers.tsx` — SessionProvider ラッパー
  - `src/server/infrastructure/db/schema/users.ts` — users テーブル定義
  - `src/types/global.d.ts` — CSS モジュール型宣言

- **アーキテクチャへの影響**: 全ルートが middleware で保護される構造になった。SessionProvider が RootLayout に追加されたため、クライアントコンポーネントからセッション情報を取得できる

### 実装時の判断・工夫
- React 19 RC バージョンの peer dependency 競合のため `--legacy-peer-deps` でインストール
- NextAuth v5 では `export { auth as middleware }` だけではリダイレクトされない仕様のため、コールバック形式 `auth((req) => { if (!req.auth) return Response.redirect(...) })` に変更
- Zod v4 では `error.errors` が廃止され `error.issues` に変わっているため対応
- パスワードのハッシュ化は bcrypt の cost factor 12 を採用（セキュリティと速度のバランス）

## コミット履歴
```
d407dbe ログイン機能追加
2097354 スキーマ追加
d8667b4 マイグレーション追加
```

## 主要な変更差分
```diff
// src/middleware.ts
+ import { auth } from "@/auth";
+
+ export default auth((req) => {
+   if (!req.auth) {
+     const loginUrl = new URL("/login", req.nextUrl.origin);
+     return Response.redirect(loginUrl);
+   }
+ });

// src/server/infrastructure/db/schema/users.ts
+ export const users = mysqlTable("users", {
+   id: int("id").primaryKey().autoincrement(),
+   email: varchar("email", { length: 255 }).notNull().unique(),
+   password: varchar("password", { length: 255 }).notNull(),
+   name: varchar("name", { length: 100 }),
+   createdAt: timestamp("created_at").defaultNow(),
+ });
```

## 関連情報

### テスト
- TypeScript 型チェック（`tsc --noEmit`）通過を確認
- DB マイグレーション（`drizzle-kit migrate`）適用済み

### 参考資料
- [NextAuth.js v5 ドキュメント](https://authjs.dev)

## 今後の課題・備考
- 各ユーザーのトランザクションデータを紐付ける（現状は `transactions` テーブルに `user_id` が未実装）
- パスワードリセット機能は未実装
- セッション有効期限の明示的な設定を検討
