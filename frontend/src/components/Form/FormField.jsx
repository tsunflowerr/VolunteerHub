import styles from './Form.module.css';

const FormField = ({
  icon: Icon,
  label,
  required = false,
  error,
  children,
}) => {
  return (
    <div className={styles['form__group']}>
      <label className={styles['form__label']}>
        {Icon && <Icon size={20} />}
        {label}
        {required && <span className={styles['form__required']}>*</span>}
      </label>
      {children}
      {error && <span className={styles['form__error']}>{error}</span>}
    </div>
  );
};

export default FormField;
