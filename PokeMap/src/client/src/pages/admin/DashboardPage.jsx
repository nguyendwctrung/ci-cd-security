import {useState, useEffect}   from "react";


export default function Dashboard() {

  
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');  

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
        const date = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setCurrentTime(time);
      setCurrentDate(date);
    };

    updateTimeAndDate();
    const intervalId = setInterval(updateTimeAndDate, 10000); // Cập nhật 10 giây một lần

    return () => clearInterval(intervalId); // Cleanup khi component unmount
  }, []);


  return (
    <div className="flex-1 p-8 overflow-auto">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome back,
              </h1>
              <p className="text-gray-600 text-lg">{currentDate}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-indigo-600">{currentTime}</div>
              <p className="text-sm text-gray-500 mt-1">Current Time</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-50 -ml-32 -mb-32"></div>
          
          <div className="relative z-10 text-center">
            {/* Pokeball SVG */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  {/* Shadow */}
                  <ellipse cx="50" cy="95" rx="35" ry="5" fill="#000000" opacity="0.1" />
                  {/* Top half - red with gradient effect */}
                  <defs>
                    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#EF4444', stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#DC2626', stopOpacity:1}} />
                    </linearGradient>
                    <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#FFFFFF', stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#F3F4F6', stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  <path d="M50 10 A 40 40 0 0 1 90 50 L 10 50 A 40 40 0 0 1 50 10 Z" fill="url(#redGrad)" />
                  {/* Bottom half - white */}
                  <path d="M50 90 A 40 40 0 0 0 90 50 L 10 50 A 40 40 0 0 0 50 90 Z" fill="url(#whiteGrad)" />
                  {/* Middle band - black */}
                  <rect x="10" y="45" width="80" height="10" fill="#1F2937" />
                  {/* Center circle - white with shadow */}
                  <circle cx="50" cy="50" r="15" fill="#FFFFFF" stroke="#1F2937" strokeWidth="4" />
                  {/* Center button */}
                  <circle cx="50" cy="50" r="7" fill="#1F2937" />
                  <circle cx="48" cy="48" r="3" fill="#4B5563" />
                </svg>
                {/* Floating effect */}
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-full h-full rounded-full bg-indigo-400 opacity-20 blur-xl"></div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Admin Control Center
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Manage your platform efficiently. Monitor users, oversee posts, and keep everything running smoothly.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Users */}
              <a href = "/admin/users" className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-800">Users</div>
                <div className="text-sm text-gray-600 mt-1">Manage accounts</div>
              </a>
              {/* Posts */}
              <a href = "/admin/posts" className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-2xl font-bold text-gray-800">Posts</div>
                <div className="text-sm text-gray-600 mt-1">Content overview</div>
              </a>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-gray-800">System Status</h3>
            </div>
            <p className="text-gray-600">All systems operational</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🎯</div>
              <h3 className="font-semibold text-gray-800">Quick Tip</h3>
            </div>
            <p className="text-gray-600">Use the sidebar to navigate between sections</p>
          </div>
        </div>
      </div>
    </div>
  );
}