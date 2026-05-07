import { X,  Send} from 'lucide-react';
import UploadImage from '@/components/common/UploadImage.jsx';
import TextEditor from '@/components/common/TextEditor.jsx';
import {useAuth} from '@/routes/ProtectedRouter.jsx';
import { useState, useEffect } from 'react';
import JustValidate from 'just-validate';
import {toast} from "sonner";

export default function CreatePostModal({onClose, setData }) {
    const {user} = useAuth();
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect (() => {
        const validate = new JustValidate ("#createPostForm");
        validate.addField("#postContent", [
            {
                rule : "required",
                errorMessage : "Post content is required"
            },
            {
                rule : "minLength",
                value : 10,
                errorMessage : "Post content must be at least 10 characters"
            },
        ])
        .onSuccess (e => {
            e.preventDefault();
            setIsSubmitting (true);
        })
    }, []);



    const handleSubmit = (e) => {
        if (!isSubmitting) return;
        const formData = new FormData(e.target);
        if (images && images.length > 0){
            images.forEach (image => {
                formData.append ("images", image);
            });
        }

        formData.append("userId", user._id);
        console.log("Form Data Content:", formData.get("postContent"), images);
        console.log("Form Data images:", formData.getAll("images"));
        fetch (`${import.meta.env.VITE_API_URL}/api/post/create`, {
            method : "POST",
            credentials : "include",
            body : formData
        })
        .then (res => {
            if (!res.ok){
                throw new Error ("Failed to create post");
            }
            return res.json();
        })
        .then (data => {
            toast.success (data.message || "Post created successfully");
            setData (prev => [data.data, ...prev]);
            onClose ();
        })
        .catch (err => {
            toast.error (err.message || "Error creating post");
        })
        .finally (() =>{
            setIsSubmitting (false);
        });
        
    }

    const handleEditorChange = (content) => {
        document.getElementById("postContent").value = content;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600 scrollbar-hide">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-400/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Create New Post</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-white cursor-pointer" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <form className="space-y-6" onSubmit ={handleSubmit} id = "createPostForm">
                        {/* Post Content */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Post Content
                            </label>
                            <TextEditor onEditChange = {handleEditorChange}></TextEditor>
                            <input type = "hidden" id = "postContent" name = "postContent"></input>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Upload Images
                            </label>
                            <UploadImage images = {images} onImagesChange={setImages}></UploadImage>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 cursor-pointer bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled ={isSubmitting}
                                className={'flex-1 px-4 py-3 cursor-pointer bg-blue-400 text-white rounded-lg hover:bg-blue-300 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 ' + (isSubmitting ? 'opacity-50 cursor-not-allowed' : '')}
                            >
                                <Send className="w-4 h-4" />
                                <span>Post</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* open outside to close */}
            <div
                className="absolute inset-0 -z-1"
                onClick={onClose}
            />
        </div>
    );
}