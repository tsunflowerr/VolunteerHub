import { useState, useEffect } from 'react'
import './CategoriesTable.css'

/**
 * BƯỚC 12: Quản lý Danh mục
 * Học CRUD đầy đủ với form
 */

function CategoriesTable() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const mockCategories = [
          { _id: '1', name: 'Môi trường', description: 'Các hoạt động bảo vệ môi trường' },
          { _id: '2', name: 'Giáo dục', description: 'Hỗ trợ giáo dục cho trẻ em' },
          { _id: '3', name: 'Y tế', description: 'Hoạt động y tế cộng đồng' },
          { _id: '4', name: 'Từ thiện', description: 'Các hoạt động từ thiện, trao quà' }
        ]
        
        setCategories(mockCategories)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle submit (Create or Update)
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('⚠️ Vui lòng nhập tên danh mục')
      return
    }

    if (editingId) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat._id === editingId 
          ? { ...cat, ...formData }
          : cat
      ))
      alert('✅ Cập nhật danh mục thành công!')
    } else {
      // Create new category
      const newCategory = {
        _id: Date.now().toString(),
        ...formData
      }
      setCategories([...categories, newCategory])
      alert('✅ Thêm danh mục thành công!')
    }

    // Reset form
    setFormData({ name: '', description: '' })
    setShowForm(false)
    setEditingId(null)
  }

  // Handle edit
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description
    })
    setEditingId(category._id)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = (categoryId) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa danh mục này?')) return
    
    setCategories(categories.filter(cat => cat._id !== categoryId))
    alert('✅ Đã xóa danh mục!')
  }

  // Cancel form
  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setShowForm(false)
    setEditingId(null)
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="categories-container">
      <div className="table-header">
        <h2>📁 Danh sách Danh mục ({categories.length})</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Đóng' : '+ Thêm danh mục'}
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="category-form">
          <h3>{editingId ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên danh mục *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Môi trường"
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả về danh mục..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? '💾 Cập nhật' : '✅ Thêm mới'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                ✕ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                Chưa có danh mục nào
              </td>
            </tr>
          ) : (
            categories.map((category, index) => (
              <tr key={category._id}>
                <td>{index + 1}</td>
                <td><strong>{category.name}</strong></td>
                <td>{category.description || 'Không có mô tả'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(category)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(category._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CategoriesTable
