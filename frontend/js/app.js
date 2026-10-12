const API_URL =
    "http://localhost:5000/api/news";

const AUTH_API =
    "http://localhost:5000/api/auth";


/* =====================================================
   USER + TOKEN
   ===================================================== */

let user =
    JSON.parse(
        localStorage.getItem("user")
    );

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";

}


/* =====================================================
   DOM
   ===================================================== */

const navLinks =
    document.getElementById(
        "nav-links"
    );

const welcomeTitle =
    document.getElementById(
        "welcomeTitle"
    );

const profileSummary =
    document.getElementById(
        "profileSummary"
    );

const locationBadge =
    document.getElementById(
        "locationBadge"
    );

const languageBadge =
    document.getElementById(
        "languageBadge"
    );

const regionalTitle =
    document.getElementById(
        "regionalTitle"
    );

const regionalDescription =
    document.getElementById(
        "regionalDescription"
    );

const localLocationTitle =
    document.getElementById(
        "localLocationTitle"
    );

const localLocationText =
    document.getElementById(
        "localLocationText"
    );

const localDescription =
    document.getElementById(
        "localDescription"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );

const exploreTitle =
    document.getElementById(
        "exploreTitle"
    );

const exploreDescription =
    document.getElementById(
        "exploreDescription"
    );


/* =====================================================
   PROFILE DOM
   ===================================================== */

const profileButton =
    document.getElementById(
        "profileButton"
    );

const profileOverlay =
    document.getElementById(
        "profileOverlay"
    );

const closeProfile =
    document.getElementById(
        "closeProfile"
    );

const profileLogout =
    document.getElementById(
        "profileLogout"
    );

const profilePanelName =
    document.getElementById(
        "profilePanelName"
    );

const profilePanelEmail =
    document.getElementById(
        "profilePanelEmail"
    );

const profileInfoName =
    document.getElementById(
        "profileInfoName"
    );

const profileInfoEmail =
    document.getElementById(
        "profileInfoEmail"
    );

const profileLocation =
    document.getElementById(
        "profileLocation"
    );

const profileLocationDetails =
    document.getElementById(
        "profileLocationDetails"
    );

const profileLanguage =
    document.getElementById(
        "profileLanguage"
    );

const saveLanguageButton =
    document.getElementById(
        "saveLanguageButton"
    );

const profileUpdateMessage =
    document.getElementById(
        "profileUpdateMessage"
    );


/* =====================================================
   LOCATION DOM
   ===================================================== */

const profileState =
    document.getElementById(
        "profileState"
    );

const profileDistrict =
    document.getElementById(
        "profileDistrict"
    );

const profileCity =
    document.getElementById(
        "profileCity"
    );

const saveLocationButton =
    document.getElementById(
        "saveLocationButton"
    );

const locationUpdateMessage =
    document.getElementById(
        "locationUpdateMessage"
    );

const changeLocationButton =
    document.getElementById(
        "changeLocationButton"
    );


/* =====================================================
   LOAD REAL PROFILE
   ===================================================== */

async function loadUserProfile() {

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                `${AUTH_API}/profile`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load profile"
            );

        }


        if (data.user) {

            user =
                data.user;

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

        }


        updateProfileUI();


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        updateProfileUI();

    }

}


/* =====================================================
   LOCATION DATA HELPERS
   ===================================================== */

function getLocationData() {

    if (
        window.indiaLocationData
    ) {

        return (
            window.indiaLocationData
        );

    }

    return {
        states: [],
        districts: {},
        ready: false
    };

}


/* =====================================================
   WAIT FOR LOCATION DATA
   ===================================================== */

async function waitForLocationData() {

    let attempts = 0;

    while (
        attempts < 50
    ) {

        const data =
            getLocationData();

        if (
            data.ready &&
            Array.isArray(data.states)
        ) {

            return data;

        }

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );

        attempts++;

    }

    return getLocationData();

}


/* =====================================================
   LOAD STATES
   ===================================================== */

async function loadProfileStates() {

    if (!profileState) {
        return;
    }


    const data =
        await waitForLocationData();


    profileState.innerHTML = `
        <option value="">
            Select State / UT
        </option>
    `;


    let states = [];


    if (
        Array.isArray(data.states)
    ) {

        states =
            data.states;

    }


    states
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        )
        .forEach(
            state => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    state;

                option.textContent =
                    state;

                profileState.appendChild(
                    option
                );

            }
        );


    if (
        user &&
        user.state
    ) {

        profileState.value =
            user.state;

        await loadProfileDistricts(
            user.state
        );

    }

}


/* =====================================================
   LOAD DISTRICTS
   ===================================================== */

async function loadProfileDistricts(
    state,
    selectedDistrict = ""
) {

    if (!profileDistrict) {
        return;
    }


    profileDistrict.innerHTML = `
        <option value="">
            Select District
        </option>
    `;


    profileDistrict.disabled =
        true;


    if (!state) {
        return;
    }


    const data =
        getLocationData();


    let districts = [];


    if (
        data.districts &&
        Array.isArray(
            data.districts[state]
        )
    ) {

        districts =
            data.districts[state];

    }


    /*
       Some datasets may use
       slightly different state
       formatting.
    */

    if (
        !districts.length &&
        data.districts
    ) {

        const key =
            Object.keys(
                data.districts
            ).find(
                item =>
                    item.toLowerCase() ===
                    state.toLowerCase()
            );


        if (key) {

            districts =
                data.districts[key];

        }

    }


    districts
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        )
        .forEach(
            district => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    district;

                option.textContent =
                    district;

                profileDistrict.appendChild(
                    option
                );

            }
        );


    profileDistrict.disabled =
        districts.length === 0;


    if (
        selectedDistrict
    ) {

        profileDistrict.value =
            selectedDistrict;

    }

}


/* =====================================================
   PROFILE UI
   ===================================================== */

function updateProfileUI() {

    if (!user) {
        return;
    }


    const name =
        (
            user.name ||
            ""
        ).trim();


    const displayName =
        name ||
        "News Reader";


    const email =
        user.email ||
        "No email";


    const state =
        user.state ||
        "";


    const district =
        user.district ||
        "";


    const city =
        user.city ||
        "";


    const languages =
        Array.isArray(
            user.languages
        )
            ? user.languages
            : ["English"];


    const selectedLanguage =
        languages[0] ||
        "English";


    /* NAVBAR */

    const profileName =
        document.getElementById(
            "profileName"
        );


    if (profileName) {

        profileName.textContent =
            displayName;

    }


    /* PROFILE NAME */

    if (profilePanelName) {

        profilePanelName.textContent =
            displayName;

    }


    /* PROFILE EMAIL */

    if (profilePanelEmail) {

        profilePanelEmail.textContent =
            email;

    }


    /* ACCOUNT NAME */

    if (profileInfoName) {

        profileInfoName.textContent =
            displayName;

    }


    /* ACCOUNT EMAIL */

    if (profileInfoEmail) {

        profileInfoEmail.textContent =
            email;

    }


    /* LANGUAGE */

    if (profileLanguage) {

        profileLanguage.value =
            selectedLanguage;

    }


    /* LOCATION */

    const locationParts = [];


    if (city) {
        locationParts.push(city);
    }


    if (district) {
        locationParts.push(district);
    }


    if (state) {
        locationParts.push(state);
    }


    const fullLocation =
        locationParts.length
            ? locationParts.join(", ")
            : "India";


    if (profileLocation) {

        profileLocation.textContent =
            fullLocation;

    }


    if (profileLocationDetails) {

        profileLocationDetails.textContent =
            city || district
                ? "Your selected location"
                : "India";

    }


    /* LOCATION EDITOR */

    if (profileState) {

        profileState.value =
            state;

    }


    if (profileCity) {

        profileCity.value =
            city;

    }


    /* LANGUAGE BADGE */

    if (languageBadge) {

        languageBadge.textContent =
            `🌐 ${selectedLanguage}`;

    }


    /* LOCATION BADGE */

    if (locationBadge) {

        locationBadge.textContent =
            `📍 ${fullLocation}`;

    }


    /* HERO */

    if (profileSummary) {

        profileSummary.textContent =
            `Discover the stories that matter to you, ${displayName}.`;

    }


    /* LOCAL LOCATION */

    if (localLocationTitle) {

        localLocationTitle.textContent =
            fullLocation;

    }


    if (localLocationText) {

        localLocationText.textContent =
            city || district
                ? `Latest local stories from ${city || district}.`
                : "Latest local stories from your selected location.";

    }

}


/* =====================================================
   OPEN PROFILE
   ===================================================== */

function openProfile() {

    updateProfileUI();


    if (profileOverlay) {

        profileOverlay.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "profile-open"
    );


    loadProfileStates();

}


/* =====================================================
   CLOSE PROFILE
   ===================================================== */

function closeProfilePanel() {

    if (profileOverlay) {

        profileOverlay.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "profile-open"
    );

}


/* =====================================================
   PROFILE BUTTON
   ===================================================== */

if (profileButton) {

    profileButton.addEventListener(
        "click",
        openProfile
    );

}


/* =====================================================
   CLOSE PROFILE
   ===================================================== */

if (closeProfile) {

    closeProfile.addEventListener(
        "click",
        closeProfilePanel
    );

}


if (profileOverlay) {

    profileOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                profileOverlay
            ) {

                closeProfilePanel();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeProfilePanel();

        }

    }
);


/* =====================================================
   LOCATION STATE CHANGE
   ===================================================== */

if (profileState) {

    profileState.addEventListener(
        "change",
        async () => {

            await loadProfileDistricts(
                profileState.value
            );

        }
    );

}


/* =====================================================
   SAVE LOCATION
   ===================================================== */

async function saveLocation() {

    const state =
        profileState?.value.trim() ||
        "";

    const district =
        profileDistrict?.value.trim() ||
        "";

    const city =
        profileCity?.value.trim() ||
        "";


    if (!state) {

        if (locationUpdateMessage) {

            locationUpdateMessage.textContent =
                "Please select a state.";

            locationUpdateMessage.className =
                "profile-update-message error";

        }

        return;

    }


    saveLocationButton.disabled =
        true;

    saveLocationButton.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `${AUTH_API}/profile`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            state,
                            district,
                            city

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update location"
            );

        }


        if (data.user) {

            user =
                data.user;

        }


        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        updateProfileUI();


        if (locationUpdateMessage) {

            locationUpdateMessage.textContent =
                "✓ Location updated successfully";

            locationUpdateMessage.className =
                "profile-update-message success";

        }


        /*
           Clear cached regional/local
           news so new location gets
           fresh results.
        */

        browserCache.delete(
            `${user.state}-6`
        );

        browserCache.delete(
            `${buildLocalQuery()}-6`
        );


        /* REGIONAL NEWS */

        await loadNews(
            user.state ||
                "Andhra Pradesh",
            "regional-news",
            6
        );


        /* LOCAL NEWS */

        await loadNews(
            buildLocalQuery(),
            "local-news",
            6
        );


    } catch (error) {

        console.error(
            "Location update error:",
            error
        );


        if (locationUpdateMessage) {

            locationUpdateMessage.textContent =
                error.message ||
                "Unable to update location";

            locationUpdateMessage.className =
                "profile-update-message error";

        }

    } finally {

        saveLocationButton.disabled =
            false;

        saveLocationButton.textContent =
            "Save Location";

    }

}


if (saveLocationButton) {

    saveLocationButton.addEventListener(
        "click",
        saveLocation
    );

}


/* =====================================================
   CHANGE LOCATION BUTTON
   ===================================================== */

if (changeLocationButton) {

    changeLocationButton.addEventListener(
        "click",
        () => {

            openProfile();

            setTimeout(
                () => {

                    profileState?.focus();

                },
                250
            );

        }
    );

}


/* =====================================================
   LOCATION BADGE CLICK
   ===================================================== */

if (locationBadge) {

    locationBadge.style.cursor =
        "pointer";

    locationBadge.title =
        "Change your location";


    locationBadge.addEventListener(
        "click",
        () => {

            openProfile();

            setTimeout(
                () => {

                    profileState?.focus();

                },
                250
            );

        }
    );

}


/* =====================================================
   LANGUAGE BADGE CLICK
   ===================================================== */

if (languageBadge) {

    languageBadge.style.cursor =
        "pointer";

    languageBadge.title =
        "Change language";


    languageBadge.addEventListener(
        "click",
        () => {

            openProfile();

            setTimeout(
                () => {

                    profileLanguage?.focus();

                },
                250
            );

        }
    );

}


/* =====================================================
   LANGUAGE SAVE
   ===================================================== */

if (saveLanguageButton) {

    saveLanguageButton.addEventListener(
        "click",
        saveLanguage
    );

}


async function saveLanguage() {

    const selected =
        profileLanguage?.value;


    if (!selected) {
        return;
    }


    saveLanguageButton.disabled =
        true;

    saveLanguageButton.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `${AUTH_API}/profile`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            languages:
                                [selected]

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update language"
            );

        }


        if (data.user) {

            user =
                data.user;

        }


        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        updateProfileUI();


        applyLanguage(
            selected
        );


        if (profileUpdateMessage) {

            profileUpdateMessage.textContent =
                "✓ Language updated successfully";

            profileUpdateMessage.className =
                "profile-update-message success";

        }


    } catch (error) {

        console.error(
            "Language update error:",
            error
        );


        if (profileUpdateMessage) {

            profileUpdateMessage.textContent =
                error.message ||
                "Unable to update language";

            profileUpdateMessage.className =
                "profile-update-message error";

        }

    } finally {

        saveLanguageButton.disabled =
            false;

        saveLanguageButton.textContent =
            "Save Language";

    }

}


/* =====================================================
   LOGOUT
   ===================================================== */

if (profileLogout) {

    profileLogout.addEventListener(
        "click",
        logout
    );

}


function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";

}


/* =====================================================
   LANGUAGE TRANSLATIONS
   ===================================================== */

const translations = {

    English: {

        world: "World",
        india: "India",
        regional: "Regional",
        local: "Local",

        worldNews: "World News",
        indiaNews: "India News",
        regionalNews: "Regional News",
        localNews: "Local News",

        search: "Search",
        searchPlaceholder:
            "Search for news...",

        technology:
            "Technology",

        sports:
            "Sports",

        business:
            "Business",

        entertainment:
            "Entertainment",

        explore:
            "Explore News",

        exploreDescription:
            "Select a topic to discover more stories.",

        changeLocation:
            "Change Location",

        saveLocation:
            "Save Location",

        saveLanguage:
            "Save Language",

        logout:
            "🚪 Logout"

    },


    Telugu: {

        world:
            "ప్రపంచం",

        india:
            "భారతదేశం",

        regional:
            "ప్రాంతీయ",

        local:
            "స్థానిక",

        worldNews:
            "ప్రపంచ వార్తలు",

        indiaNews:
            "భారతదేశ వార్తలు",

        regionalNews:
            "ప్రాంతీయ వార్తలు",

        localNews:
            "స్థానిక వార్తలు",

        search:
            "వెతకండి",

        searchPlaceholder:
            "వార్తలను వెతకండి...",

        technology:
            "సాంకేతికత",

        sports:
            "క్రీడలు",

        business:
            "వ్యాపారం",

        entertainment:
            "వినోదం",

        explore:
            "వార్తలను అన్వేషించండి",

        exploreDescription:
            "మరిన్ని వార్తలను తెలుసుకోవడానికి అంశాన్ని ఎంచుకోండి.",

        changeLocation:
            "ప్రాంతాన్ని మార్చండి",

        saveLocation:
            "ప్రాంతాన్ని సేవ్ చేయండి",

        saveLanguage:
            "భాషను సేవ్ చేయండి",

        logout:
            "🚪 లాగ్ అవుట్"

    },


    Hindi: {

        world:
            "विश्व",

        india:
            "भारत",

        regional:
            "क्षेत्रीय",

        local:
            "स्थानीय",

        worldNews:
            "विश्व समाचार",

        indiaNews:
            "भारत समाचार",

        regionalNews:
            "क्षेत्रीय समाचार",

        localNews:
            "स्थानीय समाचार",

        search:
            "खोजें",

        searchPlaceholder:
            "समाचार खोजें...",

        technology:
            "प्रौद्योगिकी",

        sports:
            "खेल",

        business:
            "व्यापार",

        entertainment:
            "मनोरंजन",

        explore:
            "समाचार खोजें",

        exploreDescription:
            "और समाचार देखने के लिए कोई विषय चुनें।",

        changeLocation:
            "स्थान बदलें",

        saveLocation:
            "स्थान सहेजें",

        saveLanguage:
            "भाषा सहेजें",

        logout:
            "🚪 लॉग आउट"

    }

};


/* =====================================================
   APPLY LANGUAGE
   ===================================================== */

function applyLanguage(
    language
) {

    const t =
        translations[
            language
        ] ||
        translations.English;


    document.documentElement.lang =
        language === "Telugu"
            ? "te"
            : language === "Hindi"
                ? "hi"
                : "en";


    /* NAVBAR */

    const navAnchors =
        navLinks?.querySelectorAll(
            "a"
        );


    if (navAnchors?.length >= 4) {

        navAnchors[0].textContent =
            t.world;

        navAnchors[1].textContent =
            t.india;

        navAnchors[2].textContent =
            t.regional;

        navAnchors[3].textContent =
            t.local;

    }


    /* SEARCH */

    if (searchInput) {

        searchInput.placeholder =
            t.searchPlaceholder;

    }


    if (searchButton) {

        searchButton.textContent =
            t.search;

    }


    /* QUICK NAV */

    const quickButtons =
        document.querySelectorAll(
            ".quick-nav"
        );


    quickButtons.forEach(
        button => {

            const section =
                button.dataset.section;


            const icon =
                button.textContent
                    .trim()
                    .split(" ")
                    [0];


            const map = {

                world:
                    t.world,

                india:
                    t.india,

                regional:
                    t.regional,

                local:
                    t.local,

                technology:
                    t.technology,

                sports:
                    t.sports,

                business:
                    t.business,

                entertainment:
                    t.entertainment

            };


            if (
                map[section]
            ) {

                button.textContent =
                    `${icon} ${map[section]}`;

            }

        }
    );


    /* LOCAL BUTTON */

    if (changeLocationButton) {

        changeLocationButton.textContent =
            t.changeLocation;

    }


    /* SAVE LOCATION */

    if (saveLocationButton) {

        saveLocationButton.textContent =
            t.saveLocation;

    }


    /* SAVE LANGUAGE */

    if (saveLanguageButton) {

        saveLanguageButton.textContent =
            t.saveLanguage;

    }


    /* LOGOUT */

    if (profileLogout) {

        profileLogout.textContent =
            t.logout;

    }


    /* SECTION TITLES */

    const worldHeading =
        document.querySelector(
            "#world h2"
        );

    if (worldHeading) {

        worldHeading.textContent =
            `🌍 ${t.worldNews}`;

    }


    const indiaHeading =
        document.querySelector(
            "#india h2"
        );

    if (indiaHeading) {

        indiaHeading.textContent =
            `🇮🇳 ${t.indiaNews}`;

    }


    if (regionalTitle) {

        regionalTitle.textContent =
            `🏛️ ${t.regionalNews}`;

    }


    const localHeading =
        document.querySelector(
            "#local h2"
        );

    if (localHeading) {

        localHeading.textContent =
            `📍 ${t.localNews}`;

    }


    /* EXPLORE */

    if (exploreTitle) {

        exploreTitle.textContent =
            t.explore;

    }


    if (exploreDescription) {

        exploreDescription.textContent =
            t.exploreDescription;

    }

}


/* =====================================================
   NEWS TRANSLATION
   ===================================================== */

function getTranslationLanguage() {

    const languages =
        Array.isArray(
            user?.languages
        )
            ? user.languages
            : ["English"];


    return (
        languages[0] ||
        "English"
    );

}


async function translateText(
    text,
    language
) {

    if (
        !text ||
        language === "English"
    ) {

        return text;

    }


    const languageCodes = {

        Telugu:
            "te",

        Hindi:
            "hi"

    };


    const target =
        languageCodes[
            language
        ];


    if (!target) {

        return text;

    }


    try {

        const url =
            "https://translate.googleapis.com/" +
            "translate_a/single" +
            "?client=gtx" +
            "&sl=auto" +
            `&tl=${target}` +
            "&dt=t" +
            `&q=${encodeURIComponent(text)}`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (
            Array.isArray(data) &&
            Array.isArray(data[0])
        ) {

            return data[0]
                .map(
                    part =>
                        part[0]
                )
                .join("");

        }

    } catch (error) {

        console.warn(
            "Translation failed:",
            error
        );

    }


    return text;

}


/* =====================================================
   SAFE TEXT
   ===================================================== */

function safe(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   BROWSER CACHE
   ===================================================== */

const browserCache =
    new Map();

const BROWSER_CACHE_TIME =
    60 * 1000;


/* =====================================================
   ACTIVE REQUESTS
   ===================================================== */

const activeRequests =
    new Map();


/* =====================================================
   LOAD NEWS
   ===================================================== */

async function loadNews(
    query,
    containerId,
    limit = 6
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    const cacheKey =
        `${query}-${limit}`;


    const cached =
        browserCache.get(
            cacheKey
        );


    if (
        cached &&
        Date.now() -
            cached.time <
            BROWSER_CACHE_TIME
    ) {

        renderNews(
            cached.articles,
            container
        );

        return;

    }


    if (
        activeRequests.has(
            cacheKey
        )
    ) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            Loading news...
        </div>
    `;


    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {

                controller.abort();

            },
            15000
        );


    activeRequests.set(
        cacheKey,
        controller
    );


    try {

        const response =
            await fetch(
                `${API_URL}?category=${encodeURIComponent(query)}`,
                {
                    cache:
                        "no-store",

                    signal:
                        controller.signal
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const articles =
            Array.isArray(
                data.articles
            )

                ? data.articles
                    .filter(
                        article =>
                            article &&
                            article.title &&
                            article.title !==
                                "[Removed]"
                    )
                    .slice(
                        0,
                        limit
                    )

                : [];


        browserCache.set(
            cacheKey,
            {

                time:
                    Date.now(),

                articles

            }
        );


        if (
            articles.length === 0
        ) {

            container.innerHTML = `
                <div class="loading">
                    No news found.
                </div>
            `;

            return;

        }


        renderNews(
            articles,
            container
        );


    } catch (error) {

        console.error(
            "News error:",
            error
        );


        container.innerHTML = `
            <div class="loading">

                Unable to load news.

                <br><br>

                <button
                    class="retry-button"
                >
                    Try Again
                </button>

            </div>
        `;


        container
            .querySelector(
                ".retry-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    browserCache.delete(
                        cacheKey
                    );

                    loadNews(
                        query,
                        containerId,
                        limit
                    );

                }
            );


    } finally {

        clearTimeout(
            timeout
        );

        activeRequests.delete(
            cacheKey
        );

    }

}


/* =====================================================
   RENDER NEWS
   ===================================================== */

function renderNews(
    articles,
    container
) {

    container.innerHTML =
        "";


    articles.forEach(
        (article, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "news-card";


            if (
                index === 0
            ) {

                card.classList.add(
                    "featured"
                );

            }


            /* IMAGE */

            const imageBox =
                document.createElement(
                    "div"
                );


            imageBox.className =
                "news-image";


            if (
                article.urlToImage
            ) {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    article.urlToImage;

                image.alt =
                    article.title ||
                    "News";

                image.loading =
                    "lazy";

                image.onerror =
                    () => {

                        imageBox.innerHTML =
                            "📰";

                    };

                imageBox.appendChild(
                    image
                );

            } else {

                imageBox.textContent =
                    "📰";

            }


            /* CONTENT */

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "news-content";


            /* SOURCE */

            const source =
                document.createElement(
                    "span"
                );


            source.className =
                "news-source";


            source.textContent =
                article.source?.name ||
                "News";


            /* TITLE */

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                article.title ||
                "Untitled News";


            title.dataset.original =
                article.title ||
                "";


            /* DESCRIPTION */

            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                article.description ||
                "Read the latest details about this story.";


            description.dataset.original =
                article.description ||
                "";


            /* DATE */

            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "news-meta";


            if (
                article.publishedAt
            ) {

                meta.textContent =
                    new Date(
                        article.publishedAt
                    ).toLocaleDateString(
                        "en-IN",
                        {

                            day:
                                "numeric",

                            month:
                                "short",

                            year:
                                "numeric"

                        }
                    );

            }


            /* LINK */

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                article.url ||
                "#";


            link.target =
                "_blank";


            link.rel =
                "noopener noreferrer";


            link.textContent =
                "Read Full Story →";


            /* BUILD */

            content.appendChild(
                source
            );

            content.appendChild(
                title
            );

            content.appendChild(
                description
            );

            content.appendChild(
                meta
            );

            content.appendChild(
                link
            );


            card.appendChild(
                imageBox
            );

            card.appendChild(
                content
            );


            container.appendChild(
                card
            );

        }
    );


    translateNewsCards(
        container
    );

}


/* =====================================================
   TRANSLATE NEWS CARDS
   ===================================================== */

async function translateNewsCards(
    container
) {

    const language =
        getTranslationLanguage();


    if (
        language ===
        "English"
    ) {

        return;

    }


    const titles =
        container.querySelectorAll(
            "h3[data-original]"
        );


    const descriptions =
        container.querySelectorAll(
            "p[data-original]"
        );


    for (
        const title of titles
    ) {

        const original =
            title.dataset.original;


        if (original) {

            title.textContent =
                await translateText(
                    original,
                    language
                );

        }

    }


    for (
        const description
        of descriptions
    ) {

        const original =
            description.dataset.original;


        if (original) {

            description.textContent =
                await translateText(
                    original,
                    language
                );

        }

    }

}


/* =====================================================
   MAIN NEWS SECTIONS
   ===================================================== */

async function loadMainSections() {

    await Promise.all([

        loadNews(
            "world",
            "world-news",
            6
        ),

        loadNews(
            "india",
            "india-news",
            6
        )

    ]);


    setTimeout(
        () => {

            loadNews(
                user?.state ||
                    "Andhra Pradesh",
                "regional-news",
                6
            );


            loadNews(
                buildLocalQuery(),
                "local-news",
                6
            );

        },
        150
    );

}


/* =====================================================
   LOCAL QUERY
   ===================================================== */

function buildLocalQuery() {

    if (!user) {

        return "India";

    }


    const city =
        user.city ||
        "";


    const district =
        user.district ||
        "";


    const state =
        user.state ||
        "";


    if (
        city &&
        district
    ) {

        return `${city} ${district}`;

    }


    if (city) {

        return city;

    }


    if (district) {

        return district;

    }


    return state ||
        "India";

}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollToSection(
    id
) {

    document
        .getElementById(id)
        ?.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

}


/* =====================================================
   TOPICS
   ===================================================== */

function loadTopic(
    topic
) {

    const niceName =
        topic.charAt(0).toUpperCase() +
        topic.slice(1);


    if (exploreTitle) {

        exploreTitle.textContent =
            `📰 ${niceName} News`;

    }


    if (exploreDescription) {

        exploreDescription.textContent =
            `Latest ${niceName.toLowerCase()} stories selected for you.`;

    }


    loadNews(
        topic,
        "explore-news",
        12
    );


    document
        .getElementById(
            "explore-results"
        )
        ?.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

}


/* =====================================================
   QUICK NAVIGATION
   ===================================================== */

document
    .querySelectorAll(
        ".quick-nav"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".quick-nav"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    this.classList.add(
                        "active"
                    );


                    const section =
                        this.dataset.section;


                    if (
                        [
                            "world",
                            "india",
                            "regional",
                            "local"
                        ].includes(
                            section
                        )
                    ) {

                        scrollToSection(
                            section
                        );

                    } else {

                        loadTopic(
                            section
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   TOPIC CARDS
   ===================================================== */

document
    .querySelectorAll(
        ".topic-card"
    )
    .forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    loadTopic(
                        card.dataset.section
                    );

                }
            );

        }
    );


/* =====================================================
   SEARCH
   ===================================================== */

if (searchButton) {

    searchButton.addEventListener(
        "click",
        () => {

            const query =
                searchInput.value.trim();


            if (!query) {
                return;
            }


            loadTopic(
                query
            );

        }
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                searchButton.click();

            }

        }
    );

}


/* =====================================================
   START APPLICATION
   ===================================================== */

async function startApp() {

    await loadUserProfile();

    await loadProfileStates();

    const selectedLanguage =
        user?.languages?.[0] ||
        "English";


    applyLanguage(
        selectedLanguage
    );


    loadMainSections();

}


/* =====================================================
   START
   ===================================================== */

startApp();