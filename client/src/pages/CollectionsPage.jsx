import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CollectionCard } from '../components/collections/CollectionCard';
import { CreateCollectionModal } from '../components/collections/CreateCollectionModal';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { FolderHeart, Plus, Lock, Globe, ArrowLeft, Trash2, User, Layers, AlertCircle, Sparkles } from 'lucide-react';

export const CollectionsPage = ({ onReportResource, onAddToCollection }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // All collections list state
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    collection.ownerId._id === user._id || collection.ownerId === user._id
  );

  /* Render Single Collection View */
  if (id) {
    if (detailLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
          <div className="h-8 bg-[#090e1d] rounded w-32" />
          <div className="glass-panel rounded-3xl h-48 bg-[#090e1d]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="glass-card rounded-2xl h-80 bg-[#090e1d]" />
            ))}
          </div>
        </div>
      );
    }

    if (!collection) {
      return (
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 glass-panel rounded-3xl border border-slate-800 p-8 hud-bracket">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="font-display text-xl font-bold text-white">Vault Not Found</h2>
          <p className="text-xs text-slate-400">The vault collection you are looking for does not exist or is set to private access.</p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-glow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Vaults</span>
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
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vault Index</span>
          </button>
        </div>

        {/* Collection Details Header Banner */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hud-bracket">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
                collection.visibility === 'PRIVATE'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}>
                {collection.visibility === 'PRIVATE' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                <span>{collection.visibility} VAULT</span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                {collection.items ? collection.items.length : 0} ITEMS INDEXED
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white leading-tight">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-slate-400">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                ✦
              </span>
              <span>Curated Public Resource Vault</span>
            </div>
          </div>

          {/* Action Buttons for Owner */}
          {isOwner && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDeleteCollection}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete Vault'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Collection Items Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Indexed Vault Transmissions</span>
            </h2>
          </div>

          {!collection.items || collection.items.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-slate-800 space-y-3 hud-bracket">
              <FolderHeart className="w-12 h-12 text-cyan-400/50 mx-auto" />
              <h3 className="font-display text-base font-bold text-white">Vault is Empty</h3>
              <p className="text-xs text-slate-400">No resources have been added to this vault collection yet.</p>
              <Link
                to="/"
                className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-6 hud-bracket">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold">
            <FolderHeart className="w-4 h-4 text-cyan-400" />
            <span>CURATED RESOURCE VAULTS</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
            Public & Private <span className="text-gradient">Data Vaults</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Explore curated topic vaults created across the network or assemble your own custom discovery channels.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow hover:scale-105 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Data Vault</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-card rounded-2xl h-48 animate-pulse p-4" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-slate-800 hud-bracket">
          <FolderHeart className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
          <h3 className="font-display text-base font-bold text-white">No Data Vaults Detected</h3>
          <p className="text-xs text-slate-400 mt-1">Be the first to initialize a public resource vault!</p>
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
