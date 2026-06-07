import React, { useState, useEffect } from 'react';
import {MessageCircle} from 'lucide-react';
import PostLine from '@/pages/admin/posts/components/PostLine.jsx';
import PaginationComponent from '@/components/common/Pagination';
import Loading from '@/components/common/AdminLoading';
import {toast} from "sonner";
import SearchInput from '@/pages/admin/components/SearchInput.jsx';
const PostManagementDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFoundPosts, setTotalFoundPosts] = useState(0);
  const [total_posts, setTotalPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitSearchQuery, setSubmitSearchQuery] = useState('');



  // Fetch posts data -> get posts in current page and number of page
  useEffect (() => {
    
    const page = currentPage;
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/post/listPosts?page=${page}&limit=5&search=${submitSearchQuery}`,{
          method: "GET",
          credentials: "include"
        });
        const data = await response.json();
        if (!response.ok){
          throw new Error (data.message || "Failed to fetch posts");
        }
        setPosts(data.data);
        setNumberOfPages(data.totalPages);
        setTotalFoundPosts(data.totalCount);

      }
      catch (error) {
        console.error("Error fetching posts:", error);
        toast.error(error.message || "Failed to fetch posts");
      }
    }
    fetchPosts().finally(() => setIsLoading (false));
    
    
  }, [currentPage, submitSearchQuery]);

  useEffect (() => {
    // Fetch total posts
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/post/total-posts`, {
      method : "GET",
      credentials : "include",
    })
    .then (res => res.json())
    .then (data => {
      setTotalPosts(data.data);
      console.log ("Total posts:", data.data);
    })
    .catch (err => {
      console.error("Error fetching total posts:", err);
    });
  }, [])




  
  return (

    isLoading ? <Loading></Loading> : 
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 text-4xl font-bold tracking-tight">Post Management</h1>
              <p className="text-slate-600 text-lg mt-1 font-medium">Monitor and manage posts across the platform</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Total Posts</p>
                <p className="text-slate-800 font-bold text-3xl">{total_posts}</p>
                <p className="text-emerald-600 text-sm font-medium mt-1">Active content</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput labelName={"Search Posts"} placeHolder={"Search by content of posts"} searchQuery = {searchQuery} setSearchQuery={setSearchQuery} setSubmitSearchQuery = {setSubmitSearchQuery} setPage = {setCurrentPage}></SearchInput>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Posts Directory</h2>
            <p className="text-slate-600 text-sm mt-1">Found {totalFoundPosts} posts</p>
            <p className="text-slate-600 text-sm mt-1">View and manage all posts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Warnings</th>
                   <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <PostLine postInfo={post} />
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              {totalFoundPosts ?
              <div className="text-slate-600 text-sm font-medium">
                Showing page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{numberOfPages}</span>
              </div>
              :
              <div className="text-slate-600 text-sm mx-auto font-medium">
                No posts found
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

};

export default PostManagementDashboard;