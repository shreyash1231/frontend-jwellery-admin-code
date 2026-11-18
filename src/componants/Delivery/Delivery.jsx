import React, { useEffect, useMemo, useState } from "react";
import { MdLocalShipping, MdSave, MdCurrencyRupee, MdEvent, MdDateRange, MdCheckCircle } from "react-icons/md";
import Load from "../Load/Load";
import { getSiteSettingsApi, updateSiteSettingsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

const FIELDS = ["deliveryCharge", "freeDeliveryAbove", "deliveryDaysType", "deliveryDaysMin", "deliveryDaysMax"];
const DEFAULTS = { deliveryCharge: 200, freeDeliveryAbove: 5000, deliveryDaysType: "range", deliveryDaysMin: 3, deliveryDaysMax: 7 };

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const dayLabel = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + Number(n || 0));
  return d;
};

// Same sentence the website shows after a pincode check
export const deliveryLine = (s) => {
  if (s.deliveryDaysType === "range" && Number(s.deliveryDaysMax) > Number(s.deliveryDaysMin)) {
    return `expected between ${dayLabel(addDays(s.deliveryDaysMin))} – ${dayLabel(addDays(s.deliveryDaysMax))}`;
  }
  return `expected by ${dayLabel(addDays(s.deliveryDaysMin))}`;
};

const ChoiceCard = ({ active, icon, title, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`text-left rounded-2xl border-2 p-4 transition-all ${
      active ? "border-[#c8a24a] bg-[#fbf6e9] shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
    }`}
  >
    <span className={`text-2xl ${active ? "text-[#c8a24a]" : "text-gray-400"}`}>{icon}</span>
    <p className="font-semibold text-[#1d2532] mt-1">{title}</p>
    <p className="text-xs text-gray-500">{text}</p>
  </button>
);

const NumberInput = ({ label, value, onChange, prefix, suffix, hint, error }) => (
  <div>
    <label className="block text-sm font-semibold text-[#1d2532] mb-1.5">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{prefix}</span>}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg py-2.5 ${prefix ? "pl-8" : "pl-3"} ${suffix ? "pr-14" : "pr-3"}`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>}
    </div>
    {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const Delivery = () => {
  const message = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getSiteSettingsApi()
      .then((res) => {
        const s = { ...DEFAULTS };
        FIELDS.forEach((k) => res?.data?.[k] !== undefined && (s[k] = res.data[k]));
        setForm(s);
        setSaved(s);
      })
      .catch(errorResponseHandler)
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const dirty = useMemo(() => FIELDS.some((k) => String(form[k]) !== String(saved[k])), [form, saved]);

  const validate = () => {
    const e = {};
    const whole = (v) => v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 90;
    if (form.deliveryCharge === "" || Number(form.deliveryCharge) < 0) e.deliveryCharge = "Enter 0 or more";
    if (form.freeDeliveryAbove === "" || Number(form.freeDeliveryAbove) < 0) e.freeDeliveryAbove = "Enter 0 or more";
    if (!whole(form.deliveryDaysMin)) e.deliveryDaysMin = "Whole number of days, 0 to 90";
    if (form.deliveryDaysType === "range") {
      if (!whole(form.deliveryDaysMax)) e.deliveryDaysMax = "Whole number of days, 0 to 90";
      else if (Number(form.deliveryDaysMax) < Number(form.deliveryDaysMin))
        e.deliveryDaysMax = "Must be the same as or more than the earliest";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      deliveryCharge: Number(form.deliveryCharge),
      freeDeliveryAbove: Number(form.freeDeliveryAbove),
      deliveryDaysType: form.deliveryDaysType,
      deliveryDaysMin: Number(form.deliveryDaysMin),
      deliveryDaysMax: Number(form.deliveryDaysType === "range" ? form.deliveryDaysMax : form.deliveryDaysMin),
    };
    try {
      setSaving(true);
      const res = await updateSiteSettingsApi(payload);
      if (res?.success) {
        setForm(payload);
        setSaved(payload);
        message.success("Delivery settings saved");
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Load />;

  const charge = Number(form.deliveryCharge) || 0;
  const freeAbove = Number(form.freeDeliveryAbove) || 0;

  return (
    <div className="p-4 pb-10 mt-16">
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Sales</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">Delivery</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-xl">
          Set the delivery charge and how long delivery takes. Customers see this when they check their pincode on a
          product page, and the charge is added at checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm space-y-8">
          <section>
            <h3 className="font-semibold text-[#1d2532] mb-4 flex items-center gap-2">
              <MdCurrencyRupee className="text-[#c8a24a]" /> Delivery charge
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                label="Charge per order"
                prefix="₹"
                value={form.deliveryCharge}
                onChange={(v) => set("deliveryCharge", v)}
                hint="Enter 0 for free delivery on every order"
                error={errors.deliveryCharge}
              />
              <NumberInput
                label="Free delivery on orders above"
                prefix="₹"
                value={form.freeDeliveryAbove}
                onChange={(v) => set("freeDeliveryAbove", v)}
                hint="Enter 0 to always charge delivery"
                error={errors.freeDeliveryAbove}
              />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-[#1d2532] mb-4 flex items-center gap-2">
              <MdEvent className="text-[#c8a24a]" /> Delivery time
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <ChoiceCard
                active={form.deliveryDaysType === "fixed"}
                icon={<MdEvent />}
                title="Within a number of days"
                text={`"Delivery expected by 21 Nov"`}
                onClick={() => set("deliveryDaysType", "fixed")}
              />
              <ChoiceCard
                active={form.deliveryDaysType === "range"}
                icon={<MdDateRange />}
                title="Between two dates"
                text={`"Delivery expected between 19 Nov – 23 Nov"`}
                onClick={() => set("deliveryDaysType", "range")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                label={form.deliveryDaysType === "range" ? "Earliest delivery" : "Delivered in"}
                suffix="days"
                value={form.deliveryDaysMin}
                onChange={(v) => set("deliveryDaysMin", v)}
                hint="Counted from the day the customer checks"
                error={errors.deliveryDaysMin}
              />
              {form.deliveryDaysType === "range" && (
                <NumberInput
                  label="Latest delivery"
                  suffix="days"
                  value={form.deliveryDaysMax}
                  onChange={(v) => set("deliveryDaysMax", v)}
                  error={errors.deliveryDaysMax}
                />
              )}
            </div>
          </section>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#1d2532] text-white rounded-xl font-semibold disabled:opacity-50"
            >
              <MdSave className="text-lg" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Live preview of the product page box */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm xl:sticky xl:top-20">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-3">Customer sees</p>
          <p className="font-semibold text-[#1d2532] mb-2 flex items-center gap-2">
            <MdLocalShipping className="text-[#c8a24a]" /> Check delivery
          </p>
          <div className="flex gap-2">
            <div className="flex-1 border rounded-lg px-3 py-2 text-gray-500 bg-gray-50">221005</div>
            <div className="px-4 py-2 rounded-lg bg-[#1d2532] text-white text-sm font-semibold">Check</div>
          </div>
          <p className="text-sm text-emerald-700 font-medium mt-3 flex items-center gap-1.5">
            <MdCheckCircle /> Delivery available · {deliveryLine(form)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {charge > 0
              ? `${rupees(charge)} delivery charge added at checkout${freeAbove > 0 ? ` · free on orders above ${rupees(freeAbove)}` : ""}`
              : "Free delivery"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
