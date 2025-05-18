// components/ui/DatePicker.tsx
"use client";

import React, { forwardRef } from "react";
import ReactDatePicker, {
  DatePickerProps as ReactDatePickerProps,
} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";

type DatePickerProps = {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  [x: string]: any; // Для других props
};

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ selected, onChange, className = "", ...props }, ref) => {
    // Создаем кастомный инпут с поддержкой Tailwind
    const CustomInput = forwardRef<
      HTMLInputElement,
      React.HTMLProps<HTMLInputElement>
    >(({ value, onClick, ...rest }, inputRef) => (
      <input
        ref={inputRef}
        value={value as string}
        onClick={onClick}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
        readOnly // Для предотвращения ввода с клавиатуры
        {...rest}
      />
    ));

    CustomInput.displayName = "CustomDatePickerInput";

    return (
      <div ref={ref}>
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          locale={ru}
          dateFormat="dd.MM.yyyy"
          customInput={<CustomInput />}
          {...props}
        />
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
