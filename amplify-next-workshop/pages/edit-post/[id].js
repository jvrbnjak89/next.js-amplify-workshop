import { useState, useEffect } from 'react'
import SimpleMDE from 'react-simplemde-editor'
import { API } from 'aws-amplify'
import { useRouter } from 'next/router'
import { getPost } from '../../graphql/queries'
import { updatePost } from '../../graphql/mutations'

import "easymde/dist/easymde.min.css"

function EditPost() {
    const [post, setPost] = useState(null)
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        fetchPost();
        
        async function fetchPost() {
            if (!id) return;

            const postData = await API.graphql({
                query: getPost,
                variables: {
                    id,
                }
            })
            
            setPost(postData.data.getPost)
        }
    }, [id])

    function onChange(e) {
        setPost(() => ({ ...post, [e.target.name]: e.target.value }));
    }

    async function updateCurrentPost() {
        const { title, content } = post;

        if (!title || !content) return;

        await API.graphql({
            query: updatePost,
            variables: {
                input: {
                    id,
                    title,
                    content,
                }
            },
            authMode: "AMAZON_COGNITO_USER_POOLS",
        })

        console.log("post successfully updated!")

        router.push("/my-posts")
    }

    if (!post) return null;

    const { title, content } = post;

    return (
        <div>
            <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">Edit post</h1>
            <input 
                className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
                name="title" 
                placeholder="Title" 
                value={title}
                onChange={onChange}
            />
            <SimpleMDE value={content} onChange={(value) => setPost({ ...post, content: value })} />
            <button 
                className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
                onClick={updateCurrentPost}
            >
                Update Post
            </button>
        </div>
    )
}

export default EditPost;