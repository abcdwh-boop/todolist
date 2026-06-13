import React, { useState, useEffect } from 'react';
import { todoService } from '../firebase';
import { 
  Plus, Check, Trash2, Edit2, X, Save, 
  ListTodo, User, BookOpen, AlertCircle, ShieldAlert 
} from 'lucide-react';

export default function TodoList({ user, role }) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError('');
    
    try {
      const unsubscribe = todoService.subscribeTodos(user.uid, role, (fetchedTodos) => {
        setTodos(fetchedTodos);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는데 실패했습니다. Firebase Firestore 권한 또는 설정을 확인하세요.');
      setLoading(false);
    }
  }, [user.uid, role]);

  // Create Todo (Only students can create, or teachers can also create if they wish. Usually students manage their own and teachers review, but let's allow both)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await todoService.addTodo(newTask.trim(), user.uid, role, user.email);
      setNewTask('');
    } catch (err) {
      console.error(err);
      setError('할 일을 등록하는 중에 오류가 발생했습니다.');
    }
  };

  // Toggle Complete (Update)
  const handleToggleComplete = async (todoId, currentStatus) => {
    try {
      await todoService.updateTodo(todoId, { completed: !currentStatus });
    } catch (err) {
      console.error(err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  // Start Inline Editing
  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  // Save Edited Task Text (Update)
  const handleSaveEdit = async (todoId) => {
    if (!editingText.trim()) return;
    try {
      await todoService.updateTodo(todoId, { task: editingText.trim() });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError('수정에 실패했습니다.');
    }
  };

  // Delete Todo
  const handleDelete = async (todoId) => {
    try {
      await todoService.deleteTodo(todoId);
    } catch (err) {
      console.error(err);
      setError('삭제에 실패했습니다.');
    }
  };

  // Filter Todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="dashboard-grid">
      {/* Sidebar Info/Add Todo */}
      <div className="dashboard-sidebar">
        <div className="todo-creator-card">
          <h3 className="card-title">정보 및 관리</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <User size={16} className="text-muted" />
              <span><strong>계정:</strong> {user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <BookOpen size={16} className="text-muted" />
              <span>
                <strong>권한:</strong> {role === 'teacher' ? '교사 (전체 조회/수정)' : '학생 (본인 목록 관리)'}
              </span>
            </div>
          </div>

          {/* Todo Add Form: Students and Teachers can add */}
          <form onSubmit={handleAddTodo}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-todo-input">할 일 등록</label>
              <input
                id="new-todo-input"
                type="text"
                className="form-input"
                placeholder={role === 'teacher' ? "공지 및 학급 과제 등록..." : "오늘 할 일은 무엇인가요?"}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} />
              추가하기
            </button>
          </form>
        </div>
        
        {error && (
          <div className="alert-banner error" style={{ margin: 0 }}>
            <ShieldAlert size={18} />
            <span style={{ fontSize: '0.8rem' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Main Todo List Board */}
      <div className="todo-list-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>할 일 목록</h3>
          
          <div className="todo-filters">
            <span 
              className={`filter-badge ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체 ({todos.length})
            </span>
            <span 
              className={`filter-badge ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              진행 중 ({todos.filter(t => !t.completed).length})
            </span>
            <span 
              className={`filter-badge ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              완료 ({todos.filter(t => t.completed).length})
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
            <p style={{ marginTop: '1rem' }}>실시간 데이터를 가져오는 중입니다...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <ListTodo className="empty-icon" />
            <p>할 일 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="todo-items">
            {filteredTodos.map((todo) => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-item-content">
                  {/* Status checkbox */}
                  <div 
                    className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                    onClick={() => handleToggleComplete(todo.id, todo.completed)}
                  >
                    {todo.completed && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    {editingId === todo.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{ padding: '0.25rem 0.5rem' }}
                          autoFocus
                        />
                        <button className="action-btn" onClick={() => handleSaveEdit(todo.id)}>
                          <Save size={16} />
                        </button>
                        <button className="action-btn" onClick={() => setEditingId(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="todo-text">{todo.task}</span>
                        {/* Meta info, especially showing creator info for teachers */}
                        <div className="todo-meta">
                          {role === 'teacher' && (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              작성자: {todo.createdByEmail} ({todo.creatorRole === 'teacher' ? '교사' : '학생'})
                            </span>
                          )}
                          <span>
                            {new Date(todo.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="todo-actions">
                  {editingId !== todo.id && (
                    <button 
                      className="action-btn" 
                      onClick={() => startEditing(todo.id, todo.task)}
                      title="수정"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button 
                    className="action-btn delete" 
                    onClick={() => handleDelete(todo.id)}
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
