/* eslint-disable prettier/prettier */

const API_KEY = 'dc402bfe0b5097c7f95bf409365725837f46623db5939d29bcd0d07be8463e92';

export const loadTickers = tickers => 
   fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(',')}&tsyms=USD&api_key=${API_KEY}`
   )
   .then(r => r.json())
   .then(rawData =>
      Object.fromEntries(
         Object.entries(rawData).map(([key, value]) => ([key, value.USD]))
      ) 
   );