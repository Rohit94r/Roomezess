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

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  endorsements: number;
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

  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    collegeEmail: '',
  });
  const [verificationError, setVerificationError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsInput, setSkillsInput] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    checkVerificationStatus();
    fetchPosts();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data && response.data.user && response.data.user.isVerified) {
        setIsVerified(true);
        const raw = response.data.user.skills || [];
        const parsed: Skill[] = (raw as any[]).map((s: any) => {
          if (typeof s === 'string') {
            const [name, level] = s.split('|');
            return {
              name: (name || '').trim(),
              level: ((level || 'Intermediate').trim() as 'Beginner' | 'Intermediate' | 'Advanced'),
              endorsements: 0,
            };
          }
          if (s && typeof s === 'object' && s.name) {
            return {
              name: s.name,
              level: (s.level || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
              endorsements: s.endorsements || 0,
            };
          }
          return { name: String(s), level: 'Intermediate', endorsements: 0 };
        });
        setSkills(parsed);
      } else {
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setSubmitLoading(true);

    if (!verificationForm.name || !verificationForm.collegeEmail) {
      setVerificationError('All fields are required');
      setSubmitLoading(false);
      return;
    }

    const domain = '@atharvacoe.ac.in';
    if (!verificationForm.collegeEmail.includes('@') || !verificationForm.collegeEmail.toLowerCase().endsWith(domain)) {
      setVerificationError(`Email must end with ${domain}`);
      setSubmitLoading(false);
      return;
    }

    try {
      try {
        await authAPI.getProfile();
      } catch (_) {
        setVerificationError('Please log in to verify');
        setSubmitLoading(false);
        return;
      }
      await authAPI.updateProfile({
        name: verificationForm.name,
        collegeEmail: verificationForm.collegeEmail,
        isVerified: true
      });

      setIsVerified(true);
      fetchPosts();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      setVerificationError(error.response?.data?.message || 'Failed to submit verification details');
    } finally {
      setSubmitLoading(false);
    }
  };

  const serializeSkills = (arr: Skill[]) => arr.map(s => `${s.name}|${s.level}`);

  const handleAddSkill = async () => {
    if (!skillsInput.trim()) return;
    const next: Skill[] = [...skills, { name: skillsInput.trim(), level: selectedLevel, endorsements: 0 }];
    try {
      await authAPI.updateProfile({
        name: verificationForm.name,
        isVerified: true,
        skills: serializeSkills(next)
      });
      setSkills(next);
      setSkillsInput('');
      setSelectedLevel('Intermediate');
    } catch (error: any) {
      console.error('Error updating skills:', error);
    }
  };

  const handleEndorse = (name: string) => {
    if (!isVerified) return;
    const next = skills.map(s => (s.name === name ? { ...s, endorsements: s.endorsements + 1 } : s));
    setSkills(next);
  };

  const handleRemoveSkill = async (name: string) => {
    const next = skills.filter(s => s.name !== name);
    try {
      await authAPI.updateProfile({
        name: verificationForm.name,
        isVerified: true,
        skills: serializeSkills(next)
      });
      setSkills(next);
      if (selectedSkill === name) setSelectedSkill(null);
    } catch (error: any) {
      console.error('Error removing skill:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await communityAPI.getPosts();
      const transformedPosts = response.data.data.map((post: any) => ({
        _id: post.id,
        title: post.content.substring(0, 30) + '...',
        content: post.content,
        postType: post.type,
        author: {
          name: post.profiles?.name || 'Unknown',
          email: 'dummy@example.com',
        },
        likes: [],
        comments: [],
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
      await communityAPI.createPost({
        type: newPost.postType,
        content: newPost.content
      });

      setNewPost({
        title: '',
        content: '',
        postType: 'discussion',
      });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(posts.map(post =>
      post._id === postId
        ? { ...post, likes: [...post.likes, 'current_user'] }
        : post
    ));
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

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

    setNewComments({ ...newComments, [postId]: '' });
  };

  const filteredPosts = posts.filter((p: any) => {
    const typeOk = filter === 'all' ? true : p.postType === filter;
    const skillOk = selectedSkill ? (p.content?.toLowerCase().includes(selectedSkill.toLowerCase())) : true;
    return typeOk && skillOk;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Campus Community
            </h1>
            <p className="mt-2 text-gray-600">
              Connect with students, discuss topics, find lost items, and buy/sell essentials.
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <a href="/community/discussions" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">
                Discussions
              </a>
              <a href="/community/lost-and-found" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">
                Lost & Found
              </a>
              <a href="/community/buy-sell" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">
                Buy & Sell
              </a>
              <a href="/community/project-friday" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">
                Project Friday
              </a>
            </div>
          </div>

          {checkingVerification && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          )}

          {!checkingVerification && !isVerified && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:p-5 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-yellow-800 font-semibold">Verification Recommended</h2>
                  <p className="text-yellow-700 text-sm">
                    You can browse community posts. Verify to create posts and manage skills.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  I’ll verify now
                </button>
              </div>
            </div>
          )}

          {!checkingVerification && !isVerified && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Verification</h3>
              <form onSubmit={handleVerificationSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={verificationForm.name}
                  onChange={(e) => setVerificationForm({ ...verificationForm, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="College Email (name@atharvacoe.ac.in)"
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={verificationForm.collegeEmail}
                  onChange={(e) => setVerificationForm({ ...verificationForm, collegeEmail: e.target.value })}
                />
                <div className="sm:col-span-3 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {submitLoading ? 'Verifying...' : 'Verify & Unlock Features'}
                  </button>
                  {verificationError && <span className="text-red-600 text-sm">{verificationError}</span>}
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  {(['all', 'discussion', 'lost', 'sell'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        filter === tab ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab === 'discussion' ? 'Discussions' : tab === 'lost' ? 'Lost & Found' : 'Buy & Sell'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCreatePost(true)}
                  disabled={!isVerified}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition ${
                    isVerified
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Create Post
                </button>
              </div>

              {showCreatePost && isVerified && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">New Post</h3>
                  <form onSubmit={handleSubmitPost} className="space-y-3">
                    <div className="flex gap-3">
                      <select
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={newPost.postType}
                        onChange={(e) => setNewPost({ ...newPost, postType: e.target.value as any })}
                      >
                        <option value="discussion">Discussion</option>
                        <option value="lost">Lost & Found</option>
                        <option value="sell">Buy & Sell</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Title"
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      />
                    </div>
                    <textarea
                      placeholder="Write your post..."
                      className="w-full border rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-24 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center text-gray-600">
                    No posts yet. Be the first to start a discussion!
                  </div>
                ) : (
                  filteredPosts.map((post: any) => (
                    <div key={post._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                            {post.postType === 'discussion' ? 'Discussion' : post.postType === 'lost' ? 'Lost & Found' : 'Buy & Sell'}
                          </span>
                          <h3 className="mt-2 text-lg font-semibold text-gray-900">{post.title}</h3>
                          <p className="mt-1 text-gray-700">{post.content}</p>
                          <div className="mt-3 text-sm text-gray-500">
                            <span>{post.author?.name || 'Unknown'}</span> · <span>{new Date(post.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <button
                          onClick={() => isVerified && handleLike(post._id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            isVerified ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          ❤️ {post.likes.length}
                        </button>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Comments</h4>
                        <div className="space-y-2">
                          {post.comments.map((c: any, idx: number) => (
                            <div key={idx} className="rounded-lg bg-gray-50 px-3 py-2">
                              <div className="text-sm text-gray-800">{c.text}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {c.user?.name || 'User'} · {new Date(c.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={isVerified ? 'Add a comment...' : 'Verify to comment'}
                            disabled={!isVerified}
                            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                            value={newComments[post._id] || ''}
                            onChange={(e) => setNewComments({ ...newComments, [post._id]: e.target.value })}
                          />
                          <button
                            onClick={() => isVerified && handleAddComment(post._id)}
                            disabled={!isVerified}
                            className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-300 disabled:text-gray-600"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Skills & Endorsements</h3>
                <p className="text-sm text-gray-600 mt-1">Showcase your strengths across colleges.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    disabled={!isVerified}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                  />
                  <select
                    disabled={!isVerified}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    onClick={handleAddSkill}
                    disabled={!isVerified || !skillsInput.trim()}
                    className="sm:col-span-2 w-full px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-300 disabled:text-gray-600"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {skills.length === 0 ? (
                    <div className="text-sm text-gray-500">No skills yet</div>
                  ) : (
                    skills.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">{s.name}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                              s.level === 'Advanced' ? 'bg-green-100 text-green-700' : s.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {s.level}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">Endorsements: {s.endorsements}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEndorse(s.name)}
                            disabled={!isVerified}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              isVerified ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Endorse
                          </button>
                          <button
                            onClick={() => handleRemoveSkill(s.name)}
                            disabled={!isVerified}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              isVerified ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {skills.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Browse by skill</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <button
                          key={s.name}
                          onClick={() => setSelectedSkill(selectedSkill === s.name ? null : s.name)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            selectedSkill === s.name ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                      {selectedSkill && (
                        <button
                          onClick={() => setSelectedSkill(null)}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Filtering posts by selected skill.</p>
                  </div>
                )}
                {!isVerified && (
                  <p className="mt-2 text-xs text-gray-500">
                    Verify to edit skills and participate actively.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
