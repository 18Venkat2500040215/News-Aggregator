const API_URL =
    "http://localhost:5000/api/auth";


// =========================================================
// ELEMENTS
// =========================================================

const stateSelect =
    document.getElementById(
        "signupState"
    );

const districtSelect =
    document.getElementById(
        "signupDistrict"
    );

const locationButton =
    document.getElementById(
        "locationButton"
    );

const locationStatus =
    document.getElementById(
        "locationStatus"
    );

const utBadge =
    document.getElementById(
        "utBadge"
    );


// =========================================================
// LOCATION DATA
// =========================================================

function getLocationDatabase() {

    return (
        window.indiaLocationData || {
            states: [],
            districts: {},
            ready: false
        }
    );

}


// =========================================================
// LOAD STATES
// =========================================================

function populateStates() {

    if (!stateSelect) {
        return;
    }


    const database =
        getLocationDatabase();


    stateSelect.innerHTML = `
        <option value="">
            Select State / UT
        </option>
    `;


    database.states.forEach(
        state => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                state;


            option.textContent =
                state;


            stateSelect.appendChild(
                option
            );

        }
    );


    stateSelect.disabled =
        false;


    if (database.ready) {

        if (locationStatus) {

            locationStatus.textContent =
                `${database.states.length} States/UTs available with district selection.`;

            locationStatus.style.color =
                "#16a34a";

        }

    } else {

        if (locationStatus) {

            locationStatus.textContent =
                "Location data could not be fully loaded. Please check your internet connection.";

            locationStatus.style.color =
                "#dc2626";

        }

    }

}


// =========================================================
// LOCATIONS READY
// =========================================================

window.addEventListener(
    "indiaLocationsReady",
    populateStates
);


// If data loaded before auth.js

if (
    window.indiaLocationData?.states?.length
) {

    populateStates();

}


// =========================================================
// STATE CHANGE
// =========================================================

if (stateSelect) {

    stateSelect.addEventListener(
        "change",
        updateDistricts
    );

}


// =========================================================
// UPDATE DISTRICTS
// =========================================================

function updateDistricts() {

    if (
        !stateSelect ||
        !districtSelect
    ) {

        return;

    }


    const state =
        stateSelect.value;


    districtSelect.innerHTML = `
        <option value="">
            Select District
        </option>
    `;


    districtSelect.disabled =
        true;


    if (utBadge) {

        utBadge.style.display =
            "none";

    }


    if (!state) {

        districtSelect.innerHTML = `
            <option value="">
                Select State First
            </option>
        `;

        return;

    }


    const database =
        getLocationDatabase();


    const districts =
        database.districts[
            state
        ] || [];


    if (
        window.indiaLocationData &&
        !database.ready
    ) {

        districtSelect.innerHTML = `
            <option value="">
                District data unavailable
            </option>
        `;

        return;

    }


    if (
        !districts.length
    ) {

        districtSelect.innerHTML = `
            <option value="">
                District not available
            </option>
        `;

    } else {

        districts.forEach(
            district => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    district;


                option.textContent =
                    district;


                districtSelect.appendChild(
                    option
                );

            }
        );


        districtSelect.disabled =
            false;

    }


    const isUT =
        [
            "Andaman and Nicobar Islands",
            "Chandigarh",
            "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi",
            "Jammu and Kashmir",
            "Ladakh",
            "Lakshadweep",
            "Puducherry"
        ].includes(
            state
        );


    if (
        utBadge &&
        isUT
    ) {

        utBadge.style.display =
            "inline-block";

    }

}


// =========================================================
// PASSWORD TOGGLE
// =========================================================

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {
        return;
    }


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";

        button.textContent =
            "Hide";

    } else {

        input.type =
            "password";

        button.textContent =
            "Show";

    }

}


// =========================================================
// PASSWORD STRENGTH
// =========================================================

const passwordInput =
    document.getElementById(
        "signupPassword"
    );

const passwordBar =
    document.getElementById(
        "passwordStrengthBar"
    );

const passwordStrengthText =
    document.getElementById(
        "passwordStrengthText"
    );


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        updatePasswordStrength
    );

}


function updatePasswordStrength() {

    if (
        !passwordInput ||
        !passwordBar
    ) {

        return;

    }


    const password =
        passwordInput.value;


    let score = 0;


    if (
        password.length >= 8
    ) {

        score++;

    }


    if (
        /[A-Z]/.test(
            password
        )
    ) {

        score++;

    }


    if (
        /[0-9]/.test(
            password
        )
    ) {

        score++;

    }


    if (
        /[^A-Za-z0-9]/.test(
            password
        )
    ) {

        score++;

    }


    const widths = [
        "0%",
        "25%",
        "50%",
        "75%",
        "100%"
    ];


    passwordBar.style.width =
        widths[score];


    if (
        passwordStrengthText
    ) {

        if (score === 0) {

            passwordStrengthText.textContent =
                "Use 8+ characters";

        } else if (
            score <= 1
        ) {

            passwordStrengthText.textContent =
                "Weak";

            passwordStrengthText.style.color =
                "#dc2626";

        } else if (
            score === 2
        ) {

            passwordStrengthText.textContent =
                "Fair";

            passwordStrengthText.style.color =
                "#d97706";

        } else if (
            score === 3
        ) {

            passwordStrengthText.textContent =
                "Good";

            passwordStrengthText.style.color =
                "#2563eb";

        } else {

            passwordStrengthText.textContent =
                "Strong";

            passwordStrengthText.style.color =
                "#16a34a";

        }

    }

}


// =========================================================
// LOCATION BUTTON
// =========================================================

if (locationButton) {

    locationButton.addEventListener(
        "click",
        detectLocation
    );

}


// =========================================================
// GPS LOCATION
// =========================================================

function detectLocation() {

    if (
        !navigator.geolocation
    ) {

        showLocationError(
            "Location is not supported by this browser."
        );

        return;

    }


    locationButton.disabled =
        true;


    locationButton.textContent =
        "📍 Detecting...";


    if (locationStatus) {

        locationStatus.textContent =
            "Requesting your browser location...";

        locationStatus.style.color =
            "#2563eb";

    }


    navigator.geolocation.getCurrentPosition(

        async position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                const response =
                    await fetch(
                        "https://api.bigdatacloud.net/data/reverse-geocode-client" +
                        `?latitude=${latitude}` +
                        `&longitude=${longitude}` +
                        `&localityLanguage=en`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Reverse geocoding failed"
                    );

                }


                const data =
                    await response.json();


                const detectedState =
                    data.principalSubdivision ||
                    data.principalSubdivisionCode ||
                    "";


                const detectedCity =
                    data.city ||
                    data.locality ||
                    data.localityInfo?.administrative?.[3]?.name ||
                    "";


                const database =
                    getLocationDatabase();


                let matchingState =
                    database.states.find(
                        state =>
                            state.toLowerCase() ===
                            String(
                                detectedState
                            ).toLowerCase()
                    );


                /*
                   Common reverse-geocoding variations.
                */

                if (!matchingState) {

                    matchingState =
                        database.states.find(
                            state => {

                                const a =
                                    state
                                        .toLowerCase();

                                const b =
                                    String(
                                        detectedState
                                    )
                                        .toLowerCase();

                                return (
                                    a.includes(b) ||
                                    b.includes(a)
                                );

                            }
                        );

                }


                if (
                    matchingState &&
                    stateSelect
                ) {

                    stateSelect.value =
                        matchingState;


                    updateDistricts();

                }


                if (
                    detectedCity
                ) {

                    const cityInput =
                        document.getElementById(
                            "signupCity"
                        );


                    if (cityInput) {

                        cityInput.value =
                            detectedCity;

                    }

                }


                locationButton.textContent =
                    "✓ Location Detected";


                locationButton.style.color =
                    "#16a34a";


                locationButton.style.borderColor =
                    "#bbf7d0";


                locationButton.style.background =
                    "#f0fdf4";


                if (locationStatus) {

                    locationStatus.textContent =
                        "Location detected. Please verify your State and District before continuing.";

                    locationStatus.style.color =
                        "#16a34a";

                }


            } catch (error) {

                console.error(
                    "Location error:",
                    error
                );


                showLocationError(
                    "Your location was detected, but we could not match the complete address. Please select it manually."
                );

            }


            locationButton.disabled =
                false;

        },


        error => {

            console.error(
                "GPS error:",
                error
            );


            locationButton.disabled =
                false;


            locationButton.textContent =
                "📍 Use My Location";


            if (
                error.code ===
                1
            ) {

                showLocationError(
                    "Location permission was denied. Allow location access in Chrome and try again."
                );

            } else if (
                error.code ===
                2
            ) {

                showLocationError(
                    "Your location could not be determined."
                );

            } else if (
                error.code ===
                3
            ) {

                showLocationError(
                    "Location request timed out. Please try again."
                );

            } else {

                showLocationError(
                    "Unable to detect your location."
                );

            }

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }

    );

}


// =========================================================
// LOCATION ERROR
// =========================================================

function showLocationError(
    message
) {

    if (locationStatus) {

        locationStatus.textContent =
            message;

        locationStatus.style.color =
            "#dc2626";

    }


    if (locationButton) {

        locationButton.disabled =
            false;

        locationButton.textContent =
            "📍 Use My Location";

    }

}


// =========================================================
// SIGNUP
// =========================================================

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "signupName"
                )
                    .value
                    .trim();


            const email =
                document.getElementById(
                    "signupEmail"
                )
                    .value
                    .trim();


            const password =
                document.getElementById(
                    "signupPassword"
                )
                    .value;


            const state =
                document.getElementById(
                    "signupState"
                )
                    .value;


            const district =
                document.getElementById(
                    "signupDistrict"
                )
                    .value;


            const city =
                document.getElementById(
                    "signupCity"
                )
                    .value
                    .trim();


            const languages =
                Array.from(
                    document.querySelectorAll(
                        'input[name="languages"]:checked'
                    )
                )
                    .map(
                        input =>
                            input.value
                    );


            const interests =
                Array.from(
                    document.querySelectorAll(
                        'input[name="interests"]:checked'
                    )
                )
                    .map(
                        input =>
                            input.value
                    );


            const message =
                document.getElementById(
                    "signupMessage"
                );


            const submitButton =
                document.getElementById(
                    "signupSubmit"
                );


            if (
                !state
            ) {

                message.textContent =
                    "Please select your State / Union Territory.";

                message.style.color =
                    "#dc2626";

                return;

            }


            if (
                !district
            ) {

                message.textContent =
                    "Please select your District.";

                message.style.color =
                    "#dc2626";

                return;

            }


            if (
                password.length < 8
            ) {

                message.textContent =
                    "Password must contain at least 8 characters.";

                message.style.color =
                    "#dc2626";

                return;

            }


            if (
                languages.length === 0
            ) {

                message.textContent =
                    "Please select at least one language.";

                message.style.color =
                    "#dc2626";

                return;

            }


            if (
                interests.length === 0
            ) {

                message.textContent =
                    "Please select at least one news interest.";

                message.style.color =
                    "#dc2626";

                return;

            }


            message.textContent =
                "Creating your personalized NewsHub profile...";


            message.style.color =
                "#2563eb";


            submitButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `${API_URL}/signup`,
                        {

                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name,
                                    email,
                                    password,
                                    state,
                                    district,
                                    city,
                                    languages,
                                    interests

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok
                ) {

                    message.textContent =
                        "✓ Account created. Taking you to NewsHub...";


                    message.style.color =
                        "#16a34a";


                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1200
                    );


                } else {

                    message.textContent =
                        data.message ||
                        "Unable to create account.";


                    message.style.color =
                        "#dc2626";


                    submitButton.disabled =
                        false;

                }


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );


                message.textContent =
                    "Unable to connect to the NewsHub server.";


                message.style.color =
                    "#dc2626";


                submitButton.disabled =
                    false;

            }

        }
    );

}


// =========================================================
// LOGIN
// =========================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                )
                    .value
                    .trim();


            const password =
                document.getElementById(
                    "loginPassword"
                )
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            message.textContent =
                "Signing you in...";


            message.style.color =
                "#2563eb";


            try {

                const response =
                    await fetch(
                        `${API_URL}/login`,
                        {

                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    email,
                                    password

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok
                ) {

                    message.textContent =
                        "Login successful.";

                    message.style.color =
                        "#16a34a";


                    localStorage.setItem(
                        "token",
                        data.token
                    );


                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "index.html";

                        },
                        700
                    );

                } else {

                    message.textContent =
                        data.message ||
                        "Invalid email or password.";

                    message.style.color =
                        "#dc2626";

                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                message.textContent =
                    "Unable to connect to the server.";

                message.style.color =
                    "#dc2626";

            }

        }
    );

}