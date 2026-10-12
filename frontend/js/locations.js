/* =========================================================
   NEWSHUB INDIA LOCATION DATA
   28 STATES + 8 UNION TERRITORIES

   The dataset is loaded from a public JSON source designed
   for Indian web applications.
========================================================= */

const INDIA_LOCATION_DATA_URL =
    "https://raw.githubusercontent.com/CodingMation/indian-states-districts/main/data/india_states_districts.min.json";


const fallbackStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
];


const unionTerritories = new Set([
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
]);


window.indiaLocationData = {
    states: [],
    districts: {},
    ready: false
};


function normalizeLocationData(data) {

    const result = {
        states: [],
        districts: {}
    };


    /*
       Format:
       {
           states: [
               {
                   code: "AP",
                   name: "Andhra Pradesh",
                   districts: [...]
               }
           ]
       }
    */

    if (
        data &&
        Array.isArray(data.states)
    ) {

        data.states.forEach(
            state => {

                const stateName =
                    state.name ||
                    state.state ||
                    state.title;


                if (!stateName) {
                    return;
                }


                let districts =
                    state.districts ||
                    [];


                districts =
                    districts
                        .map(
                            district => {

                                if (
                                    typeof district ===
                                    "string"
                                ) {

                                    return district;

                                }


                                return (
                                    district.name ||
                                    district.district ||
                                    district.title ||
                                    ""
                                );

                            }
                        )
                        .filter(Boolean);


                result.states.push(
                    stateName
                );


                result.districts[
                    stateName
                ] = districts;

            }
        );

    }


    /*
       Alternative format:
       [
           {
               state: "Andhra Pradesh",
               districts: [...]
           }
       ]
    */

    if (
        Array.isArray(data)
    ) {

        data.forEach(
            state => {

                const stateName =
                    state.name ||
                    state.state;


                if (!stateName) {
                    return;
                }


                const districts =
                    (
                        state.districts ||
                        []
                    )
                        .map(
                            district => {

                                if (
                                    typeof district ===
                                    "string"
                                ) {

                                    return district;

                                }


                                return (
                                    district.name ||
                                    district.district ||
                                    ""
                                );

                            }
                        )
                        .filter(Boolean);


                result.states.push(
                    stateName
                );


                result.districts[
                    stateName
                ] = districts;

            }
        );

    }


    /*
       Remove duplicate states.
    */

    result.states =
        [
            ...new Set(
                result.states
            )
        ];


    /*
       Sort states alphabetically.
    */

    result.states.sort(
        (a, b) =>
            a.localeCompare(
                b
            )
    );


    return result;
}


async function loadIndiaLocations() {

    try {

        const response =
            await fetch(
                INDIA_LOCATION_DATA_URL
            );


        if (!response.ok) {

            throw new Error(
                `Location data HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const normalized =
            normalizeLocationData(
                data
            );


        if (
            normalized.states.length < 30
        ) {

            throw new Error(
                "Location dataset is incomplete"
            );

        }


        window.indiaLocationData =
            {
                ...normalized,
                ready: true
            };


        console.log(
            "NewsHub location database loaded:",
            normalized.states.length,
            "States/UTs"
        );


    } catch (error) {

        console.error(
            "Location database error:",
            error
        );


        /*
           Fallback state list.
           Districts will be empty only if the
           remote dataset is unavailable.
        */

        const districts = {};


        fallbackStates.forEach(
            state => {

                districts[state] =
                    [];

            }
        );


        window.indiaLocationData =
            {
                states:
                    [...fallbackStates].sort(
                        (a, b) =>
                            a.localeCompare(
                                b
                            )
                    ),

                districts,

                ready: false
            };

    }


    window.dispatchEvent(
        new CustomEvent(
            "indiaLocationsReady"
        )
    );

}


loadIndiaLocations();