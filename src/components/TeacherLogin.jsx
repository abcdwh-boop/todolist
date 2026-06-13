import React, { useState } from 'react';
import { loginUser } from '../firebase';
import { LogIn, AlertCircle } from 'lucide-react';

export default function TeacherLogin({ onLoginSuccess, switchToStudentSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Authenticate with Firebase & retrieve role
      const { user, role } = await loginUser(email, password);
      onLoginSuccess(user, role);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. (Firebase Config 설정 확인 필요)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">교사 로그인</h2>
      <p className="auth-subtitle">등록된 교사 계정으로 로그인하여 할 일 목록을 관리하세요.</p>
      
      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="teacher-email">교사 이메일</label>
          <input
            id="teacher-email"
            type="email"
            className="form-input"
            placeholder="teacher@school.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="teacher-password">비밀번호</label>
          <input
            id="teacher-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#fff' }}></div>
          ) : (
            <>
              <LogIn size={18} />
              로그인
            </>
          )}
        </button>
      </form>
      
      <p className="auth-toggle-link">
        학생이신가요? <span onClick={switchToStudentSignup}>학생 회원가입하기</span>
      </p>
    </div>
  );
}
