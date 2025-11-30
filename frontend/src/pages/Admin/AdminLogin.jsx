import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUser = { _id: '1', fullName: 'Admin User', email: formData.email, role: 'admin' }
      localStorage.setItem('token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('currentUser', JSON.stringify(mockUser))
      navigate('/admin')
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>VolunteerHub</h1>
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" disabled={loading} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" disabled={loading} />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="demo-note">Demo: Enter any email/password to login</p>
      </div>
    </div>
  )
}

export default AdminLogin