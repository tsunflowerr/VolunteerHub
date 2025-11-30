import { useState, useEffect } from 'react'
import { Edit3, Trash2, Plus, X, Save, Loader2, Tag, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './CategoriesTable.css'

/**
 * BƯỚC 12: Quản lý Danh mục
 * Học CRUD đầy đủ với form
 */

function CategoriesTable() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        
        // Gọi API lấy danh sách categories
        const response = await fetch('http://localhost:4000/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status}`)
        }

        const data = await response.json()
        
        // Map dữ liệu từ API
        const mappedCategories = (data.categories || data.data || []).map(cat => ({
          _id: cat._id,
          name: cat.name,
          description: cat.description || ''
        }))
        
        setCategories(mappedCategories)
        console.log('✅ Đã lấy dữ liệu categories từ API:', mappedCategories.length, 'danh mục')
        
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu categories:', err)
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
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên danh mục'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Tên danh mục phải có ít nhất 2 ký tự'
    } else if (categories.some(c => c.name.toLowerCase() === formData.name.toLowerCase() && c._id !== editingId)) {
      errors.name = 'Tên danh mục đã tồn tại'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

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
        setCategories([newCategory, ...categories])
        alert('✅ Thêm danh mục thành công!')
      }

      // Reset form and close modal
      handleCloseModal()
    } catch (err) {
      alert('❌ Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description
    })
    setEditingId(category._id)
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = (categoryId) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa danh mục này?')) return
    
    setCategories(categories.filter(cat => cat._id !== categoryId))
    alert('✅ Đã xóa danh mục!')
  }

  // Close modal and reset form
  const handleCloseModal = () => {
    setFormData({ name: '', description: '' })
    setShowModal(false)
    setEditingId(null)
    setFormErrors({})
  }

  // Pagination logic
  const totalPages = Math.ceil(categories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCategories = categories.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, categories.length)} / {categories.length} kết quả
        </div>
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>
          
          {startPage > 1 && (
            <>
              <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
            </>
          )}
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="pagination-size">
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="categories-container">
      <div className="table-header">
        <h2>Danh sách Danh mục</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} strokeWidth={2.5} />
          Thêm danh mục
        </button>
      </div>

      {/* Modal thêm/sửa */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
                <button className="modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="name">Tên danh mục <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Môi trường"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả về danh mục..."
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {editingId ? 'Đang cập nhật...' : 'Đang tạo...'}
                      </>
                    ) : (
                      <>
                        {editingId ? <Save size={18} /> : <Plus size={18} />}
                        {editingId ? 'Cập nhật' : 'Thêm danh mục'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {paginatedCategories.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                Chưa có danh mục nào
              </td>
            </tr>
          ) : (
            paginatedCategories.map((category, index) => (
              <tr key={category._id}>
                <td>{startIndex + index + 1}</td>
                <td><strong>{category.name}</strong></td>
                <td>{category.description || 'Không có mô tả'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(category)}
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} strokeWidth={2.5} />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(category._id)}
                      title="Xóa danh mục"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {renderPagination()}
    </div>
  )
}

export default CategoriesTable
