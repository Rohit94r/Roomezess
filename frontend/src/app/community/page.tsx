'use client';

import { useState, useEffect } from 'react';
import { communityAPI, authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  postType: 'discussion' | 'lost' | 'sell';
  author: {
    name: string;
    email: string;
  };
  likes: string[];
  comments: {
    user: {
      name: string;
    };
    text: string;
    createdAt: string;
  }[];
  college: string;
  createdAt: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    postType: 'discussion',
  });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<'all' | 'discussion' | 'lost' | 'sell'>('all');

  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    collegeIdNumber: '',
    verificationNumber: '',
  });
  const [verificationError, setVerificationError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await authAPI.getProfile();
      // Check if user is verified
      if (response.data && response.data.user && response.data.user.isVerified) {
        setIsVerified(true);
        setSkills(response.data.user.skills || []);
        fetchPosts();
      } else {
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      // If auth fails (e.g., unauthorized), redirect to login or handle appropriately
      // For now, we assume user might be logged in but not verified
      // If mock mode is desired without backend, we might need a fallback here
    } finally {
      setCheckingVerification(false);
      setLoading(false); // Stop main loading spinner
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setSubmitLoading(true);

    if (!verificationForm.name || !verificationForm.collegeIdNumber || !verificationForm.verificationNumber) {
      setVerificationError('All fields are required');
      setSubmitLoading(false);
      return;
    }

    try {
      // Update user profile with verification details
      // We are also setting isVerified to true immediately for this flow as per requirements
      await authAPI.updateProfile({
        name: verificationForm.name,
        collegeIdNumber: verificationForm.collegeIdNumber,
        verificationNumber: verificationForm.verificationNumber,
        isVerified: true // Auto-verify for now as per "put verification number and name" request implications
      });

      setIsVerified(true);
      fetchPosts(); // Load posts now that we are verified
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      setVerificationError(error.response?.data?.message || 'Failed to submit verification details');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSkillsSave = async () => {
    try {
      const parsed = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      await authAPI.updateProfile({
        name: verificationForm.name,
        isVerified: true,
        skills: parsed
      });
      setSkills(parsed);
      setSkillsInput('');
    } catch (error: any) {
      console.error('Error updating skills:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      // Use the actual API call
      const response = await communityAPI.getPosts();
      // Transform the Supabase data to match the expected format
      const transformedPosts = response.data.data.map((post: any) => ({
        _id: post.id,
        title: post.content.substring(0, 30) + '...', // Use content as title for now
        content: post.content,
        postType: post.type,
        author: {
          name: post.profiles?.name || 'Unknown',
          email: 'dummy@example.com',
        },
        likes: [], // Supabase doesn't have likes in the schema
        comments: [], // Comments would be loaded separately
        college: 'Atharva College of Engineering',
        createdAt: post.created_at,
      }));
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use the actual API call
      await communityAPI.createPost({
        type: newPost.postType,
        content: newPost.content
      });

      // Reset the form
      setNewPost({
        title: '',
        content: '',
        postType: 'discussion',
      });
      setShowCreatePost(false);
      // Refresh posts after creating
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // In a real app, we would use the API call
      // await communityAPI.likePost(postId);
      // For demo purposes, we'll just update the local state
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, likes: [...post.likes, 'current_user'] }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    try {
      // In a real app, we would use the API call
      // await communityAPI.addComment(postId, { text: commentText });
      // For demo purposes, we'll just update the local state
      const newComment = {
        user: { name: 'Current User' },
        text: commentText,
        createdAt: new Date().toISOString(),
      };

      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ));

      // Clear the comment input
      setNewComments({ ...newComments, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (checkingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Checking verification status...</div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Community Access
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please verify your identity to join the college community.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="ver-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="ver-name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                  value={verificationForm.name}
                  onChange={(e) => setVerificationForm({ ...verificationForm, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="college-id" className="block text-sm font-medium text-gray-700 mb-1">
                  College ID Card Number
                </label>
                <input
                  id="college-id"
                  name="collegeId"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="e.g. ACE-2023-001"
                  value={verificationForm.collegeIdNumber}
                  onChange={(e) => setVerificationForm({ ...verificationForm, collegeIdNumber: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="ver-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Number
                </label>
                <input
                  id="ver-number"
                  name="verNumber"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter verification code"
                  value={verificationForm.verificationNumber}
                  onChange={(e) => setVerificationForm({ ...verificationForm, verificationNumber: e.target.value })}
                />
              </div>
            </div>

            {verificationError && (
              <div className="text-red-500 text-sm text-center">
                {verificationError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={submitLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${submitLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
              >
                {submitLoading ? 'Verifying...' : 'Verify & Join Community'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading community posts...</div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">👥</span> Campus Community
          </h1>
          <button
            onClick={() => setShowCreatePost(true)}
            className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center"
          >
            <span className="mr-2">+</span> Create Post
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-8">
          <div className="mb-2 text-sm font-semibold text-gray-800">Your Skills</div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((sk, idx) => (
                <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs border border-primary-200">{sk}</span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-3">Add skills to showcase in the community.</div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, Figma, Python"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={handleSkillsSave}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
              </div>
              <form onSubmit={handleSubmitPost} className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="postType" className="block text-sm font-medium text-gray-700 mb-1">
                    Post Type
                  </label>
                  <select
                    id="postType"
                    value={newPost.postType}
                    onChange={(e) => setNewPost({ ...newPost, postType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="discussion">Discussion</option>
                    <option value="lost">Lost & Found</option>
                    <option value="sell">Buy & Sell</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={4}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-md text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          <button onClick={() => setFilter('discussion')} className={`px-3 py-1.5 rounded-md text-sm ${filter === 'discussion' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Discussions</button>
          <button onClick={() => setFilter('lost')} className={`px-3 py-1.5 rounded-md text-sm ${filter === 'lost' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Lost & Found</button>
          <button onClick={() => setFilter('sell')} className={`px-3 py-1.5 rounded-md text-sm ${filter === 'sell' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Buy & Sell</button>
        </div>
        {/* Posts List */}
        <div className="space-y-6">
          {posts.filter(p => filter === 'all' ? true : p.postType === filter).map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${post.postType === 'discussion'
                      ? 'bg-blue-100 text-blue-800'
                      : post.postType === 'lost'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {post.postType === 'sell' ? 'Buy & Sell' : post.postType === 'lost' ? 'Lost & Found' : 'Discussion'}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900">{post.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700">{post.content}</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900">{post.author.name}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center text-gray-500 hover:text-red-500"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-primary-500">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                      <span>{post.comments.length}</span>
                    </button>
                  </div>
                </div>

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {post.comments.map((comment: any, index: number) => (
                      <div key={index} className="flex mt-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-700 text-sm font-medium">
                              {comment.user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{comment.user.name}</p>
                          <p className="mt-1 text-sm text-gray-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">U</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComments[post._id] || ''}
                      onChange={(e) => setNewComments({ ...newComments, [post._id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post._id);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-sm font-medium"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
