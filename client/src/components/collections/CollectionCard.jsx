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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className="h-full"
    >
      <Link
        to={`/collections/${collection._id}`}
        className="bg-[#0d081e] rounded-3xl p-5 border border-purple-900/40 flex flex-col justify-between group hover:border-purple-600/60 hover:shadow-[0_0_25px_rgba(147,51,234,0.15)] transition-all h-full text-left hud-bracket"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                <FolderHeart className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-medium text-purple-200">
                Vault
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold uppercase flex items-center gap-1 border ${
                isPrivate
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-purple-950/40 text-purple-300 border-purple-800/60'
              }`}
            >
              {isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
              <span>{collection.visibility}</span>
            </span>
          </div>

          <h3 className="font-display font-semibold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            {collection.name}
          </h3>

          {collection.description && (
            <p className="text-xs text-purple-200/70 line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>

        <div className="pt-3.5 mt-4 border-t border-purple-900/30 flex items-center justify-between text-xs font-mono text-purple-400/70">
          <span className="flex items-center gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{itemCount} {itemCount === 1 ? 'Resource' : 'Resources'}</span>
          </span>
          <span className="text-xs font-medium text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform group-hover:text-white">
            <span>Inspect</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
