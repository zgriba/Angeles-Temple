console.log("Qi flows through Angel's Temple!");


// 1. Select the elements on the page that we want to work with
const mainScene = document.querySelector('main');
const portalTrigger = document.querySelector('.portal-trigger');
const btnGarden = document.getElementById('btn-garden');
const btnOutside = document.getElementById('btn-outside');
const gardenSection = document.getElementById('temple-garden');

// 2. The function that takes us into the Garden and calls the Falcon (fetch)
function enterGarden() {
    console.log("Entering the Garden");

    // We add the class that triggers the CSS absorption animation
    mainScene.className = 'entered-garden';

    // If the Garden is empty, we send the Falcon (fetch) to retrieve it from garden.html
    if (gardenSection.innerHTML.trim() === "") {
        fetch('views/garden.html')
            .then(response => response.text())
            .then(data => {
                gardenSection.innerHTML = data;
                console.log("The Falcon has built the Garden!");

                // As soon as the Garden is built, we summon the Weather Falcon!
                fetchTempleWeather();
                setupGardenPavilions(); // <-- ENABLE CLICKING ON THE PAVILIONS!
            });
    } else {
        // We update the weather every time we enter the Garden
        fetchTempleWeather();
    }
}

// 3. The function that takes us back in front of the Torii Gate
function exitGarden() {
    console.log("Returning outside the Torii Gate");
    mainScene.className = '';
}

// 4. Bind functions to mouse clicks (Event Listeners)
portalTrigger.addEventListener('click', enterGarden);
btnGarden.addEventListener('click', enterGarden);
btnOutside.addEventListener('click', exitGarden); 

// Function that fetches live weather via an API (no API key required!)
function fetchTempleWeather() {
    // The exact coordinates for Heilbronn, Germany:
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=49.14&longitude=9.21&current_weather=true';

    fetch(weatherUrl)
        .then(response => response.json()) // Translate the API response into a JSON object
        .then(data => {
            console.log("Weather API Data received:", data);

            // Extract the temperature and wind speed from the JSON object
            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;

            // Displaying live data in the Garden
            const weatherBox = document.getElementById('temple-weather');
            if (weatherBox) {
                weatherBox.innerHTML = "⛩️ Heilbronn Dojo: <strong>" + temp + "°C</strong> &nbsp;|&nbsp; 🌬️ Wind: <strong>" + wind + "km/h</strong>";
            }
        })
        .catch(error => {
            console.error("The Weather Falcon encountered a storm:", error);
        });
}

// The function that enables clicks on the 4 Pavilions in the Garden
function setupGardenPavilions() {
    const courtyard = document.querySelector('.garden-courtyard');
    const modal = document.getElementById('chamber-modal');
    const modalTitle = document.getElementById('chamber-title');
    const modalBody = document.getElementById('chamber-body');
    const btnBack = document.getElementById('btn-back-courtyard');
    const cards = document.querySelectorAll('.pavilion-card');

    // When we click on any of the 4 Pavilions:
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const chamberType = card.getAttribute('data-chamber');

           // If we click on the DOJO, we enter the 3D Pagoda Building directly!
           if (chamberType === 'dojo') {
                enterPagodaDojo();
                return; // The "return" statement stops the function here, preventing it from opening the small modal!
            }

            // If we click on HALL OF SCROLLS, we enter the 3D Sacred Library directly!
            if (chamberType === 'scrolls') {
                enterHallOfScrolls();
                return;
            }

            // For the other 2 Pavilions (Monk, Tea House), we open the window from the Garden:
            courtyard.classList.add('hidden'); // Hide the court with the 4 cards
            modal.classList.remove('hidden'); // Display the Indoor Camera

            if (chamberType === 'monk') {
                modalTitle.textContent = "🧘‍♂️ THE MONK'S PATH";
                modalBody.innerHTML = "<p>Meditating on the Daily Sutra...</p>";
            } else if (chamberType === 'teahouse') {
                modalTitle.textContent = "🍵 THE TEA HOUSE";
                modalBody.innerHTML = "<p>Brewing tea for travelers...</p>";
            }
        });
    });

    // When we click the "<- Back to Courtyard" button:
    btnBack.addEventListener('click', () => {
        modal.classList.add('hidden');
        courtyard.classList.remove('hidden');
    });
}



