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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: '#55628b' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
        <p style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>LOADING SYSTEM...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 1. Header with Mascot Bubble & Logo */}
      <header className="app-header">
        <div className="mascot-container">
          <span className="mascot-icon" role="img" aria-label="mario-mascot">👾</span>
          <div className="mascot-bubble">
            {user ? "SYSTEM ACTIVE. HELLO!" : "WELCOME TO EDUTODO!"}
          </div>
        </div>

        <div className="logo-container">
          <div className="logo-pill">
            <span className="logo-text">Nintendo 01</span>
          </div>
        </div>
      </header>

      {/* 2. Primary Halftone Carbon Nav Bar */}
      <nav className="nav-bar halftone-bg">
        <ul className="nav-links">
          <li className="nav-link">Home</li>
          <li className="nav-link">My Tasks</li>
          <li className="nav-link">Calendar</li>
          <li className="nav-link">NSider</li>
          <li className="nav-link">Help</li>
        </ul>

        {user && (
          <div className="user-profile">
            <span className={`user-role-badge ${role}`}>
              {role === 'teacher' ? '교사' : '학생'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700 }}>
              {user.email}
            </span>
            <button className="btn btn-secondary action-btn" onClick={handleLogout} title="로그아웃" style={{ width: 'auto', padding: '0.25rem var(--spacing-sm)' }}>
              <LogOut size={12} />
            </button>
          </div>
        )}
      </nav>

      {/* 3. Secondary Subnav Strip */}
      <div className="subnav-strip">
        <span className="subnav-link">PARENTS</span>
        <span className="subnav-link">CUSTOMER SERVICE</span>
        <span className="subnav-link">CORPORATE</span>
        <span className="subnav-link">GLOBAL</span>
        <span className="subnav-link">STORE</span>
        <span className="subnav-link">CONTACT</span>
      </div>

      {/* 4. Left Rail & Main Layout Wrapper */}
      <div className="main-layout-wrapper">
        <aside className="left-rail">
          <div className="left-rail-tab active">TODAY</div>
          <div className="left-rail-tab">WEEKLY</div>
          <div className="left-rail-tab">RATINGS</div>
          <div className="left-rail-tab">RULES</div>
        </aside>

        {/* Main Content Dashboard */}
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

      {/* 5. Footer Bar */}
      <footer className="footer-bar halftone-bg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div>©1997-2001 EDUTODO CO., LTD. ALL RIGHTS RESERVED.</div>
          <div style={{ color: 'var(--muted-indigo)' }}>TRADEMARKS ARE PROPERTY OF THEIR RESPECTIVE OWNERS.</div>
        </div>
        <div className="esrb-badge">
          ESRB PRIVACY CERTIFIED
        </div>
      </footer>
    </div>
  );
}
