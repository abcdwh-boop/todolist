import React, { useState } from 'react';
import { registerStudent } from '../firebase';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function StudentSignup({ onSignupSuccess, switchToTeacherLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Register with Firebase & set role to student
      const { user, role } = await registerStudent(email, password);
      onSignupSuccess(user, role);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else {
        setError('회원가입 중 오류가 발생했습니다. (Firebase Config 설정 확인 필요)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="section-label-bar">
        <span>≡ STUDENT REGISTER</span>
        <span className="mascot-icon">📝</span>
      </div>
      <div className="auth-card-content">
        <h2 className="auth-title">STUDENT PORTAL</h2>
        <p className="auth-subtitle">CREATE AN ACCOUNT & START TRACKING TASKS</p>
        
        {error && (
          <div className="alert-banner error">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="student-email">STUDENT EMAIL</label>
            <input
              id="student-email"
              type="email"
              className="form-input"
              placeholder="student@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="student-password">PASSWORD (6+ CHARS)</label>
            <input
              id="student-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student-confirm-password">CONFIRM PASSWORD</label>
            <input
              id="student-confirm-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <hr className="dotted-divider" />
          
          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <UserPlus size={12} />
                REGISTER
              </>
            )}
          </button>
        </form>
        
        <p className="auth-toggle-link">
          TEACHER? <span onClick={switchToTeacherLogin}>LOG IN HERE</span>
        </p>
      </div>
    </div>
  );
}
