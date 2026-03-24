import { image_url } from "../../common/env";

// View domain details in a modal
const DomainView = ({ showView, setShowView, domain }) => {
  const close = () => setShowView(false);

  const name = domain?.name || domain?.domain_name || domain?.title || "-";
  const description =
    domain?.description || domain?.desc || domain?.detail || "-";
  const stocks = domain?.stocks || "-";
  const image =
    domain?.image ||
    domain?.imageUrl ||
    domain?.profile_image ||
    "";
  const logo = domain?.logo || "";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[600px] min-h-[480px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">
          Category Details
        </h3>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="font-semibold block mb-2">Image</label>
            <div className="flex justify-center">
              {image ? (
                <img
                  src={`${image_url}/${image}`}
                  alt={name}
                  className="w-28 h-28 rounded border object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded border flex items-center justify-center bg-gray-100">
                  No Image
                </div>
              )}
            </div>
          </div>

          {logo && (
            <div>
              <label className="font-semibold block mb-2">Logo</label>
              <div className="flex justify-center">
                <img
                  src={`${image_url}/${logo}`}
                  alt={`${name} logo`}
                  className="w-28 h-28 rounded border object-contain"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold">Name</label>
            <input
              type="text"
              value={name}
              readOnly
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="font-semibold">Stocks</label>
            <input
              type="text"
              value={stocks}
              readOnly
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded font-semibold text-lg"
            />
          </div>

          <div>
            <label className="font-semibold">Description</label>
            <textarea
              value={description}
              readOnly
              rows={5}
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={domain?.isShopByProduct || false}
              readOnly
              className="w-4 h-4"
            />
            <label className="font-semibold">Shop By Product</label>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={close}
            className="bg-gray-300 text-black w-32 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainView;
