"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatAddFeedback,
  isProductInCartForActivePatient,
  type AddCatalogProduct,
  type AddPackageProduct,
} from "@/lib/add-to-cart";
import { catalogCartKey, packageCartKey } from "@/lib/cart";
import { formatResultTime, formatResultTimeValue, formatTestCount } from "@/lib/offer-format";
import type { PatientProfile } from "@/lib/types";
import { useActivePatient } from "@/lib/use-active-patient";
import { useAddToCart } from "@/lib/use-add-to-cart";
import { CardInfoIconButton } from "./CardInfoIconButton";
import { CartAddIconButton } from "./CartAddIconButton";
import styles from "./OfferCard.module.css";

import {
  cardActionsCartClassName,
  cardActionsClassName,
  cardInfoBtnRemoveClassName,
  offerCardListClassName,
  offerCardListEnterClassName,
} from "./offer-card-layout";

export type OfferCardProps = {
  href: string;
  name: string;
  typ: "badanie" | "pakiet";
  price: number | null;
  resultTime: string;
  testCount: number;
  catalogSlug?: string;
  catalogId?: number;
  packageId?: string;
  tierLabel?: string;
  category?: string;
  highlighted?: boolean;
  variant?: "default" | "search" | "cart";
  onCartToast?: (message: string) => void;
  onNavigate?: () => void;
  cartLineKey?: string;
  onRemove?: (key: string) => void;
  patients?: PatientProfile[];
  selectedPatientId?: string;
  onAssignPatient?: (patientId: string) => void;
  hidePatientSelector?: boolean;
  packageTests?: string[];
  packageTestsLoading?: boolean;
  assignSelectRef?: React.Ref<HTMLSelectElement>;
};

function TestsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 3v6l-4 9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-4-9V3" strokeLinejoin="round" />
      <path d="M9 3h6" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function patientLabel(patient: PatientProfile, index: number): string {
  const name = patient.fullName.trim();
  if (name.length >= 3) return name;
  return index === 0 ? "Osoba kontaktowa" : `Osoba ${index + 1}`;
}

function OfferCardTop({
  typ,
  price,
  tierLabel,
}: {
  typ: "badanie" | "pakiet";
  price: number | null;
  tierLabel?: string;
}) {
  return (
    <>
      <div className={styles.top}>
        <div className={styles.topBadges}>
          <span className={`${styles.badge} ${typ === "pakiet" ? styles.badgePakiet : styles.badgeBadanie}`}>
            {typ === "pakiet" ? "Pakiet" : "Badanie"}
          </span>
        </div>
        <span className={styles.price}>{price != null ? `${price} zł` : "—"}</span>
      </div>
      {tierLabel && <span className={styles.tier}>{tierLabel}</span>}
    </>
  );
}

function getProductInput(
  props: Pick<OfferCardProps, "packageId" | "catalogSlug" | "catalogId" | "name" | "price" | "typ">,
): AddCatalogProduct | AddPackageProduct | null {
  if (props.packageId) {
    return { kind: "package", packageId: props.packageId };
  }
  if (props.catalogSlug != null && props.catalogId != null) {
    return {
      kind: "catalog",
      slug: props.catalogSlug,
      id: props.catalogId,
      nazwa: props.name,
      cena: props.price,
      typ: props.typ,
    };
  }
  return null;
}

function getProductKey(props: Pick<OfferCardProps, "catalogSlug" | "packageId">): string | null {
  if (props.packageId) return packageCartKey(props.packageId);
  if (props.catalogSlug) return catalogCartKey(props.catalogSlug);
  return null;
}

function OfferCardMeta({
  typ,
  testCount,
  resultTime,
  category,
  showTestMeta,
}: {
  typ: "badanie" | "pakiet";
  testCount: number;
  resultTime: string;
  category?: string;
  showTestMeta: boolean;
}) {
  const resultValue = formatResultTimeValue(resultTime);
  const timeLabel = resultValue === "do ustalenia" ? "" : resultValue;

  if (!showTestMeta && !timeLabel && !category) return null;

  return (
    <div className={styles.meta}>
      {showTestMeta && (
        <span className={styles.metaItem} aria-label={formatTestCount(testCount)}>
          <TestsIcon />
          <span>{testCount}</span>
        </span>
      )}
      {timeLabel && (
        <span className={styles.metaItem} aria-label={formatResultTime(resultTime)}>
          <ClockIcon />
          <span>{timeLabel}</span>
        </span>
      )}
      {category && <span className={`${styles.metaItem} ${styles.category}`}>{category}</span>}
    </div>
  );
}

function OfferCardCart({
  href,
  name,
  typ,
  price,
  resultTime,
  testCount,
  category,
  packageId,
  catalogSlug,
  variant,
  cartLineKey,
  onRemove,
  patients = [],
  selectedPatientId,
  onAssignPatient,
  hidePatientSelector = false,
  packageTests = [],
  packageTestsLoading = false,
  onNavigate,
  assignSelectRef,
}: OfferCardProps) {
  if (!cartLineKey || !onRemove) return null;

  const showTestMeta = testCount > 0;
  const showPatientSelector = patients.length > 0 && !hidePatientSelector;

  return (
    <article className={`${styles.card} ${styles.cart}`}>
      <div className={styles.body}>
        <OfferCardTop typ={typ} price={price} />
        <strong className={styles.name}>{name}</strong>
        <OfferCardMeta
          typ={typ}
          testCount={testCount}
          resultTime={resultTime}
          category={category}
          showTestMeta={showTestMeta}
        />
        {showPatientSelector && (
          <label className={styles.cartAssign}>
            <span className={styles.cartAssignLabel}>Dla</span>
            <select
              ref={assignSelectRef}
              className={styles.cartAssignSelect}
              value={selectedPatientId ?? ""}
              onChange={(e) => onAssignPatient?.(e.target.value)}
              aria-label={`Przypisz ${name} do osoby`}
            >
              <option value="">Wybierz osobę</option>
              {patients.map((patient, index) => (
                <option key={patient.id} value={patient.id}>
                  {patientLabel(patient, index)}
                </option>
              ))}
            </select>
          </label>
        )}
        {packageTests.length > 0 && (
          <ul className={styles.cartTests} aria-label="Badania w pakiecie">
            {packageTests.map((test) => (
              <li key={test}>{test}</li>
            ))}
          </ul>
        )}
        {packageTestsLoading && (
          <div className={styles.cartTestsSkeleton} aria-hidden="true">
            <span className={`skeleton ${styles.skeletonTestLine}`} />
            <span className={`skeleton ${styles.skeletonTestLine} ${styles.skeletonTestLineShort}`} />
          </div>
        )}
      </div>
      <div className={cardActionsCartClassName}>
        <CardInfoIconButton href={href} name={name} onNavigate={onNavigate} />
        <button
          type="button"
          className={cardInfoBtnRemoveClassName}
          onClick={() => onRemove(cartLineKey)}
          aria-label={`Usuń ${name} z koszyka`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </article>
  );
}

function OfferCardStandard(props: OfferCardProps) {
  const {
    href,
    name,
    typ,
    price,
    resultTime,
    testCount,
    tierLabel,
    category,
    highlighted = false,
    variant = "default",
    onCartToast,
    onNavigate,
  } = props;

  const productKey = getProductKey(props);
  const productInput = getProductInput(props);
  const canAdd = price != null && productKey != null && productInput != null;

  const { patients, activePatientId } = useActivePatient();
  const router = useRouter();
  const { requestAdd } = useAddToCart({
    onResult: (result) => {
      const message = formatAddFeedback(result);
      if (message) onCartToast?.(message);
    },
  });
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (!productKey) return;

    const refresh = () => {
      setInCart(isProductInCartForActivePatient(productKey, patients, activePatientId));
    };

    refresh();
    window.addEventListener("labflow-cart", refresh);
    window.addEventListener("labflow-patients", refresh);
    return () => {
      window.removeEventListener("labflow-cart", refresh);
      window.removeEventListener("labflow-patients", refresh);
    };
  }, [productKey, patients, activePatientId]);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd || !productInput) return;
    requestAdd(productInput);
  }

  function handleNavigate() {
    onNavigate?.();
    router.push(href);
  }

  const isSearch = variant === "search";
  const showTestMeta = !isSearch && testCount > 0;

  const cardClassName = [
    styles.card,
    highlighted ? styles.cardHighlighted : "",
    isSearch ? styles.search : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassName}>
      <button type="button" className={`${styles.body} ${styles.bodyLink}`} onClick={handleNavigate}>
        <OfferCardTop typ={typ} price={price} tierLabel={tierLabel} />
        <strong className={styles.name}>{name}</strong>
        <OfferCardMeta
          typ={typ}
          testCount={testCount}
          resultTime={resultTime}
          category={category}
          showTestMeta={showTestMeta}
        />
      </button>
      <div className={cardActionsClassName}>
        <CardInfoIconButton href={href} name={name} onNavigate={onNavigate} />
        {productKey && (
          <CartAddIconButton inCart={inCart} canAdd={canAdd} name={name} onClick={handleAdd} />
        )}
      </div>
    </div>
  );
}

export function OfferCard(props: OfferCardProps) {
  if (props.variant === "cart") {
    return <OfferCardCart {...props} />;
  }
  return <OfferCardStandard {...props} />;
}

export { offerCardListClassName, offerCardListEnterClassName } from "./offer-card-layout";
