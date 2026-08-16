import React from 'react';
import { Link } from 'react-router-dom';
import { FolderHeart, Lock, Globe, Layers } from 'lucide-react';

export const CollectionCard = ({ collection }) => {
  if (!collection) return null;

  const itemCount = collection.items ? collection.items.length : 0;
  const isPrivate = collection.visibility === 'PRIVATE';

  return (
    <Link
      to={`/collections/${collection._id}`}
      className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition-all h-full"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300">
              Curated List
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
            isPrivate ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
          }`}>
            {isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
            <span>{collection.visibility}</span>
          </span>
        </div>

        <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
          {collection.name}
        </h3>

        {collection.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px] font-mono">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{itemCount} {itemCount === 1 ? 'Resource' : 'Resources'}</span>
        </span>
        <span className="text-[11px] text-cyan-400 group-hover:underline">View Collection →</span>
      </div>
    </Link>
  );
};
