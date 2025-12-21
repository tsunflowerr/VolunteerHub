import { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAdminDashboard,
} from '../../hooks/useAdmin';
import {
  CategorySearchFilter,
  CategoryTable,
  CategoryModal,
} from '../../components/Admin/CategoriesTable';
import { Pagination } from '../../components/common';
import styles from '../../components/Admin/CategoriesTable/CategoriesTable.module.css';

function CategoriesManagement() {
  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Loading state for specific actions (like delete)
  const [actionLoading, setActionLoading] = useState(null);

  // TanStack Query hooks
  const { data: categories = [], isLoading, isError, error } = useAdminCategories();
  const { data: dashboardData } = useAdminDashboard();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Filter categories locally with useMemo and merge with dashboard stats
  const filteredCategories = useMemo(() => {
    // Create a map for quick lookup of event counts from dashboard stats
    const eventCounts = {};
    if (dashboardData?.data?.eventStatistics?.byCategory) {
        dashboardData.data.eventStatistics.byCategory.forEach(stat => {
            eventCounts[stat.name] = stat.count;
        });
    }

    return categories
      .map(cat => ({
        ...cat,
        eventCount: eventCounts[cat.name] || 0
      }))
      .filter((cat) =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [categories, searchTerm, dashboardData]);

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
      try {
        if (selectedCategory) {
          await updateCategoryMutation.mutateAsync({
            id: selectedCategory._id,
            data: formData,
          });
        } else {
          await createCategoryMutation.mutateAsync(formData);
        }
        handleCloseModal();
      } catch (error) {
        console.error('Failed to save category:', error);
      }
    },
    [createCategoryMutation, updateCategoryMutation, selectedCategory, handleCloseModal]
  );

  const handleDelete = useCallback(async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
    
    try {
      setActionLoading(categoryId);
      await deleteCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
       // Error handled by mutation onError toast
       console.error('Delete failed', error);
    } finally {
      setActionLoading(null);
    }
  }, [deleteCategoryMutation]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        Loading data...
      </div>
    );
  }
  
  if (isError) {
     return (
      <div className={styles.error}>
        Error: {error?.message || 'Failed to load categories'}
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
        isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending}
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
