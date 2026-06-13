import React, { useState, useEffect } from 'react';
import { todoService } from '../firebase';
import { 
  Plus, Check, Trash2, Edit2, X, Save, 
  ListTodo, User, BookOpen, ShieldAlert, ChevronRight, HelpCircle
} from 'lucide-react';

export default function TodoList({ user, role }) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Poll state (fun decorative element)
  const [pollVote, setPollVote] = useState('gamecube');
  const [voted, setVoted] = useState(false);

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

  // Create Todo
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

  // Toggle Complete
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

  // Save Edited Task Text
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
      {/* LEFT COLUMN: Hero and Main Task Board */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Y2K Hero Banner Panel */}
        <div className="hero-panel">
          <div className="hero-display-title">Nintendo Gamecube</div>
          <div className="hero-tagline">
            THE SYSTEM OF THE FUTURE HAS ARRIVED. MANAGE YOUR ACADEMIC GOALS IN HIGH-FIDELITY CHROME DESIGN!
          </div>
          <div 
            className="button-arrow-chip" 
            style={{ position: 'absolute', bottom: '12px', right: '12px', width: '24px', height: '24px', borderRadius: '50%' }}
            title="Next Feature"
          >
            →
          </div>
        </div>

        {/* Main Todo List Card */}
        <div className="todo-list-card">
          <div className="section-label-bar">
            <span>≡ OFFICIAL TASK BOARD</span>
            <div className="todo-filters">
              <span 
                className={`filter-badge ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                ALL ({todos.length})
              </span>
              <span 
                className={`filter-badge ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                ACTIVE ({todos.filter(t => !t.completed).length})
              </span>
              <span 
                className={`filter-badge ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                DONE ({todos.filter(t => t.completed).length})
              </span>
            </div>
          </div>

          <div className="todo-list-card-content">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
                <p style={{ marginTop: '1rem', fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>RECEIVING REALTIME PACKETS...</p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="empty-state">
                <ListTodo className="empty-icon" size={32} />
                <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>NO RECORDS REGISTERED.</p>
              </div>
            ) : (
              <div className="todo-items">
                {filteredTodos.map((todo) => (
                  <div key={todo.id} className={`news-row ${todo.completed ? 'completed' : ''}`}>
                    <div className="todo-item-content">
                      {/* Checkbox */}
                      <div 
                        className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleComplete(todo.id, todo.completed)}
                      >
                        {todo.completed && <div className="todo-checkbox-dot"></div>}
                      </div>

                      <div style={{ flexGrow: 1 }}>
                        {editingId === todo.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem', width: '100%' }}>
                            <input
                              type="text"
                              className="form-input"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              style={{ padding: '2px 6px' }}
                              autoFocus
                            />
                            <button className="action-btn" onClick={() => handleSaveEdit(todo.id)}>
                              <Save size={12} />
                            </button>
                            <button className="action-btn" onClick={() => setEditingId(null)}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="todo-text">{todo.task}</span>
                            <div className="todo-meta">
                              {role === 'teacher' && (
                                <span style={{ color: 'var(--primary)', marginRight: '8px' }}>
                                  FROM: {todo.createdByEmail.split('@')[0]} ({todo.creatorRole === 'teacher' ? '교사' : '학생'})
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

                    {/* Actions */}
                    <div className="todo-actions">
                      {editingId !== todo.id && (
                        <button 
                          className="action-btn" 
                          onClick={() => startEditing(todo.id, todo.task)}
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(todo.id)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="button-arrow-chip" style={{ marginLeft: '4px' }}>
                        <ChevronRight size={10} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar Info/Add & Retro Widgets */}
      <div className="dashboard-sidebar">
        {/* 1. Task Creator Card */}
        <div className="todo-creator-card">
          <div className="section-label-bar">
            <span>≡ DISPATCH CENTER</span>
            <span className="mascot-icon">💾</span>
          </div>
          <div className="todo-creator-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px dotted var(--muted-indigo)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '10px', fontWeight: 600 }}>
                <User size={12} className="text-muted" />
                <span>USER: {user.email.split('@')[0]}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '10px', fontWeight: 600 }}>
                <BookOpen size={12} className="text-muted" />
                <span>
                  ROLE: {role === 'teacher' ? 'TEACHER (ALL)' : 'STUDENT (SELF)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleAddTodo}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-todo-input">COMMAND REGISTER</label>
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
                <Plus size={12} />
                ADD TASK
              </button>
            </form>
          </div>
          
          {error && (
            <div className="alert-banner error" style={{ margin: '0 var(--spacing-sm) var(--spacing-sm)' }}>
              <ShieldAlert size={12} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 2. Player's Poll Widget */}
        <div className="poll-panel">
          <div className="section-label-bar">
            <span>≡ PLAYER'S POLL</span>
            <span className="mascot-icon">🗳️</span>
          </div>
          <div className="poll-panel-content">
            {!voted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
                  What is your primary gaming console?
                </p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 600 }}>
                  <input 
                    type="radio" 
                    name="poll-vote" 
                    value="gamecube" 
                    checked={pollVote === 'gamecube'} 
                    onChange={() => setPollVote('gamecube')}
                  />
                  Nintendo GameCube
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 600 }}>
                  <input 
                    type="radio" 
                    name="poll-vote" 
                    value="gba" 
                    checked={pollVote === 'gba'} 
                    onChange={() => setPollVote('gba')}
                  />
                  Game Boy Advance
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 600 }}>
                  <input 
                    type="radio" 
                    name="poll-vote" 
                    value="n64" 
                    checked={pollVote === 'n64'} 
                    onChange={() => setPollVote('n64')}
                  />
                  Nintendo 64
                </label>
                <button 
                  type="button" 
                  className="btn btn-submit" 
                  style={{ marginTop: '8px' }}
                  onClick={() => setVoted(true)}
                >
                  SUBMIT VOTE
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', fontWeight: 600 }}>
                <p style={{ color: 'var(--chrome-indigo)' }}>THANK YOU FOR VOTING!</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>GameCube</span>
                  <span>62%</span>
                </div>
                <div style={{ background: 'var(--chrome-indigo)', height: '8px', width: '62%' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>GBA</span>
                  <span>25%</span>
                </div>
                <div style={{ background: 'var(--chrome-indigo)', height: '8px', width: '25%' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* 3. What Is explainer card */}
        <div className="info-box">
          <div className="section-label-bar" style={{ backgroundColor: 'var(--amber)' }}>
            <span style={{ color: 'var(--carbon)' }}>≡ INFO: EDUTODO</span>
            <HelpCircle size={12} color="var(--carbon)" />
          </div>
          <div className="info-box-content" style={{ fontSize: '10px', fontWeight: 500, lineHeight: 1.4 }}>
            EduTodo Y2K is a scholastic command terminal built on Google Firebase & React. Track tasks in retro style.
          </div>
        </div>
      </div>
    </div>
  );
}
