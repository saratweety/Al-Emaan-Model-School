import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, required, id, className = "", ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-4 focus:ring-[#A2E494]/30 ${
          error ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#3AB67D]"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
