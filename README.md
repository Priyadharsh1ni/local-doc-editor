# 📝 Local Doc Editor (Offline-Safe Versioned Editor)

A **Next.js + Editor.js** based document editor with offline support, auto draft saving, server sync, and version history with cursor restoration.

---

## 🚀 Features

### ✨ Editor
- Built using **Editor.js**
- Supports:
  - Paragraph
  - Header
  - List
  - Quote
  - Image
  - Warning blocks
- Cursor automatically moves to the exact block when a version is selected

---

### 📶 Offline-First Support
- Auto-saves drafts to **localStorage**
- Works even when the internet connection drops
- Automatically syncs content to the server when back online

---

### 🕒 Version History
- Every save creates a snapshot
- Versions stored in `document_versions` table
- Clicking a version restores:
  - Full document content
  - Cursor position (block index)

---

### 🗂 Documents Dashboard
- Create new documents
- View documents in a card layout
- Rename documents inline (real-time update)

---

## 🧠 Tech Stack

| Layer      | Tech |
|-----------|------|
| Frontend  | Next.js (App Router), React, Tailwind CSS |
| Editor    | Editor.js |
| Backend   | Next.js API Routes |
| Database  | MySQL |
| Auth      | Token-based (localStorage) |
| Storage   | localStorage (offline drafts) |

---

##  Database Schema  API Endpoints

### `documents`
```sql
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  content LONGTEXT,
  snapshot LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE document_versions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id INT,
  snapshot LONGTEXT,
  start_block_index INT DEFAULT 0,
  base_version INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
 
## API Endpoints

Documents
POST /api/documents → Create document
GET /api/documents → List documents
GET /api/documents/:id → Get document
PATCH /api/documents → Rename document

Sync
POST /api/sync → Save document content


Versions
POST /api/versions → Create version snapshot
GET /api/versions?documentId=ID → Get all versions
GET /api/versions?documentId=ID&latest=true → Get latest version


How Version Restore Works
1.User clicks a version timestamp
2.Snapshot JSON is loaded into Editor.js
3.Editor is re-initialized
4.Cursor focuses on the saved start_block_index


Setup Instructions

clone repositary 
--git clone <repo url>
--npm install
--npm run dev


Testing Scenarios

1.Disconnect internet → continue typing → reconnect → auto sync
2.Refresh page → local draft restores
3.Click version → cursor jumps to correct block
4.Rename title → reflected instantly


Login credentials
email : user@gmail.com
password : test@123