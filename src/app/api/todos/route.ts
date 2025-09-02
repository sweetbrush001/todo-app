import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { todos } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));
    return NextResponse.json(allTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, category, dueDate, position } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newTodo = await db.insert(todos).values({
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      category: category || 'general',
      dueDate: dueDate ? new Date(dueDate) : null,
      position: position || 0,
    }).returning();

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
