import { useState } from 'react';
import CollectionsPage from './components/CollectionsPage';
import ItemsPage from './components/ItemsPage';

const COLLECTIONS_KEY = 'collectorsNotebook_collections';

function App() {
  const [selectedCollection, setSelectedCollection] = useState(null);

  const handleCollectionUpdated = (collectionId) => {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (!stored) return;
    const collections = JSON.parse(stored);
    const updated = collections.map((c) =>
      c.id === collectionId ? { ...c, dateUpdated: new Date().toISOString() } : c
    );
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
  };

  if (selectedCollection) {
    return (
      <ItemsPage
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
        onCollectionUpdated={handleCollectionUpdated}
      />
    );
  }

  return <CollectionsPage onSelectCollection={setSelectedCollection} />;
}

export default App;
