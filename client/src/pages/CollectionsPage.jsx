import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useIncognito } from '../context/IncognitoContext';
import { CollectionCard } from '../components/collections/CollectionCard';
import { EditCollectionModal } from '../components/collections/EditCollectionModal';
import { CreateCollectionModal } from '../components/collections/CreateCollectionModal';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { FolderHeart, Plus, Lock, Globe, ArrowLeft, Trash2, Edit3, User, Layers, AlertCircle, Sparkles, ShieldCheck, Ghost, Shield } from 'lucide-react';
import { ResourceCardSkeleton } from '../components/common/Skeleton';

export const CollectionsPage = ({ onReportResource, onAddToCollection }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isIncognito, enableIncognito, isAdultCollection } = useIncognito();

  // All collections list state
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Single collection detail state
  const [collection, setCollection] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch all collections
  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await API.get('/collections', {
        params: { includeNsfw: isIncognito }
      });
      if (res.data.success) {
        setCollections(res.data.data);
      }
    } catch (err) {
      console.error('[CollectionsPage] Failed to fetch collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single collection details
  const fetchCollectionDetail = async (colId) => {
    setDetailLoading(true);
    try {
      const res = await API.get(`/collections/${colId}`, {
        params: { includeNsfw: isIncognito }
      });
      if (res.data.success) {
        setCollection(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load collection details', 'error');
      setCollection(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCollectionDetail(id);
    } else {
      fetchCollections();
      setCollection(null);
    }
  }, [id, isIncognito]);

  // Handle delete collection
  const handleDeleteCollection = async () => {
    if (!collection) return;
    if (!window.confirm(`Are you sure you want to delete "${collection.name}"?`)) return;

    setDeleting(true);
    try {
      const res = await API.delete(`/collections/${collection._id}`);
      if (res.data.success) {
        showToast('Collection deleted successfully', 'success');
        navigate('/collections');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete collection', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && collection && collection.ownerId && (
    (collection.ownerId._id && collection.ownerId._id === user._id) ||
    collection.ownerId === user._id ||
    collection.ownerId === user.id
  );
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const canManage = isOwner || isAdmin;

  /* Render Single Collection View */
  if (id) {
    if (detailLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="h-6 bg-[#0d081e] rounded-xl w-28 animate-pulse" />
          <div className="bg-[#0d081e] rounded-3xl h-44 border border-purple-900/30 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ResourceCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      );
    }

    if (!collection) {
      return (
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 bg-[#0d081e] rounded-3xl border border-purple-900/40 p-8 shadow-xl hud-bracket">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-display font-semibold text-white">Vault Not Found</h2>
          <p className="text-xs font-mono text-purple-300/70">This collection does not exist or has been made private.</p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-medium text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vaults</span>
          </Link>
        </div>
      );
    }

    const isAdultVault = isAdultCollection(collection);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">

        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center gap-2 text-xs font-mono text-purple-300/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Vaults</span>
          </button>
        </div>

        {/* 18+ Adult Vault Notice Banner */}
        {isAdultVault && (
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
            isIncognito ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-purple-950/20 border-purple-800/40 text-purple-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <Ghost className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200">
                  18+ Adult Resource Vault
                </p>
                <p className="text-[11px] text-purple-300/70 font-mono">
                  {isIncognito
                    ? 'Stealth mode active: 18+ adult resources in this vault are unshielded'
                    : 'This vault contains 18+ adult resources. Safe Browsing mode is currently active.'}
                </p>
              </div>
            </div>
            {!isIncognito && (
              <button
                onClick={enableIncognito}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Ghost className="w-3.5 h-3.5" />
                <span>Turn On Incognito</span>
              </button>
            )}
          </div>
        )}

        {/* Collection Details Header Banner */}
        <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-8 border border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl hud-bracket">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${
                collection.visibility === 'PRIVATE'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-purple-950/40 text-purple-300 border-purple-800/60'
              }`}>
                {collection.visibility === 'PRIVATE' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{collection.visibility} Vault</span>
              </span>

              {isAdultVault && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-purple-950/90 text-purple-200 border border-purple-500/50 uppercase tracking-wider shadow-sm">
                  18+ Vault
                </span>
              )}

              {isAdmin && !isOwner && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}

              <span className="text-xs font-mono text-purple-400/70">
                {collection.items ? collection.items.length : 0} items saved
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1 text-xs font-mono text-purple-400/60">
              <span>
                {collection.ownerId ? `Curated by @${collection.ownerId.username || 'user'}` : 'Public Vault'}
              </span>
            </div>
          </div>

          {/* Action Buttons for Owner or Admin */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#140d2e] hover:bg-[#1a1138] border border-purple-900/40 text-purple-200 text-xs font-mono font-medium transition-all cursor-pointer hover:border-purple-500"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Vault</span>
              </button>

              <button
                onClick={handleDeleteCollection}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Collection Modal */}
        <EditCollectionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          collection={collection}
          onCollectionUpdated={(updated) => setCollection(updated)}
        />

        {/* Collection Items Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-purple-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Saved Resources in Vault</span>
            </h2>
          </div>

          {!collection.items || collection.items.length === 0 ? (
            <div className="bg-[#0d081e] rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-purple-900/40 space-y-3 hud-bracket">
              <FolderHeart className="w-10 h-10 text-purple-400/40 mx-auto" />
              <h3 className="text-base font-display font-semibold text-white">Vault is Empty</h3>
              <p className="text-xs font-mono text-purple-300/70">No resources have been added to this vault collection yet.</p>
              <Link
                to="/"
                className="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-medium text-xs transition-colors shadow-sm"
              >
                Browse Resources to Add
              </Link>
            </div>
          ) : (
            <ResourceGrid
              resources={collection.items}
              onReport={onReportResource}
              onAddToCollection={onAddToCollection}
            />
          )}
        </div>

      </div>
    );
  }

  /* Render All Collections View */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">

      {/* Header Banner */}
      <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-8 border border-purple-900/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl hud-bracket">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/15 text-purple-300 text-xs font-mono border border-purple-500/30">
            <FolderHeart className="w-3.5 h-3.5 text-purple-400" />
            <span>Curated Collections</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Resource Vaults
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/70 max-w-xl font-mono">
            Explore curated topic vaults created across the network or assemble your own custom collections.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Vault</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-[#0d081e] rounded-3xl h-44 animate-pulse border border-purple-900/30 p-4" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-[#0d081e] rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-purple-900/40 space-y-2 shadow-xl hud-bracket">
          <FolderHeart className="w-10 h-10 text-purple-400/40 mx-auto mb-2" />
          <h3 className="text-base font-display font-semibold text-white">No Vaults Found</h3>
          <p className="text-xs font-mono text-purple-300/70">Be the first to create a public resource vault!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map(col => (
            <CollectionCard key={col._id} collection={col} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCollectionCreated={() => fetchCollections()}
      />

    </div>
  );
};
