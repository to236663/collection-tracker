## Current State
- Landing page displays project title, collection cards sorted by most recent update/creation, and an empty-state message
- Each card shows the collection name, a Created/Updated date, and a three-dot menu with Edit, Pin/Unpin, and Delete options
- Add/Edit modal includes name (required), tag, and description fields with name validation
- All collection data persists to localStorage
- Collections can be pinned to the top of the list (max 3); pinned collections are sorted oldest-pin-first and display a 📌 icon with a dark-green left-border accent
- Pin option in the dropdown is disabled (grayed out with tooltip) when 3 pins are already active
- Clicking a collection card navigates to ItemsPage for that collection
- ItemsPage shows the collection name centered at top of main content, a sticky "Add Item" button in the header, item cards (name, description, price, status badge), and an empty-state message + Add Item button when no items exist
- Items can be added, edited, and deleted; data persists to localStorage per collection: `collectorsNotebook_items_<collectionId>`
- Item cards have a three-dot menu with Edit and Delete options
- Item cards have a checkbox on the left that toggles status between collected (checked) and uncollected (unchecked); state persists to localStorage
- ItemsPage has a Filter button (left of the collection title) with a dropdown to filter by Collected or Uncollected; an × inside the button clears the active filter
- No routing library — navigation is managed via React state in App.js

## Known Issues
- None

## Next Steps
- None (all planned features complete)
