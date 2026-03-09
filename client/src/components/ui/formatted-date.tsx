"use client";

import { memo } from "react";
import { formatDate } from "@/utils/format/date";

interface FormattedDateProps {
  date: Date;
  className?: string;
}

/**
 * Client component that displays a formatted date
 */
export const FormattedDate = memo<FormattedDateProps>(({ date, className }) => {
  return <span className={className}>{formatDate(date)}</span>;
});

FormattedDate.displayName = "FormattedDate";
