import styles from './Form.module.css';

const FormActions = ({
  onCancel,
  onSubmit,
  loading,
  submitText = 'Submit',
  loadingText = 'Creating...',
}) => {
  return (
    <div className={styles['form__actions']}>
      <button
        type="button"
        onClick={onCancel}
        className={styles['form__button--cancel']}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        className={styles['form__button--submit']}
        disabled={loading}
      >
        {loading ? loadingText : submitText}
      </button>
    </div>
  );
};

export default FormActions;
