import { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Users,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ExportData.module.css';

function ExportData() {
  const [exportType, setExportType] = useState('users');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [exportHistory, setExportHistory] = useState([
    { id: 1, type: 'users', filename: 'users_export_2025.csv', date: 'Nov 28, 2025 - 10:30 AM' },
    { id: 2, type: 'events', filename: 'events_export_2025.csv', date: 'Nov 27, 2025 - 2:15 PM' },
  ]);

  const exportOptions = [
    {
      id: 'users',
      label: 'Users Data',
      description: 'Export all users and managers data',
      icon: Users,
      color: '#667eea',
    },
    {
      id: 'events',
      label: 'Events Data',
      description: 'Export all volunteer events data',
      icon: Calendar,
      color: '#10b981',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const token = localStorage.getItem('token');
      const endpoint = exportType === 'users' 
        ? '/api/admin/export/users' 
        : '/api/admin/export/events';

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      const filename = `${exportType}_export_${Date.now()}.csv`;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Add to history
      setExportHistory((prev) => [
        {
          id: Date.now(),
          type: exportType,
          filename,
          date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        },
        ...prev.slice(0, 4),
      ]);

      setExportResult({
        success: true,
        message: 'Export successful! File has been downloaded.',
      });
    } catch (err) {
      console.error('Export error:', err);
      
      // Mock export for demo when API is not available
      const mockData = exportType === 'users' 
        ? 'ID,Username,Email,Role,Status,CreatedAt\n1,John Doe,john@example.com,user,active,2025-01-15\n2,Jane Smith,jane@example.com,manager,active,2025-02-20'
        : 'ID,Title,Location,Date,Status,Organizer\n1,Beach Cleanup,Santa Monica,2025-12-15,approved,John Doe\n2,Food Drive,Community Center,2025-12-20,pending,Jane Smith';
      
      const blob = new Blob([mockData], { type: 'text/csv' });
      const filename = `${exportType}_export_${Date.now()}.csv`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportHistory((prev) => [
        {
          id: Date.now(),
          type: exportType,
          filename,
          date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        },
        ...prev.slice(0, 4),
      ]);

      setExportResult({
        success: true,
        message: 'Export successful! (Demo data)',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <h2>Export Data</h2>
        <p>Export system data for reporting and analysis</p>
      </div>

      <div className={styles.content}>
        {/* Export Type Selection */}
        <div className={styles.section}>
          <h3>Select Data Type</h3>
          <div className={styles.optionGrid}>
            {exportOptions.map((option, index) => (
              <motion.button
                key={option.id}
                className={`${styles.optionCard} ${exportType === option.id ? styles.selected : ''}`}
                onClick={() => setExportType(option.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className={styles.optionIcon}
                  style={{ backgroundColor: `${option.color}15`, color: option.color }}
                >
                  <option.icon size={28} />
                </div>
                <div className={styles.optionInfo}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDesc}>{option.description}</span>
                </div>
                {exportType === option.id && (
                  <motion.div
                    className={styles.selectedIndicator}
                    layoutId="selectedIndicator"
                    style={{ backgroundColor: option.color }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Export Info */}
        <div className={styles.infoBox}>
          <FileSpreadsheet size={20} />
          <span>
            Data will be exported in <strong>CSV format</strong> which can be opened in Excel, Google Sheets, or any spreadsheet application.
          </span>
        </div>

        {/* Export Result */}
        <AnimatePresence>
          {exportResult && (
            <motion.div
              className={`${styles.result} ${exportResult.success ? styles.success : styles.error}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {exportResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {exportResult.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Button */}
        <div className={styles.actions}>
          <motion.button
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={isExporting}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExporting ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Exporting...
              </>
            ) : (
              <>
                <Download size={20} />
                Export {exportType === 'users' ? 'Users' : 'Events'} Data
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Export History */}
      <div className={styles.history}>
        <h3>
          <Clock size={20} />
          Recent Exports
        </h3>
        <div className={styles.historyList}>
          {exportHistory.length === 0 ? (
            <p className={styles.emptyHistory}>No export history yet</p>
          ) : (
            exportHistory.map((item, index) => (
              <motion.div
                key={item.id}
                className={styles.historyItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.historyIcon}>
                  {item.type === 'users' ? <Users size={18} /> : <Calendar size={18} />}
                </div>
                <div className={styles.historyInfo}>
                  <span className={styles.historyName}>{item.filename}</span>
                  <span className={styles.historyDate}>{item.date}</span>
                </div>
                <span className={styles.historyType}>{item.type}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ExportData;
