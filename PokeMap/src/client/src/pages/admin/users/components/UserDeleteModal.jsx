import { AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

const DeleteConfirmModal = ({ user, setUser, setOpenModal }) => {


  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/deleteUser/${user._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete user");
      }

      const data = await response.json();
      toast.success("User deleted successfully");
      setUser(user => ({ ...user, bannedAt: data.bannedAt }));
      setOpenModal(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.message || "Failed to delete user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setOpenModal(false)} />

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate__animated animate__slideInDown animate_fast">
        {/* Modal Header */}
        <div className="flex items-center gap-4 p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
            <p className="text-gray-600 text-sm">This action cannot be undone</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
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
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">Delete this user account?</p>
            <p className="text-gray-700 text-sm mt-2">You can restore later.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setOpenModal(false)}
            className="flex-1 px-4 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            className="flex-1 px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;