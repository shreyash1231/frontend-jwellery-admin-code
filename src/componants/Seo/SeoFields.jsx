import React, { useState } from "react";
import { MdClose, MdLink, MdSearch, MdEdit, MdUndo, MdLock, MdAutoFixHigh, MdCheckCircle, MdErrorOutline } from "react-icons/md";

export const WEBSITE_URL = (process.env.REACT_APP_WEBSITE_URL || "https://kuchalagindia.com").replace(/\/+$/, "");

// Same rule as the backend: "Bridal Potli Bag (Red)" -> "bridal-potli-bag-red"
export const slugify = (text = "") =>
  String(text)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Recommended lengths (what Google shows without cutting) and hard maximums (what can be saved).
// The backend enforces the same maximums.
export const LIMITS = { metaTitle: 60, metaDescription: 160 };
export const SEO_RULES = {
  slug: { max: 80 },
  metaTitle: { min: 30, ideal: 60, max: 70 },
  metaDescription: { min: 120, ideal: 160, max: 160 },
  metaKeywords: { max: 255 },
};

const describeChar = (c) => {
  if (c === " ") return "space";
  if (c === "_") return "_ (underscore)";
  if (/\p{L}/u.test(c) && !/[a-z]/i.test(c)) return `${c} (non-English letter)`;
  return c;
};

// Everything wrong with a slug, as plain sentences. Empty array = valid.
export const slugIssues = (slug = "") => {
  if (!slug) return [];
  const issues = [];
  const bad = [...new Set([...slug].filter((c) => !/[a-z0-9-]/.test(c) && !/[A-Z]/.test(c)))];
  if (bad.length) issues.push(`Not allowed: ${bad.map(describeChar).join("  ")}`);
  if (/[A-Z]/.test(slug)) issues.push("Use lowercase letters only (A → a)");
  if (/^-|-$/.test(slug)) issues.push("Can't start or end with a dash");
  if (/--/.test(slug)) issues.push("No double dashes (--)");
  if (slug.length > SEO_RULES.slug.max) issues.push(`Too long: ${slug.length}/${SEO_RULES.slug.max} characters`);
  if (/^[a-f0-9]{24}$/i.test(slug)) issues.push("Looks like an internal id; use words instead");
  return issues;
};

// Returns an error message, or null when the SEO values can be saved
export const validateSeo = ({ slug = "", metaTitle = "", metaDescription = "", metaKeywords = "" }) => {
  const issues = slugIssues(slug);
  if (issues.length || (slug && !SLUG_RE.test(slug))) return `URL slug: ${issues[0] || "only a-z, 0-9 and single dashes"}`;
  if (metaTitle.trim().length > SEO_RULES.metaTitle.max)
    return `Meta title can be at most ${SEO_RULES.metaTitle.max} characters`;
  if (metaDescription.trim().length > SEO_RULES.metaDescription.max)
    return `Meta description can be at most ${SEO_RULES.metaDescription.max} characters`;
  if (metaKeywords.trim().length > SEO_RULES.metaKeywords.max)
    return `Meta keywords can be at most ${SEO_RULES.metaKeywords.max} characters`;
  return null;
};

const plain = (t = "") => String(t).replace(/\s+/g, " ").trim();
const cut = (t, n) => (t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t);

// "42/70 · good length"
export const CharCount = ({ value = "", min, ideal, max }) => {
  const n = value.length;
  let color = "text-gray-400";
  let note = "";
  if (n > max) [color, note] = ["text-red-600", "too long"];
  else if (n > ideal) [color, note] = ["text-amber-600", "may be cut in Google"];
  else if (n && min && n < min) [color, note] = ["text-amber-600", `short, aim for ${min}–${ideal}`];
  else if (n) [color, note] = ["text-green-600", "good length"];
  return (
    <span className={`normal-case font-normal ${color}`}>
      {n}/{max}
      {note && ` · ${note}`}
    </span>
  );
};

const FieldLabel = ({ children, extra }) => (
  <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
    <span>{children}</span>
    <span className="flex items-center gap-2">{extra}</span>
  </div>
);

/**
 * Edit / Cancel button for one locked field.
 * locked: currently read-only. onEdit unlocks, onCancel restores the saved value and locks again.
 */
export const LockButton = ({ locked, changed, onEdit, onCancel, onLock }) =>
  locked ? (
    <button
      type="button"
      onClick={onEdit}
      className="normal-case inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[#1d2532] font-medium hover:border-[#c8a24a] hover:text-[#8a6a1f]"
    >
      <MdEdit /> Edit
    </button>
  ) : changed ? (
    <button
      type="button"
      onClick={onCancel}
      title="Put back the saved value"
      className="normal-case inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:text-red-600"
    >
      <MdUndo /> Cancel
    </button>
  ) : (
    <button
      type="button"
      onClick={onLock}
      className="normal-case inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium"
    >
      <MdLock /> Lock
    </button>
  );

export const lockedCls = "!bg-gray-50 !text-gray-600 cursor-not-allowed";

// Chips input: type a tag and press Enter or comma
export const TagInput = ({ value = [], onChange, inputCls, placeholder = "e.g. bridal, potli, return gift" }) => {
  const [draft, setDraft] = useState("");
  const add = (text) => {
    const next = text
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && t.length <= 40 && !value.includes(t));
    if (next.length) onChange([...value, ...new Set(next)].slice(0, 30));
    setDraft("");
  };
  return (
    <div className={`${inputCls} flex flex-wrap items-center gap-1.5 !py-2`}>
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 text-xs pl-2.5 pr-1 py-1 rounded-full bg-[#fbf6e9] border border-[#ecd9a6] text-[#7a5c14]"
        >
          {t}
          <button
            type="button"
            title={`Remove ${t}`}
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="w-4 h-4 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
          >
            <MdClose className="text-[11px]" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? "Add tag" : placeholder}
        className="flex-1 min-w-[140px] border-0 p-0 text-sm focus:outline-none focus:ring-0 bg-transparent"
      />
    </div>
  );
};

const SlugRules = () => (
  <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600">
    <p className="font-semibold text-[#1d2532] mb-1">URL slug rules</p>
    <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
      <li className="flex gap-1.5"><MdCheckCircle className="text-green-600 mt-0.5 shrink-0" /> Lowercase English letters a–z</li>
      <li className="flex gap-1.5"><MdCheckCircle className="text-green-600 mt-0.5 shrink-0" /> Numbers 0–9</li>
      <li className="flex gap-1.5"><MdCheckCircle className="text-green-600 mt-0.5 shrink-0" /> Single dash (-) between words</li>
      <li className="flex gap-1.5"><MdCheckCircle className="text-green-600 mt-0.5 shrink-0" /> Up to {SEO_RULES.slug.max} characters, 3–6 words is best</li>
      <li className="flex gap-1.5 sm:col-span-2">
        <MdErrorOutline className="text-red-500 mt-0.5 shrink-0" />
        <span>
          Not allowed: spaces, CAPITALS, underscore _, and symbols like{" "}
          <code className="px-1 rounded bg-gray-100 text-red-600">@ # $ % &amp; * ! ? / \ . , : ; ' " ( ) [ ] {"{ }"} + = &lt; &gt; | ~ ^ `</code>
          , emoji or Hindi/other-language letters
        </span>
      </li>
      <li className="flex gap-1.5 sm:col-span-2">
        <MdErrorOutline className="text-red-500 mt-0.5 shrink-0" /> No dash at the start or end, and no double dashes (--)
      </li>
    </ul>
    <p className="mt-2 text-gray-500">
      Example: <span className="line-through text-red-500">Kundan Choker @ 50% Off!</span> →{" "}
      <span className="text-green-700 font-medium">kundan-choker-50-off</span>
    </p>
  </div>
);

/**
 * SEO inputs for a product or category.
 * value: { slug, metaTitle, metaDescription, metaKeywords }
 * name / description: used as the automatic fallback when a field is left empty.
 * lockable: edit mode, every field is read-only until its own Edit button is clicked.
 * saved: the values saved in the database (for Cancel and the "old link redirects" note).
 * slugLinked / onSlugLinkedChange: the slug follows the name until the slug is typed by hand.
 */
const SeoFields = ({
  value,
  onChange,
  name = "",
  description = "",
  basePath,
  inputCls,
  siteName = "Kuchalag India",
  tags,
  onTagsChange,
  lockable = false,
  saved = {},
  slugLinked,
  onSlugLinkedChange,
}) => {
  const [unlocked, setUnlocked] = useState({});
  const set = (k, v) => onChange({ ...value, [k]: v });
  const isLocked = (k) => lockable && !unlocked[k];
  const lockProps = (k) => ({
    locked: isLocked(k),
    changed: (value[k] || "") !== (saved[k] || ""),
    onEdit: () => setUnlocked((u) => ({ ...u, [k]: true })),
    onLock: () => setUnlocked((u) => ({ ...u, [k]: false })),
    onCancel: () => {
      set(k, saved[k] || "");
      setUnlocked((u) => ({ ...u, [k]: false }));
      if (k === "slug") onSlugLinkedChange?.(false);
    },
  });

  const autoSlug = slugify(name);
  const shownSlug = value.slug || autoSlug || "your-page";
  const shownTitle = plain(value.metaTitle) || (name ? `${plain(name)} | ${siteName}` : siteName);
  const shownDescription = plain(value.metaDescription) || plain(description);
  const issues = slugIssues(value.slug);
  const slugChangedFromSaved = saved.slug && value.slug && value.slug !== saved.slug;
  const { metaTitle: T, metaDescription: D, metaKeywords: K } = SEO_RULES;

  return (
    <div className="space-y-4">
      {/* Google preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1">
          <MdSearch /> Google preview
        </p>
        <p className="text-xs text-[#202124] truncate">
          {WEBSITE_URL.replace(/^https?:\/\//, "")} › {basePath.replace(/^\/|\/$/g, "")} › {shownSlug}
        </p>
        <p className="text-[18px] leading-snug text-[#1a0dab] truncate">{cut(shownTitle, 65)}</p>
        <p className="text-[13px] text-[#4d5156] line-clamp-2">
          {shownDescription ? cut(shownDescription, 160) : <span className="italic text-gray-400">Add a description</span>}
        </p>
      </div>

      {/* URL slug */}
      <div>
        <FieldLabel
          extra={
            <>
              {onSlugLinkedChange &&
                (slugLinked ? (
                  <span className="normal-case font-normal text-green-700 inline-flex items-center gap-1">
                    <MdLink /> Follows the name
                  </span>
                ) : (
                  !isLocked("slug") && (
                    <button
                      type="button"
                      onClick={() => {
                        onSlugLinkedChange(true);
                        set("slug", autoSlug);
                      }}
                      className="normal-case font-medium text-[#8a6a1f] hover:underline"
                    >
                      Make from name
                    </button>
                  )
                ))}
              <span className={`normal-case font-normal ${value.slug.length > SEO_RULES.slug.max ? "text-red-600" : "text-gray-400"}`}>
                {value.slug.length}/{SEO_RULES.slug.max}
              </span>
              {lockable && <LockButton {...lockProps("slug")} />}
            </>
          }
        >
          URL slug
        </FieldLabel>
        <div
          className={`flex items-stretch rounded-xl border bg-white overflow-hidden focus-within:ring-2 ${
            issues.length
              ? "border-red-300 focus-within:ring-red-200"
              : "border-gray-200 focus-within:border-[#c8a24a] focus-within:ring-[#c8a24a]/20"
          }`}
        >
          <span className="flex items-center gap-1 px-3 text-xs text-gray-500 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
            <MdLink /> {basePath}
          </span>
          <input
            type="text"
            value={value.slug}
            readOnly={isLocked("slug")}
            onChange={(e) => {
              onSlugLinkedChange?.(false);
              set("slug", e.target.value);
            }}
            placeholder={autoSlug || "bridal-potli-bag"}
            className={`flex-1 min-w-0 px-3 py-2.5 text-sm text-[#1d2532] placeholder-gray-400 focus:outline-none ${
              isLocked("slug") ? lockedCls : ""
            }`}
          />
        </div>

        {issues.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <ul className="text-xs text-red-700 space-y-0.5">
              {issues.map((i) => (
                <li key={i} className="flex gap-1">
                  <MdErrorOutline className="mt-0.5 shrink-0" /> {i}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => set("slug", slugify(value.slug))}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-100"
            >
              <MdAutoFixHigh /> Fix it: {slugify(value.slug) || "(empty)"}
            </button>
          </div>
        )}
        {!autoSlug && name.trim() && !value.slug && (
          <p className="text-xs text-amber-700 mt-1">
            The name has no English letters or numbers, so type a slug yourself.
          </p>
        )}
        {slugChangedFromSaved && !issues.length && (
          <p className="text-xs text-amber-700 mt-1">
            The URL changes from {basePath}
            {saved.slug} to {basePath}
            {value.slug}. Old links will redirect to the new one automatically.
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Must be unique. If another product already uses it, "-2" is added at the end when you save.
        </p>
        {!isLocked("slug") && <SlugRules />}
      </div>

      {/* Meta title */}
      <div>
        <FieldLabel
          extra={
            <>
              <CharCount value={value.metaTitle} min={T.min} ideal={T.ideal} max={T.max} />
              {lockable && <LockButton {...lockProps("metaTitle")} />}
            </>
          }
        >
          Meta title
        </FieldLabel>
        <input
          type="text"
          value={value.metaTitle}
          maxLength={T.max}
          readOnly={isLocked("metaTitle")}
          onChange={(e) => set("metaTitle", e.target.value)}
          placeholder={name ? `${name} | ${siteName}` : "Shown as the blue link in Google"}
          className={`${inputCls} ${isLocked("metaTitle") ? lockedCls : ""}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Best {T.min}–{T.ideal} characters, max {T.max}. Put the main keyword first. Empty = "{plain(name) || "Name"} | {siteName}".
        </p>
      </div>

      {/* Meta description */}
      <div>
        <FieldLabel
          extra={
            <>
              <CharCount value={value.metaDescription} min={D.min} ideal={D.ideal} max={D.max} />
              {lockable && <LockButton {...lockProps("metaDescription")} />}
            </>
          }
        >
          Meta description
        </FieldLabel>
        <textarea
          rows={3}
          value={value.metaDescription}
          maxLength={D.max}
          readOnly={isLocked("metaDescription")}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder={plain(description) ? cut(plain(description), 160) : "Short summary shown under the title in Google"}
          className={`${inputCls} resize-y ${isLocked("metaDescription") ? lockedCls : ""}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Best {D.min}–{D.ideal} characters, max {D.max}. Empty = the first {D.max} characters of the description.
        </p>
      </div>

      {/* Meta keywords */}
      <div>
        <FieldLabel
          extra={
            <>
              <span className={`normal-case font-normal ${value.metaKeywords.length > K.max ? "text-red-600" : "text-gray-400"}`}>
                {value.metaKeywords.length}/{K.max}
              </span>
              {lockable && <LockButton {...lockProps("metaKeywords")} />}
            </>
          }
        >
          Meta keywords
        </FieldLabel>
        <input
          type="text"
          value={value.metaKeywords}
          maxLength={K.max}
          readOnly={isLocked("metaKeywords")}
          onChange={(e) => set("metaKeywords", e.target.value)}
          placeholder="Comma separated, e.g. bridal potli, wedding gift"
          className={`${inputCls} ${isLocked("metaKeywords") ? lockedCls : ""}`}
        />
        <p className="text-xs text-gray-500 mt-1">Comma separated, max {K.max} characters. 3–8 keywords is enough.</p>
      </div>

      {onTagsChange && (
        <div>
          <FieldLabel extra={<span className="normal-case font-normal text-gray-400">{(tags || []).length}/30</span>}>
            Product tags
          </FieldLabel>
          <TagInput value={tags || []} onChange={onTagsChange} inputCls={inputCls} />
          <p className="text-xs text-gray-500 mt-1">
            Press Enter or comma after each tag. Products sharing tags show up as "Related products".
          </p>
        </div>
      )}
    </div>
  );
};

export default SeoFields;
