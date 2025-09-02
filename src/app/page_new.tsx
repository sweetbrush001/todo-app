import TodoApp from '@/components/TodoApp';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          ✅ Todo App
        </h1>
        <TodoApp />
      </div>
    </main>
  );
}
