import CleanTodoApp from '@/components/CleanTodoApp';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Simple, Clean Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            My Tasks
          </h1>
          <p className="text-slate-600 text-sm">
            Stay organized and productive
          </p>
        </div>
        
        <CleanTodoApp />
      </div>
    </main>
  );
}
