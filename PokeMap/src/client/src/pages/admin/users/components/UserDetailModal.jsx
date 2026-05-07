import {X, UserPlus, Heart, Users, Mail, Calendar, Clock} from 'lucide-react';
export default function UserDetailModal ({ user, setOpenModal }) {


  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={() => setOpenModal(false)}
      ></div>
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden animate__animated animate__fadeInDown animate_faster">
        {/* Modal Header - Hero Style with Avatar Background */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>

          {/* Header Content */}
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                    {user.profile && user.profile.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-3xl font-bold mb-1">{user.username}</h2>
                <p className="text-blue-200 text-lg flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    {user.role || 'User'}
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm font-medium backdrop-blur-sm">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setOpenModal(false)}
              className="p-3 bg-white/10 cursor-pointer hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 bg-gray-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Following</p>
                  <p className="text-3xl font-bold text-gray-900">{user.profile.following}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Followers</p>
                  <p className="text-3xl font-bold text-gray-900">{user.profile.followers}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                  <p className="text-xl font-bold text-gray-900">{user.role}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span>User Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900 font-medium break-words">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className={`font-semibold ${user.sex === "Male" ? "text-blue-600" : user.sex === "Female" ? "text-pink-600" : "text-gray-600"}`}>
                      {user.sex || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">Join Date</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-gray-900 font-mono text-sm break-all bg-white px-2 py-1 rounded border">
                      {user._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};