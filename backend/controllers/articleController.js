
const axios = require("axios");

const API_URL = "https://newsapi.org/v2";
const CACHE_TIME = 2 * 60 * 1000;
const cache = new Map();

const newsAPI = axios.create({
    baseURL: API_URL,
    timeout: 12000
});

/*
 * Common names and spelling variations.
 * Add more aliases here as the project grows.
 */
const SEARCH_ALIASES = [
    {
        names: [
            "bhuvneshwar kumar",
            "bhuvaneswar kumar",
            "bhuvaneshwar kumar",
            "bhuvneshwar kumar",
            "bhuvi"
        ],
        query:
            '"Bhuvneshwar Kumar" OR "Bhuvaneswar Kumar" OR "Bhuvaneshwar Kumar" OR Bhuvi'
    },
    {
        names: ["virat kohli", "virat"],
        query: '"Virat Kohli"'
    },
    {
        names: ["rohit sharma", "rohit"],
        query: '"Rohit Sharma"'
    },
    {
        names: ["ms dhoni", "dhoni"],
        query: '"MS Dhoni" OR "Mahendra Singh Dhoni"'
    },
    {
        names: ["allu arjun", "allu"],
        query: '"Allu Arjun"'
    },
    {
        names: ["prabhas"],
        query: '"Prabhas"'
    },
    {
        names: ["ntr", "jr ntr", "junior ntr"],
        query: '"Jr NTR" OR "Junior NTR"'
    },
    {
        names: ["artificial intelligence", " ai "],
        query: '"artificial intelligence" OR AI'
    }
];

const CATEGORY_CONFIGS = {
    world: {
        query: '"world news" OR international',
        pageSize: 30
    },
    india: {
        query: '"India news" OR "Indian government"',
        pageSize: 30
    },
    sports: {
        query: "cricket OR football OR tennis OR sports",
        pageSize: 30
    },
    technology: {
        query: '"artificial intelligence" OR technology OR software',
        pageSize: 30
    },
    entertainment: {
        query: 'movies OR cinema OR entertainment',
        pageSize: 30
    },
    business: {
        query: 'business OR economy OR finance OR markets',
        pageSize: 30
    },
    health: {
        query: 'health OR medicine OR medical research',
        pageSize: 30
    },
    education: {
        query: 'education OR university OR school OR examination',
        pageSize: 30
    }
};

function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanArticles(articles) {
    if (!Array.isArray(articles)) return [];

    const seen = new Set();

    return articles.filter(article => {
        if (
            !article ||
            !article.title ||
            article.title === "[Removed]"
        ) {
            return false;
        }

        const key = article.url || normalize(article.title);

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

async function requestNews(query, pageSize = 30) {
    console.log("NewsAPI query:", query);

    const response = await newsAPI.get("/everything", {
        params: {
            q: query,
            language: "en",
            sortBy: "publishedAt",
            pageSize,
            apiKey: process.env.NEWS_API_KEY
        }
    });

    return cleanArticles(response.data?.articles);
}

function getQueries(userQuery) {
    const normalized = normalize(userQuery);
    const queries = [];
    const alias = SEARCH_ALIASES.find(item =>
        item.names.some(name => {
            const normalizedName = normalize(name);
            return normalizedName &&
                (
                    normalized === normalizedName ||
                    normalized.includes(normalizedName) ||
                    normalizedName.includes(normalized)
                );
        })
    );

    /*
     * Try the expanded name first, then the original query.
     */
    if (alias) queries.push(alias.query);

    queries.push(userQuery);

    /*
     * For longer searches, try the main meaningful words
     * if the exact phrase produces no results.
     */
    const stopWords = new Set([
        "the", "a", "an", "is", "are", "was", "were",
        "for", "to", "in", "on", "of", "and", "or",
        "latest", "news", "about", "show", "me"
    ]);

    const terms = normalized
        .split(" ")
        .filter(word => word.length > 1 && !stopWords.has(word));

    if (terms.length > 1) {
        queries.push(terms.join(" OR "));
    }

    return [...new Set(queries)].slice(0, 3);
}

function rankArticles(articles, userQuery) {
    const terms = normalize(userQuery)
        .split(" ")
        .filter(word => word.length > 1);

    return [...articles]
        .map((article, index) => {
            const title = normalize(article.title);
            const description = normalize(article.description);
            const content = normalize(article.content);

            let score = 0;

            for (const term of terms) {
                if (title.includes(term)) score += 8;
                else if (description.includes(term)) score += 4;
                else if (content.includes(term)) score += 1;
            }

            const titlePhrase = normalize(userQuery);

            if (titlePhrase && title.includes(titlePhrase)) {
                score += 12;
            } else if (
                titlePhrase &&
                description.includes(titlePhrase)
            ) {
                score += 5;
            }

            return { article, score, index };
        })
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;

            const dateA = Date.parse(a.article.publishedAt || "") || 0;
            const dateB = Date.parse(b.article.publishedAt || "") || 0;

            return dateB - dateA || a.index - b.index;
        })
        .map(item => item.article);
}

function getCache(key) {
    const item = cache.get(key);

    if (!item) return null;

    if (Date.now() - item.time > CACHE_TIME) {
        cache.delete(key);
        return null;
    }

    return item.articles;
}

function setCache(key, articles) {
    if (cache.size >= 100) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) cache.delete(oldestKey);
    }

    cache.set(key, {
        time: Date.now(),
        articles
    });
}

async function searchArticles(query) {
    const allArticles = [];

    for (const searchQuery of getQueries(query)) {
        try {
            const results = await requestNews(searchQuery, 30);
            allArticles.push(...results);

            /*
             * If we have results, keep gathering only when
             * the alias expansion may have found more coverage.
             */
            if (allArticles.length >= 30) break;
        } catch (error) {
            console.error(
                `Search attempt failed for "${searchQuery}":`,
                error.response?.data || error.message
            );
        }
    }

    const uniqueArticles = cleanArticles(allArticles);
    return rankArticles(uniqueArticles, query).slice(0, 30);
}

const getNews = async (req, res) => {
    try {
        const query = String(req.query.category || "world").trim();

        if (!query) {
            return res.status(400).json({
                status: "error",
                message: "Enter a search term.",
                articles: []
            });
        }

        if (query.length > 200) {
            return res.status(400).json({
                status: "error",
                message: "Search must be 200 characters or fewer.",
                articles: []
            });
        }

        if (!process.env.NEWS_API_KEY) {
            return res.status(500).json({
                status: "error",
                message: "NEWS_API_KEY is missing in backend .env",
                articles: []
            });
        }

        const key = normalize(query);
        const cached = getCache(key);

        console.log("Requested news:", query);

        if (cached) {
            return res.json({
                status: "ok",
                query,
                totalResults: cached.length,
                articles: cached
            });
        }

        let articles;

        if (CATEGORY_CONFIGS[key]) {
            articles = await requestNews(
                CATEGORY_CONFIGS[key].query,
                CATEGORY_CONFIGS[key].pageSize
            );
        } else {
            articles = await searchArticles(query);
        }

        setCache(key, articles);

        console.log(
            `Returning ${articles.length} articles for "${query}"`
        );

        return res.json({
            status: "ok",
            query,
            totalResults: articles.length,
            articles
        });
    } catch (error) {
        console.error(
            "News controller error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            status: "error",
            message:
                error.response?.data?.message ||
                "Unable to fetch news. Check the backend terminal.",
            articles: []
        });
    }
};

module.exports = { getNews };
