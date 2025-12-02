import { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  CategorySearchFilter,
  CategoryTable,
  CategoryModal,
} from '../../components/Admin/CategoriesTable';
import { Pagination } from '../../components/common';
import styles from '../../components/Admin/CategoriesTable/CategoriesTable.module.css';

// Mock data for development/fallback
const mockCategories = [
  {
    _id: '1',
    name: 'Environment',
    description: 'Environmental protection activities',
    color: '#4caf50',
    eventCount: 12,
    createdAt: '2025-01-10',
  },
  {
    _id: '2',
    name: 'Education',
    description: 'Teaching and mentoring programs',
    color: '#2196f3',
    eventCount: 8,
    createdAt: '2025-01-15',
  },
  {
    _id: '3',
    name: 'Health',
    description: 'Healthcare and wellness initiatives',
    color: '#f44336',
    eventCount: 15,
    createdAt: '2025-02-01',
  },
  {
    _id: '4',
    name: 'Community',
    description: 'Community building events',
    color: '#ff9800',
    eventCount: 10,
    createdAt: '2025-02-20',
  },
  {
    _id: '5',
    name: 'Animal Welfare',
    description: 'Animal care and rescue',
    color: '#9c27b0',
    eventCount: 5,
    createdAt: '2025-03-05',
  },
];

function CategoriesManagement() {
  // Data state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories on mount
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
      const mappedCategories = (data.data || data.categories || []).map(
        (cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, ''),
          description: cat.description || '',
          color: cat.color || '#667eea',
          eventCount: cat.eventCount || 0,
          createdAt: cat.createdAt,
        })
      );
      setCategories(mappedCategories);
    } catch (err) {
      console.warn('Using mock data:', err.message);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useState(() => {
    fetchCategories();
  });

  // Filter categories locally with useMemo
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Pagination calculations with useMemo
  const { paginatedCategories, totalPages, startIndex, endIndex, totalItems } =
    useMemo(() => {
      const total = filteredCategories.length;
      const pages = Math.ceil(total / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, total);
      const paginated = filteredCategories.slice(start, end);

      return {
        paginatedCategories: paginated,
        totalPages: pages,
        startIndex: start,
        endIndex: end,
        totalItems: total,
      };
    }, [filteredCategories, currentPage, itemsPerPage]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleOpenModal = useCallback((category = null) => {
    setSelectedCategory(category);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedCategory(null);
  }, []);

  const handleSubmitCategory = useCallback(
    async (formData) => {
      const token = localStorage.getItem('token');
      const isEditMode = !!selectedCategory;

      if (isEditMode) {
        // Update existing category
        try {
          const response = await fetch(
            `/api/admin/categories/${selectedCategory._id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              credentials: 'include',
              body: JSON.stringify(formData),
            }
          );
          if (!response.ok) throw new Error('API failed');
        } catch {
          // Fallback to mock update
        }
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === selectedCategory._id ? { ...cat, ...formData } : cat
          )
        );
      } else {
        // Create new category
        try {
          const response = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify(formData),
          });
          if (response.ok) {
            const data = await response.json();
            setCategories((prev) => [
              data.data || {
                ...formData,
                _id: String(Date.now()),
                eventCount: 0,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ]);
            return;
          }
          throw new Error('API failed');
        } catch {
          // Mock create
          setCategories((prev) => [
            {
              _id: String(Date.now()),
              ...formData,
              eventCount: 0,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      }
    },
    [selectedCategory]
  );

  const handleDelete = useCallback(async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    try {
      setActionLoading(categoryId);
      // Note: Backend doesn't have delete category endpoint yet
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  // Loading state
  if (loading && categories.length === 0) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        Loading data...
      </div>
    );
  }

  const emptyMessage = searchTerm
    ? 'No matching categories found'
    : 'No categories yet';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Categories Management</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => handleOpenModal(null)}
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <CategoryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
        category={selectedCategory}
      />

      <CategorySearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <CategoryTable
        categories={paginatedCategories}
        startIndex={startIndex}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        actionLoading={actionLoading}
        emptyMessage={emptyMessage}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default CategoriesManagement;
