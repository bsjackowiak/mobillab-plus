import type { InputHTMLAttributes, ReactNode } from "react";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldHintClassName,
  fieldHintSuccessClassName,
  fieldInputClassName,
  fieldLabelClassName,
} from "@/components/ui/form-field-layout";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  hintSuccess?: boolean;
};

export function FormField({
  id,
  label,
  error,
  hint,
  hintSuccess = false,
  className,
  ...inputProps
}: Props) {
  return (
    <div className={fieldGroupClassName}>
      <label className={fieldLabelClassName} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${fieldInputClassName(Boolean(error))}${className ? ` ${className}` : ""}`}
        {...inputProps}
      />
      {error && <span className={fieldErrorTextClassName}>{error}</span>}
      {hint && (
        <span className={`${fieldHintClassName}${hintSuccess ? ` ${fieldHintSuccessClassName}` : ""}`}>
          {hint}
        </span>
      )}
    </div>
  );
}
