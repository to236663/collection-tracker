import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import CollectionsPage from './components/CollectionsPage';
import ItemsPage from './components/ItemsPage';
import AuthPage from './components/AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleCollectionUpdated = (collectionId) => {
    const storageKey = `collectorsNotebook_collections_${user.uid}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    const collections = JSON.parse(stored);
    const updated = collections.map((c) =>
      c.id === collectionId ? { ...c, dateUpdated: new Date().toISOString() } : c
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  if (authLoading) return null;

  if (!user) return <AuthPage />;

  if (selectedCollection) {
    return (
      <ItemsPage
        collection={selectedCollection}
        user={user}
        onBack={() => setSelectedCollection(null)}
        onCollectionUpdated={handleCollectionUpdated}
      />
    );
  }

  return <CollectionsPage user={user} onSelectCollection={setSelectedCollection} />;
}

export default App;
