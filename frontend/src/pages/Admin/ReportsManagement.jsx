import { useState, useMemo, useCallback } from 'react';
import { Loader2, Flag, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  useAdminReports,
  useReviewReport,
  useDeleteReport,
  useAdminReportStats,
} from '../../hooks/useAdmin';
import {
  ReportSearchFilter,
  ReportTable,
  ReportDetailModal,
} from '../../components/Admin/ReportsTable';
import { Pagination } from '../../components/common';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import styles from '../../components/Admin/ReportsTable/ReportsTable.module.css';
import statStyles from './ReportsManagement.module.css';

function ReportsManagement() {
  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteReportId, setDeleteReportId] = useState(null);

  // TanStack Query hooks
  const { data, isLoading, isError, error } = useAdminReports();
  const { data: statsData } = useAdminReportStats();
  const reviewMutation = useReviewReport();
  const deleteMutation = useDeleteReport();

  // Get reports from query data
  const reports = data?.reports || [];
  const stats = statsData?.stats || { pending: 0, resolved: 0, dismissed: 0, total: 0 };

  // Filter reports locally with useMemo for performance
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.reporter?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportedUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesType = filterType === 'all' || report.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, searchTerm, filterStatus, filterType]);

  // Pagination calculations with useMemo
  const { paginatedReports, totalPages, startIndex, endIndex, totalReports } =
    useMemo(() => {
      const total = filteredReports.length;
      const pages = Math.ceil(total / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, total);
      const paginated = filteredReports.slice(start, start + itemsPerPage);

      return {
        paginatedReports: paginated,
        totalPages: pages,
        startIndex: start,
        endIndex: end,
        totalReports: total,
      };
    }, [filteredReports, currentPage, itemsPerPage]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((value) => {
    setFilterType(value);
    setCurrentPage(1);
  }, []);

  const handleViewReport = useCallback((report) => {
    setSelectedReport(report);
  }, []);

  const handleReviewReport = useCallback(
    (reportId, status, action, adminNote = '') => {
      reviewMutation.mutate(
        {
          reportId,
          data: { status, action, adminNote },
        },
        {
          onSuccess: () => {
            setSelectedReport(null);
          },
        }
      );
    },
    [reviewMutation]
  );

  const handleDeleteReport = useCallback(
    (reportId) => {
      setDeleteReportId(reportId);
    },
    []
  );

  const confirmDeleteReport = useCallback(() => {
    if (deleteReportId) {
      deleteMutation.mutate(deleteReportId, {
        onSuccess: () => {
          toast.success('Report deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete report');
        },
      });
    }
    setDeleteReportId(null);
  }, [deleteReportId, deleteMutation]);

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
        Loading reports...
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
          'Failed to load reports'}
      </div>
    );
  }

  const emptyMessage =
    searchTerm || filterStatus !== 'all' || filterType !== 'all'
      ? 'No matching reports found'
      : 'No reports yet';

  return (
    <div className={statStyles.container}>
      <div className={statStyles.header}>
        <h2>
          <Flag size={24} />
          Reports Management
        </h2>
      </div>

      {/* Stats Cards */}
      <div className={statStyles.statsGrid}>
        <div className={`${statStyles.statCard} ${statStyles.pending}`}>
          <AlertTriangle size={24} />
          <div className={statStyles.statInfo}>
            <span className={statStyles.statValue}>{stats.pending || 0}</span>
            <span className={statStyles.statLabel}>Pending</span>
          </div>
        </div>
        <div className={`${statStyles.statCard} ${statStyles.resolved}`}>
          <CheckCircle size={24} />
          <div className={statStyles.statInfo}>
            <span className={statStyles.statValue}>{stats.resolved || 0}</span>
            <span className={statStyles.statLabel}>Resolved</span>
          </div>
        </div>
        <div className={`${statStyles.statCard} ${statStyles.dismissed}`}>
          <XCircle size={24} />
          <div className={statStyles.statInfo}>
            <span className={statStyles.statValue}>{stats.dismissed || 0}</span>
            <span className={statStyles.statLabel}>Dismissed</span>
          </div>
        </div>
        <div className={`${statStyles.statCard} ${statStyles.total}`}>
          <Flag size={24} />
          <div className={statStyles.statInfo}>
            <span className={statStyles.statValue}>{stats.total || reports.length}</span>
            <span className={statStyles.statLabel}>Total</span>
          </div>
        </div>
      </div>

      <ReportSearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusChange}
        filterType={filterType}
        onTypeChange={handleTypeChange}
      />

      <ReportTable
        reports={paginatedReports}
        startIndex={startIndex}
        onView={handleViewReport}
        onReview={handleReviewReport}
        onDelete={handleDeleteReport}
        isReviewPending={reviewMutation.isPending}
        reviewingReportId={reviewMutation.variables?.reportId}
        emptyMessage={emptyMessage}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalReports}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onReview={handleReviewReport}
            isReviewPending={reviewMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Delete Report Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteReportId}
        onClose={() => setDeleteReportId(null)}
        onConfirm={confirmDeleteReport}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default ReportsManagement;
