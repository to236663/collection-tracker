## Transcript Highlights

### 1. Testing the first feature (Session 2, late)
Claude found small bugs and fixed them before running tests for the feature. Once it fixed the bugs, it moved to creating the tests and running them, encountering 2 failures
that it fixed right away and re-tested afterwards, which was very helpful.

### 2. Fixing weird dropdown interactivity (Session 2, mid-late)
I noticed there would be weird interactivity between the dropdown menus for editing and deleting collections and the collection cards, so I made Claude aware of the issue
and asked it fix it so that its hovering would not interfere with the collection card in behind the menu. It quickly fixed the z-index issue with the cards and the dropdown 
was interacting properly with the collection cards behind it.

### 3. Updating the timing of collections (Session 5, late)
Whenever items within a collection were updated or added, the collection itself on the main page wouldn't display an updated time and move to the top of the page. I asked
Claude to update the way timing for the collections worked and for it to update when items within collections were added, edited, or deleted, which it did and made sure
that it would update before users would click the back button and return to the main page. 
