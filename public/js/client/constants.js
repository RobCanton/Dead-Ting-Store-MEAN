angular.module('MyStore')
 
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  authenticated: 'authenticated'
})
 
.constant('API_ENDPOINT', {
  url: '/api'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
});