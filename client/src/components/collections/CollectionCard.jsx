import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderHeart, Lock, Globe, Layers, ArrowUpRight } from 'lucide-react';

export const CollectionCard = ({ collection }) => {
  if (!collection) return null;

  const itemCount = collection.items ? collection.items.length : 0;
  const isPrivate = collection.visibility === 'PRIVATE';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="h-full"
    >
      <Link
        to={`/collections/${collection._id}`}
        className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between group hover:border-zinc-700 transition-all h-full text-left shadow-sm"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <FolderHeart className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-300">
                Collection
              </span>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase flex items-center gap-1 border ${
                isPrivate
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                  : 'bg-indigo-950/40 text-indigo-300 border-indigo-800'
              }`}
            >
              {isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
              <span>{collection.visibility}</span>
            </span>
          </div>

          <h3 className="font-semibold text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {collection.name}
          </h3>

          {collection.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>

        <div className="pt-3.5 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{itemCount} {itemCount === 1 ? 'Resource' : 'Resources'}</span>
          </span>
          <span className="text-xs font-medium text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>View</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

