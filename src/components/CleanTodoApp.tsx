'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DatePicker from 'react-datepicker';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface SortableTodoProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

function SortableTodo({ todo, onToggle, onDelete }: SortableTodoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  const priorityConfig = {
    high: {
      border: 'border-l-red-500',
      badge: 'bg-red-100 text-red-700',
      icon: '🔴'
    },
    medium: {
      border: 'border-l-amber-500',
      badge: 'bg-amber-100 text-amber-700',
      icon: '🟡'
    },
    low: {
      border: 'border-l-green-500',
      badge: 'bg-green-100 text-green-700',
      icon: '🟢'
    }
  };

  const config = priorityConfig[todo.priority];
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        config.border
      } ${todo.completed ? 'opacity-60' : ''} ${isOverdue ? 'bg-red-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="mt-1 p-1 rounded cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Checkbox */}
        <div 
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
            todo.completed 
              ? 'bg-blue-500 border-blue-500' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onClick={() => onToggle(todo.id, todo.completed)}
        >
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`font-medium text-gray-900 ${
              todo.completed ? 'line-through text-gray-500' : ''
            }`}>
              {todo.title}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                <span className="text-xs">{config.icon}</span>
                {todo.priority}
              </span>
              
              {isOverdue && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {todo.description && (
            <p className={`text-sm mb-3 ${
              todo.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {todo.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Created {new Date(todo.createdAt).toLocaleDateString()}</span>
            
            {todo.dueDate && (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Due {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(todo.id, todo.completed)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              todo.completed
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {todo.completed ? 'Undo' : 'Done'}
          </button>
          
          <button
            onClick={() => onDelete(todo.id)}
            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CleanTodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    dueDate: null as Date | null
  });
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data.sort((a: Todo, b: Todo) => a.position - b.position));
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const maxPosition = Math.max(...todos.map(t => t.position), 0);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTodo,
          category: newTodo.category || 'tasks', // Set default category if empty
          position: maxPosition + 1,
          dueDate: newTodo.dueDate?.toISOString() || null
        }),
      });
      
      if (response.ok) {
        setNewTodo({ 
          title: '', 
          description: '', 
          priority: 'medium',
          category: '',
          dueDate: null
        });
        setShowAddForm(false);
        fetchTodos();
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over?.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      try {
        await Promise.all(
          newTodos.map((todo, index) =>
            fetch(`/api/todos/${todo.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ position: index }),
            })
          )
        );
      } catch (error) {
        console.error('Error updating positions:', error);
      }
    }
  };

  // Filter logic
  const filteredTodos = todos.filter(todo => {
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    const matchesCompleted = showCompleted || !todo.completed;
    
    // Date filtering logic
    let matchesDate = true;
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        matchesDate = dueDate.getTime() === selectedDate.getTime();
      } else {
        matchesDate = false; // If no due date, don't match when filtering by date
      }
    }
    
    return matchesPriority && matchesCompleted && matchesDate;
  });

  const pendingTodos = filteredTodos.filter(t => !t.completed);
  const completedTodos = filteredTodos.filter(t => t.completed);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{todos.filter(t => !t.completed).length}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{todos.filter(t => t.completed).length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">{todos.filter(t => t.priority === 'high' && !t.completed).length}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            
            <div className="relative">
              <DatePicker
                selected={filterDate}
                onChange={(date) => setFilterDate(date)}
                placeholderText="Filter by due date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                dateFormat="MMMM d, yyyy"
                isClearable
              />
            </div>
            
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                showCompleted 
                  ? 'bg-gray-50 text-gray-700 border-gray-300' 
                  : 'bg-blue-50 text-blue-700 border-blue-300'
              }`}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            {showAddForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
            <form onSubmit={addTodo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
                
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
                
                <DatePicker
                  selected={newTodo.dueDate}
                  onChange={(date) => setNewTodo({ ...newTodo, dueDate: date })}
                  placeholderText="Due date (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                />
                
                <div className="md:col-span-2">
                  <textarea
                    placeholder="Description (optional)..."
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredTodos.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {/* Pending Tasks */}
            {pendingTodos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Active Tasks ({pendingTodos.length})
                </h3>
                <div className="space-y-3">
                  {pendingTodos.map((todo) => (
                    <SortableTodo
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTodos.length > 0 && showCompleted && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Completed Tasks ({completedTodos.length})
                </h3>
                <div className="space-y-3">
                  {completedTodos.map((todo) => (
                    <SortableTodo
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTodos.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">Create your first task to get started!</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
