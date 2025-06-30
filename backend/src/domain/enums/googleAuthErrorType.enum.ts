export enum GoogleAuthErrorType { 
    MissingAuthorizationCode = 'No authorization code provided', 
    MissingIdToken = 'No ID token received from Google', 
    InvalidGoogleToken = 'Invalid Google token: Email is missing', 
    GoogleAuthFailed = 'Google authentication failed', 
}