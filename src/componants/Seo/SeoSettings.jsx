import React, { useEffect, useMemo, useState } from "react";
import {
  MdSave,
  MdPublic,
  MdArticle,
  MdSmartToy,
  MdCode,
  MdAccountTree,
  MdContentCopy,
  MdOpenInNew,
  MdRestartAlt,
  MdExpandMore,
} from "react-icons/md";
import Load from "../Load/Load";
import { getSeoSettingsApi, updateSeoSettingsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { LIMITS, SEO_RULES, WEBSITE_URL } from "./SeoFields";

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#1d2532] placeholder-gray-400 focus:outline-none focus:border-[#c8a24a] focus:ring-2 focus:ring-[#c8a24a]/20 transition";
const CODE = `${INPUT} font-mono text-xs leading-relaxed resize-y`;

const FIELDS = [
  "siteUrl",
  "siteName",
  "defaultMetaTitle",
  "defaultMetaDescription",
  "defaultMetaKeywords",
  "defaultShareImage",
  "robotsTxt",
  "headerScripts",
  "footerScripts",
];

const TABS = [
  { key: "site", label: "Site defaults", icon: MdPublic },
  { key: "pages", label: "Pages", icon: MdArticle },
  { key: "robots", label: "robots.txt", icon: MdSmartToy },
  { key: "sitemap", label: "XML sitemap", icon: MdAccountTree },
  { key: "scripts", label: "Header & footer scripts", icon: MdCode },
];

const Count = ({ value = "", ideal }) => {
  const n = value.length;
  return (
    <span className={`normal-case font-normal ${n === 0 ? "text-gray-400" : n <= ideal ? "text-green-600" : "text-amber-600"}`}>
      {n}/{ideal}
    </span>
  );
};

const Label = ({ children, extra }) => (
  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
    <span>{children}</span>
    {extra}
  </div>
);

const Card = ({ title, hint, children }) => (
  <section className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
    <h3 className="font-semibold text-[#1d2532]">{title}</h3>
    {hint && <p className="text-sm text-gray-500 mt-0.5 mb-5">{hint}</p>}
    {children}
  </section>
);

const toForm = (data) => {
  const f = {};
  FIELDS.forEach((k) => (f[k] = data?.[k] ?? ""));
  f.pages = (data?.pages || []).map((p) => ({ ...p }));
  return f;
};

const SeoSettings = () => {
  const message = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("site");
  const [form, setForm] = useState(toForm());
  const [saved, setSaved] = useState(toForm());
  const [defaultRobots, setDefaultRobots] = useState("");
  const [openPage, setOpenPage] = useState("home");

  useEffect(() => {
    getSeoSettingsApi()
      .then((res) => {
        const f = toForm(res?.data);
        setForm(f);
        setSaved(f);
        setDefaultRobots(res?.data?.defaultRobotsTxt || "");
      })
      .catch(errorResponseHandler)
      .finally(() => setLoading(false));
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const siteUrl = (form.siteUrl || WEBSITE_URL).replace(/\/+$/, "");
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPage = (key, field, v) =>
    setForm((f) => ({ ...f, pages: f.pages.map((p) => (p.key === key ? { ...p, [field]: v } : p)) }));

  const handleSave = async () => {
    if (form.siteUrl && !/^https?:\/\/[^\s]+$/i.test(form.siteUrl.trim())) {
      setTab("site");
      message.error("Website address must start with https://");
      return;
    }
    const payload = {};
    FIELDS.forEach((k) => (payload[k] = typeof form[k] === "string" ? form[k] : ""));
    payload.siteUrl = payload.siteUrl.trim().replace(/\/+$/, "");
    payload.pages = form.pages.map(({ key, metaTitle, metaDescription, metaKeywords }) => ({
      key,
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      metaKeywords: metaKeywords.trim(),
    }));
    try {
      setSaving(true);
      const res = await updateSeoSettingsApi(payload);
      if (res?.success) {
        const f = toForm(res.data);
        setForm(f);
        setSaved(f);
        message.success("SEO settings saved. The website shows them within a minute.");
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Copied");
    } catch {
      message.error("Could not copy, please select and copy it");
    }
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 pb-10 mt-16">
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Storefront</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">SEO Settings</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-2xl">
          How the website appears in Google and when shared on WhatsApp, Instagram and Facebook. Products and
          categories have their own SEO section on their edit screens.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
              tab === key
                ? "bg-[#1d2532] border-[#1d2532] text-white shadow"
                : "bg-white border-gray-200 text-gray-600 hover:border-[#c8a24a] hover:text-[#1d2532]"
            }`}
          >
            <Icon className={tab === key ? "text-[#e3c77a]" : "text-gray-400"} /> {label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl space-y-6">
        {tab === "site" && (
          <Card
            title="Site defaults"
            hint="Used on every page that doesn't have its own title or description."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Website address</Label>
                <input
                  className={INPUT}
                  value={form.siteUrl}
                  onChange={(e) => set("siteUrl", e.target.value)}
                  placeholder="https://kuchalagindia.com"
                />
                <p className="text-xs text-gray-500 mt-1">Used for canonical links and the sitemap.</p>
              </div>
              <div>
                <Label>Site name</Label>
                <input
                  className={INPUT}
                  value={form.siteName}
                  onChange={(e) => set("siteName", e.target.value)}
                  placeholder="Kuchalag India"
                />
                <p className="text-xs text-gray-500 mt-1">Added after page titles: "Bridal Potli | Kuchalag India".</p>
              </div>
              <div className="sm:col-span-2">
                <Label extra={<Count value={form.defaultMetaTitle} ideal={LIMITS.metaTitle} />}>Default meta title</Label>
                <input
                  className={INPUT}
                  maxLength={SEO_RULES.metaTitle.max}
                  value={form.defaultMetaTitle}
                  onChange={(e) => set("defaultMetaTitle", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label extra={<Count value={form.defaultMetaDescription} ideal={LIMITS.metaDescription} />}>
                  Default meta description
                </Label>
                <textarea
                  rows={3}
                  maxLength={SEO_RULES.metaDescription.max}
                  className={`${INPUT} resize-y`}
                  value={form.defaultMetaDescription}
                  onChange={(e) => set("defaultMetaDescription", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Default meta keywords</Label>
                <input
                  className={INPUT}
                  maxLength={SEO_RULES.metaKeywords.max}
                  value={form.defaultMetaKeywords}
                  onChange={(e) => set("defaultMetaKeywords", e.target.value)}
                  placeholder="Comma separated, e.g. wedding gifts, bridal potli, festive hampers"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Default share image</Label>
                <input
                  className={INPUT}
                  value={form.defaultShareImage}
                  onChange={(e) => set("defaultShareImage", e.target.value)}
                  placeholder="https://… (1200 × 630 works best)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shown when a page without its own photo is shared. Product and category pages use their own photo.
                </p>
              </div>
            </div>
          </Card>
        )}

        {tab === "pages" && (
          <Card
            title="Page titles & descriptions"
            hint="Leave a field empty to use the page name with the site defaults."
          >
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {form.pages.map((p) => {
                const open = openPage === p.key;
                const filled = p.metaTitle || p.metaDescription || p.metaKeywords;
                return (
                  <div key={p.key} className={open ? "bg-[#fffdf7]" : "bg-white"}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenPage(open ? "" : p.key)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <span>
                        <span className="font-semibold text-[#1d2532]">{p.label}</span>
                        <span className="ml-2 text-xs text-gray-400">{p.path}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            filled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {filled ? "Custom" : "Automatic"}
                        </span>
                        <MdExpandMore className={`text-xl text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                      </span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 space-y-3">
                        <div>
                          <Label extra={<Count value={p.metaTitle} ideal={LIMITS.metaTitle} />}>Meta title</Label>
                          <input
                            className={INPUT}
                            maxLength={SEO_RULES.metaTitle.max}
                            value={p.metaTitle}
                            onChange={(e) => setPage(p.key, "metaTitle", e.target.value)}
                            placeholder={p.key === "home" ? form.defaultMetaTitle : `${p.label} | ${form.siteName || "Kuchalag India"}`}
                          />
                        </div>
                        <div>
                          <Label extra={<Count value={p.metaDescription} ideal={LIMITS.metaDescription} />}>
                            Meta description
                          </Label>
                          <textarea
                            rows={2}
                            maxLength={SEO_RULES.metaDescription.max}
                            className={`${INPUT} resize-y`}
                            value={p.metaDescription}
                            onChange={(e) => setPage(p.key, "metaDescription", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Meta keywords</Label>
                          <input
                            className={INPUT}
                            maxLength={SEO_RULES.metaKeywords.max}
                            value={p.metaKeywords}
                            onChange={(e) => setPage(p.key, "metaKeywords", e.target.value)}
                            placeholder="Comma separated"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tab === "robots" && (
          <Card
            title="robots.txt"
            hint="Tells Google which pages to crawl and which to skip. Cart, checkout and account pages are skipped by default."
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`text-xs font-semibold ${form.robotsTxt ? "text-[#7a5c14]" : "text-gray-500"}`}>
                {form.robotsTxt ? "Using your custom text" : "Using the built-in default"}
              </span>
              <div className="flex gap-2">
                {!form.robotsTxt && (
                  <button
                    type="button"
                    onClick={() => set("robotsTxt", defaultRobots)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1d2532]"
                  >
                    Edit the default
                  </button>
                )}
                {form.robotsTxt && (
                  <button
                    type="button"
                    onClick={() => set("robotsTxt", "")}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1d2532]"
                  >
                    <MdRestartAlt /> Reset to default
                  </button>
                )}
              </div>
            </div>
            <textarea
              rows={14}
              className={CODE}
              value={form.robotsTxt || defaultRobots}
              readOnly={!form.robotsTxt}
              onChange={(e) => set("robotsTxt", e.target.value)}
              spellCheck={false}
            />
            <p className="text-xs text-gray-500 mt-2">
              A <code>Sitemap:</code> line pointing to {sitemapUrl} is added automatically if you don't include one.
            </p>
            <a
              href={`${siteUrl}/robots.txt`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#1d2532] hover:underline"
            >
              View live robots.txt <MdOpenInNew />
            </a>
          </Card>
        )}

        {tab === "sitemap" && (
          <Card
            title="XML sitemap"
            hint="Built automatically from all active products, categories and pages. New products appear within 10 minutes."
          >
            <Label>Sitemap address</Label>
            <div className="flex gap-2">
              <input className={`${INPUT} font-mono`} readOnly value={sitemapUrl} onFocus={(e) => e.target.select()} />
              <button
                type="button"
                onClick={() => copy(sitemapUrl)}
                className="shrink-0 inline-flex items-center gap-1 px-4 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-[#1d2532]"
              >
                <MdContentCopy /> Copy
              </button>
              <a
                href={sitemapUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1 px-4 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-[#1d2532]"
              >
                <MdOpenInNew /> Open
              </a>
            </div>
            <div className="mt-5 rounded-xl bg-[#fbf6e9] border border-[#ecd9a6] p-4 text-sm text-[#5c4510]">
              <p className="font-semibold mb-1">Submit it to Google once</p>
              <ol className="list-decimal pl-5 space-y-0.5">
                <li>Open Google Search Console and select your website.</li>
                <li>Go to Indexing › Sitemaps.</li>
                <li>Paste <span className="font-mono">sitemap.xml</span> and press Submit.</li>
              </ol>
              <p className="mt-2 text-xs">
                For the verification step, paste Google's meta tag into Header scripts.
              </p>
            </div>
          </Card>
        )}

        {tab === "scripts" && (
          <>
            <Card
              title="Header scripts"
              hint="Added inside <head> on every page: Google Analytics, Google Tag Manager, Search Console verification meta tag."
            >
              <textarea
                rows={10}
                className={CODE}
                value={form.headerScripts}
                onChange={(e) => set("headerScripts", e.target.value)}
                placeholder={'<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  ...\n</script>\n<meta name="google-site-verification" content="..." />'}
                spellCheck={false}
              />
            </Card>
            <Card
              title="Footer scripts"
              hint="Added at the end of every page: chat widgets and other scripts that can load last."
            >
              <textarea
                rows={8}
                className={CODE}
                value={form.footerScripts}
                onChange={(e) => set("footerScripts", e.target.value)}
                placeholder={'<script src="https://example.com/chat-widget.js" async></script>'}
                spellCheck={false}
              />
            </Card>
            <p className="text-xs text-gray-500">
              Paste the code exactly as the provider gives it. Only <code>&lt;script&gt;</code>,{" "}
              <code>&lt;noscript&gt;</code>, <code>&lt;meta&gt;</code>, <code>&lt;link&gt;</code> and{" "}
              <code>&lt;style&gt;</code> tags are used in the header. The Meta Pixel is already built into the website, so
              don't paste it again.
            </p>
          </>
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 z-30 mt-6 max-w-4xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-lg px-5 py-3 flex items-center justify-between gap-3">
        <span className={`text-sm ${dirty ? "text-[#7a5c14] font-semibold" : "text-gray-400"}`}>
          {dirty ? "You have unsaved changes" : "All changes saved"}
        </span>
        <div className="flex gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => setForm(saved)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f] disabled:opacity-50 shadow"
          >
            <MdSave /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeoSettings;
