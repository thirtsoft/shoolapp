export interface IFilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'date-range';
  placeholder?: string;
  options?: { value: any; label: string }[];
  disabled?: boolean;
  fromKey?: string; // Pour date-range
  toKey?: string;  // Pour date-range
  onChange?: (value: any) => void;
}
