import { useState, useEffect} from 'react';
import {Users} from 'lucide-react';
import PaginationComponent from '@/components/common/Pagination';
import {toast} from "sonner";
import Loading from '@/components/common/AdminLoading';
import UserLine from '@/pages/admin/users/components/UserLine';
import SearchUser from '@/pages/admin/components/SearchInput.jsx';
// User Detail Modal Component


// Delete Confirmation Modal Component



export default function UserAdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersInPage, setTotalUsersInPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitSearchQuery, setSubmitSearchQuery] = useState('');





  // List Users and Total Users
  useEffect (() => {
    // List Users
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/listUsers?page=${currentPage}&limit=5&search=${submitSearchQuery}`,{
      method: "GET",
      credentials: "include"
    })
    .then (res => { 
      if (!res.ok) {
        return res.json().then (data => {
          throw new Error (data.message || "Failed to fetch users");
        })
      }
      return res.json();
    })
    .then (data => {
        setUsers (data.data);
        setNumberOfPages (data.totalPages);
        setTotalUsersInPage (data.totalCount);
    })
    .catch (err => {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    });

    

    setIsLoading(false);
  }, [currentPage, submitSearchQuery]);
  
  useEffect (() => {
    // Total Users
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/total-users`)
    .then (res => {
      if (!res.ok) {
        return res.json().then (data => {
          throw new Error (data.message || "Failed to fetch total users");
        })
      }
      return res.json();
    })
    .then (data => { 
        setTotalUsers (data.data);
    })
    .catch (err => {
      console.error("Error fetching total users:", err);
      toast.error("Failed to fetch total users");
    });
  }, []);




  return (
    isLoading ? <Loading></Loading> : 
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto overflow-x-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 text-4xl font-bold tracking-tight">User Management</h1>
              <p className="text-slate-600 text-lg mt-1 font-medium">Manage and monitor user accounts across the platform</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Total Users</p>
                <p className="text-slate-800 font-bold text-3xl">{totalUsers}</p>
                <p className="text-emerald-600 text-sm font-medium mt-1">Active accounts</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchUser labelName={"Search User"} placeHolder={"Search by username, email, role, description..."} searchQuery = {searchQuery} setSearchQuery={setSearchQuery} setSubmitSearchQuery = {setSubmitSearchQuery} setPage = {setCurrentPage}></SearchUser>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Users Directory</h2>
            <p className="text-slate-600 text-sm mt-1">Total {totalUsersInPage} users found</p>
            <p className="text-slate-600 text-sm mt-1">View and manage all registered users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {
                  users && users.map((user, index) => (
                      <UserLine key ={index} userInfo = {user}></UserLine>
                  ))
                }
              </tbody>
            </table>

          {/* Pagination */}
          <div className="px-6 py-5 w-full">
            <div className="flex items-center justify-between">
              {totalUsersInPage ?
              <div className="text-slate-600 text-sm font-medium">
                Showing page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{numberOfPages}</span>
              </div>
              :
              <div className="text-slate-600 text-sm mx-auto font-medium">
                No users found
              </div>
              }
              <PaginationComponent
                numberOfPages={numberOfPages}
                currentPage={currentPage}
                controlPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
        

      </div>
    </div>
    </div>

  );
}
