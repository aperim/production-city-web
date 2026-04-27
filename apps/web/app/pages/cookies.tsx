"use client";

import { I18nProvider, useTranslation } from "../i18n/context";
import { tArray } from "../i18n/index";
import { LandingPageTemplate } from "@productioncity/holding-ui";
import { useLandingNav, useLandingFooter } from "../lib/use-landing-layout";

export function CookiesPage() {
  return (
    <I18nProvider>
      <CookiesPageContent />
    </I18nProvider>
  );
}

const ESSENTIAL_COOKIES = [
  {
    name: "__Secure-session",
    purpose: "Maintains your authenticated session after you log in. Stores a hashed session token.",
    duration: "Up to 90 days (expires after 30 days of inactivity)",
    type: "First-party, server-set, HttpOnly, Secure, SameSite=Lax",
  },
] as const;

const FUNCTIONAL_COOKIES = [
  {
    name: "pc-locale-suggestion",
    purpose: "Stores a language suggestion based on your browser's language settings, shown as a suggestion banner on your first visit.",
    duration: "7 days",
    type: "First-party, server-set, Secure, SameSite=Lax",
  },
] as const;

const LOCAL_STORAGE = [
  {
    key: "pc-locale",
    purpose: "Remembers your preferred language and locale so the Website displays in your chosen language on return visits.",
    duration: "Persistent (until you clear browser data)",
  },
] as const;

function CookiesPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const browserList = tArray("legal.cookies.managing.browserList", locale);

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <div className="mx-auto max-w-3xl py-12">
        <a
          href={`${prefix}/`}
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
        >
          ← {t("legal.backToHome")}
        </a>

        <h1 id="page-heading" className="mt-4 text-3xl font-bold text-foreground">
          {t("legal.cookies.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("legal.cookies.effectiveDate", { date: "27 April 2026" })}
        </p>

        {/* Section 1 — About this policy */}
        <section className="mt-10" aria-labelledby="cookies-about">
          <h2 id="cookies-about" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.about.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.about.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.about.link")}{" "}
            <a href={`${prefix}/privacy`} className="underline underline-offset-4 hover:text-foreground">
              {t("legal.privacyPolicy")}
            </a>
          </p>
        </section>

        {/* Section 2 — What are cookies */}
        <section className="mt-10" aria-labelledby="cookies-what">
          <h2 id="cookies-what" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.whatAreCookies.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.whatAreCookies.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.whatAreCookies.localStorage")}
          </p>
        </section>

        {/* Section 3 — Cookies we use */}
        <section className="mt-10" aria-labelledby="cookies-we-use">
          <h2 id="cookies-we-use" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.cookiesWeUse.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.cookiesWeUse.description")}
          </p>

          <h3 className="mt-6 text-base font-semibold text-foreground">
            {t("legal.cookies.cookiesWeUse.essentialTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("legal.cookies.cookiesWeUse.essentialDescription")}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Cookie</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Purpose</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Duration</th>
                  <th className="pb-2 text-left font-medium text-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {ESSENTIAL_COOKIES.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top font-mono text-xs text-muted-foreground">{row.name}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.purpose}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.duration}</td>
                    <td className="py-2 align-top text-muted-foreground">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-foreground">
            {t("legal.cookies.cookiesWeUse.functionalTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("legal.cookies.cookiesWeUse.functionalDescription")}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Cookie</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Purpose</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Duration</th>
                  <th className="pb-2 text-left font-medium text-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {FUNCTIONAL_COOKIES.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top font-mono text-xs text-muted-foreground">{row.name}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.purpose}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.duration}</td>
                    <td className="py-2 align-top text-muted-foreground">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 — Local storage */}
        <section className="mt-10" aria-labelledby="cookies-local-storage">
          <h2 id="cookies-local-storage" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.localStorage.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.localStorage.description")}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Key</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Purpose</th>
                  <th className="pb-2 text-left font-medium text-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                {LOCAL_STORAGE.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top font-mono text-xs text-muted-foreground">{row.key}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.purpose}</td>
                    <td className="py-2 align-top text-muted-foreground">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.cookies.localStorage.note")}
          </p>
        </section>

        {/* Section 5 — Analytics */}
        <section className="mt-10" aria-labelledby="cookies-analytics">
          <h2 id="cookies-analytics" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.analytics.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.analytics.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.analytics.note")}
          </p>
        </section>

        {/* Section 6 — Third-party cookies and external resources */}
        <section className="mt-10" aria-labelledby="cookies-third-party">
          <h2 id="cookies-third-party" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.thirdParty.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.thirdParty.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.thirdParty.fonts")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.thirdParty.analytics")}
          </p>
        </section>

        {/* Section 7 — Managing cookies and local storage */}
        <section className="mt-10" aria-labelledby="cookies-managing">
          <h2 id="cookies-managing" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.managing.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.managing.description")}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.cookies.managing.browsers")}
          </p>
          {browserList.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {browserList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.cookies.managing.sessionNote")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.managing.localStorageNote")}
          </p>
        </section>

        {/* Section 8 — Changes */}
        <section className="mt-10" aria-labelledby="cookies-changes">
          <h2 id="cookies-changes" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.changes.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.cookies.changes.description")}
          </p>
        </section>

        {/* Section 9 — Contact */}
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="cookies-contact">
          <h2 id="cookies-contact" className="text-xl font-semibold text-foreground">
            {t("legal.cookies.contact.title")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {t("legal.cookies.contact.description")}
          </p>
        </section>
      </div>
    </LandingPageTemplate>
  );
}
