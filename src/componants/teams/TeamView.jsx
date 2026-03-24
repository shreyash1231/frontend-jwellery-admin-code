import { image_url } from "../../common/env";

const TeamView = ({ show, setShow, team }) => {
  const close = () => setShow(false);
  if (!team) return null;

  const img = team?.image || team?.imageUrl || team?.profile_image || "";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999999 }}>
      <div className="bg-white rounded-lg shadow-lg w-[600px] min-h-[420px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">Team Details</h3>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-center">
            {img ? (
              <img src={`${image_url}/${img}`} alt={team?.name} className="w-28 h-28 rounded border object-cover" />
            ) : (
              <div className="w-28 h-28 rounded border flex items-center justify-center bg-gray-100">No Image</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Name</label>
              <input type="text" value={team?.name || '-'} readOnly className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded" />
            </div>
            <div>
              <label className="font-semibold">Designation</label>
              <input type="text" value={team?.designation || '-'} readOnly className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Facebook</label>
              <input type="text" value={team?.socialLinks?.facebook || '-'} readOnly className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded" />
            </div>
            <div>
              <label className="font-semibold">Twitter</label>
              <input type="text" value={team?.socialLinks?.twitter || '-'} readOnly className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded" />
            </div>
            <div>
              <label className="font-semibold">Instagram</label>
              <input type="text" value={team?.socialLinks?.instagram || '-'} readOnly className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded" />
            </div>
            <div>
              <label className="font-semibold">LinkedIn</label>
              <input type="text" value={team?.socialLinks?.linkedin || '-'} readOnly className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded" />
            </div>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t">
          <button onClick={close} className="bg-gray-300 text-black w-32 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200">Close</button>
        </div>
      </div>
    </div>
  );
};

export default TeamView;