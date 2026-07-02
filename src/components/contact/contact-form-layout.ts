import { btnPrimaryClassName, btnSecondaryClassName } from "@/components/ui/app-button-layout";
import { consentBoxClassName } from "@/components/ui/consent-box-layout";
import { formStackClassName } from "@/components/ui/form-stack-layout";
import styles from "./ContactForm.module.css";

export const CONTACT_FORM_GRID_CLASS = "lf-contact-form-grid";

export const contactFormClassName = `${formStackClassName} ${styles.form}`;
export const contactFormHeadingClassName = styles.heading;
export const contactFormLeadClassName = styles.lead;
export const contactFormAlertClassName = styles.alert;
export const contactHpClassName = styles.hp;
export const contactFormGridClassName = `${styles.formGrid} ${CONTACT_FORM_GRID_CLASS}`;
export const contactFormSelectClassName = styles.select;
export const contactFormTextareaClassName = styles.textarea;
export const contactFormMessageMetaClassName = styles.messageMeta;
export const contactCharCountClassName = styles.charCount;
export const contactOptionalClassName = styles.optional;
export const contactConsentClassName = `${consentBoxClassName} ${styles.consent}`;
export { consentBoxErrorClassName as contactConsentErrorClassName } from "@/components/ui/consent-box-layout";
export const contactFormSubmitClassName = `${btnPrimaryClassName} ${styles.submit}`;
export const contactFormPrivacyNoteClassName = styles.privacyNote;
export const contactFormSuccessClassName = styles.success;
export const contactFormSuccessIconClassName = styles.successIcon;
export const contactFormSuccessTitleClassName = styles.successTitle;
export const contactFormSuccessTextClassName = styles.successText;
export const contactFormDemoNoteClassName = styles.demoNote;
export const contactFormResetBtnClassName = `${btnSecondaryClassName} ${styles.resetBtn}`;
