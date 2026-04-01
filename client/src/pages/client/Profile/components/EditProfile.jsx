import { useState, useEffect } from "react";
import { User, Mail, Users, Camera, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter.jsx";
import TextEditor from "@/components/common/TextEditor.jsx";
import JustValidate from "just-validate";
import { toast } from "sonner";
import speakingURL from "speakingurl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

export default function EditProfile() {
  const { user, setUser } = useAuth();

  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(user?.profile?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const handleEditorChange = (value) => {
    document.getElementById("description").value = value;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const validator = new JustValidate("#editProfileForm");
    validator
      .addField("#email", [
        {
          rule: "required",
          errorMessage: "Email là bắt buộc",
        },
        {
          rule: "email",
          errorMessage: "Email không hợp lệ",
        },
      ])
      .addField("#username", [
        {
          rule: "required",
          errorMessage: "Username là bắt buộc",
        },
      ])
      .onSuccess((event) => {
        event.preventDefault();
        setIsSubmit(true);
      });
  }, []);

  function handleSubmit(e) {
    if (!isSubmit) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", e.target.email.value);
    formData.append("username", e.target.username.value);
    formData.append("sex", e.target.sex.value);
    formData.append("description", e.target.description.value);
    // Append avatar file if changed with user.profile.avatar
    if (avatarFile && avatar !== user?.profile?.avatar) {
      formData.append("avatar", avatarFile);
    }

    fetch(`${API_URL}/api/user/profile/edit`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          res.json().then((data) => {
            toast.error(data.message || "Cập nhật hồ sơ thất bại");
            throw new Error(data.message || "Cập nhật hồ sơ thất bại");
          });
        }
        return res.json();
      })
      .then((data) => {
        toast.success("Cập nhật hồ sơ thành công");
        setUser(data.data);
        navigate(
          `/profile/${speakingURL(data.data.username)}_${data.data._id}`,
        );
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsSubmit(false);
      });
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-white">Chỉnh sửa hồ sơ</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
          id="editProfileForm"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 bg-gray-900/80 rounded-2xl p-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-400 hover:bg-blue-300 p-3 rounded-full cursor-pointer transition-colors shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-400 text-center">
              Click icon to change your avatar
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 bg-gray-900/80 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={user?.email || ""}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <User className="w-4 h-4" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  defaultValue={user?.username || ""}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Nhập username"
                  required
                />
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <Users className="w-4 h-4" />
                  <span>Giới tính</span>
                </label>
                <select
                  name="sex"
                  defaultValue={user?.sex || ""}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Users className="w-4 h-4" />
                <span>Describe yourself</span>
              </label>
            </div>
            <TextEditor
              value={user?.description || ""}
              onEditChange={handleEditorChange}
            />
            <input type="hidden" id="description" name="description"></input>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-4 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium text-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 cursor-pointer px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium text-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
