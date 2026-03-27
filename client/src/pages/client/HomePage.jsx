
    import Posts from "@/pages/client/Posts/Posts.jsx";
    import ShortCutToMap from "@/components/common/ShortcutToMap.jsx";
    import DragonModel from "@/components/3DModel.jsx";


    import {useState, useEffect, useRef, useMemo} from "react";
    import useIntersectionObserver from "@/hooks/useIntersectionObserver";
    import Loading from "@/components/common/ClientLoading.jsx";

    export default function HomePage(){

        const [posts, setPosts] = useState([]);
        const [usedPostsIds, setUsedPostsIds] = useState(new Set());
        const isFetchingRef = useRef(false);
        const [loading, setLoading] = useState(false);
        const [hasMore, setHasMore] = useState(true);

        const newPostsObserver = useIntersectionObserver({ threshold: 0.1 });

        useEffect(() => {
            if (!newPostsObserver.isIntersecting || loading || !hasMore || isFetchingRef.current) return;
            setLoading(true);
            isFetchingRef.current = true;
            fetch(`${import.meta.env.VITE_API_URL}/api/post/home`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    exclude_ids: Array.from(usedPostsIds),
                    limit: 3    
                }),
            })  
            .then (res => res.json())
            .then (data => {
                if (data.status === "success"){
                    setPosts(prevPosts => [...prevPosts, ...data.data]);
                    setUsedPostsIds(prevIds => {
                        const newIds = new Set(prevIds);
                        data.data.forEach(post => newIds.add(post._id));
                        return newIds;
                    });
                    if (data.data.length === 0){
                        setHasMore(false);
                    }
                }
            })
            .finally(() => {
                // Delay to show loading spinner
                setTimeout(() => {
                    setLoading(false);
                    isFetchingRef.current = false;
                }, 3000);
                
            });
        }, [newPostsObserver.isIntersecting, loading, hasMore, usedPostsIds]);
        
        // Memoize posts to prevent unnecessary re-renders
        const memoizedPosts = useMemo(() => posts, [posts.length, posts.map(p => p._id).join(',')]);
        
        if (posts.length === 0 && !hasMore) return <Loading text = {"Pikachu..."}></Loading>;
        return(
            <div className="min-h-screen pt-20 px-4">
                <div className = "w-[60%] ml-[100px] items-start">
                    <Posts isOwnerProfile = {false} posts = {memoizedPosts}></Posts>
                    <div className = "py-10" ref = {newPostsObserver.ref} ></div>
                    {loading && hasMore && <Loading className = "static  bg-transparent" text = "Pikachu..."></Loading>}
                    {!hasMore && <div className="text-center text-white font-semibold py-4">No more posts to load.</div>}
                </div>
                <DragonModel></DragonModel>
                <ShortCutToMap></ShortCutToMap>
            </div>
        );
    }