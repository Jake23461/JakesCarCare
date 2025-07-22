# Gallery Admin Setup Guide

## Overview
This guide shows you how to set up a drag-and-drop gallery management system that allows you to easily add and remove images/videos without coding.

## Architecture

### Option 1: Firebase (Recommended)
- **Firebase Storage**: Stores image/video files
- **Firestore Database**: Stores gallery metadata (titles, descriptions, categories)
- **React Component**: Drag-and-drop interface

### Option 2: Local File System
- **Public folder**: Stores files locally
- **JSON file**: Stores gallery configuration
- **React Component**: Drag-and-drop interface

## Firebase Setup (Recommended)

### 1. Firebase Configuration
Your `src/firebase.js` already has the basic setup. Make sure you have:
- Firebase Storage enabled
- Firestore Database enabled
- Proper security rules

### 2. Security Rules
Add these to your Firebase Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users
    }
  }
}
```

### 3. Firestore Rules
Add these to your Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users
    }
  }
}
```

## Integration Steps

### 1. Add GalleryManager to Admin
In your `src/components/Admin.jsx`, add:

```javascript
import GalleryManager from './GalleryManager';

// Add a new tab for gallery management
const [activeTab, setActiveTab] = useState('bookings');

// Add this to your tab navigation
<button 
  className={`nav-link ${activeTab === 'gallery' ? 'active' : ''}`}
  onClick={() => setActiveTab('gallery')}
>
  Gallery Management
</button>

// Add this to your tab content
{activeTab === 'gallery' && <GalleryManager />}
```

### 2. Update Gallery Component
Modify `src/components/Gallery.jsx` to load from Firebase:

```javascript
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  
  useEffect(() => {
    loadGalleryItems();
  }, []);
  
  const loadGalleryItems = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, 'gallery'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });
    setGalleryItems(items);
  };
  
  // Group items by category
  const groupedItems = galleryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  
  // Use groupedItems instead of hardcoded galleryCategories
}
```

## Features

### ✅ Drag & Drop Upload
- Drag files directly onto the upload area
- Multiple file selection
- Progress indicators
- File type validation

### ✅ Category Management
- Organize by: Before & After, Interiors, Exteriors, Videos
- Easy category switching
- Bulk operations

### ✅ File Management
- Preview thumbnails
- Delete files
- Edit metadata (titles, descriptions)
- File size optimization

### ✅ Security
- Admin-only access
- File type restrictions
- Size limits
- Authentication required

## Usage

### Adding Files
1. Go to Admin → Gallery Management
2. Select the appropriate category
3. Drag & drop files or click "Choose Files"
4. Files upload automatically to Firebase
5. Gallery updates in real-time

### Removing Files
1. Find the file in the gallery manager
2. Click "Delete" button
3. Confirm deletion
4. File removed from storage and database

### Editing Metadata
1. Click on a file in the gallery manager
2. Edit title, description, or category
3. Save changes
4. Updates reflected immediately

## Benefits

### 🎯 **No Coding Required**
- Upload files through web interface
- No need to edit code or configuration files
- User-friendly drag-and-drop interface

### 🚀 **Real-time Updates**
- Changes appear immediately on the website
- No need to restart servers or rebuild
- Instant feedback

### 🔒 **Secure**
- Admin-only access
- File validation and restrictions
- Proper authentication

### 📱 **Responsive**
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized for all devices

## Alternative: Local File System

If you prefer not to use Firebase, you can create a local version:

1. **File Storage**: Store files in `public/gallery/`
2. **Configuration**: Store metadata in `src/gallery-config.json`
3. **Upload**: Use FileReader API to read files
4. **Save**: Update JSON file and copy files to public folder

This approach is simpler but less secure and doesn't provide real-time updates.

## Next Steps

1. **Install GalleryManager component**
2. **Set up Firebase Storage rules**
3. **Integrate with Admin panel**
4. **Test upload functionality**
5. **Configure file size limits**
6. **Add image optimization**

The drag-and-drop system will make managing your gallery much easier and more professional! 