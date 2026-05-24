export const environment = {
  production: true,
//  apiBaseUrl: '/myschool/api/',
  apiBaseUrl: process.env['API_URL'] || '/myschool/api'

};
