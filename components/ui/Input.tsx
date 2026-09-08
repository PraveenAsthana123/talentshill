'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn(styles.input, error && styles.error, className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && <span id={`${inputId}-error`} className={styles.errorText} role="alert">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(styles.input, styles.textarea, error && styles.error, className)}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span className={styles.errorText} role="alert">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <select
          ref={ref}
          id={inputId}
          className={cn(styles.input, styles.select, error && styles.error, className)}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className={styles.errorText} role="alert">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
