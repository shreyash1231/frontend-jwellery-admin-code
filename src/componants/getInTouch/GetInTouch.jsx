import React, { useEffect, useState } from "react";
import { getDetailsApi, updateDetailsApi, addDetailsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";
import { useToast } from "../toast/Toast";

const GetInTouch = () => {
    const [contactDetails, setContactDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const message=useToast()
    const [form, setForm] = useState({

        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        phone: "",
        email: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
    });

    useEffect(() => {
        getDetailsApi()
            .then((res) => {
                if (res.success && res.data) {
                    setContactDetails(res.data?.[0]);
                    setForm({
                        street: res.data?.[0]?.address?.street || "",
                        city: res.data?.[0]?.address?.city || "",
                        state: res.data?.[0]?.address?.state || "",
                        country: res.data?.[0]?.address?.country || "",
                        zipCode: res.data?.[0]?.address?.zipCode || "",
                        phone: res.data?.[0]?.phone || "",
                        email: res.data?.[0]?.email || "",
                        facebook: res.data?.[0]?.socialLinks?.facebook || "",
                        twitter: res.data?.[0]?.socialLinks?.twitter || "",
                        instagram: res.data?.[0]?.socialLinks?.instagram || "",
                        linkedin: res.data?.[0]?.socialLinks?.linkedin || "",
                    });

                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const payload = {

                address: {
                    street: form.street,
                    city: form.city,
                    state: form.state,
                    country: form.country,
                    zipCode: form.zipCode,
                },
                phone: form.phone,
                email: form.email,
                socialLinks: {
                    facebook: form.facebook,
                    twitter: form.twitter,
                    instagram: form.instagram,
                    linkedin: form.linkedin,
                },
            };

            if (contactDetails?.id) {
                const res = await updateDetailsApi(contactDetails.id, payload);
                if (res.success) {
                    message.success(res.message)
                }
            } else {
                const res = await addDetailsApi(payload);
                if (res.success) {
                    setContactDetails(res.data);

                }
            }
        } catch (err) {
            errorResponseHandler(err)
        }
    };

    if (loading) return <Load />;

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg mt-24">
            <h2 className="text-2xl font-bold mb-4 text-center">📩 Get In Touch</h2>

            <h3 className="text-lg font-semibold mt-6 mb-2">🏠 Address</h3>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="street" placeholder="Street" value={form.street} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="zipCode" placeholder="Zip Code" value={form.zipCode} onChange={handleChange} className="border p-2 rounded col-span-2" />
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2">📞 Contact</h3>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-2 rounded" />
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded" />
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2">🔗 Social Links</h3>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="facebook" placeholder="Facebook" value={form.facebook} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="twitter" placeholder="Twitter" value={form.twitter} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="linkedin" placeholder="LinkedIn" value={form.linkedin} onChange={handleChange} className="border p-2 rounded" />
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSave}
                    className="bg-[#1d2532] text-white py-2 px-6 rounded hover:bg-[#2f3b52] transition"
                >
                    {contactDetails?.id ? "Update Details" : "Add Details"}
                </button>
            </div>
        </div>
    );
};

export default GetInTouch;
