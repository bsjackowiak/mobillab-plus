"use client";

import { useId, useRef, useState } from "react";
import {
  formatBirthDateLabel,
  formatPeselInput,
  isValidPesel,
  parsePeselBirthDate,
} from "@/lib/pesel";
import { formErrorAlertProps } from "@/components/ui/form-field-layout";
import styles from "./PeselInput.module.css";

type PeselInputProps = {
  id?: string;
  value: string;
  onChange: (digits: string) => void;
  error?: string;
  hint?: string;
};

const PESEL_LENGTH = 11;
const DATE_PART_LENGTH = 6;

function focusInput(input: HTMLInputElement | null) {
  input?.focus();
}

export function PeselInput({ id, value, onChange, error, hint }: PeselInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const digits = formatPeselInput(value);
  const activeIndex = focused ? Math.min(digits.length, PESEL_LENGTH - 1) : -1;
  const birthDate = parsePeselBirthDate(digits);
  const isComplete = digits.length === PESEL_LENGTH;
  const isValid = isValidPesel(digits);

  function handleChange(raw: string) {
    onChange(formatPeselInput(raw));
  }

  function renderCell(index: number) {
    const filled = index < digits.length;
    const active = index === activeIndex;
    const char = digits[index] ?? "";

    return (
      <span
        key={index}
        className={`${styles.cell}${filled ? ` ${styles.cellFilled}` : ""}${active ? ` ${styles.cellActive}` : ""}`}
        aria-hidden="true"
      >
        {char || "·"}
      </span>
    );
  }

  const inputClassName = [
    styles.input,
    error ? styles.inputError : "",
    isValid ? styles.inputValid : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrap}>
      <div
        className={inputClassName}
        onClick={() => focusInput(inputRef.current)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            focusInput(inputRef.current);
          }
        }}
        role="presentation"
      >
        <div className={styles.groups}>
          <div className={styles.group}>
            <span className={styles.groupLabel}>Data urodzenia</span>
            <div className={styles.cells}>{Array.from({ length: DATE_PART_LENGTH }, (_, i) => renderCell(i))}</div>
          </div>
          <span className={styles.groupDivider} aria-hidden="true" />
          <div className={styles.group}>
            <span className={styles.groupLabel}>Nr i suma</span>
            <div className={styles.cells}>
              {Array.from({ length: PESEL_LENGTH - DATE_PART_LENGTH }, (_, i) =>
                renderCell(DATE_PART_LENGTH + i),
              )}
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          className={styles.hiddenInput}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={digits}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(e) => {
            e.preventDefault();
            handleChange(e.clipboardData.getData("text"));
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null].filter(Boolean).join(" ") ||
            undefined
          }
        />
      </div>

      <div className={styles.meta}>
        {isComplete && isValid && birthDate ? (
          <span className={styles.ok}>Data urodzenia: {formatBirthDateLabel(birthDate)}</span>
        ) : birthDate ? (
          <span className={styles.hint}>Data urodzenia: {formatBirthDateLabel(birthDate)}</span>
        ) : digits.length > 0 ? (
          <span className={styles.hint}>
            {digits.length}/{PESEL_LENGTH} cyfr
          </span>
        ) : hint ? (
          <span className={styles.hint} id={`${inputId}-hint`}>
            {hint}
          </span>
        ) : null}
      </div>

      {error && (
        <span className={styles.errorText} id={`${inputId}-error`} {...formErrorAlertProps}>
          {error}
        </span>
      )}
    </div>
  );
}
