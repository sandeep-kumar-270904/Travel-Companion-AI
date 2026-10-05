import axios from 'axios';

export const convertCurrency = async (from, to, amount) => {
  try {
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    const response = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromLower}.json`);
    
    if (response.data && response.data[fromLower] && response.data[fromLower][toLower] !== undefined) {
      const rate = response.data[fromLower][toLower];
      return rate * amount;
    } else {
      throw new Error('Conversion failed');
    }
  } catch (error) {
    throw new Error('Error fetching conversion rate');
  }
};
