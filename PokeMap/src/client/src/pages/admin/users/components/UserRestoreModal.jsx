import { RefreshCw} from 'lucide-react';
import { toast } from "sonner";

const UserRestoreModal = ({ user, setUser, setOpenModal }) => {


  const handleRestoreUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/restoreUser/${user._id}`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to restore user");
      }

      toast.success("User restored successfully");
      setUser(user => ({ ...user, bannedAt: null}));
      setOpenModal(false);
    } catch (err) {
      console.error("Error restoring user:", err);
      toast.error(err.message || "Failed to restore user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={() => setOpenModal(false)}
      ></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-[50%] h-fit  w-full animate__animated animate__fadeInDown animate_fast">
        {/* Modal Header */}
        <div className="flex items-center gap-4 p-8 border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Restore User</h2>
            <p className="text-gray-600">Reactivate this user account</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          <div className="bg-green-50/90 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {user.profile && user.profile.avatar ? (
                  <img
                    src={user.profile.avatar}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{user.username}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-green-800 font-semibold">Restore this user account?</p>
              <p className="text-gray-700 text-sm mt-2">The user will regain access to their account and all features.</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-4 p-8 border-t border-gray-200 bg-gray-300/50">
          <button
            onClick={() => setOpenModal(false)}
            className="flex-1 px-6 py-3 cursor-pointer bg-white text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleRestoreUser}
            className="flex-1 px-6 py-3 cursor-pointer bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Restore User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRestoreModal;