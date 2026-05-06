import {
  mysqlTable,
  int,
  decimal,
  varchar,
  date,
  timestamp,
} from "drizzle-orm/mysql-core";

export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  date: date("date").notNull(),
  genre: varchar("genre", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
