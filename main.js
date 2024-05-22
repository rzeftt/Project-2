let selectedCurrencies = []; // משתנה גלובלי

document.addEventListener("DOMContentLoaded", function () {
    function displayHomeContent() {
        // קריאה לפונקציה שמציגה את הכרטיסים

        fetch('https://api.coingecko.com/api/v3/coins/list')
            .then(response => {
                if (response.status >= 400) {
                    return fetchBackup();
                } else {
                    return response.json()
                }
            })
            .then(json => displayCurrencyNames(json))
            .catch(error => console.error("Error fetching currency list:", error));
    }

});



// פונקציה שמציגה את התוכן בעמוד הראשי

// Clear content when clicking on Live Reports or About
document.getElementById("reportsLink").addEventListener("click", liveReports);




function liveReports() {
    document.getElementById("divCard").innerHTML = `<div class="bonus></div>`;
    document.getElementById("divCard").innerText = `בונוס`;
    searchContainer.style.display = 'none';
    searchBtn.style.display = 'none';
    hideParallaxImage();
}

// קביעת פעולה ללחיצה על HOME
document.getElementById("homeLink").addEventListener("click", function (event) {
    event.preventDefault(); // מניעת התנהגות ברירת המחדל של הקישור
    displayHomeContent(); // קריאה לפונקציה שמציגה את התוכן בעמוד הראשי
    searchContainer.style.display = 'none';
    searchBtn.style.display = 'none';
});

// Fetching currency list and displaying currency names
displayHomeContent(); // מציג את הכרטיסים בעת טעינת הדף

// פונקציה שמציגה את התוכן בעמוד הראשי
function displayHomeContent() {
    // Add these lines at appropriate places in your code
    // Show the progress bar advancing in increments
    function showProgressBar() {
        const progressBar = document.getElementById('progressBar');
        let width = 0;
        const interval = setInterval(() => {
            width += 10;
            progressBar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
            }
        }, 500); // Adjust interval time (in milliseconds) for the progress increments
    }

    // Call showProgressBar immediately upon page load
    showProgressBar();

    fetch('https://api.coingecko.com/api/v3/coins/list')
        .then(response => {
            return response.json();
        })
        .then(json => {
            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = '100%'; // Set progress to 100% once data is loaded
            setTimeout(() => {
                progressBar.style.display = 'none'; // Hide the progress bar after a delay
            }, 300); // Adjust delay as needed for smooth transition
            displayCurrencyNames(json);
        })
        .catch(error => {
            console.error("Error fetching currency list:", error);
        });
}
function displayCurrencyNames(json) {

    const divCardCurrency = document.getElementById("divCard");
    divCardCurrency.innerHTML = "";

    for (let i = 0; i < 24; i++) {/*let i = 0; i < json.length; i++*/
        divCardCurrency.innerHTML +=
            `<div class="card" style="width: 17rem; height: 20rem; overflow: auto;">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h5 class="card-title">${json[i].symbol}</h5>
                    <label class="switch" style="margin-left: 10px;">
                        <input type="checkbox" class="toggleButton" value="${json[i].symbol}" onchange="handleToggle(this, '${json[i].symbol}')">
                        <span class="slider round"></span>
                    </label>
                </div>
                <p class="card-text">${json[i].name}</p>
                <button  class="btn btn-primary" id="moreInfoBtn${i}">More Info</button>
                <div id="additionalInfo${i}" class="additional-info" style="display: none;"></div>
            </div>
        </div>`;
    }

    // Adding event listeners for more info buttons
    for (let i = 0; i < 24; i++) {/*let i = 0; i < json.length; i++*/
        const moreInfoBtn = document.getElementById(`moreInfoBtn${i}`);
        const additionalInfo = document.getElementById(`additionalInfo${i}`);
        let isContentVisible = false; // Variable to track the current state of the content
        let cachedData = null; // Variable to store cached data

        moreInfoBtn.addEventListener('click', function () {
            // If content is visible, hide it
            if (isContentVisible) {
                additionalInfo.style.display = 'none';
                isContentVisible = false
            } else {
                // If there are cached data and they are less than 2 minutes old, display them
                if (cachedData && (new Date().getTime() - cachedData.timestamp < 120000)) {
                    displayCachedData(cachedData);
                } else {
                    // Otherwise, make a request to the server
                    fetchAdditionalInfoAndDisplayShape();
                }
            }
        });

        function displayCachedData(data) {
            additionalInfo.innerHTML = data.html;
            additionalInfo.style.display = 'block';
            isContentVisible = true;
            console.log("Data source: Cache");
        }

        function fetchAdditionalInfoAndDisplayShape() {
            // When making a request to the
            const url = `https://api.coingecko.com/api/v3/coins/${json[i].id}`;
            additionalInfo.innerHTML = 'Loading...';
            additionalInfo.style.display = 'block';

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch currency info');
                    }
                    return response.json();
                })
                .then(json => {
                    const currencySymbols = {
                        usd: '$',
                        eur: '€',
                        ils: '₪'
                    };

                    const infoHtml = `
                    <img src="${json.image.small}" alt="Currency Image">
                    <p>USD: ${json.market_data.current_price.usd} ${currencySymbols.usd}</p>
                    <p>EUR: ${json.market_data.current_price.eur} ${currencySymbols.eur}</p>
                    <p>ILS: ${json.market_data.current_price.ils} ${currencySymbols.ils}</p>
                `;

                    // Storing data in cache
                    const currentTime = new Date().getTime();
                    cachedData = {
                        html: infoHtml,
                        timestamp: currentTime,
                        source: "API"
                    };

                    localStorage.setItem('cachedData', JSON.stringify(cachedData));

                    additionalInfo.innerHTML = infoHtml;
                    additionalInfo.style.display = 'block';
                    isContentVisible = true;
                    console.log("Data source: API");

                    // Removing data from cache after two minutes
                    setTimeout(() => {
                        searchBtn
                        localStorage.removeItem('cachedData');
                        console.log("Cached data removed");
                    }, 120000);
                })
                .catch(error => {
                    console.error("Error fetching additional currency info:", error);
                    additionalInfo.innerHTML = 'Failed to fetch additional currency info';
                });
        }
    }
    // לעבור על אברי המערך ולהדליק כל מטבע
    for (let i = 0; i < selectedCurrencies.length; i++) {
        const coin = selectedCurrencies[i];
        const mainCardCheckbox = document.querySelector(`#divCard .toggleButton[value="${coin}"]`);
        if (mainCardCheckbox) {
            mainCardCheckbox.checked = true;
        }
    }
}



document.addEventListener("DOMContentLoaded", function () {
    // Function to handle click on the search button
    document.getElementById("searchBtn").addEventListener("click", function () {
        const input = document.getElementById("countryName").value.toLowerCase();
        if (input === "") {
            displayNoInputMessage();
            return;
        }
        // Request to the server to get the list of currencies
        fetch('https://api.coingecko.com/api/v3/coins/list')
            .then(response => response.json())
            .then(json => {
                // Finding the currency in the currency list based on the input
                const currency = json.find(item => item.symbol.toLowerCase() === input);
                if (currency) {
                    // If the currency is found, display it
                    displaySingleCurrencyCard(currency);
                } else {
                    // If the currency is not found, display a "No Results" message
                    displayNoResultsMessage();
                }
            })
            .catch(error => console.error("Error fetching currency list:", error));
    });
});
function displaySingleCurrencyCard(currency) {
    const divCardCurrency = document.getElementById("divCard");
    divCardCurrency.innerHTML = `
        <div class="card" style="width: 17rem; height: 20rem; overflow: auto;">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h5 class="card-title">${currency.symbol}</h5>
                    <label class="switch" style="margin-left: 10px;">
                        <input type="checkbox" class="toggleButton" value="${currency.symbol}" onchange="handleToggle(this, '${currency.symbol}')">
                        <span class="slider round"></span>
                    </label>
                </div>
                <p class="card-text">${currency.name}</p>
                <button class="btn btn-primary" id="moreInfoBtnSingle${currency.symbol}">More Info</button>
                <div id="additionalInfoSingle${currency.symbol}" class="additional-info" style="display: none;"></div>
            </div>
        </div>`;

    const backToHomeBtn = document.createElement("div");
    backToHomeBtn.innerHTML = `<div class="button">Back to Home <div class="arrow"></div></div>`;
    backToHomeBtn.classList.add("back-to-home-btn");
    backToHomeBtn.addEventListener("click", function () {
        displayHomeContent();
    });

    divCardCurrency.appendChild(backToHomeBtn);

    const moreInfoBtnSingle = document.getElementById(`moreInfoBtnSingle${currency.symbol}`);
    const additionalInfoSingle = document.getElementById(`additionalInfoSingle${currency.symbol}`);
    moreInfoBtnSingle.addEventListener("click", function () {
        if (additionalInfoSingle.style.display === 'block') {
            additionalInfoSingle.style.display = 'none';
        } else {
            additionalInfoSingle.style.display = 'block';
            fetchAdditionalInfoAndDisplayShape(currency.id, additionalInfoSingle);
        }
    });

}
function fetchAdditionalInfoAndDisplayShape(id, additionalInfo) {
    const cachedData = JSON.parse(localStorage.getItem(`cachedData_${id}`));
    const currentTime = new Date().getTime();

    if (cachedData && (currentTime - cachedData.timestamp < 120000)) {
        additionalInfo.innerHTML = cachedData.html;
        additionalInfo.style.display = 'block';
        console.log("Data source: Cache");
    } else {
        const url = `https://api.coingecko.com/api/v3/coins/${id}`;
        additionalInfo.innerHTML = 'Loading...';
        additionalInfo.style.display = 'block';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch currency info');
                }
                return response.json();
            })
            .then(json => {
                const currencySymbols = {
                    usd: '$',
                    eur: '€',
                    ils: '₪'
                };

                const infoHtml = `
                    <img src="${json.image.small}" alt="Currency Image">
                    <p>USD: ${json.market_data.current_price.usd} ${currencySymbols.usd}</p>
                    <p>EUR: ${json.market_data.current_price.eur} ${currencySymbols.eur}</p>
                    <p>ILS: ${json.market_data.current_price.ils} ${currencySymbols.ils}</p>
                `;

                const cachedData = {
                    html: infoHtml,
                    timestamp: currentTime,
                    source: "API"
                };

                localStorage.setItem(`cachedData_${id}`, JSON.stringify(cachedData));

                additionalInfo.innerHTML = infoHtml;
                console.log("Data source: API");

                setTimeout(() => {
                    localStorage.removeItem(`cachedData_${id}`);
                    console.log("Cached data removed");
                }, 120000);
            })
            .catch(error => {
                console.error("Error fetching additional currency info:", error);
                additionalInfo.innerHTML = 'Failed to fetch additional currency info';
            });
    }
}

function displayCachedData(data, additionalInfo) {
    additionalInfo.innerHTML = data.html;
    additionalInfo.style.display = 'block';
    console.log("Data source: Cache");
}
function displayNoResultsMessage() {
    const divCardCurrency = document.getElementById("divCard");
    divCardCurrency.innerHTML = `<p>No results found):.</p>`;

    const backToHomeBtn = document.createElement("div");

    backToHomeBtn.innerHTML = `  <div class="button">Back to Home <div Back to Home class ="arrow"></div></div>`;
    backToHomeBtn.addEventListener("click", function () {
        displayHomeContent();
    });

    divCardCurrency.appendChild(backToHomeBtn);
}
function displayNoInputMessage() {
    alert("No input provided.");
}

document.addEventListener("DOMContentLoaded", function () {
    const countryNameInput = document.getElementById("countryName");
    const clearInputBtn = document.getElementById("clearInputBtn");

    countryNameInput.addEventListener("click", function () {
        showClearButton();
    });

    document.addEventListener("click", function (event) {
        const isClickInsideInput = countryNameInput.contains(event.target);
        if (!isClickInsideInput) {
            hideClearButton();
        }
    });

    clearInputBtn.addEventListener("click", function () {
        countryNameInput.value = "";
        hideClearButton();
    });


    function showClearButton() {
        clearInputBtn.style.display = "block";
    }

    function hideClearButton() {
        clearInputBtn.style.display = "none";
    }
});

// Filter out elements from the array based on toggle button checked status
const checkedCurrencies = selectedCurrencies.filter(currency => {
    const mainCardCheckbox = document.querySelector(`#divCard .toggleButton[value="${currency}"]`);
    return mainCardCheckbox.checked;
});

console.log(checkedCurrencies);


function hideParallaxImage() {
    const parallaxImage = document.querySelector('.parallax');
    if (parallaxImage) {
        parallaxImage.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const aboutLink = document.getElementById("aboutLink");
    const divCardCurrency = document.getElementById("divCard");
    aboutLink.addEventListener("click", function (event) {
        event.preventDefault();
    searchContainer.style.display = 'none';
    searchBtn.style.display = 'none';
        divCardCurrency.innerHTML = `
            <div class="container">
                <div class="circle">
                    <img src="assets/images/IMG_0306.JPG" alt="Your Image">
                </div>
                </div>
            </div>
            <div class="aboutMe">הי אני רייזי <br>!שמחה להיפגש אתכם כאן<br>אז קצת עלי....<br>אני בת 22 <br>נשואה עם ילד<br>גרה בבית וגן , בירושלים<br>וזהו.. מנסה לתמרן בין העבודה ללימודים , ולבית
        <br>והנה אני כאן ):</div>
<div class ="aboutProject">פרויקט Cryptonite הוא אפליקציית אינטרנט מתקדמת שנועדה לספק למשתמשים תובנות בזמן אמת על העולם ההולך ומתפתח של מטבעות קריפטוגרפיים. עם <br>ממשק אלגנטי ואינטואיטיבי, Cryptonite מציע חוויה חלקה למעקב, ניתוח והתעדכנות במטבעות דיגיטליים שונים.
<br>הלב של Cryptonite טמון בתכונות הדינמיות שלו, המאפשרות למשתמשים לחקור ולנטר ללא מאמץ מגוון רחב של מטבעות קריפטוגרפיים בכמה קליקים בלבד. <br>מדוחות חיים המציגים את המגמות האחרונות בשוק ועד למידע מפורט על מטבעות בודדים, Cryptonite מאפשרת למשתמשים לקבל החלטות מושכלות בתחום <br>המהיר של נכסים דיגיטליים.<br>יתר על כן, Cryptonite חורג מהצגת נתונים בלבד על ידי מתן מגע מותאם אישית. משתמשים יכולים לאצור את הבחירה שלהם של עד 5 מטבעות מועדפים, מה <br>שמאפשר חוויה מותאמת המשקפת את תחומי העניין ואת אסטרטגיות ההשקעה הייחודיות שלהם. האלמנטים האינטראקטיביים, כגון החלפת מטבעות וגישה למידע <br>מפורט על השוק, משפרים את מעורבות המשתמש ומבטיחים הבנה מקיפה של נוף הקריפטו.<br>על ידי מיזוג פונקציונליות עם אסתטיקה, Cryptonite ממציא את המהות של חדשנות ועיצוב ממוקד משתמש. בין אם אתה סוחר ותיק, חובב סקרן או טירון בעולם <br>המטבעות הקריפטוגרפיים, Cryptonite הוא השער שלך לשפע של מידע ומסע אל התחום המרגש של פיננסים דיגיטליים. חקור, חווה והעצים את עצמך באמצעות <br>Cryptonite - היכן שעתיד הפיננסים פוגש שימושיות חלקה.</div>
        `;
    });

    document.getElementById("btnExit").addEventListener("click", onModalSaveChanges);

    let additionalCoin = undefined;
    window.handleToggle = function (checkbox, symbol) {

        if (checkbox.checked) {
            if (selectedCurrencies.length == 5) {
                additionalCoin = symbol;
                checkbox.checked = false;
                displaySelectedCurrenciesInModal();
                $('#selectedCurrenciesModal').modal('show');
            }
            addOrRemoveCurrency(symbol, 'add');
        } else {
            addOrRemoveCurrency(symbol, 'remove');
            removeCardFromMain(symbol);
        }


    }

    window.addOrRemoveCurrency = function (currency, action) {
        if (action === 'add') {
            if (selectedCurrencies.length < 5) {
                selectedCurrencies.push(currency);
                console.log(selectedCurrencies);
            }
        } else if (action === 'remove') {
            const index = selectedCurrencies.indexOf(currency);
            if (index !== -1) {
                selectedCurrencies.splice(index, 1);
                const modalCardCheckbox = document.querySelector(`#selectedCurrenciesBody .toggleButton[value="${currency}"]`);
                if (modalCardCheckbox) {
                    modalCardCheckbox.checked = false;
                }
            }
        }
    }

    window.removeCardFromMain = function (symbol) {
        const mainCardCheckbox = document.querySelector(`#divCard .toggleButton[value="${symbol}"]`);
        if (mainCardCheckbox) {
            mainCardCheckbox.checked = false;
        }
    }

    function onModalSaveChanges() {
        $('#selectedCurrenciesModal').modal('hide');
        // אם הסירו לפחות איבר אחד מהמערך
        if (selectedCurrencies.length < 5) {
            selectedCurrencies.push(additionalCoin);
            const mainCardCheckbox = document.querySelector(`#divCard .toggleButton[value="${additionalCoin}"]`);
            if (mainCardCheckbox) {
                mainCardCheckbox.checked = true;
            }
        }
        additionalCoin = undefined;

    }
    window.displaySelectedCurrenciesInModal = function () {
        const selectedCurrenciesList = document.getElementById("selectedCurrenciesBody");
        selectedCurrenciesList.innerHTML = "";

        if (selectedCurrencies.length > 5) {
            selectedCurrencies.pop();
        }

        selectedCurrencies.forEach(symbol => {
            const currencyItem = document.createElement("div");
            currencyItem.textContent = symbol;

            const removeButton = document.createElement("label");
            removeButton.classList.add("switch");
            removeButton.style.marginLeft = "10px";

            const removeInput = document.createElement("input");
            removeInput.type = "checkbox";
            removeInput.classList.add("toggleButton");
            removeInput.value = symbol;
            removeInput.checked = true;
            removeInput.addEventListener("change", function () {
                handleToggle(this, symbol);
            });

            const removeSpan = document.createElement("span");
            removeSpan.classList.add("slider", "round");

            removeButton.appendChild(removeInput);
            removeButton.appendChild(removeSpan);

            selectedCurrenciesList.appendChild(currencyItem);
            selectedCurrenciesList.appendChild(removeButton);
        });
    }
});
document.getElementById("spanHome").addEventListener("click", function (event) {
    event.preventDefault(); // מניעת התנהגות ברירת המחדל של הקישור
    displayHomeContent(); // קריאה לפונקציה שמציגה את התוכן בעמוד הראשי
    searchContainer.style.display = 'none';
    searchBtn.style.display = 'none';


});
document.getElementById("spanLive").addEventListener("click", function (event) {
    event.preventDefault(); // מניעת התנהגות ברירת המחדל של הקישור
    liveReports(); // קריאה לפונקציה שמציגה את התוכן בעמוד הראשי
    
    searchContainer.style.display = 'none';
    searchBtn.style.display = 'none';

});

function fetchBackup() {
    return [
        {
            "id": "01coin",
            "symbol": "zoc",
            "name": "01coin"
        },
        {
            "id": "0chain",
            "symbol": "zcn",
            "name": "Zus"
        },
        {
            "id": "0-knowledge-network",
            "symbol": "0kn",
            "name": "0 Knowledge Network"
        },
        {
            "id": "0-mee",
            "symbol": "ome",
            "name": "O-MEE"
        },
        {
            "id": "0vix-protocol",
            "symbol": "vix",
            "name": "0VIX Protocol"
        },
        {
            "id": "0vm",
            "symbol": "zerovm",
            "name": "0VM"
        },
        {
            "id": "0x",
            "symbol": "zrx",
            "name": "0x Protocol"
        },
        {
            "id": "0x0-ai-ai-smart-contract",
            "symbol": "0x0",
            "name": "0x0.ai: AI Smart Contract"
        },
        {
            "id": "0x404",
            "symbol": "xfour",
            "name": "0x404"
        },
        {
            "id": "0xaiswap",
            "symbol": "0xaiswap",
            "name": "0xAISwap"
        },
        {
            "id": "0xanon",
            "symbol": "0xanon",
            "name": "0xAnon"
        },
        {
            "id": "0xbet",
            "symbol": "0xbet",
            "name": "0xBET"
        },
        {
            "id": "0xblack",
            "symbol": "0xb",
            "name": "0xBlack"
        },
        {
            "id": "0xcoco",
            "symbol": "coco",
            "name": "0xCoco"
        },
        {
            "id": "0xconnect",
            "symbol": "0xcon",
            "name": "0xConnect"
        },
        {
            "id": "0xtools",
            "symbol": "0xt",
            "name": "0xTools"
        },
        {
            "id": "0xvault",
            "symbol": "vault",
            "name": "0xVault"
        },
        {
            "id": "0xvpn-org",
            "symbol": "vpn",
            "name": "0xVPN.org"
        },

        {
            "id": "4d-twin-maps-2",
            "symbol": "4dmaps",
            "name": "4D Twin Maps"
        }
    ]
}


function onAbout() {
    const spanAbout = document.getElementById("spanAbout");
    searchContainer.style.display = 'none';
    searchBtn.style.display = 'none';
    document.getElementById("divCard").innerHTML = `
    <div class="container">
        <div class="circle">
            <img src="assets/images/IMG_0306.JPG" alt="Your Image">
        </div>
        </div>
    </div>
    <div class="aboutMe">הי אני רייזי <br>!שמחה להיפגש אתכם כאן<br>אז קצת עלי....<br>אני בת 22 <br>נשואה עם ילד<br>גרה בבית וגן , בירושלים<br>וזהו.. מנסה לתמרן בין העבודה ללימודים , ולבית
<br>והנה אני כאן ):</div>
<div class ="aboutProject">פרויקט Cryptonite הוא אפליקציית אינטרנט מתקדמת שנועדה לספק למשתמשים תובנות בזמן אמת על העולם ההולך ומתפתח של מטבעות קריפטוגרפיים. עם <br>ממשק אלגנטי ואינטואיטיבי, Cryptonite מציע חוויה חלקה למעקב, ניתוח והתעדכנות במטבעות דיגיטליים שונים.
<br>הלב של Cryptonite טמון בתכונות הדינמיות שלו, המאפשרות למשתמשים לחקור ולנטר ללא מאמץ מגוון רחב של מטבעות קריפטוגרפיים בכמה קליקים בלבד. <br>מדוחות חיים המציגים את המגמות האחרונות בשוק ועד למידע מפורט על מטבעות בודדים, Cryptonite מאפשרת למשתמשים לקבל החלטות מושכלות בתחום <br>המהיר של נכסים דיגיטליים.<br>יתר על כן, Cryptonite חורג מהצגת נתונים בלבד על ידי מתן מגע מותאם אישית. משתמשים יכולים לאצור את הבחירה שלהם של עד 5 מטבעות מועדפים, מה <br>שמאפשר חוויה מותאמת המשקפת את תחומי העניין ואת אסטרטגיות ההשקעה הייחודיות שלהם. האלמנטים האינטראקטיביים, כגון החלפת מטבעות וגישה למידע <br>מפורט על השוק, משפרים את מעורבות המשתמש ומבטיחים הבנה מקיפה של נוף הקריפטו.<br>על ידי מיזוג פונקציונליות עם אסתטיקה, Cryptonite ממציא את המהות של חדשנות ועיצוב ממוקד משתמש. בין אם אתה סוחר ותיק, חובב סקרן או טירון בעולם <br>המטבעות הקריפטוגרפיים, Cryptonite הוא השער שלך לשפע של מידע ומסע אל התחום המרגש של פיננסים דיגיטליים. חקור, חווה והעצים את עצמך באמצעות <br>Cryptonite - היכן שעתיד הפיננסים פוגש שימושיות חלקה.</div>
`;
}

document.getElementById("showSelectedCurrenciesBtn").addEventListener("click", displaySelectedCurrencies);

function displaySelectedCurrencies() {
    const divCardCurrency = document.getElementById("divCard");
    const searchContainer = document.getElementById("searchContainer");
    const searchBtn = document.getElementById("showSelectedCurrenciesBtn2");

    if (!divCardCurrency || !searchContainer || !searchBtn) {
        console.error('One or more elements not found');
        return;
    }

    // הצגת אלמנטי החיפוש והכפתור
    searchContainer.style.display = 'block';
    searchBtn.style.display = 'inline-block';
    divCardCurrency.innerHTML = '';

    // קריאה לפונקציה להסתרת החיפוש והכפתור כאשר עוברים למקום אחר
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {

        }
    });

    // בקשה לשרת לקבלת כל רשימת המטבעות
    fetch('https://api.coingecko.com/api/v3/coins/list')
        .then(response => response.json())
        .then(json => {
            // שמירת נתונים מקומיים
            const selected = json.filter(item => selectedCurrencies.includes(item.symbol));
            displayCurrencyCards(selected);

            // שמירת הנתונים ב-global variable כדי להשתמש בהם בחיפוש
            window.currencyData = selected;
        })
        .catch(error => {
            console.error("Error fetching selected currencies:", error);
            divCardCurrency.innerHTML += `<p>Failed to fetch selected currencies.</p>`;
        });
}


function performSearch() {
    const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!searchValue) {
        alert("Please enter a currency symbol.");
        return;
    }

    const filteredCurrencies = window.currencyData.filter(currency => currency.symbol.toLowerCase().includes(searchValue));
    displayCurrencyCards(filteredCurrencies);
}


function clearInput() {
    document.getElementById('searchInput').value = '';
}

function displayCurrencyCards(currencies) {
    const divCardCurrency = document.getElementById("divCard");

    if (currencies.length === 0) {
        divCardCurrency.innerHTML = `<p>No selected currencies found.</p>`;
        return;
    }

    divCardCurrency.innerHTML = '';
    currencies.forEach((currency, index) => {
        divCardCurrency.innerHTML += `
            <div class="card" style="width: 17rem; height: 20rem; overflow: auto;">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h5 class="card-title">${currency.symbol}</h5>
                        <label class="switch" style="margin-left: 10px;">
                            <input type="checkbox" class="toggleButton" value="${currency.symbol}" onchange="handleToggle(this, '${currency.symbol}')" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <p class="card-text">${currency.name}</p>
                    <button class="btn btn-primary" id="moreInfoBtn${index}">More Info</button>
                    <div id="additionalInfo${index}" class="additional-info" style="display: none;"></div>
                </div>
            </div>`;
    });

    currencies.forEach((currency, index) => {
        const moreInfoBtn = document.getElementById(`moreInfoBtn${index}`);
        const additionalInfo = document.getElementById(`additionalInfo${index}`);
        moreInfoBtn.addEventListener("click", function () {
            if (additionalInfo.style.display === 'block') {
                additionalInfo.style.display = 'none';
            } else {
                additionalInfo.style.display = 'block';
                fetchAdditionalInfoAndDisplayShape(currency.id, additionalInfo);
            }
        });
    });
}

function fetchAdditionalInfoAndDisplayShape(id, additionalInfo) {
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    additionalInfo.innerHTML = 'Loading...';
    additionalInfo.style.display = 'block';

    const cachedData = JSON.parse(localStorage.getItem(`cachedData_${id}`));

    if (cachedData && (new Date().getTime() - cachedData.timestamp < 120000)) {
        additionalInfo.innerHTML = cachedData.html;
        additionalInfo.style.display = 'block';
        console.log("Data source: Cache");
    } else {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch currency info');
                }
                return response.json();
            })
            .then(json => {
                const currencySymbols = {
                    usd: '$',
                    eur: '€',
                    ils: '₪'
                };

                const infoHtml = `
                    <img src="${json.image.small}" alt="Currency Image">
                    <p>USD: ${json.market_data.current_price.usd} ${currencySymbols.usd}</p>
                    <p>EUR: ${json.market_data.current_price.eur} ${currencySymbols.eur}</p>
                    <p>ILS: ${json.market_data.current_price.ils} ${currencySymbols.ils}</p>`
                       
                    
                    const currentTime = new Date().getTime();
                        const cachedData = {
                            html: infoHtml,
                            timestamp: currentTime,
                            source: "API"
                        };
                        
                        localStorage.setItem(`cachedData_${ id }`, JSON.stringify(cachedData));
                        
                    additionalInfo.innerHTML = infoHtml;
                    additionalInfo.style.display = 'block';
                    console.log("Data source: API");
    
                    setTimeout(() => {
                        localStorage.removeItem(`cachedData_${ id }`);
                        console.log("Cached data removed");
                    }, 120000);
                })
                .catch(error => {
                    console.error("Error fetching additional currency info:", error);
                    additionalInfo.innerHTML = 'Failed to fetch additional currency info';
                });
        }

    }
    
    function handleToggle(checkbox, symbol) {
        if (checkbox.checked) {
            selectedCurrencies.push(symbol);
        } else {
            selectedCurrencies = selectedCurrencies.filter(item => item !== symbol);
        }
    }
    

// function getSelectedCurrencies() {
//     return selectedCurrencies;
// }

// // פונקציה שמקבלת את המטבעות הנבחרים ומציגה את התוצאות בגרף
// function displayCurrencyGraph(selectedCurrencies) {
//     // בניית ה-URL לשליחת בקשת API
//     let apiUrl = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + selectedCurrencies.join(',') + '&tsyms=USD';
    
//     // שליחת בקשת API לשרת
//     fetch(apiUrl)
//         .then(response => response.json())
//         .then(data => {
//             // מסדרים את התוצאות לפי קוד המטבע
//             let currenciesData = selectedCurrencies.map(currency => ({
//                 type: "line",
//                 showInLegend: true,
//                 name: currency,
//                 dataPoints: [{ x: new Date(), y: data[currency].USD }]
//             }));

//             // בניית תצוגת הגרף
//             var chart = new CanvasJS.Chart("chartContainer", {
//                 title: {
//                     text: "Currency Exchange Rates"
//                 },
//                 axisX: {
//                     title: "Time"
//                 },
//                 axisY: {
//                     title: "Price (USD)"
//                 },
//                 data: currenciesData
//             });
//             chart.render();
//         })
//         .catch(error => console.error('Error fetching data:', error));
// }

// // הוספת אירוע ללחיצה על הכפתור
// document.getElementById('reportsLink').addEventListener('click', function() {
//     // קריאה לפונקציה שמחזירה את המטבעות הנבחרים
//     let selectedCurrencies = getSelectedCurrencies();

//     // קריאה לפונקציה להצגת הגרף
//     displayCurrencyGraph(selectedCurrencies);

//     // עדכון נתוני הגרף כל 2 שניות
//     setInterval(() => {
//         displayCurrencyGraph(selectedCurrencies);
//     }, 2000);
// });
