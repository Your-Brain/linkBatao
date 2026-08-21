import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CollectionCard } from '../components/collections/CollectionCard';
import { EditCollectionModal } from '../components/collections/EditCollectionModal';
import { CreateCollectionModal } from '../components/collections/CreateCollectionModal';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { FolderHeart, Plus, Lock, Globe, ArrowLeft, Trash2, Edit3, User, Layers, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { ResourceCardSkeleton } from '../components/common/Skeleton';

export const CollectionsPage = ({ onReportResource, onAddToCollection }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

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
      const res = await API.get('/collections');
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
      const res = await API.get(`/collections/${colId}`);
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
  }, [id]);

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
          <div className="h-6 bg-zinc-800 rounded w-28 animate-pulse" />
          <div className="bg-zinc-900 rounded-3xl h-44 border border-zinc-800 animate-pulse" />
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
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-semibold text-white">Vault Not Found</h2>
          <p className="text-xs text-zinc-400">This collection does not exist or has been made private.</p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vaults</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">

        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Vaults</span>
          </button>
        </div>

        {/* Collection Details Header Banner */}
        <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                collection.visibility === 'PRIVATE'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                  : 'bg-indigo-950/40 text-indigo-300 border-indigo-800'
              }`}>
                {collection.visibility === 'PRIVATE' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{collection.visibility} Collection</span>
              </span>

              {isAdmin && !isOwner && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-950 text-purple-300 border border-purple-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}

              <span className="text-xs text-zinc-400">
                {collection.items ? collection.items.length : 0} items saved
              </span>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl text-white leading-tight">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Vault</span>
              </button>

              <button
                onClick={handleDeleteCollection}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
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
            <h2 className="font-semibold text-base text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Saved Resources in Vault</span>
            </h2>
          </div>

          {!collection.items || collection.items.length === 0 ? (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-zinc-800 space-y-3">
              <FolderHeart className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-semibold text-zinc-100">Vault is Empty</h3>
              <p className="text-xs text-zinc-400">No resources have been added to this vault collection yet.</p>
              <Link
                to="/"
                className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
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
      <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/15 text-indigo-300 text-xs font-medium border border-indigo-500/30">
            <FolderHeart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curated Collections</span>
          </div>
          <h1 className="font-bold text-2xl sm:text-3xl text-white">
            Resource Vaults
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Explore curated topic vaults created across the community or assemble your own custom collections.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-colors shrink-0 cursor-pointer"
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
            <div key={idx} className="bg-zinc-900 rounded-2xl h-44 animate-pulse border border-zinc-800 p-4" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-zinc-800 space-y-2 shadow-sm">
          <FolderHeart className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white">No Vaults Found</h3>
          <p className="text-xs text-zinc-400">Be the first to create a public resource vault!</p>
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

