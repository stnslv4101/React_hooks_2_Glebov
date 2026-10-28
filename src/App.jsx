import { useReducer, useEffect, useCallback, useTransition, useState, useMemo } from 'react';
import { tasksReducer } from './tasksReducer.js';
import { AddTaskForm } from './components/AddTaskForm.jsx';
import { TaskList } from './components/TaskList.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { useTheme } from './ThemeContext.jsx';

const initialTasks = [];

const mockFetchTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, text: 'Изучить хук useReducer', done: true },
        { id: 2, text: 'Разобраться с useCallback', done: false },
        { id: 3, text: 'Проверить работу React 19', done: false },
      ]);
    }, 1000);
  });
};

export default function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  
  // Состояние для фильтрации: 'all', 'active' или 'completed'
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    mockFetchTasks().then((loadedTasks) => {
      dispatch({ type: 'addMany', tasks: loadedTasks });
    });
  }, []);

  const handleAddTask = useCallback((text) => {
    dispatch({
      type: 'add',
      task: { id: Date.now(), text, done: false }
    });
  }, []);

  const handleToggleTask = useCallback((id) => {
    dispatch({ type: 'toggle', id });
  }, []);

  const handleRemoveTask = useCallback((id) => {
    dispatch({ type: 'remove', id });
  }, []);

  const handleClearDone = () => {
    startTransition(() => {
      dispatch({ type: 'clearDone' });
    });
  };

  const handleClearAll = () => {
    dispatch({ type: 'clearAll' });
  };

  // Оптимизированный подсчет статистики
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    return { total, completed };
  }, [tasks]);

  // Фильтрация списка перед отрисовкой
  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter(t => !t.done);
    if (filter === 'completed') return tasks.filter(t => t.done);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="app-container">
      <header>
        <h1>Менеджер задач</h1>
        <ThemeToggle />
      </header>

      <main>
        <AddTaskForm onAdd={handleAddTask} />
        
        {/* Кнопки переключения фильтров */}
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Активные
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Готовые
          </button>
        </div>

        {/* Строка статистики */}
        <div className="stats-row">
          Всего: {stats.total}, выполнено: {stats.completed}
        </div>
        
        {isPending && <p className="loading">Очистка выполненных задач...</p>}
        
        <TaskList 
          tasks={filteredTasks} 
          onToggle={handleToggleTask} 
          onRemove={handleRemoveTask}

        />

        {tasks.length > 0 && (
          <div className="controls">
            <button onClick={handleClearDone} disabled={isPending}>
              Удалить выполненные
            </button>
            <button onClick={handleClearAll} className="btn-danger">
              Очистить всё
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
