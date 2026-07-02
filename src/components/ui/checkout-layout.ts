import styles from "./CheckoutLink.module.css";
import panelStyles from "./CheckoutPanel.module.css";
import { chipsClassName } from "./chip-layout";
import { formStackClassName } from "./form-stack-layout";

export const checkoutLinkClassName = styles.link;
export const checkoutLinkBlockClassName = `${styles.link} ${styles.linkBlock}`;
export const checkoutNipRetryLinkClassName = `${styles.link} ${styles.nipRetry}`;
export const checkoutWizardBackLinkClassName = `${styles.link} ${styles.wizardBack}`;

export const checkoutSectionClassName = panelStyles.section;
export const checkoutHeaderClassName = panelStyles.header;
export const checkoutBodyClassName = panelStyles.body;
export const checkoutRowClassName = panelStyles.row;
export const checkoutRowNameClassName = panelStyles.rowName;
export const checkoutTotalInlineClassName = `${panelStyles.row} ${panelStyles.totalInline}`;
export const checkoutPatientGroupClassName = panelStyles.patientGroup;
export const checkoutPatientNameClassName = panelStyles.patientName;
export const checkoutPatientLineClassName = panelStyles.patientLine;
export const checkoutInvoiceBodyClassName = `${panelStyles.body} ${panelStyles.invoiceBody}`;
export const checkoutInvoiceHintClassName = panelStyles.invoiceHint;
export const checkoutInvoiceChipsClassName = `${chipsClassName} ${panelStyles.invoiceChips}`;
export const checkoutInvoiceFormClassName = `${formStackClassName} ${panelStyles.invoiceForm}`;
export const checkoutInvoiceRowClassName = panelStyles.invoiceRow;
export const checkoutInvoiceSummaryClassName = panelStyles.invoiceSummary;
export const checkoutPayErrorClassName = panelStyles.payError;
