/**
 * Shared landing page layout configuration hook.
 * Provides nav links, footer config, and EOI handler for all landing pages.
 */

import { useCallback } from "react";
import type { LandingNavigationProps } from "@productioncity/holding-ui";
import type { LandingFooterProps } from "@productioncity/holding-ui";
import type { EOIFormData, EOIFormLabels, EOICategoryOption } from "@productioncity/holding-ui";
import { useTranslation } from "../i18n/context";
import { LOCALE_META, type SupportedLocale } from "../i18n/index";
import { submitEoi } from "./api-client";

/** Build navigation props from i18n context. */
export function useLandingNav(): LandingNavigationProps {
  const { t, locale, setLocale } = useTranslation();

  const prefix = locale === "en" ? "" : `/${locale}`;

  // Detect active path for nav highlighting
  const activePath = typeof window !== "undefined" ? window.location.pathname : "/";

  return {
    brand: "Production City",
    links: [
      { label: t("nav.home"), href: `${prefix}/` },
      { label: t("nav.facilities"), href: `${prefix}/facilities` },
      { label: t("nav.creative"), href: `${prefix}/creative` },
      { label: t("nav.vision"), href: `${prefix}/vision` },
      { label: t("nav.community"), href: `${prefix}/community` },
      { label: t("nav.faq"), href: `${prefix}/faq` },
      { label: t("nav.contact"), href: `${prefix}/contact` },
    ],
    languages: LOCALE_META.map((m) => ({
      code: m.code,
      label: m.nativeName,
    })),
    currentLanguage: locale,
    onLanguageChange: (code: string) => setLocale(code as SupportedLocale),
    activePath,
  };
}

/** Build footer props from i18n context. */
export function useLandingFooter(): LandingFooterProps {
  const { t, locale, setLocale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const year = new Date().getFullYear().toString();

  return {
    brandName: "Production City",
    brandTagline: t("footer.brand.tagline"),
    contactHeading: t("footer.contactHeading"),
    linkGroups: [
      {
        heading: t("footer.explore"),
        links: [
          { label: t("nav.home"), href: `${prefix}/` },
          { label: t("nav.facilities"), href: `${prefix}/facilities` },
          { label: t("nav.creative"), href: `${prefix}/creative` },
          { label: t("nav.vision"), href: `${prefix}/vision` },
          { label: t("nav.community"), href: `${prefix}/community` },
        ],
      },
      {
        heading: t("footer.resources"),
        links: [
          { label: t("nav.faq"), href: `${prefix}/faq` },
          { label: t("nav.contact"), href: `${prefix}/contact` },
        ],
      },
      {
        heading: t("footer.company"),
        links: [
          { label: t("footer.privacyPolicy"), href: `${prefix}/privacy` },
          { label: t("footer.termsOfUse"), href: `${prefix}/terms` },
        ],
      },
    ],
    legalText: {
      copyright: t("footer.copyright", { year }),
      trademark: t("footer.disclaimer"),
      acknowledgement: t("footer.acknowledgement"),
      acknowledgementHeading: t("footer.acknowledgementHeading"),
    },
    contactInfo: {
      email: "troy@team.production.city",
      phoneAU: "+61 2 9137 9100",
      phoneUS: "+1 650 215 6253",
    },
    legalLinks: [
      { label: t("footer.privacyPolicy"), href: `${prefix}/privacy` },
      { label: t("footer.termsOfUse"), href: `${prefix}/terms` },
    ],
    languages: LOCALE_META.map((m) => ({
      code: m.code,
      label: m.nativeName,
    })),
    currentLanguage: locale,
    onLanguageChange: (code: string) => setLocale(code as SupportedLocale),
  };
}

/** Build EOI form labels from i18n context. */
export function useEoiLabels(): EOIFormLabels {
  const { t, locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;

  return {
    name: t("eoi.nameLabel"),
    email: t("eoi.emailLabel"),
    company: "",
    message: t("eoi.messageLabel"),
    category: t("eoi.categoryLabel"),
    consent: t("eoi.consentLabel", { privacyPolicy: t("eoi.privacyPolicyLink") }),
    updates: t("eoi.marketingOptInLabel"),
    submit: t("eoi.submitButton"),
    submitting: t("eoi.submitting"),
    success: t("eoi.successMessage"),
    error: t("eoi.errorMessage"),
    privacyUrl: `${prefix}/privacy`,
  };
}

/** Build EOI category options from i18n context. */
export function useEoiCategories(): EOICategoryOption[] {
  const { t } = useTranslation();
  return [
    { value: "general", label: t("eoi.categoryGeneral") },
    { value: "producer", label: t("eoi.categoryProducer") },
    { value: "creative", label: t("eoi.categoryCreative") },
    { value: "partner", label: t("eoi.categoryPartner") },
    { value: "investor", label: t("eoi.categoryInvestor") },
    { value: "education", label: t("eoi.categoryEducation") },
    { value: "employment", label: t("eoi.categoryEmployment") },
  ];
}

/** EOI form submission handler. */
export function useEoiSubmit() {
  const { locale } = useTranslation();

  return useCallback(async (data: EOIFormData) => {
    await submitEoi({
      category: data.category,
      name: data.name,
      email: data.email,
      message: data.message || undefined,
      sourcePage: window.location.pathname,
      locale,
      consentVersion: "2026-03-01",
      privacyAccepted: data.consent,
      marketingOptIn: data.updates,
    });
  }, [locale]);
}
