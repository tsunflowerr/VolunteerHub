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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data - 20 categories for pagination testing
        const mockCategories = [
          { _id: '1', name: 'Môi trường', description: 'Các hoạt động bảo vệ môi trường, dọn rác, trồng cây' },
          { _id: '2', name: 'Giáo dục', description: 'Hỗ trợ giáo dục cho trẻ em vùng cao, dạy học miễn phí' },
          { _id: '3', name: 'Y tế', description: 'Hoạt động y tế cộng đồng, khám bệnh miễn phí' },
          { _id: '4', name: 'Từ thiện', description: 'Các hoạt động từ thiện, trao quà cho người nghèo' },
          { _id: '5', name: 'Hiến máu', description: 'Chương trình hiến máu nhân đạo tại các bệnh viện' },
          { _id: '6', name: 'Động vật', description: 'Bảo vệ động vật hoang dã và cứu hộ thú cưng' },
          { _id: '7', name: 'Cộng đồng', description: 'Hoạt động phát triển cộng đồng địa phương' },
          { _id: '8', name: 'Thiên tai', description: 'Cứu trợ và hỗ trợ nạn nhân thiên tai, bão lũ' },
          { _id: '9', name: 'Người cao tuổi', description: 'Chăm sóc và hỗ trợ người cao tuổi neo đơn' },
          { _id: '10', name: 'Trẻ em', description: 'Bảo vệ quyền lợi và hỗ trợ trẻ em mồ côi' },
          { _id: '11', name: 'Khuyết tật', description: 'Hỗ trợ người khuyết tật hòa nhập cộng đồng' },
          { _id: '12', name: 'Văn hóa', description: 'Bảo tồn và phát huy văn hóa truyền thống' },
          { _id: '13', name: 'Thể thao', description: 'Tổ chức các hoạt động thể thao cộng đồng' },
          { _id: '14', name: 'Nghệ thuật', description: 'Hoạt động nghệ thuật từ thiện và biểu diễn' },
          { _id: '15', name: 'Công nghệ', description: 'Hỗ trợ công nghệ cho vùng sâu vùng xa' },
          { _id: '16', name: 'Nông nghiệp', description: 'Hỗ trợ nông dân phát triển sản xuất' },
          { _id: '17', name: 'Nhà ở', description: 'Xây dựng và sửa chữa nhà cho người nghèo' },
          { _id: '18', name: 'Nước sạch', description: 'Cung cấp nước sạch cho vùng khó khăn' },
          { _id: '19', name: 'Dinh dưỡng', description: 'Hỗ trợ bữa ăn miễn phí cho người vô gia cư' },
          { _id: '20', name: 'Pháp lý', description: 'Tư vấn pháp lý miễn phí cho người nghèo' }
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
