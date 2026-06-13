import axios from 'axios';

export const convertCurrency = async (from, to, amount) => {
  try {
    const response = await axios.get(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    if (response.data && response.data.rates && response.data.rates[to] !== undefined) {
      return response.data.rates[to];
    } else {
      throw new Error('Conversion failed');
    }
  } catch (error) {
    throw new Error('Error fetching conversion rate');
  }
};
