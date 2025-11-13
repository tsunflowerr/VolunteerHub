import styles from './Form.module.css';

const TextArea = ({ name, value, onChange, placeholder, rows = 4, error }) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${styles['form__textarea']} ${
        error ? styles['form__input--error'] : ''
      }`}
    />
  );
};

export default TextArea;
