# Firebase Security Rules - Fix Upload Issues

## The Problem
Your drag & drop upload is loading forever because Firebase security rules are blocking the upload.

## Solution: Update Your Firebase Security Rules

### 1. Firebase Storage Rules
Go to your Firebase Console → Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to gallery folder (for now, allow all writes)
    match /gallery/{allPaths=**} {
      allow write: if true;
    }
  }
}
```

### 2. Firestore Rules
Go to your Firebase Console → Firestore → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all collections
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow write access to bookings, reviews, and gallery
    match /bookings/{document} {
      allow write: if true;
    }
    
    match /reviews/{document} {
      allow write: if true;
    }
    
    match /gallery/{document} {
      allow write: if true;
    }
  }
}
```

## Quick Fix Steps

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project: `valeting-1d9a7`

2. **Update Storage Rules**
   - Click "Storage" in the left sidebar
   - Click "Rules" tab
   - Replace the rules with the Storage rules above
   - Click "Publish"

3. **Update Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click "Rules" tab
   - Replace the rules with the Firestore rules above
   - Click "Publish"

4. **Test Upload**
   - Go back to your website
   - Try uploading a file again
   - Check browser console for any errors

## Alternative: Temporary Public Access

If you want to test immediately, use these very permissive rules (NOT for production):

```javascript
// Storage Rules (temporary)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}

// Firestore Rules (temporary)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Debug Steps

1. **Open Browser Console**
   - Press F12 in your browser
   - Go to Console tab
   - Try uploading a file
   - Look for error messages

2. **Common Error Messages**
   - `storage/unauthorized` = Security rules blocking upload
   - `storage/quota-exceeded` = Storage limit reached
   - `storage/unauthenticated` = Authentication required

3. **Check File Size**
   - Make sure files are under 10MB
   - Try with a smaller test image first

## Production Security (Later)

Once uploads work, you can add proper authentication:

```javascript
// More secure rules (for later)
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

Try updating the security rules first - this should fix the infinite loading issue! 