import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import './Login.css'

/**
 * BƯỚC 13: Login Page
 * Form đăng nhập với validation
 */

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error khi user nhập
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('⚠️ Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // OPTION 1: Kết nối API thật (bỏ comment để dùng)
      /*
      const data = await api.login(formData)
      login(data.user, data.token)
      navigate('/admin')
      */
      
      // OPTION 2: Mock login (demo - accept bất kỳ email/password)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        _id: '1',
        fullName: 'Admin User',
        email: formData.email,
        role: 'admin'
      }
      const mockToken = 'mock-jwt-token-123456'
      
      login(mockUser, mockToken)
      navigate('/admin')
      
    } catch (err) {
      setError('❌ ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🌟 VolunteerHub</h1>
        <h2>Đăng nhập</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>🔒 Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Đang đăng nhập...' : '🚀 Đăng nhập'}
          </button>
        </form>

        <p className="demo-note">
          💡 Demo: Nhập bất kỳ email/password nào để đăng nhập
        </p>
      </div>
    </div>
  )
}

export default Login
