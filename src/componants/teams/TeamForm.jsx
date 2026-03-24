import React, { useEffect, useState } from "react";
import { message } from "antd";
import { addTeamApi, updateTeamApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";

const TeamForm = ({ mode = "add", onClose, initial = null, onSaved }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({ name: "", designation: "", socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" } });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && initial) {
      setForm({
        name: initial?.name || "",
        designation: initial?.designation || "",
        socialLinks: {
          facebook: initial?.socialLinks?.facebook || "",
          twitter: initial?.socialLinks?.twitter || "",
          instagram: initial?.socialLinks?.instagram || "",
          linkedin: initial?.socialLinks?.linkedin || "",
        },
      });
      setImagePreview(initial?.image || initial?.imageUrl || initial?.profile_image || "");
    }
  }, [isEdit, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }));
  };

  const onSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.name?.trim() || !form.designation?.trim()) {
      message.error("Name and Designation are required");
      return;
    }
    if (!isEdit && !imageFile) {
      message.error("Image is required");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("designation", form.designation);
      fd.append("socialLinks[facebook]", form.socialLinks.facebook);
      fd.append("socialLinks[twitter]", form.socialLinks.twitter);
      fd.append("socialLinks[instagram]", form.socialLinks.instagram);
      fd.append("socialLinks[linkedin]", form.socialLinks.linkedin);
      if (imageFile) fd.append("image", imageFile); 
      if (isEdit) {
        const id = initial?._id || initial?.id;
        const res = await updateTeamApi(id, fd);
        if (res?.success) {
          message.success("Team updated successfully");
          onSaved?.();
        }
      } else {
        const res = await addTeamApi(fd);
        if (res?.success) {
          message.success("Team added successfully");
          onSaved?.();
        }
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2" style={{ zIndex: 9999999 }}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[760px] h-full max-h-[720px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white">{isEdit ? "Edit Team" : "Add Team"}</h3>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-center mb-6">
            <div className="relative text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="border border-gray-800 w-40 h-40 object-cover rounded" />
              ) : (
                <div className="w-40 h-40 border border-gray-800 flex items-center justify-center rounded bg-gray-100 text-gray-600">No image</div>
              )}
              <div className="mt-2">
                <input type="file" accept="image/*" onChange={onSelectImage} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="border border-gray-900 p-2 w-full" placeholder="Enter name" />
            </div>
            <div>
              <label className="block mb-1">Designation</label>
              <input type="text" name="designation" value={form.designation} onChange={handleChange} className="border border-gray-900 p-2 w-full" placeholder="Enter designation" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block mb-1">Facebook</label>
              <input type="url" name="facebook" value={form.socialLinks.facebook} onChange={handleSocialChange} className="border border-gray-900 p-2 w-full" placeholder="Facebook URL" />
            </div>
            <div>
              <label className="block mb-1">Twitter</label>
              <input type="url" name="twitter" value={form.socialLinks.twitter} onChange={handleSocialChange} className="border border-gray-900 p-2 w-full" placeholder="Twitter URL" />
            </div>
            <div>
              <label className="block mb-1">Instagram</label>
              <input type="url" name="instagram" value={form.socialLinks.instagram} onChange={handleSocialChange} className="border border-gray-900 p-2 w-full" placeholder="Instagram URL" />
            </div>
            <div>
              <label className="block mb-1">LinkedIn</label>
              <input type="url" name="linkedin" value={form.socialLinks.linkedin} onChange={handleSocialChange} className="border border-gray-900 p-2 w-full" placeholder="LinkedIn URL" />
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t gap-6">
          <button onClick={onClose} className="bg-gray-300 text-black w-40 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200">Close</button>
          <button onClick={handleSubmit} disabled={submitting} className="text-white py-2 px-4 rounded-md w-40 bg-[#1d2532] transition duration-200">{submitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}</button>
        </div>
      </div>
    </div>
  );
};

export default TeamForm;