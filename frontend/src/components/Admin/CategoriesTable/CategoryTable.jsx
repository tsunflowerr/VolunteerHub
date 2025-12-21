import PropTypes from 'prop-types';
import { Edit2, Trash2, Loader2, Tag } from 'lucide-react';
import styles from './CategoriesTable.module.css';

function CategoryTable({
  categories,
  startIndex,
  onEdit,
  onDelete,
  actionLoading,
  emptyMessage = 'No categories yet',
}) {
  if (categories.length === 0) {
    return (
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
            <tr>
              <td colSpan="6" className={styles.textCenter}>
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
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
          {categories.map((category, index) => (
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
              <td>
                {new Date(category.createdAt).toLocaleDateString('en-US')}
              </td>
              <td>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => onEdit(category)}
                    disabled={actionLoading === category._id}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={() => onDelete(category._id, category.name)}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

CategoryTable.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      color: PropTypes.string,
      eventCount: PropTypes.number,
      createdAt: PropTypes.string,
    })
  ).isRequired,
  startIndex: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  actionLoading: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default CategoryTable;
