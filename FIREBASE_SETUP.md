# Firebase Setup Instructions

## Fix Permission Errors

The app is experiencing permission errors because Firestore security rules need to be deployed. Follow these steps:

### Option 1: Deploy Rules via Firebase CLI (Recommended)

1. Install Firebase CLI if not already installed:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Initialize Firebase in the project (if not already done):

   ```bash
   firebase init firestore
   ```

   - Select your existing project: `beautyexpres-2f9c5`
   - Choose `firestore.rules` as the rules file
   - Choose `firestore.indexes.json` as the indexes file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 2: Manual Rule Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `beautyexpres-2f9c5`
3. Navigate to Firestore Database → Rules
4. Copy and paste the content from `firestore.rules` file
5. Click "Publish"

### What the Rules Do

The security rules allow:

- **Admin user** (VJdxemjpYTfR3TAfAQDmZ9ucjxB2): Full read/write access to all collections
- **Authenticated users**: Read/write access to their own data
- **Bookings**: Users can manage their own bookings, admin can manage all
- **Messages**: Users can send/receive messages in their conversations
- **Notifications**: Users can read their own notifications

### Verification

After deploying the rules, the following errors should be resolved:

- ✅ Dashboard metrics will load properly
- ✅ Messaging system will work between admin and clients
- ✅ Bookings will be manageable
- ✅ Sample data initialization will work

### Current Admin Account

- **Email**: beautyexpress211@gmail.com
- **UID**: VJdxemjpYTfR3TAfAQDmZ9ucjxB2

This account has full admin privileges in the security rules.
