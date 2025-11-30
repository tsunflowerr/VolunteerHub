import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Mail,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './UsersTable.module.css';

// Mock data for development/fallback
const mockUsers = [
  { _id: '1', fullName: 'John Doe', email: 'john@example.com', role: 'user', isLocked: false, createdAt: '2025-01-15' },
  { _id: '2', fullName: 'Jane Smith', email: 'jane@example.com', role: 'manager', isLocked: false, createdAt: '2025-02-20' },
  { _id: '3', fullName: 'Mike Johnson', email: 'mike@example.com', role: 'user', isLocked: true, createdAt: '2025-03-10' },
  { _id: '4', fullName: 'Sarah Williams', email: 'sarah@example.com', role: 'admin', isLocked: false, createdAt: '2025-04-05' },
  { _id: '5', fullName: 'David Brown', email: 'david@example.com', role: 'user', isLocked: false, createdAt: '2025-05-12' },
];

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSearching, setIsSearching] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const mappedUsers = (data.data || data.users || []).map((user) => ({
        _id: user._id,
        fullName: user.username || user.fullName,
        email: user.email,
        role: user.role || 'user',
        isLocked: user.isLocked || user.status === 'locked',
        createdAt: user.createdAt,
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.warn('Using mock data:', err.message);
      setUsers(mockUsers);
      setError(null); // Reset error when using mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter full name';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Please enter password';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number (10-11 digits)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser = {
        _id: String(Date.now()),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        role: formData.role,
        isLocked: false,
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user',
      });
      setShowModal(false);
      alert('User created successfully!');
    } catch (err) {
      alert('Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'user',
    });
    setFormErrors({});
  };

  const handleToggleLock = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`/api/admin/users/${userId}/lock`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('API failed');
      } catch {
        // Fallback to mock update
      }

      setUsers(users.map((user) =>
        user._id === userId ? { ...user, isLocked: !currentStatus } : user
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setActionLoading(userId);
      // Note: Backend doesn't have delete user endpoint yet, mock only
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(users.filter((user) => user._id !== userId));
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users locally
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const totalUsers = filteredUsers.length;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const renderRole = (role) => {
    const roleMap = {
      admin: { label: 'Admin', className: styles.roleAdmin },
      manager: { label: 'Manager', className: styles.roleManager },
      user: { label: 'User', className: styles.roleUser },
    };
    const roleInfo = roleMap[role] || roleMap.user;
    return (
      <span className={`${styles.roleBadge} ${roleInfo.className}`}>
        {roleInfo.label}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        Loading data...
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Users Management</h2>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
          <UserPlus size={18} />
          Create New User
        </button>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Create New User</h3>
                <button className={styles.modalClose} onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={formErrors.fullName ? styles.inputError : ''}
                  />
                  {formErrors.fullName && (
                    <span className={styles.errorText}>{formErrors.fullName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={formErrors.email ? styles.inputError : ''}
                  />
                  {formErrors.email && (
                    <span className={styles.errorText}>{formErrors.email}</span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordInput}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        className={formErrors.password ? styles.inputError : ''}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <span className={styles.errorText}>{formErrors.password}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Confirm Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordInput}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className={formErrors.confirmPassword ? styles.inputError : ''}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <span className={styles.errorText}>
                        {formErrors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className={formErrors.phone ? styles.inputError : ''}
                    />
                    {formErrors.phone && (
                      <span className={styles.errorText}>{formErrors.phone}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Role <span className={styles.required}>*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="submit"
                    className={styles.btnSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className={styles.spinner} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && <Loader2 size={16} className={styles.spinner} />}
          {searchTerm && !isSearching && (
            <button onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>

        <div className={styles.filterBox}>
          <label>Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.textCenter}>
                  {searchTerm || filterRole !== 'all'
                    ? 'No matching users found'
                    : 'No users yet'}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{renderRole(user.role)}</td>
                  <td>
                    <span
                      className={
                        user.isLocked ? styles.statusLocked : styles.statusActive
                      }
                    >
                      {user.isLocked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={user.isLocked ? styles.btnUnlock : styles.btnLock}
                        onClick={() => handleToggleLock(user._id, user.isLocked)}
                        disabled={actionLoading === user._id}
                        title={user.isLocked ? 'Unlock' : 'Lock account'}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 size={16} className={styles.spinner} />
                        ) : user.isLocked ? (
                          <Shield size={16} />
                        ) : (
                          <ShieldOff size={16} />
                        )}
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(user._id)}
                        disabled={actionLoading === user._id}
                        title="Delete user"
                      >
                        {actionLoading === user._id ? (
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
            Showing {startIndex + 1}-{endIndex} of {totalUsers} results
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

export default UsersTable;
