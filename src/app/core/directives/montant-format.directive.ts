import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appMontantFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MontantFormatDirective),
      multi: true
    }
  ]
})
export class MontantFormatDirective implements ControlValueAccessor {

  private readonly elementRef = inject(ElementRef<HTMLInputElement>);

  private onChange: (value: number | null) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: number | null): void {
    this.elementRef.nativeElement.value = this.formatMontant(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.elementRef.nativeElement.disabled = disabled;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const cursorPosition = input.selectionStart ?? input.value.length;

    const digitsBeforeCursor = input.value.substring(0, cursorPosition).replace(/\D/g, '').length;

    let value = input.value.replace(/[^\d,]/g, '');

    const commaIndex = value.indexOf(',');

    if (commaIndex !== -1) {
      value = value.substring(0, commaIndex + 1) + value.substring(commaIndex + 1).replace(/,/g, '');
    }

    const parts = value.split(',');

    if (parts.length > 1) {
      parts[1] = parts[1].substring(0, 2);
    }

    const integerPart = parts[0].replace(/^0+(?=\d)/, '');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const formattedValue = parts.length > 1
      ? `${formattedInteger},${parts[1]}`
      : formattedInteger;

    input.value = formattedValue;

    let newPosition = 0;
    let digitCount = 0;

    while (newPosition < formattedValue.length && digitCount < digitsBeforeCursor) {
      if (/\d/.test(formattedValue[newPosition])) {
        digitCount++;
      }
      newPosition++;
    }

    input.setSelectionRange(newPosition, newPosition);

    const numericValue = this.parseMontant(value);
    this.onChange(numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.elementRef.nativeElement;
    const value = this.parseMontant(input.value);

    input.value = this.formatMontant(value);

    this.onChange(value);
    this.onTouched();
  }

  private parseMontant(value: string): number | null {
    if (!value || !value.trim()) {
      return null;
    }

    const normalized = value.replace(/\s/g, '').replace(',', '.');

    if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
      return null;
    }

    const montant = Number(normalized);

    return Number.isFinite(montant) ? montant : null;
  }

  private formatMontant(value: number | null): string {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return '';
    }

    return new Intl.NumberFormat('fr-FR', {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(value)).replace(/[\u00A0\u202F]/g, ' ');
  }
}
