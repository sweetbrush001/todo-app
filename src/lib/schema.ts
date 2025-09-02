import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').default(false).notNull(),
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
  category: text('category').default('general').notNull(),
  dueDate: timestamp('due_date'),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
