import styles from './Form.module.css';

const FormHeader = ({ title, subtitle }) => {
  return (
    <div className={styles['form__header']}>
      <h1 className={styles['form__title']}>{title}</h1>
      <p className={styles['form__subtitle']}>{subtitle}</p>
    </div>
  );
};

export default FormHeader;
