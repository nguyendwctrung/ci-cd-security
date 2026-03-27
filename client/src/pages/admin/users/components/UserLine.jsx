import {useState, useEffect} from "react";
import {Eye, Trash2, RotateCcw} from "lucide-react";
import UserDetailModal from '@/pages/admin/users/components/UserDetailModal';
import DeleteConfirmModal from '@/pages/admin/users/components/UserDeleteModal';
import UserRestoreModal from '@/pages/admin/users/components/UserRestoreModal';
export default function UserLine ({userInfo}) {
    const [user, setUser ] = useState(userInfo);
    useEffect (() => {
        setUser (userInfo);
    }, [userInfo])
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openRestoreModal, setOpenRestoreModal] = useState (false);
    const [openDeleteModal, setOpenDeleteModal] = useState (false);
    return (
        <>
            <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
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
                            <div className="text-slate-900 font-semibold text-base">{user.username}</div>
                            <div className="text-slate-500 text-sm font-medium">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-5">
                        <div className="text-slate-800 font-medium text-base">{user.email}</div>
                        <div className="text-slate-500 text-sm font-medium">Verified account</div>
                      </td>
                      {/* Role */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                          user.role === 'admin'
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200'
                            : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      {/* Gender */}
                      <td className="px-6 py-5">
                        {user.sex ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                            user.sex === "Male"
                              ? "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200"
                              : "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border border-rose-200"
                          }`}>
                            {user.sex}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm font-medium italic">Not specified</span>
                        )}
                      </td>
                      {/* Active : is Banned or not */}
                      <td className="px-6 py-5">
                        {user.bannedAt ? (
                          <span className="inline-flex items-center px-3 py-1.5 w-[150px] text-red-800 rounded-full text-sm font-bold">
                            Banned at {new Date(user.bannedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-slate-800 font-medium min-w-[150px] w-fit">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-slate-500 text-sm font-medium">
                          {new Date(user.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setOpenDetailModal(true)}
                            className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </button>

                            { !user.bannedAt && <button
                            onClick={() => setOpenDeleteModal(true)}
                            className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 rounded-lg hover:from-red-100 hover:to-rose-100 hover:border-red-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>}

                            { user.bannedAt && <button
                            onClick={() => setOpenRestoreModal(true)}
                            className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                            title="Restore user"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </button>}
                        </div>
                      </td>
            </tr>


            {openDetailModal && <UserDetailModal user={user} setOpenModal = {setOpenDetailModal}/>}
            {openRestoreModal && <UserRestoreModal user={user} setUser = {setUser} setOpenModal = {setOpenRestoreModal}/>}
            {openDeleteModal && <DeleteConfirmModal user={user}  setUser = {setUser} setOpenModal = {setOpenDeleteModal}/>}
        </>
    );
}