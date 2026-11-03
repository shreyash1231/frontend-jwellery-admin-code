import React, { useEffect, useState } from "react";
import Load from "../Load/Load";
import { getSiteSettingsApi, updateSiteSettingsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

// What the switch controls on the website
const NEW_FEATURES = [
  "Top Marquee managed from the admin panel (old fixed announcement text when off)",
  "Sub-categories: hidden from menus and shown inside their parent category page",
  "Discount badges (% OFF) on product cards and product pages",
  "New coupon box at checkout: celebration on apply, inline errors, \"add ₹X more\" hints",
];

// Hidden page: reachable only at /site-settings, not linked from the side menu
const SiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [savedEnabled, setSavedEnabled] = useState(false);
  const message = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSiteSettingsApi();
        if (res?.success && res.data) {
          setEnabled(!!res.data.newFeaturesEnabled);
          setSavedEnabled(!!res.data.newFeaturesEnabled);
        }
      } catch (err) {
        errorResponseHandler(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateSiteSettingsApi({ newFeaturesEnabled: enabled });
      if (res?.success) {
        setSavedEnabled(enabled);
        message.success(
          enabled ? "New features are now live on the website" : "Website switched back to the old version",
        );
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16 max-w-3xl">
      <h2 className="text-2xl font-bold mb-2">Site Settings</h2>
      <p className="text-gray-500 mb-6">
        Controls which version of the website customers see. Changes apply as soon as you save.
      </p>

      <div className="border rounded-xl p-5 bg-white shadow-sm">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-lg">Show new features on website</p>
            <p className="text-sm text-gray-500">
              Currently live:{" "}
              <span className={savedEnabled ? "text-green-700 font-semibold" : "text-gray-700 font-semibold"}>
                {savedEnabled ? "New version" : "Old version"}
              </span>
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
              enabled ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-gray-700 list-disc pl-5">
          {NEW_FEATURES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || enabled === savedEnabled}
            className="px-6 py-2 bg-[#1d2532] text-white rounded-md font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
