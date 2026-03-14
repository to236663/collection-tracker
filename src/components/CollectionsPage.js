import { useState, useEffect } from 'react';
import styles from './CollectionsPage.module.css';

const STORAGE_KEY = 'collectorsNotebook_collections';

function CollectionsPage({ onSelectCollection }) {
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({ name: '', tag: '', description: '' });
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCollections(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  const saveToStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const openAddModal = () => {
    setEditingCollection(null);
    setFormData({ name: '', tag: '', description: '' });
    setNameError(false);
    setShowModal(true);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setFormData({ name: collection.name, tag: collection.tag || '', description: collection.description || '' });
    setNameError(false);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setNameError(true);
      return;
    }

    let updated;
    if (editingCollection) {
      updated = collections.map((c) =>
        c.id === editingCollection.id
          ? { ...c, name: formData.name.trim(), tag: formData.tag.trim(), description: formData.description.trim(), dateUpdated: new Date().toISOString() }
          : c
      );
    } else {
      const newCollection = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        tag: formData.tag.trim(),
        description: formData.description.trim(),
        dateCreated: new Date().toISOString(),
        dateUpdated: null,
        pinnedAt: null,
      };
      updated = [...collections, newCollection];
    }

    setCollections(updated);
    saveToStorage(updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = collections.filter((c) => c.id !== id);
    setCollections(updated);
    saveToStorage(updated);
    setOpenMenuId(null);
  };

  const handlePin = (id) => {
    const collection = collections.find((c) => c.id === id);
    const pinnedCount = collections.filter((c) => c.pinnedAt).length;

    let updated;
    if (collection.pinnedAt) {
      updated = collections.map((c) => c.id === id ? { ...c, pinnedAt: null } : c);
    } else if (pinnedCount >= 3) {
      setOpenMenuId(null);
      return;
    } else {
      updated = collections.map((c) => c.id === id ? { ...c, pinnedAt: new Date().toISOString() } : c);
    }

    setCollections(updated);
    saveToStorage(updated);
    setOpenMenuId(null);
  };

  const formatDate = (collection) => {
    const dateStr = collection.dateUpdated || collection.dateCreated;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDateLabel = (collection) => {
    return collection.dateUpdated ? 'Updated' : 'Created';
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Collector's Notebook</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          Add New Collection
        </button>
      </header>

      <main className={styles.main}>
        {collections.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyMessage}>Add a collection to get started!</p>
            <button className={styles.addButton} onClick={openAddModal}>
              Add New Collection
            </button>
          </div>
        ) : (() => {
          const pinnedCount = collections.filter((c) => c.pinnedAt).length;
          const pinned = [...collections]
            .filter((c) => c.pinnedAt)
            .sort((a, b) => new Date(a.pinnedAt) - new Date(b.pinnedAt));
          const unpinned = [...collections]
            .filter((c) => !c.pinnedAt)
            .sort((a, b) => new Date(b.dateUpdated || b.dateCreated) - new Date(a.dateUpdated || a.dateCreated));
          const sorted = [...pinned, ...unpinned];

          const renderCard = (collection) => (
            <div
              key={collection.id}
              className={[
                styles.card,
                collection.pinnedAt ? styles.pinnedCard : '',
                openMenuId === collection.id ? styles.cardMenuOpen : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectCollection?.(collection)}
            >
              <div className={styles.cardContent}>
                <h2 className={styles.cardName}>
                  {collection.pinnedAt && <span className={styles.pinIcon}>📌</span>}
                  {collection.name}
                </h2>
                <p className={styles.cardDate}>
                  {getDateLabel(collection)}: {formatDate(collection)}
                </p>
              </div>
              <button
                className={styles.menuButton}
                title="Options"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === collection.id ? null : collection.id);
                }}
              >
                ⋮
              </button>
              {openMenuId === collection.id && (
                <div className={styles.dropdown}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(collection);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className={[
                      styles.pinOption,
                      !collection.pinnedAt && pinnedCount >= 3 ? styles.pinOptionDisabled : '',
                    ].filter(Boolean).join(' ')}
                    disabled={!collection.pinnedAt && pinnedCount >= 3}
                    title={!collection.pinnedAt && pinnedCount >= 3 ? 'Maximum of 3 pinned collections reached' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin(collection.id);
                    }}
                  >
                    {collection.pinnedAt ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    className={styles.deleteOption}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );

          return (
            <div className={styles.grid}>
              {sorted.map(renderCard)}
            </div>
          );
        })()}
      </main>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingCollection ? 'Edit Collection' : 'New Collection'}
            </h2>
            <div className={styles.field}>
              <input
                type="text"
                placeholder="Collection name *"
                value={formData.name}
                className={nameError ? styles.inputError : ''}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (e.target.value.trim()) setNameError(false);
                }}
              />
              {nameError && <span className={styles.errorMsg}>Name is required.</span>}
            </div>
            <input
              type="text"
              placeholder="Tag (optional)"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionsPage;
