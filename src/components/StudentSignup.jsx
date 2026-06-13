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
      <h2 className="auth-title">학생 회원가입</h2>
      <p className="auth-subtitle">새로운 학생 계정을 생성하고 개인 할 일 목록을 관리하세요.</p>
      
      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="student-email">학생 이메일</label>
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
          <label className="form-label" htmlFor="student-password">비밀번호 (6자 이상)</label>
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
          <label className="form-label" htmlFor="student-confirm-password">비밀번호 확인</label>
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
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#fff' }}></div>
          ) : (
            <>
              <UserPlus size={18} />
              회원가입
            </>
          )}
        </button>
      </form>
      
      <p className="auth-toggle-link">
        교사이신가요? <span onClick={switchToTeacherLogin}>교사 로그인하기</span>
      </p>
    </div>
  );
}
