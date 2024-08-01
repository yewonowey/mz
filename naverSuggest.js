const axios = require('axios');

const client_id = "gGRrUm209lNZG3jzf6Tj";
const client_secret = "ZJZLfH3nZw";

const getNaverSearchSuggestions = async (query) => {
    try {
        const response = await axios.get('https://openapi.naver.com/v1/search/errata.json', {
            headers: {
                "X-Naver-Client-Id": client_id,
                "X-Naver-Client-Secret": client_secret,
            },
            params: {
                query: query,
            },
        });
        const suggestions = response.data.errata || [];
        return suggestions.length ? suggestions[0].orgQuery : query;
    } catch (error) {
        console.error(error);
        return query;
    }
};

module.exports = getNaverSearchSuggestions;