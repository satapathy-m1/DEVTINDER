# listing down all the apis that i'll create

## ->authRouters
-post /signup
-post /login
-post /logout

## ->profileRouters
get /profile/view
patch /profile/edit
patch /profile/password

## ->connectionRouters
/*  status:- interested, ignored, accepted, rejected */
### -post /request/send/:status/:userId
-post /request/send/interested/:userId
-post /request/send/ignored/:userId

### -post /request/review/:status/:requestId
-post /request/review/accepted/:requestId
-post /request/review/rejected/:requestId


## ->myFeedRouters
-get /user/connections
-get /user/requests/received
-get /user/feed/ (gets you the profiles of other people on the platform)

