
(() => {
    "use strict";

    const input = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchBox = document.querySelector(".search-box");

    if (!input || !searchButton || !searchBox) {
        console.error("NewsHub: Search elements not found.");
        return;
    }

    // Avoid adding the autocomplete twice.
    if (document.getElementById("newsHubSuggestions")) {
        return;
    }

    const style = document.createElement("style");

    style.textContent = `
        .nh-suggestions {
            position: absolute !important;
            top: calc(100% + 10px) !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 99999 !important;
            display: none;
            padding: 10px !important;
            background: #ffffff !important;
            color: #25223b !important;
            border: 1px solid #e7e3f2 !important;
            border-radius: 18px !important;
            box-shadow: 0 14px 36px rgba(40, 30, 80, 0.12) !important;
            max-height: 360px !important;
            overflow-y: auto !important;
        }

        .nh-suggestions.visible {
            display: block !important;
        }

        .nh-suggestion-heading {
            padding: 9px 12px !important;
            background: #ffffff !important;
            color: #827b99 !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            letter-spacing: 1px !important;
        }

        .nh-suggestions .nh-suggestion {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            width: 100% !important;
            margin: 0 0 3px !important;
            padding: 11px 12px !important;
            background: #ffffff !important;
            background-image: none !important;
            color: #25223b !important;
            border: none !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            text-align: left !important;
            cursor: pointer !important;
            font: inherit !important;
            transition: background 150ms ease !important;
        }

        .nh-suggestions .nh-suggestion:hover,
        .nh-suggestions .nh-suggestion.active {
            background: #f1edff !important;
            color: #25223b !important;
        }

        .nh-suggestions .nh-suggestion-icon {
            display: grid !important;
            place-items: center !important;
            flex: 0 0 38px !important;
            width: 38px !important;
            height: 38px !important;
            background: #f4f1ff !important;
            border: 1px solid #e8e2ff !important;
            border-radius: 11px !important;
            font-size: 17px !important;
        }

        .nh-suggestions .nh-suggestion-copy {
            flex: 1 !important;
            min-width: 0 !important;
        }

        .nh-suggestions .nh-suggestion-title {
            display: block !important;
            color: #29243f !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            line-height: 1.5 !important;
        }

        .nh-suggestions .nh-suggestion-subtitle {
            display: block !important;
            margin-top: 3px !important;
            color: #817a98 !important;
            font-size: 12px !important;
        }

        .nh-suggestions .nh-suggestion-arrow {
            color: #9b90c9 !important;
            font-size: 18px !important;
        }

        .search-box {
            position: relative !important;
        }

        @media (max-width: 600px) {
            .nh-suggestions {
                max-height: 300px !important;
            }
        }
    `;

    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.id = "newsHubSuggestions";
    panel.className = "nh-suggestions";
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-label", "Search suggestions");

    searchBox.appendChild(panel);

    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", panel.id);

    const groups = [
        {
            icon: "🏏",
            category: "Cricket",
            terms: [
                "Virat Kohli",
                "Virat Kohli latest news",
                "Virat Kohli cricket news",
                "Bhuvneshwar Kumar",
                "Bhuvneshwar Kumar latest news",
                "Bhuvi cricket news",
                "Rohit Sharma",
                "Rohit Sharma latest news",
                "MS Dhoni",
                "Jasprit Bumrah",
                "Shubman Gill",
                "Indian cricket team",
                "IPL latest news"
            ]
        },
        {
            icon: "🎬",
            category: "Telugu Movies",
            terms: [
                "Best Telugu movies",
                "Best Telugu movies of 2026",
                "Latest Telugu movie news",
                "Telugu movie reviews",
                "Allu Arjun latest news",
                "Allu Arjun upcoming movies",
                "Prabhas latest news",
                "Prabhas upcoming movies",
                "Jr NTR latest news",
                "Ram Charan latest news",
                "Telugu OTT releases"
            ]
        },
        {
            icon: "🍿",
            category: "Hindi Movies",
            terms: [
                "Best Hindi movies",
                "Best Bollywood movies of 2026",
                "Latest Bollywood movie news",
                "Hindi movie reviews",
                "Shah Rukh Khan latest news",
                "Salman Khan upcoming movies",
                "Hindi OTT releases"
            ]
        },
        {
            icon: "🌍",
            category: "General News",
            terms: [
                "Latest breaking news",
                "Latest India news",
                "Latest world news",
                "Andhra Pradesh latest news",
                "Telangana latest news",
                "Latest technology news",
                "Latest science news",
                "Latest business news"
            ]
        }
    ];

    const normalize = text => String(text || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    let suggestions = [];
    let activeIndex = -1;

    function getSuggestions(query) {
        const q = normalize(query);

        if (q.length < 2) return [];

        const results = [];

        groups.forEach(group => {
            group.terms.forEach(term => {
                const t = normalize(term);
                let score = 0;

                if (t === q) score = 100;
                else if (t.startsWith(q)) score = 90;
                else if (t.includes(q)) score = 70;
                else if (q.split(" ").every(word =>
                    t.split(" ").some(part => part.startsWith(word))
                )) score = 60;

                if (score > 0) {
                    results.push({
                        text: term,
                        icon: group.icon,
                        category: group.category,
                        score
                    });
                }
            });
        });

        [
            [" latest news", "📰", "News search"],
            [" today", "📅", "Today's updates"],
            [" latest updates", "🔔", "Latest updates"]
        ].forEach(([suffix, icon, category]) => {
            const text = query.trim() + suffix;

            if (!results.some(item => normalize(item.text) === normalize(text))) {
                results.push({
                    text,
                    icon,
                    category,
                    score: 30
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 8);
    }

    function hide() {
        panel.classList.remove("visible");
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
        activeIndex = -1;
    }

    function choose(index) {
        const item = suggestions[index];

        if (!item) return;

        input.value = item.text;
        hide();
        searchButton.click();
    }

    function render() {
        suggestions = getSuggestions(input.value);
        activeIndex = -1;
        panel.replaceChildren();

        if (!suggestions.length) {
            hide();
            return;
        }

        const heading = document.createElement("div");
        heading.className = "nh-suggestion-heading";
        heading.textContent = "Suggested searches";
        panel.appendChild(heading);

        suggestions.forEach((item, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "nh-suggestion";
            button.setAttribute("role", "option");
            button.setAttribute("aria-selected", "false");
            button.id = `nh-suggestion-${index}`;

            const icon = document.createElement("span");
            icon.className = "nh-suggestion-icon";
            icon.textContent = item.icon;

            const copy = document.createElement("span");
            copy.className = "nh-suggestion-copy";

            const title = document.createElement("span");
            title.className = "nh-suggestion-title";
            title.textContent = item.text;

            const subtitle = document.createElement("span");
            subtitle.className = "nh-suggestion-subtitle";
            subtitle.textContent = item.category;

            const arrow = document.createElement("span");
            arrow.className = "nh-suggestion-arrow";
            arrow.textContent = "↗";

            copy.append(title, subtitle);
            button.append(icon, copy, arrow);

            button.addEventListener("click", () => choose(index));
            panel.appendChild(button);
        });

        panel.classList.add("visible");
        input.setAttribute("aria-expanded", "true");
    }

    function moveSelection(direction) {
        if (!suggestions.length) return;

        activeIndex = (activeIndex + direction + suggestions.length)
            % suggestions.length;

        panel.querySelectorAll(".nh-suggestion").forEach((button, index) => {
            const selected = index === activeIndex;

            button.classList.toggle("active", selected);
            button.setAttribute("aria-selected", String(selected));

            if (selected) {
                input.setAttribute("aria-activedescendant", button.id);
                button.scrollIntoView({ block: "nearest" });
            }
        });
    }

    input.addEventListener("input", render);

    input.addEventListener("focus", () => {
        if (input.value.trim().length >= 2) render();
    });

    input.addEventListener("keydown", event => {
        if (event.key === "ArrowDown" && panel.classList.contains("visible")) {
            event.preventDefault();
            moveSelection(1);
        } else if (
            event.key === "ArrowUp" &&
            panel.classList.contains("visible")
        ) {
            event.preventDefault();
            moveSelection(-1);
        } else if (
            event.key === "Enter" &&
            activeIndex >= 0 &&
            panel.classList.contains("visible")
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
            choose(activeIndex);
        } else if (event.key === "Escape") {
            hide();
        }
    });

    document.addEventListener("click", event => {
        if (!searchBox.contains(event.target)) hide();
    });

    searchButton.addEventListener("click", hide);

    console.log("NewsHub light autocomplete ready.");
})();
