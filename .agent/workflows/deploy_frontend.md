# Deploying Frontend to Firebase Hosting

This workflow guides you through deploying the Angular frontend to Firebase Hosting.

## Prerequisites
- You must have a Firebase project created in the [Firebase Console](https://console.firebase.google.com).
- You must be logged in to Firebase CLI (which you are).

## Deployment Steps

1. **Link to your Firebase Project**:
   Run the following command in your terminal and select the project you want to use (create one in the console if you haven't yet, e.g., 'academia-plus-app'):
   ```powershell
   cd "e:\Projects\Academia Plus\Frontend"
   firebase use --add
   ```

2. **Deploy**:
   Since the application is already built and configured, you just need to run:
   ```powershell
   firebase deploy --only hosting
   ```

3. **Verify**:
   Firebase will output a "Hosting URL". Click it to view your live app!

## Notes
- The app uses `src/environments/environment.prod.ts` for production configuration.
- Currently, the API URL in `environment.prod.ts` is set to a placeholder. You will need to update this file with your actual deployed Backend URL later.
