# Collection Tracker Project

## Overview Description

This tracker will be to for helping collectors be able to track they're own personal collections and the items they have within these collections. Users will be able to create collections based on what it is they are trying to track and add, edit, and delete items within these collection lists as they continue to expand on their collections, making this the perfect tool for collectors to manage and keep organize their hobby of collecting!

## Features

- Add/Edit/Delete a Collection
- Add/Edit/Delete an Item within a Collection
- Pin a Collection to the top of the Main Page
- Check Items in Collections as Collected/Uncollected
- Filter Items by Status in Item Pages
- Sign Up, Login, and Logout of App

## Tech Stack

This project will utilize React, JavaScript, CSS, localStorage, and Vercel for its front-end and back-end development and for its deployment, as well as Firebase for the handling of back-end user authentication. 

## Known Bugs
There are no major bugs or limitations at the current state of this project. Overall there were mainly only minor bugs menu displays, specifically dropdown menus and the way they would interact with other items when toggled, but those were fixed and the app runs smoothly. 

## Setup Instructions
To setup, you can either use the Vercel deployment link or you can clone the repository and run the React app locally by running "npm start" and typing in whatever port the app is running on in your browser. Make sure when deploying locally that your terminal is open in the correct folder before running the app.

## What I Learned
I would say that probably the biggest thing I learned from this project was the amount of time and work that goes into planning the project before actually starting to code it. As I began to think through and process how I wanted to create this project and what I would need, I realized how much work and different details I had to keep track off before I even began asking Claude to start coding for me. Normally, I feel like I spend more time coding than actually planning out my code and project before starting, but with this project I had to spend the same if not more time mentally and physically organizing what I specifically wanted for this project and what I would need to ask from Claude in order to get the results I wanted, which in the end I would definitely say that I got them. 

## localStorage Schema
### Keys
- collectorsNotebook_collections_<uid> (Array of user's collectioins)
- collectorsNotebook_items_<uid>_<collectionId> (Array of items belonging to a collection)

### Data Shapes
Collection
{
  "id": "abc123",
  "name": "Vintage Stamps",
  "tag": "stamps",
  "description": "My stamp collection",
  "dateCreated": "2025-01-01T00:00:00.000Z",
  "dateUpdated": "2025-03-15T12:00:00.000Z",
  "pinnedAt": null
}

List
{
  "id": "xyz789",
  "name": "1952 Red Crown",
  "description": "Mint condition",
  "price": "$45.00",
  "status": "collected",
  "image": "data:image/png;base64,..."
}

### Storage Layout

localStorage
│
├── collectorsNotebook_collections_<uid>
│     └── Collection[]
│           ├── id, name, tag, description
│           ├── dateCreated, dateUpdated
│           └── pinnedAt (ISO timestamp or null)
│
├── collectorsNotebook_items_<uid>_<collectionId>
│     └── Item[]
│           ├── id, name, description, price
│           ├── status ("collected" | "uncollected")
│           └── image (base64 data URL or null)
│
└── collectorsNotebook_items_<uid>_<collectionId> (repeated for each collection)
      └── Item[]
