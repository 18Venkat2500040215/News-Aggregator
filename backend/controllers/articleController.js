const axios = require("axios");


/* =====================================================
   NEWS API
   ===================================================== */

const NEWS_API_URL =
    "https://newsapi.org/v2";


/* =====================================================
   CACHE
   ===================================================== */

const cache =
    new Map();


const CACHE_TIME =
    2 * 60 * 1000;


/* =====================================================
   CATEGORY CONFIG
   ===================================================== */

const categoryConfigs = {

    world: {
        query:
            "world news",
        pageSize:
            30
    },

    india: {
        query:
            "India news",
        pageSize:
            30
    },

    sports: {
        query:
            "sports",
        pageSize:
            30
    },

    technology: {
        query:
            "technology AI",
        pageSize:
            30
    },

    entertainment: {
        query:
            "entertainment movies",
        pageSize:
            30
    },

    business: {
        query:
            "business economy markets",
        pageSize:
            30
    },

    health: {
        query:
            "health medicine",
        pageSize:
            30
    },

    education: {
        query:
            "education",
        pageSize:
            30
    }

};


/* =====================================================
   AXIOS INSTANCE
   ===================================================== */

const newsAPI =
    axios.create({

        baseURL:
            NEWS_API_URL,

        timeout:
            10000

    });


/* =====================================================
   CLEAN ARTICLES
   ===================================================== */

function cleanArticles(
    articles
) {

    if (
        !Array.isArray(
            articles
        )
    ) {

        return [];

    }


    return articles.filter(
        article => {

            if (!article) {
                return false;
            }


            if (!article.title) {
                return false;
            }


            if (
                article.title ===
                "[Removed]"
            ) {

                return false;

            }


            return true;

        }
    );

}


/* =====================================================
   NEWS API REQUEST
   ===================================================== */

async function requestNews(
    query,
    pageSize = 30
) {

    console.log(
        "NewsAPI query:",
        query
    );


    const response =
        await newsAPI.get(
            "/everything",
            {

                params: {

                    q:
                        query,

                    language:
                        "en",

                    sortBy:
                        "publishedAt",

                    pageSize:
                        pageSize,

                    apiKey:
                        process.env.NEWS_API_KEY

                }

            }
        );


    return cleanArticles(
        response.data?.articles
    );

}


/* =====================================================
   LOCAL / REGIONAL SEARCH
   ===================================================== */

async function searchLocation(
    query
) {

    const parts =
        String(query)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    /*
       Example:

       Tadepalle Guntur

       First:
       Tadepalle Guntur

       Then:
       Guntur

       Then:
       Andhra Pradesh

       Then:
       India
    */


    const queries = [];


    if (parts.length >= 2) {

        queries.push(
            parts.join(" ")
        );

        queries.push(
            parts[
                parts.length - 1
            ]
        );

    } else if (
        parts.length === 1
    ) {

        queries.push(
            parts[0]
        );

    }


    /*
       State fallback
    */

    const stateMap = {

        "andhra pradesh":
            "Andhra Pradesh",

        "telangana":
            "Telangana",

        "tamil nadu":
            "Tamil Nadu",

        "karnataka":
            "Karnataka",

        "kerala":
            "Kerala",

        "maharashtra":
            "Maharashtra",

        "odisha":
            "Odisha",

        "west bengal":
            "West Bengal",

        "gujarat":
            "Gujarat",

        "rajasthan":
            "Rajasthan",

        "punjab":
            "Punjab",

        "delhi":
            "Delhi",

        "bihar":
            "Bihar",

        "uttar pradesh":
            "Uttar Pradesh"

    };


    const normalized =
        String(query)
            .toLowerCase()
            .trim();


    for (
        const key
        of Object.keys(stateMap)
    ) {

        if (
            normalized.includes(
                key
            )
        ) {

            queries.push(
                stateMap[key]
            );

            break;

        }

    }


    /*
       Final India fallback
    */

    queries.push(
        "India"
    );


    /*
       Remove duplicates
    */

    const uniqueQueries =
        [
            ...new Set(
                queries
            )
        ];


    for (
        const searchQuery
        of uniqueQueries
    ) {

        try {

            const articles =
                await requestNews(
                    searchQuery,
                    20
                );


            if (
                articles.length > 0
            ) {

                console.log(
                    `Found ${articles.length} articles using: ${searchQuery}`
                );


                return articles;

            }


            console.log(
                `No articles for: ${searchQuery}`
            );


        } catch (error) {

            console.error(
                `Search failed for ${searchQuery}:`,
                error.message
            );

        }

    }


    return [];

}


/* =====================================================
   GET NEWS
   ===================================================== */

const getNews =
    async (
        req,
        res
    ) => {

        try {

            const category =
                (
                    req.query.category ||
                    "world"
                ).trim();


            console.log(
                "Requested news:",
                category
            );


            /*
               API KEY CHECK
            */

            if (
                !process.env.NEWS_API_KEY
            ) {

                return res.status(500).json({

                    message:
                        "NEWS_API_KEY is missing in backend .env",

                    articles:
                        []

                });

            }


            /*
               CACHE CHECK
            */

            const cached =
                cache.get(
                    category
                );


            if (
                cached &&
                Date.now() -
                    cached.time <
                    CACHE_TIME
            ) {

                console.log(
                    "Serving from cache:",
                    category
                );


                return res.json({

                    status:
                        "ok",

                    articles:
                        cached.articles

                });

            }


            let articles = [];


            /*
               STANDARD CATEGORIES
            */

            if (
                categoryConfigs[
                    category
                ]
            ) {

                const config =
                    categoryConfigs[
                        category
                    ];


                articles =
                    await requestNews(
                        config.query,
                        config.pageSize
                    );

            }


            /*
               REGIONAL / LOCAL
            */

            else {

                articles =
                    await searchLocation(
                        category
                    );

            }


            /*
               CACHE RESULT
            */

            cache.set(
                category,
                {

                    time:
                        Date.now(),

                    articles

                }
            );


            console.log(
                `Returning ${articles.length} articles for ${category}`
            );


            return res.json({

                status:
                    "ok",

                articles

            });


        } catch (error) {

            console.error(
                "News Controller Error:",
                error.message
            );


            /*
               NEWS API ERROR DETAILS
            */

            if (
                error.response
            ) {

                console.error(
                    "NewsAPI status:",
                    error.response.status
                );


                console.error(
                    "NewsAPI data:",
                    error.response.data
                );

            }


            return res.status(
                500
            ).json({

                status:
                    "error",

                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch news",

                articles:
                    []

            });

        }

    };


/* =====================================================
   EXPORT
   ===================================================== */

module.exports = {
    getNews
};