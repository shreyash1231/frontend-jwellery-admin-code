import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import Load from "../Load/Load";
import ReactQuill from "react-quill";
import { staticContent, updateContent, createContent } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

const Exchange = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [text, setText] = useState("");
  const [disableStatus, setDisableStatus] = useState(true);
  const message = useToast();

  const sentHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getExchangePolicyApi = async () => {
    setLoading(true);
    try {
      const response = await staticContent();
      if (response?.success) {
        const exchange = response?.data.filter((item) => item.title === "exchange")[0];
        setData(exchange);
        setText(exchange?.content);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  const createExchangePolicyApi = async () => {
    const plainText = sentHtml(text).trim();

    if (!plainText) {
      message.error("Content can not be empty");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        content: text,
        title: "exchange",
        type: "EXCHANGE_POLICY",
      };
      const response = await createContent(payload);
      if (response?.success) {
        message.success(response?.message);
        await getExchangePolicyApi();
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  const updateExchangePolicyApi = async () => {
    const plainText = sentHtml(text).trim();

    if (!plainText) {
      message.error("Content can not be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await updateContent(data.id, { content: text });
      if (response?.success) {
        message.success("Content updated successfully");
        setDisableStatus(true);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExchangePolicyApi();
  }, []);

  const handleChange = (value) => {
    setText(value);
    setDisableStatus(false);
  };

  return (
    <div className="mt-28 ">
      <div style={{ width: "90%", margin: "0px auto" }}>
        <div style={{ marginTop: "100px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1 className="text-2xl text-gray-600 font-bold text-black">
              Exchange Policy
            </h1>
          </div>
          <ReactQuill
            value={text}
            onChange={handleChange}
            placeholder="Write your exchange policy here..."
            theme="snow"
            className="mb-4"
            style={{ height: "300px", position: "relative" }}
          />
        </div>
      </div>
      <div className="flex flex-row justify-end items-center w-full">
        <button
          onClick={data?.id ? updateExchangePolicyApi : createExchangePolicyApi}
          disabled={disableStatus}
          className="bg-[#1d2532] hover:bg-[#100f0fcf] text-white py-2 px-5 rounded-lg mt-16 mr-20"
        >
          {data?.id ? "Update" : "Create"}
        </button>
      </div>
      {loading && <Load />}
    </div>
  );
};

export default Exchange;
