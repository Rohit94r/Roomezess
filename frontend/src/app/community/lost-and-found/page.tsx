'use client';

import { useEffect, useState } from 'react';
import { communityAPI, authAPI } from '@/lib/api';

export default function LostFoundPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [verificationForm, setVerificationForm] = useState({ name: '', collegeEmail: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const prof = await authAPI.getProfile();
        const user = prof?.data?.user;
        const verified = Boolean(user?.isVerified);
        setIsVerified(verified);
        setVerificationForm({ name: user?.name || '', collegeEmail: '' });
        if (verified) {
          await fetchPosts();
        }
      } catch (_) {
        setIsVerified(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await communityAPI.getPosts();
      const data = res.data.data || [];
      const transformed = data.map((post: any) => ({
        id: post.id,
        title: (post.content || '').slice(0, 40) + (post.content?.length > 40 ? '…' : ''),
        content: post.content,
        type: post.type,
        author: post.profiles?.name || 'Unknown',
        created_at: post.created_at
      })).filter((p: any) => p.type === 'lost');
      setPosts(transformed);
    } catch (e) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
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
      await fetchPosts();
    } catch (err: any) {
      setVerificationError(err?.data?.message || err?.message || 'Verification failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await communityAPI.createPost({ type: 'lost', content });
      setContent('');
      setShowCreatePost(false);
      await fetchPosts();
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Lost & Found</h1>
            <p className="mt-2 text-gray-600">Report lost items or help return found items.</p>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <a href="/community/discussions" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">Discussions</a>
              <a href="/community/lost-and-found" className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white">Lost & Found</a>
              <a href="/community/buy-sell" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">Buy & Sell</a>
              <a href="/community/project-friday" className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100">Project Friday</a>
            </div>
          </div>

          {checking && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          )}

          {!checking && !isVerified && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Verification Required</h3>
              <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="sm:col-span-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {submitLoading ? 'Verifying...' : 'Verify & Access'}
                </button>
                {verificationError && <span className="sm:col-span-3 text-red-600 text-sm">{verificationError}</span>}
              </form>
            </div>
          )}

          {!checking && isVerified && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
                <button
                  onClick={() => setShowCreatePost(!showCreatePost)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text:white text-white"
                >
                  {showCreatePost ? 'Close' : 'New Lost & Found'}
                </button>
              </div>
              {showCreatePost && (
                <form onSubmit={handlePost} className="mt-3 space-y-3">
                  <textarea
                    placeholder="Describe the lost/found item..."
                    className="w-full border rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white">
                      Post
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!checking && isVerified && (
            <>
              {loading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center text-gray-600">No lost & found posts yet.</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((p) => (
                    <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <span className="inline-flex items:center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Lost & Found</span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">{p.title}</h3>
                      <p className="mt-1 text-gray-700">{p.content}</p>
                      <div className="mt-3 text-sm text-gray-500">{p.author} · {new Date(p.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
