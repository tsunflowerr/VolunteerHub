import { useState, useMemo, useCallback } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAdminUsers, useToggleLockUser } from '../../hooks/useAdmin';
import {
  UserSearchFilter,
  UserTable,
  CreateUserModal,
} from '../../components/Admin/UsersTable';
import { Pagination } from '../../components/common';
import styles from '../../components/Admin/UsersTable/UsersTable.module.css';

function UsersManagement() {
  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);

  // TanStack Query hooks
  const { data, isLoading, isError, error } = useAdminUsers();
  const toggleLockMutation = useToggleLockUser();

  // Get users from query data
  const users = data?.users || [];

  // Filter users locally with useMemo for performance
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // Pagination calculations with useMemo
  const { paginatedUsers, totalPages, startIndex, endIndex, totalUsers } =
    useMemo(() => {
      const total = filteredUsers.length;
      const pages = Math.ceil(total / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, total);
      const paginated = filteredUsers.slice(start, start + itemsPerPage);

      return {
        paginatedUsers: paginated,
        totalPages: pages,
        startIndex: start,
        endIndex: end,
        totalUsers: total,
      };
    }, [filteredUsers, currentPage, itemsPerPage]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((value) => {
    setFilterRole(value);
    setCurrentPage(1);
  }, []);

  const handleToggleLock = useCallback(
    (userId) => {
      toggleLockMutation.mutate(userId);
    },
    [toggleLockMutation]
  );

  const handleCreateUser = useCallback(async (formData) => {
    // TODO: Implement create user mutation
    console.log('Create user:', formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, []);

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

  // Error state
  if (isError) {
    return (
      <div className={styles.error}>
        Error:{' '}
        {error?.response?.data?.message ||
          error?.message ||
          'Failed to load users'}
      </div>
    );
  }

  const emptyMessage =
    searchTerm || filterRole !== 'all'
      ? 'No matching users found'
      : 'No users yet';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Users Management</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={18} />
          Create New User
        </button>
      </div>

      <CreateUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateUser}
      />

      <UserSearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterRole={filterRole}
        onFilterChange={handleFilterChange}
      />

      <UserTable
        users={paginatedUsers}
        startIndex={startIndex}
        onToggleLock={handleToggleLock}
        isLockPending={toggleLockMutation.isPending}
        lockingUserId={toggleLockMutation.variables}
        emptyMessage={emptyMessage}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalUsers}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default UsersManagement;
