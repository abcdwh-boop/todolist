import React, { useState, useEffect } from 'react';
import { auth, db, logoutUser } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import TeacherLogin from './components/TeacherLogin';
import StudentSignup from './components/StudentSignup';
import TodoList from './components/TodoList';
import { LogOut, GraduationCap, CheckSquare } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'teacher' or 'student'
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('teacher-login'); // 'teacher-login' or 'student-signup'

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // If the document doesn't exist, check if email is pre-configured or default
            // Here, we default to student if not specified, or allow custom handling
            setRole('student');
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setRole('student'); // Fallback
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser, userRole) => {
    setUser(loggedInUser);
    setRole(userRole);
  };

  const handleSignupSuccess = (registeredUser, userRole) => {
    setUser(registeredUser);
    setRole(userRole);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>앱을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <CheckSquare size={20} />
          </div>
          <span className="logo-text">EduTodo</span>
        </div>

        {user && (
          <div className="user-profile">
            <span className={`user-role-badge ${role}`}>
              {role === 'teacher' ? '교사' : '학생'}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {user.email}
            </span>
            <button className="btn btn-secondary action-btn" onClick={handleLogout} title="로그아웃" style={{ width: 'auto', padding: '0.5rem' }}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {user ? (
          <TodoList user={user} role={role} />
        ) : (
          <div className="auth-wrapper">
            {authView === 'teacher-login' ? (
              <TeacherLogin 
                onLoginSuccess={handleLoginSuccess} 
                switchToStudentSignup={() => setAuthView('student-signup')} 
              />
            ) : (
              <StudentSignup 
                onSignupSuccess={handleSignupSuccess} 
                switchToTeacherLogin={() => setAuthView('teacher-login')} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
