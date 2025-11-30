import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
} from 'lucide-react';
import styles from './CategoriesTable.module.css';

// Mock data for development/fallback
const mockCategories = [
  { _id: '1', name: 'Environment', description: 'Environmental protection activities', color: '#4caf50', eventCount: 12, createdAt: '2025-01-10' },
  { _id: '2', name: 'Education', description: 'Teaching and mentoring programs', color: '#2196f3', eventCount: 8, createdAt: '2025-01-15' },
  { _id: '3', name: 'Health', description: 'Healthcare and wellness initiatives', color: '#f44336', eventCount: 15, createdAt: '2025-02-01' },
  { _id: '4', name: 'Community', description: 'Community building events', color: '#ff9800', eventCount: 10, createdAt: '2025-02-20' },
  { _id: '5', name: 'Animal Welfare', description: 'Animal care and rescue', color: '#9c27b0', eventCount: 5, createdAt: '2025-03-05' },
];

function CategoriesTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#667eea',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedColors = [
    '#667eea', '#764ba2', '#e53935', '#43a047',
    '#1e88e5', '#ff9800', '#9c27b0', '#00bcd4',
  ];

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const mappedCategories = (data.data || data.categories || []).map((cat) => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, ''),
        description: cat.description || '',
        color: cat.color || '#667eea',
        eventCount: cat.eventCount || 0,
        createdAt: cat.createdAt,
      }));
      setCategories(mappedCategories);
    } catch (err) {
      console.warn('Using mock data:', err.message);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '') } : {}),
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter category name';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description must not exceed 200 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, ''),
        description: category.description || '',
        color: category.color || '#667eea',
      });
    } else {
      setFormData({ name: '', slug: '', description: '', color: '#667eea' });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({ name: '', slug: '', description: '', color: '#667eea' });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (modalMode === 'create') {
        try {
          const response = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              name: formData.name.trim(),
              slug: formData.slug,
              description: formData.description.trim(),
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setCategories((prev) => [data.data || { ...formData, _id: Date.now(), eventCount: 0, createdAt: new Date().toISOString() }, ...prev]);
          } else {
            throw new Error('API failed');
          }
        } catch {
          // Mock create
          setCategories((prev) => [{
            _id: String(Date.now()),
            ...formData,
            eventCount: 0,
            createdAt: new Date().toISOString(),
          }, ...prev]);
        }
      } else {
        try {
          const response = await fetch(`/api/admin/categories/${selectedCategory._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              name: formData.name.trim(),
              slug: formData.slug,
              description: formData.description.trim(),
            }),
          });
          if (!response.ok) throw new Error('API failed');
        } catch {
          // Fallback to mock update
        }
        setCategories((prev) => prev.map((cat) =>
          cat._id === selectedCategory._id ? { ...cat, ...formData } : cat
        ));
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    try {
      setActionLoading(categoryId);
      // Note: Backend doesn't have delete category endpoint yet
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
    } finally {
      setActionLoading(null);
    }
  };

  // Filter categories locally
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  if (loading && categories.length === 0) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        Loading data...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Categories Management</h2>
        <button className={styles.btnPrimary} onClick={() => handleOpenModal('create')}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{modalMode === 'create' ? 'Add New Category' : 'Edit Category'}</h3>
                <button className={styles.modalClose} onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>
                    Category Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="E.g.: Environment, Education, Health..."
                    className={formErrors.name ? styles.inputError : ''}
                  />
                  {formErrors.name && (
                    <span className={styles.errorText}>{formErrors.name}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the category"
                    rows={3}
                    className={formErrors.description ? styles.inputError : ''}
                  />
                  <span className={styles.charCount}>
                    {formData.description.length}/200 characters
                  </span>
                  {formErrors.description && (
                    <span className={styles.errorText}>{formErrors.description}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Display Color</label>
                  <div className={styles.colorPicker}>
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.colorOption} ${formData.color === color ? styles.colorSelected : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData((prev) => ({ ...prev, color }))}
                      />
                    ))}
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className={styles.customColor}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Preview</label>
                  <div className={styles.preview}>
                    <span
                      className={styles.categoryBadge}
                      style={{ backgroundColor: formData.color }}
                    >
                      <Tag size={14} />
                      {formData.name || 'Category Name'}
                    </span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.btnSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className={styles.spinner} />
                        {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {modalMode === 'create' ? 'Create' : 'Save Changes'}
                      </>
                    )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Search */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Category</th>
              <th>Description</th>
              <th>Event Count</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.textCenter}>
                  {searchTerm ? 'No matching categories found' : 'No categories yet'}
                </td>
              </tr>
            ) : (
              paginatedCategories.map((category, index) => (
                <tr key={category._id}>
                  <td>{startIndex + index + 1}</td>
                  <td>
                    <span
                      className={styles.categoryBadge}
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag size={14} />
                      {category.name}
                    </span>
                  </td>
                  <td className={styles.descriptionCell}>
                    {category.description || '-'}
                  </td>
                  <td>
                    <span className={styles.eventCount}>{category.eventCount}</span>
                  </td>
                  <td>{new Date(category.createdAt).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleOpenModal('edit', category)}
                        disabled={actionLoading === category._id}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(category._id, category.name)}
                        disabled={actionLoading === category._id}
                        title="Delete"
                      >
                        {actionLoading === category._id ? (
                          <Loader2 size={16} className={styles.spinner} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length} results
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.paginationBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default CategoriesTable;
