import React, { useState, useEffect } from 'react';
import { getArticlesApi, searchArticlesApi } from '../api/knowledge';
import { BookOpen, Search, FileText } from 'lucide-react';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      if (query.trim()) {
        const res = await searchArticlesApi(query);
        if (res.data.success) setArticles(res.data.data);
      } else {
        const res = await getArticlesApi();
        if (res.data.success) setArticles(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [query]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 py-4">
        <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">University Knowledge Base & Self-Service</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Find instant solutions, step-by-step guides, password reset instructions, and FAQs.
        </p>

        {/* Search */}
        <div className="relative max-w-lg mx-auto pt-3">
          <Search className="w-4 h-4 absolute left-3.5 top-6 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles e.g. WiFi, password reset, Moodle..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 shadow-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((art) => (
          <div key={art._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2 hover:border-slate-700 transition-colors">
            <h3 className="font-bold text-white text-base flex items-start gap-2">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-1" /> {art.title}
            </h3>
            <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{art.body}</p>
            {art.tags?.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1">
                {art.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-950 text-indigo-400 rounded text-[10px] border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
