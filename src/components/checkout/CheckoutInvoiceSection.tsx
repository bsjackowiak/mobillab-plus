import { chipClassNames } from "@/components/ui/chip-layout";
import {
  checkoutHeaderClassName,
  checkoutInvoiceBodyClassName,
  checkoutInvoiceChipsClassName,
  checkoutInvoiceFormClassName,
  checkoutInvoiceHintClassName,
  checkoutInvoiceRowClassName,
  checkoutNipRetryLinkClassName,
  checkoutSectionClassName,
} from "@/components/ui/checkout-layout";
import { FormField } from "@/components/ui/FormField";
import { fieldGroupClassName, fieldHintClassName } from "@/components/ui/form-field-layout";
import {
  fieldErrorTextClassName,
  fieldHintClassName as hintClass,
  fieldHintSuccessClassName,
  fieldInputClassName,
  fieldLabelClassName,
} from "@/components/ui/form-field-layout";
import { formatNipInput, formatPostalCodeInput, type InvoiceFieldErrors } from "@/lib/invoice";
import type { InvoiceCompanyData, InvoicePersonalData, InvoiceType } from "@/lib/types";
import type { NipLookupStatus } from "@/components/checkout/useNipLookup";

type Props = {
  invoiceType: InvoiceType | null;
  personalInvoice: InvoicePersonalData;
  companyInvoice: InvoiceCompanyData;
  invoiceErrors: InvoiceFieldErrors;
  nipLookupStatus: NipLookupStatus;
  nipLookupHint: string | null;
  nipLookupSource: "regon" | "vat" | "ceidg" | null;
  onSelectType: (type: InvoiceType) => void;
  onUpdatePersonal: <K extends keyof InvoicePersonalData>(key: K, value: InvoicePersonalData[K]) => void;
  onUpdateCompany: <K extends keyof InvoiceCompanyData>(key: K, value: InvoiceCompanyData[K]) => void;
  onRetryNipLookup: () => void;
};

function nipSourceLabel(source: "regon" | "vat" | "ceidg" | null): string {
  if (source === "vat") return "Dane uzupełnione z rejestru VAT";
  if (source === "ceidg") return "Dane uzupełnione z bazy CEIDG";
  return "Dane uzupełnione z rejestru GUS (REGON)";
}

export function CheckoutInvoiceSection({
  invoiceType,
  personalInvoice,
  companyInvoice,
  invoiceErrors,
  nipLookupStatus,
  nipLookupHint,
  nipLookupSource,
  onSelectType,
  onUpdatePersonal,
  onUpdateCompany,
  onRetryNipLookup,
}: Props) {
  return (
    <div className={checkoutSectionClassName}>
      <div className={checkoutHeaderClassName}>
        <span>Faktura</span>
      </div>
      <div className={checkoutInvoiceBodyClassName}>
        <p className={`hero-sub ${checkoutInvoiceHintClassName}`}>
          Domyślnie możesz zapłacić bez faktury VAT. Wybierz inny rodzaj, jeśli potrzebujesz faktury.
        </p>

        <div className={checkoutInvoiceChipsClassName}>
          <button
            type="button"
            className={chipClassNames(invoiceType === "none")}
            onClick={() => onSelectType("none")}
          >
            Bez faktury VAT
          </button>
          <button
            type="button"
            className={chipClassNames(invoiceType === "personal")}
            onClick={() => onSelectType("personal")}
          >
            Faktura imienna
          </button>
          <button
            type="button"
            className={chipClassNames(invoiceType === "company")}
            onClick={() => onSelectType("company")}
          >
            Faktura na firmę
          </button>
        </div>

        {invoiceType === "none" && (
          <p className={fieldHintClassName}>
            Nie musisz podawać danych do faktury — możesz przejść od razu do płatności.
          </p>
        )}

        {invoiceType === "personal" && (
          <div className={checkoutInvoiceFormClassName}>
            <FormField
              id="invoiceFullName"
              label="Imię i nazwisko"
              value={personalInvoice.fullName}
              onChange={(e) => onUpdatePersonal("fullName", e.target.value)}
              autoComplete="name"
              error={invoiceErrors.fullName}
            />
            <FormField
              id="invoiceAddress"
              label="Ulica i numer"
              value={personalInvoice.address}
              onChange={(e) => onUpdatePersonal("address", e.target.value)}
              autoComplete="street-address"
              placeholder="np. Marszałkowska 10/5"
              error={invoiceErrors.address}
            />
            <div className={checkoutInvoiceRowClassName}>
              <FormField
                id="invoicePostalCode"
                label="Kod pocztowy"
                value={personalInvoice.postalCode}
                onChange={(e) => onUpdatePersonal("postalCode", formatPostalCodeInput(e.target.value))}
                inputMode="numeric"
                placeholder="00-000"
                error={invoiceErrors.postalCode}
              />
              <FormField
                id="invoiceCity"
                label="Miejscowość"
                value={personalInvoice.city}
                onChange={(e) => onUpdatePersonal("city", e.target.value)}
                autoComplete="address-level2"
                error={invoiceErrors.city}
              />
            </div>
          </div>
        )}

        {invoiceType === "company" && (
          <div className={checkoutInvoiceFormClassName}>
            <div className={fieldGroupClassName}>
              <label className={fieldLabelClassName} htmlFor="invoiceNip">
                NIP
              </label>
              <input
                id="invoiceNip"
                className={fieldInputClassName(Boolean(invoiceErrors.nip))}
                value={companyInvoice.nip}
                onChange={(e) => onUpdateCompany("nip", formatNipInput(e.target.value))}
                inputMode="numeric"
                placeholder="000-000-00-00"
                autoComplete="off"
              />
              {invoiceErrors.nip && <span className={fieldErrorTextClassName}>{invoiceErrors.nip}</span>}
              {nipLookupStatus === "loading" && (
                <span className={hintClass}>Pobieranie danych firmy…</span>
              )}
              {nipLookupStatus === "found" && (
                <span className={`${hintClass} ${fieldHintSuccessClassName}`}>
                  {nipSourceLabel(nipLookupSource)}
                </span>
              )}
              {nipLookupStatus === "not_found" && (
                <>
                  <span className={hintClass}>
                    Nie znaleziono firmy po tym NIP
                    {nipLookupHint ? ` — ${nipLookupHint}` : ""}. Uzupełnij dane ręcznie.
                  </span>
                  <button type="button" className={checkoutNipRetryLinkClassName} onClick={onRetryNipLookup}>
                    Pobierz ponownie
                  </button>
                </>
              )}
              {nipLookupStatus === "error" && (
                <>
                  <span className={hintClass}>
                    Nie udało się pobrać danych — uzupełnij pola ręcznie lub spróbuj ponownie.
                  </span>
                  <button type="button" className={checkoutNipRetryLinkClassName} onClick={onRetryNipLookup}>
                    Pobierz ponownie
                  </button>
                </>
              )}
            </div>

            <FormField
              id="invoiceCompanyName"
              label="Nazwa firmy"
              value={companyInvoice.companyName}
              onChange={(e) => onUpdateCompany("companyName", e.target.value)}
              autoComplete="organization"
              error={invoiceErrors.companyName}
            />
            <FormField
              id="invoiceCompanyAddress"
              label="Ulica i numer"
              value={companyInvoice.address}
              onChange={(e) => onUpdateCompany("address", e.target.value)}
              autoComplete="street-address"
              placeholder="np. Prosta 18"
              error={invoiceErrors.address}
            />
            <div className={checkoutInvoiceRowClassName}>
              <FormField
                id="invoiceCompanyPostalCode"
                label="Kod pocztowy"
                value={companyInvoice.postalCode}
                onChange={(e) => onUpdateCompany("postalCode", formatPostalCodeInput(e.target.value))}
                inputMode="numeric"
                placeholder="00-000"
                error={invoiceErrors.postalCode}
              />
              <FormField
                id="invoiceCompanyCity"
                label="Miejscowość"
                value={companyInvoice.city}
                onChange={(e) => onUpdateCompany("city", e.target.value)}
                autoComplete="address-level2"
                error={invoiceErrors.city}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
