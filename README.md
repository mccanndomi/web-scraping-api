# web-scraping-api
Web Scraping api to fetch 'the people forum' data. Will be used by the web-scraping-app that will handle the front end design. Use puppeteer to fetch the data from the website. Store data in firebase every so often (2 mins?). This will make the data accessable for the web-scrapping-app. Firebase is much faster at fetching data and will speed up process.

### Two parts to this API/Backend

#### Webscraping / Data Gathering
This part of the back end is responsible for fetching the data from sources like The People Forum and Reddit. It uses processes like Puppeteer to webscrape raw text and translates it into usable objects. These will then be written into a SQL database.

#### API
The API will be created with the NEST.js framework and will use GraphQL to make crud opperations onto the SQL databse and return them to the API.

## Links

### API

https://www.youtube.com/watch?v=vjf774RKrLc&t=2338s&ab_channel=DevEd

### Web Scraping

https://www.youtube.com/watch?v=pixfH6yyqZk&ab_channel=DevTips
