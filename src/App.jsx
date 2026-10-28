import { useReducer, useEffect, useCallback, useTransition } from 'react';
import { tasksReducer } from './tasksReducer.js';
import { AddTaskForm } from './components/AddTaskForm.jsx';
import { TaskList } from './components/TaskList.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { useTheme } from './ThemeContext.jsx';

// Начальное состояние — пустой массив задач
const initialTasks = [];

// Симуляция получения данных с сервера (Задание 3 - useEffect)
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

  // Загрузка первоначальных задач при старте (useEffect)
  useEffect(() => {
    mockFetchTasks().then((loadedTasks) => {
      dispatch({ type: 'addMany', tasks: loadedTasks });
    });
  }, []);

  // Оптимизация колбэков с помощью useCallback (Шаг 5)
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

  // Очистка выполненных с использованием useTransition (React 19)
  const handleClearDone = () => {
    startTransition(() => {
      dispatch({ type: 'clearDone' });
    });
  };

  const handleClearAll = () => {
    dispatch({ type: 'clearAll' });
  };

  return (
    <div className={`app-container ${theme}`}>
      <header>
        <h1>Список задач (React Hooks)</h1>
        <ThemeToggle />
      </header>

      <main>
        <AddTaskForm onAdd={handleAddTask} />
        
        {isPending && <p className="loading">Очистка выполненных задач...</p>}
        
        <TaskList 
          tasks={tasks} 
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
