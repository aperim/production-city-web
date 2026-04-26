/**
 * Shared landing page layout configuration hook.
 * Provides nav links, footer config, and EOI handler for all landing pages.
 */

import { useCallback, useState, useEffect } from "react";
import type { LandingNavigationProps } from "@productioncity/holding-ui";
import type { LandingFooterProps } from "@productioncity/holding-ui";
import type { EOIFormData, EOIFormLabels, EOICategoryOption } from "@productioncity/holding-ui";
import { useTranslation } from "../i18n/context";
import { LOCALE_META, type SupportedLocale } from "../i18n/index";
import { submitEoi } from "./api-client";
import { useOptionalAuth } from "./auth-context";

/** Build navigation props from i18n context. */
export function useLandingNav(): LandingNavigationProps {
  const { t, locale, setLocale } = useTranslation();
  const auth = useOptionalAuth();

  const prefix = locale === "en" ? "" : `/${locale}`;

  // Read pathname after hydration so active state is correct on all pages.
  // SSR defaults to "/" — useEffect updates to real pathname on client.
  const [activePath, setActivePath] = useState("/");
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  // Show "Dashboard" when authenticated, "Sign in" otherwise
  const authLink = auth?.isAuthenticated
    ? { label: t("nav.dashboard"), href: "/dashboard" }
    : { label: t("nav.signIn"), href: "/login" };

  return {
    brand: "Production City",
    links: [
      { label: t("nav.home"), href: `${prefix}/` },
      { label: t("nav.facilities"), href: `${prefix}/facilities` },
      { label: t("nav.masterplan"), href: `${prefix}/masterplan` },
      { label: t("nav.services"), href: `${prefix}/services` },
      { label: t("nav.creative"), href: `${prefix}/creative` },
      { label: t("nav.vision"), href: `${prefix}/vision` },
      { label: t("nav.network"), href: `${prefix}/network` },
      { label: t("nav.company"), href: `${prefix}/company` },
      { label: t("nav.firstNations"), href: `${prefix}/first-nations` },
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
    authLink,
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
          { label: t("nav.masterplan"), href: `${prefix}/masterplan` },
          { label: t("nav.services"), href: `${prefix}/services` },
          { label: t("nav.creative"), href: `${prefix}/creative` },
          { label: t("nav.vision"), href: `${prefix}/vision` },
          { label: t("nav.network"), href: `${prefix}/network` },
          { label: t("nav.community"), href: `${prefix}/community` },
        ],
      },
      {
        heading: t("footer.resources"),
        links: [
          { label: t("nav.company"), href: `${prefix}/company` },
          { label: t("nav.firstNations"), href: `${prefix}/first-nations` },
          { label: t("nav.faq"), href: `${prefix}/faq` },
          { label: t("nav.contact"), href: `${prefix}/contact` },
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
    legalLinks: [],
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
  const { t } = useTranslation();

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
    privacyUrl: "#",
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
