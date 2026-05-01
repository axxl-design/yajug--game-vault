import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/utils/cn';

export interface NicknameInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'maxLength' | 'type'
  > {
  value: string;
  onChange: (value: string) => void;
  /** Se dispara al presionar Enter si el valor es válido. */
  onSubmitValid?: (value: string) => void;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  /** Si se pasa, sobreescribe la validación interna y muestra este error. */
  externalError?: string;
}

const DEFAULT_MAX = 20;

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

function validate(value: string, max: number): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'El nickname no puede estar vacío.' };
  }
  if (value.length > max) {
    return { valid: false, error: `Máximo ${max} caracteres.` };
  }
  return { valid: true, error: null };
}

export const NicknameInput = forwardRef<HTMLInputElement, NicknameInputProps>(
  function NicknameInput(
    {
      value,
      onChange,
      onSubmitValid,
      maxLength = DEFAULT_MAX,
      label = 'Nickname',
      placeholder = 'Tu nombre en la mesa',
      externalError,
      autoFocus,
      className,
      id,
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const errorId = `${inputId}-error`;
    const counterId = `${inputId}-counter`;

    const [touched, setTouched] = useState(false);
    const { valid, error: internalError } = validate(value, maxLength);
    const showError = externalError ?? (touched && !valid ? internalError : null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value.slice(0, maxLength);
      onChange(next);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && valid && onSubmitValid) {
        e.preventDefault();
        onSubmitValid(value.trim());
      }
    };

    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-baseline justify-between">
          <label htmlFor={inputId}>{label}</label>
          <span id={counterId} aria-live="polite">
            {value.length}/{maxLength}
          </span>
        </div>
        <input
          ref={ref}
          id={inputId}
          type="text"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(showError)}
          aria-describedby={cn(counterId, showError ? errorId : undefined)}
        />
        {showError && (
          <p id={errorId} role="alert">
            {showError}
          </p>
        )}
      </div>
    );
  },
);
