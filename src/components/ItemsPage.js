import { useState, useEffect, useRef } from 'react';
import styles from './ItemsPage.module.css';

function ItemsPage({ collection, user, onBack, onCollectionUpdated }) {
  const storageKey = `collectorsNotebook_items_${user.uid}_${collection.id}`;
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', status: 'uncollected', image: null });
  const [nameError, setNameError] = useState(false);
  const [imageError, setImageError] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setItems(JSON.parse(stored));
  }, [storageKey]);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  useEffect(() => {
    if (!showFilterMenu) return;
    const handler = () => setShowFilterMenu(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showFilterMenu]);

  const saveToStorage = (data) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', status: 'uncollected', image: null });
    setNameError(false);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '', price: item.price ?? '', status: item.status, image: item.image || null });
    setNameError(false);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(true);
    setOpenMenuId(null);
    setSelectedItem(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Only JPG and PNG images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be under 2 MB.');
      e.target.value = '';
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onload = (ev) => setFormData((prev) => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setNameError(true);
      return;
    }

    let updated;
    if (editingItem) {
      updated = items.map((i) =>
        i.id === editingItem.id
          ? { ...i, name: formData.name.trim(), description: formData.description.trim(), price: formData.price, status: formData.status, image: formData.image || null }
          : i
      );
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        status: formData.status,
        image: formData.image || null,
      };
      updated = [...items, newItem];
    }

    setItems(updated);
    saveToStorage(updated);
    onCollectionUpdated?.(collection.id);
    setShowModal(false);
  };

  const handleToggleStatus = (id) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, status: i.status === 'collected' ? 'uncollected' : 'collected' } : i
    );
    setItems(updated);
    saveToStorage(updated);
    onCollectionUpdated?.(collection.id);
  };

  const handleDelete = (id) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveToStorage(updated);
    onCollectionUpdated?.(collection.id);
    setOpenMenuId(null);
  };

  const filteredItems = statusFilter ? items.filter((i) => i.status === statusFilter) : items;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.addButton} onClick={openAddModal}>
          Add Item
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <div className={styles.filterWrapper} onClick={(e) => e.stopPropagation()}>
            <button
              className={[styles.filterButton, statusFilter ? styles.filterActive : ''].filter(Boolean).join(' ')}
              onClick={() => setShowFilterMenu((v) => !v)}
            >
              Filter
              {statusFilter && (
                <span
                  className={styles.filterClear}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter(null);
                    setShowFilterMenu(false);
                  }}
                >
                  ×
                </span>
              )}
            </button>
            {showFilterMenu && (
              <div className={styles.filterDropdown}>
                <button
                  className={statusFilter === 'collected' ? styles.filterOptionActive : ''}
                  onClick={() => { setStatusFilter('collected'); setShowFilterMenu(false); }}
                >
                  Collected
                </button>
                <button
                  className={statusFilter === 'uncollected' ? styles.filterOptionActive : ''}
                  onClick={() => { setStatusFilter('uncollected'); setShowFilterMenu(false); }}
                >
                  Uncollected
                </button>
              </div>
            )}
          </div>
          <h1 className={styles.collectionTitle}>{collection.name}</h1>
          <div className={styles.titleSpacer} />
        </div>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyMessage}>Add items to this collection to get started!</p>
            <button className={styles.addButton} onClick={openAddModal}>
              Add Item
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyMessage}>No items match this filter.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={[styles.card, openMenuId === item.id ? styles.cardMenuOpen : ''].filter(Boolean).join(' ')}
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <img src={item.image} alt={item.name} className={styles.cardThumbnail} />
                )}
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={item.status === 'collected'}
                  onChange={() => handleToggleStatus(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  title={item.status === 'collected' ? 'Mark as uncollected' : 'Mark as collected'}
                />
                <div className={styles.cardContent}>
                  <h2 className={styles.cardName}>{item.name}</h2>
                  {item.description && (
                    <p className={styles.cardDescription}>{item.description}</p>
                  )}
                  <div className={styles.cardMeta}>
                    {item.price !== '' && item.price != null && (
                      <span className={styles.cardPrice}>${item.price}</span>
                    )}
                    <span className={[styles.cardStatus, item.status === 'collected' ? styles.statusCollected : styles.statusUncollected].join(' ')}>
                      {item.status === 'collected' ? 'Collected' : 'Uncollected'}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.menuButton}
                  title="Options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === item.id ? null : item.id);
                  }}
                >
                  ⋮
                </button>
                {openMenuId === item.id && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <div className={styles.overlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.detailPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.detailClose} onClick={() => setSelectedItem(null)}>×</button>
            {selectedItem.image && (
              <img src={selectedItem.image} alt={selectedItem.name} className={styles.detailImage} />
            )}
            <div className={styles.detailBody}>
              <h2 className={styles.detailName}>{selectedItem.name}</h2>
              {selectedItem.description && (
                <p className={styles.detailDescription}>{selectedItem.description}</p>
              )}
              <div className={styles.detailMeta}>
                {selectedItem.price !== '' && selectedItem.price != null && (
                  <span className={styles.cardPrice}>${selectedItem.price}</span>
                )}
                <span className={[styles.cardStatus, selectedItem.status === 'collected' ? styles.statusCollected : styles.statusUncollected].join(' ')}>
                  {selectedItem.status === 'collected' ? 'Collected' : 'Uncollected'}
                </span>
              </div>
            </div>
            <div className={styles.detailActions}>
              <button className={styles.detailEditButton} onClick={() => openEditModal(selectedItem)}>Edit</button>
              <button className={styles.detailDeleteButton} onClick={() => { handleDelete(selectedItem.id); setSelectedItem(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'New Item'}
            </h2>
            <div className={styles.field}>
              <input
                type="text"
                placeholder="Item name *"
                value={formData.name}
                className={nameError ? styles.inputError : ''}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (e.target.value.trim()) setNameError(false);
                }}
              />
              {nameError && <span className={styles.errorMsg}>Name is required.</span>}
            </div>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price (optional)"
              value={formData.price}
              min="0"
              step="0.01"
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <div className={styles.imageSection}>
              <span className={styles.imageLabel}>Image (JPG or PNG, optional)</span>
              {formData.image ? (
                <div className={styles.imagePreviewWrapper}>
                  <img src={formData.image} alt="Preview" className={styles.imagePreview} />
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: null }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={styles.fileInputLabel}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className={styles.fileInput}
                    onChange={handleImageChange}
                  />
                  Choose Image
                </label>
              )}
              {imageError && <span className={styles.errorMsg}>{imageError}</span>}
            </div>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="uncollected">Uncollected</option>
              <option value="collected">Collected</option>
            </select>
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

export default ItemsPage;
