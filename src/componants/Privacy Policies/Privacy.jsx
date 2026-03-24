import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import Load from '../Load/Load'
import ReactQuill from "react-quill";
import { staticContent, updateContent, createContent } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

const Privacy = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [text, setText] = useState("");
  const [disableStatus, setDisableStatus] = useState(true);
  const [isPolicyCreated, setIsPolicyCreated] = useState(false); 
  const message=useToast();

  const getPrivacyPolicyApi = async () => {
    setLoading(true);
    try {
      const response = await staticContent();
      if (response?.success) {
        const policyData = response?.data.filter((item) => item.title === "privacy")[0];
        setData(policyData);
        setText(policyData?.content);
        setIsPolicyCreated(!!policyData);
      }
    } catch (error) {
      errorResponseHandler(error)

    } finally {
      setLoading(false);
    }
  };

  const createPrivacyPolicyApi = async () => {
    const plainText = sentHtml(text).trim();

    if (!plainText) {
      message.error("Content can not be empty")
      return;
    }
    setLoading(true);
    try {

      const data = {
        content: text,
        title: "privacy",
        type:"PRIVACY_POLICY"
      }
      const response = await createContent(data);
      if (response?.success) {
        message.success("Content updated successfully");
        await getPrivacyPolicyApi(); 
      }
    } catch (error) {
      errorResponseHandler(error)

    } finally {
      setLoading(false);
    }
  };

  const sentHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }


  const updatePrivacyPolicyApi = async () => {

    const plainText = sentHtml(text).trim();

    if (!plainText) {
      message.error("Content can not be empty")
      return;
    }

    setLoading(true);
    try {
      const response = await updateContent(data.id, { content: text });
      if (response?.success) {
        message.success(response?.message);
        setDisableStatus(true);
      } 
    } catch (error) {
      errorResponseHandler(error)

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrivacyPolicyApi();
  }, []);

  const handleChange = (value) => {
    setText(value);
    setDisableStatus(false);
  };


  return (


    <div className="mt-28">
      <div style={{ width: "90%", margin: "0 auto" }}>

        <div style={{ marginTop: "100px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h1 className="text-2xl text-gray-600 font-bold text-black">Privacy & Policy</h1>

          </div>
          <ReactQuill
            value={text}
            onChange={handleChange}
            placeholder="Write your privacy policies here..."
            theme="snow"
            className="mb-4"
            style={{ height: "300px", position: "relative" }}
          />
        </div>
      </div>
      <div className="flex flex-row justify-end items-center w-full">
        <button
          onClick={isPolicyCreated ? updatePrivacyPolicyApi : createPrivacyPolicyApi}
          disabled={disableStatus}
          className="bg-[#1d2532] hover:bg-[#100f0fcf] text-white py-2 px-5 rounded-lg mt-16 mr-20"
        >
          {isPolicyCreated ? "Update" : "Create"}
        </button>
      </div>

      {loading && <Load />}
    </div>
  );
};

export default Privacy;

