import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import Load from "../Load/Load";
import { getMarqueeApi, updateMarqueeApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const SPEEDS = [
  { label: "Slow", value: 40 },
  { label: "Normal", value: 25 },
  { label: "Fast", value: 12 },
];

/* ================= COLOR FIELD ================= */

const ColorField = ({ label, value, onChange }) => (
  <div>
    <label className="block mb-1 font-semibold">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={HEX.test(value) && value.length === 7 ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 border border-gray-900 rounded cursor-pointer p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        maxLength={7}
        className={`border p-2 w-32 rounded-md font-mono ${
          HEX.test(value) ? "border-gray-900" : "border-red-500"
        }`}
        placeholder="#2a2016"
      />
    </div>
  </div>
);

/* ================= PREVIEW ================= */

const MarqueePreview = ({ messages, textColor, backgroundColor, speed }) => {
  const text = messages.filter((m) => m.trim()).join("   ✦   ");

  return (
    <div
      className="w-full h-[36px] overflow-hidden flex items-center rounded-md"
      style={{ backgroundColor }}
    >
      {text ? (
        <div
          className="admin-marquee-track flex whitespace-nowrap"
          style={{ animationDuration: `${speed}s` }}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className="text-[12px] tracking-[0.08em] font-semibold uppercase pr-16"
              style={{ color: textColor }}
            >
              {text}
              <span className="px-8">✦</span>
              {text}
            </span>
          ))}
        </div>
      ) : (
        <span className="px-4 text-sm" style={{ color: textColor }}>
          Add a message to see the preview
        </span>
      )}
      <style>{`
        .admin-marquee-track {
          animation: admin-marquee linear infinite;
        }
        @keyframes admin-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

/* ================= PAGE ================= */

const Marquee = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    messages: [""],
    textColor: "#f4e8dc",
    backgroundColor: "#2a2016",
    speed: 25,
    isActive: true,
  });
  const message = useToast();

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const res = await getMarqueeApi();
        if (res?.success && res.data) {
          setForm({
            messages: res.data.messages?.length ? res.data.messages : [""],
            textColor: res.data.textColor || "#f4e8dc",
            backgroundColor: res.data.backgroundColor || "#2a2016",
            speed: res.data.speed || 25,
            isActive: res.data.isActive !== false,
          });
        }
      } catch (err) {
        errorResponseHandler(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarquee();
  }, []);

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const updateMessage = (index, value) =>
    setField(
      "messages",
      form.messages.map((m, i) => (i === index ? value : m)),
    );

  const addMessage = () => setField("messages", [...form.messages, ""]);

  const removeMessage = (index) =>
    setField(
      "messages",
      form.messages.length === 1
        ? [""]
        : form.messages.filter((_, i) => i !== index),
    );

  const handleSave = async () => {
    const messages = form.messages.map((m) => m.trim()).filter(Boolean);

    if (form.isActive && messages.length === 0) {
      message.error("Add at least one message, or switch the marquee off");
      return;
    }
    if (!HEX.test(form.textColor) || !HEX.test(form.backgroundColor)) {
      message.error("Colors must be hex values like #2a2016");
      return;
    }

    try {
      setSaving(true);
      const res = await updateMarqueeApi({ ...form, messages });
      if (res?.success) {
        message.success("Marquee updated successfully");
        setField("messages", messages.length ? messages : [""]);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Marquee</h2>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="font-semibold">
            {form.isActive ? "Showing on website" : "Hidden on website"}
          </span>
        </label>
      </div>

      {/* PREVIEW */}
      <div className="mb-8">
        <p className="font-semibold mb-2">Live Preview</p>
        <MarqueePreview {...form} />
      </div>

      {/* MESSAGES */}
      <div className="mb-8">
        <label className="block mb-2 font-semibold">Messages</label>
        <p className="text-sm text-gray-500 mb-3">
          Each message scrolls one after another, separated by a ✦.
        </p>
        <div className="space-y-3">
          {form.messages.map((msg, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="w-6 text-gray-500 text-right">{index + 1}.</span>
              <input
                type="text"
                value={msg}
                maxLength={300}
                onChange={(e) => updateMessage(index, e.target.value)}
                placeholder="e.g. Flat 10% off on all bridal sets — use code BRIDE10"
                className="border border-gray-900 p-2 rounded-md flex-1"
              />
              <AiFillDelete
                onClick={() => removeMessage(index)}
                className="text-xl text-red-500 cursor-pointer hover:text-red-700"
                title="Remove message"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addMessage}
          className="mt-3 px-4 py-2 border border-[#1d2532] text-[#1d2532] rounded-md hover:bg-gray-100"
        >
          + Add Message
        </button>
      </div>

      {/* COLORS + SPEED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ColorField
          label="Text Color"
          value={form.textColor}
          onChange={(v) => setField("textColor", v)}
        />
        <ColorField
          label="Background Color"
          value={form.backgroundColor}
          onChange={(v) => setField("backgroundColor", v)}
        />
        <div>
          <label className="block mb-1 font-semibold">Scroll Speed</label>
          <select
            value={form.speed}
            onChange={(e) => setField("speed", Number(e.target.value))}
            className="border border-gray-900 p-2 w-full rounded-md h-10"
          >
            {SPEEDS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
            {!SPEEDS.some((s) => s.value === form.speed) && (
              <option value={form.speed}>Custom ({form.speed}s)</option>
            )}
          </select>
        </div>
      </div>

      <div className="flex justify-end border-t pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-white py-2 px-4 rounded-md w-40 bg-[#1d2532] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default Marquee;
