import styles from './Form.module.css';

const TextInput = ({
  name,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  min,
  disabled = false,
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      className={`${styles['form__input']} ${
        error ? styles['form__input--error'] : ''
      }`}
      disabled={disabled}
    />
  );
};

export default TextInput;
