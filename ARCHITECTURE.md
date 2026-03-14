## Tech Stack
- React
- localStorage for data persistence
- CSS Modules for styling

## Key Files
- src/App.js — root component, manages page-level navigation via selectedCollection state
- src/components/CollectionsPage.js — landing page; lists all collections
- src/components/CollectionsPage.module.css — styles for CollectionsPage
- src/components/ItemsPage.js — items page for a single collection
- src/components/ItemsPage.module.css — styles for ItemsPage

## Data Model
- Collection: {id, name, tag, description, dateCreated, dateUpdated, pinnedAt}
- Item: {id, name, description, price, status}

## localStorage Keys
- collectorsNotebook_collections — JSON array of Collection objects
- collectorsNotebook_items_<collectionId> — JSON array of Item objects per collection
