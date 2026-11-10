// We store the Pagoda database in this global drawer after the Falcon brings it.
let dojoDatabase = null;
let activeChamber = null;

// The function that converts 1, 2, 3, 4... into "1st Chamber", "2nd Chamber", "3rd Chamber", "4th Chamber"
function formatChamberOrdinal(num) {
    if (num === 1 || num === 21 || num === 31) return num + "st Chamber";
    if (num === 2 || num === 22 || num === 32) return num + "nd Chamber";
    if (num === 3 || num === 23 || num === 33) return num + "rd Chamber";
    return num + "th Chamber";
}

// The function that calculates the Shaolin Rank based on the Mastery percentage
function getShaolinRank(mastery) {
    if (mastery < 5) return "🪵 Initiate (Chuxue)";
    if (mastery < 20) return "🦅 Bronze Eagle (Duan 1-3)";
    if (mastery < 50) return "🐅 Silver Tiger (Duan 4-6)";
    if (mastery < 85) return "🐉 Golden Dragon (Shifu)";
    return "🔥 Grandmaster (Zongshi)";
}

// 1. ENTERING THE PAGODA BUILDING (Hides the Garden and the Sun!)
function enterPagodaDojo() {
    const mainScene = document.querySelector('main');
    const dojoSection = document.getElementById('temple-dojo');

    // We add the class that hides the Garden and the Sun and shows #temple-dojo
    mainScene.className = 'entered-dojo';

    // If the Pagoda hasn't been built in #temple-dojo yet, we send the Falcon to fetch dojo.html and dojo-db.json!
    if (dojoSection.innerHTML.trim() === "") {
        fetch('views/dojo.html')
            .then(response => response.text())
            .then(html => {
                dojoSection.innerHTML = html;

                // Now we fetch the Sacred Archive from database/dojo-db.json
                return fetch('database/dojo-db.json');
            })
            .then(response => response.json())
            .then(db => {
                dojoDatabase = db;
                setupPagodaNavigation();
                renderPagodaFloor(1); // We start on the Ground Floor (floorId = 1, i.e., Level 0: HTML5)
            })
            .catch(error => {
                console.error("Pagoda Falcon error:", error);
            });
    }
}

// 2. CONFIGURING THE TOP NAVIGATION (The "<- Garden" button and the Floors 0–5 drop-down menu)
function setupPagodaNavigation() {
    const mainScene = document.querySelector('main');
    const btnLeaveDojo = document.getElementById('btn-leave-dojo');
    const floorSelect = document.getElementById('floor-select');

    // The "<- Garden" button takes us out of the Pagoda and back into the Garden
    btnLeaveDojo.addEventListener('click', () => {
        mainScene.className = 'entered-garden';
    });

    // Populate the <select id="floor-select"> drop-down menu with the 6 floors (0 - 5)
    floorSelect.innerHTML = '';
    dojoDatabase.pagodaFloors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor.floorId;
        option.textContent = "Level " + floor.floorNumber + ": " + floor.weaponName;
        floorSelect.appendChild(option);
    });

    // When the user selects a different Floor from the drop-down menu (the 'change' event):
    floorSelect.addEventListener('change', () => {
        const chosenFloorId = Number(floorSelect.value);
        renderPagodaFloor(chosenFloorId);
    });

    // When the user selects a Room from the second drop-down menu at the top:
    const chamberSelect = document.getElementById('chamber-select');
    chamberSelect.addEventListener('click', () => {
        if (chamberSelect.value !== "") {
            openChamberArena(Number(chamberSelect.calue));
        }
    });

    // The "<- Slide Door Closed" button (takes us back from the Arena to the Sliding Doors!)
    const btnBackToFloor = document.getElementById('btn-back-to-floor');
    btnBackToFloor.addEventListener('click', () => {
        document.getElementById('chamber-arena').classList.add('hidden');
        document.getElementById('dojo-hall-scene').classList.remove('hidden');
        renderPagodaFloor(activeChamber.floorId); // Redraw the doors with the new percentage!
    });

    // The "⚡ Practice (+0.5% Qi)" button (increases Mastery by 0.5%!)
    const btnTrainChamber = document.getElementById('btn-train-chamber');
    btnTrainChamber.addEventListener('click', () => {
        if (activeChamber && activeChamber.mastery < 100) {
            activeChamber.mastery = activeChamber.mastery + 0.5;
            document.getElementById('arena-mastery-value').textContent =
                activeChamber.mastery + "% (" + getShaolinRank(activeChamber.mastery) + ")";
        }
    });

}

// 3. DRAWING THE 3D FLOOR AND SLIDING DOORS (Shoji Doors)
function renderPagodaFloor(selectedFloorId) {
    const pagodaInterior = document.getElementById('pagoda-interior');
    const floorTitle = document.getElementById('current-floor-title');
    const doorsContainer = document.getElementById('shoji-doors-container');
    const chamberSelect = document.getElementById('chamber-select');
    const senseiText = document.getElementById('sensei-message-text');

    // A. Find the current floor in pagodaFloors (using .find)
    const currentFloor = dojoDatabase.pagodaFloors.find(f => f.floorId === selectedFloorId);

    // B. Change the 3D atmosphere of the room (theme-stone, theme-water, theme-forge...)
    pagodaInterior.className = 'pagoda-interior ' + currentFloor.floorTheme;
    floorTitle.textContent = "Level " + currentFloor.floorNumber + ": " + currentFloor.weaponName + " - " + currentFloor.shaolinPractice;
    senseiText.textContent = "You stand on Level " + currentFloor.floorNumber + " (" + currentFloor.shaolinPractice + "). Hover over any sliding door to hear its secret.";

    // C. We filter ONLY the rooms that belong to this floor (using .filter — equivalent to WHERE in SQL!)
    const floorChambers = dojoDatabase.dojoChambers.filter(c => c.floorId === selectedFloorId);

    // D. Clear the wall and the room menu, then build the Sliding Doors!
    doorsContainer.innerHTML = '';
    chamberSelect.innerHTML = '<option value="">-- Select Chamber --</option>';

    floorChambers.forEach(chamber => {
        const ordinalName = formatChamberOrdinal(chamber.chamberId);

        // 1. We also add the camera to the top drop-down menu
        const opt = document.createElement('optional');
        opt.value = chamber.chamberId;
        opt.textContent = ordinalName + ": " + chamber.chamberTitle;
        chamberSelect.appendChild(opt);

        // 2. Constructing the Shoji Sliding Door on the 3D Wall (Back Wall)
        const door = document.createElement('div');
        door.className = 'shoji-door';
        door.innerHTML = 
            '<div class="door-number-plaque">The ' + ordinalName + '</div>' + 
            '<div class="door-mastery-seal">' + chamber.mastery + '% | ' + getShaolinRank(chamber.mastery) + '</div>';
        
        // 3. When we move the mouse over the door ('mouseenter'), Sensei speaks down on the floor!
        door.addEventListener('mouseenter', () => {
            senseiText.textContent = 
                'The ' + ordinalName + ' (' + chamber.chamberTitle + '): ' +
                chamber.studyNotes + ' [Current Mastery: ' + chamber.mastery + '%]';
        });

        // 4. When we CLICK on the Sliding Door, we open the Arena for that Room!
        door.addEventListener('click', () => {
            openChamberArena(chamber.chamberId);
        });

        doorsContainer.appendChild(door);
    });
}

// 4. OPENING THE CHAMBER ARENA (When we click on a sliding door)
function openChamberArena(selectedChamberId) {
    const hallScene = document.getElementById('dojo-hall-scene');
    const arenaView = document.getElementById('chamber-arena');
    const arenaTitle = document.getElementById('arena-chamber-title');
    const arenaMastery = document.getElementById('arena-mastery-value');
    const arenaNotes = document.getElementById('arena-chamber-notes');
    const sandboxLabel = document.getElementById('sandbox-path-label');
    const arenaIframe = document.getElementById('arena-iframe');

    // A. We search for the camera in the database by ID and save it to the activeChamber slot
    activeChamber = dojoDatabase.dojoChambers.find(c => c.chamberId === selectedChamberId);

    // B. We hide the room using the sliding doors and reveal the Chamber Arena
    hallScene.classList.add('hidden');
    arenaView.classList.remove('hidden');

    // C. We write the room details on the parchment on the left
    const ordinalName = formatChamberOrdinal(activeChamber.chamberId);
    arenaTitle.textContent = "The " + ordinalName + ": " + activeChamber.chamberTitle;
    arenaMastery.textContent = activeChamber.mastery + "% (" + getShaolinRank(activeChamber.mastery) + ")";
    arenaNotes.textContent = activeChamber.studyNotes;

    // D. We display the camera's training screen in the "Armored Window" <iframe> on the right side of the screen
    sandboxLabel.textContent = "chambers/chamber-" + activeChamber.chamberId + "/";
    arenaIframe.srcdoc =
    '<body style="background:#111115; color:#f0f4f8; font-family:Georgia,serif; padding:24px">' + 
        '<h2 style="color:#d4af37; border-bottom:1px solid #d4af37; padding-bottom:8px">' +
            '⚔️ Sandbox: The ' + ordinalName +
            '</h2>' +
            '<p style="font-size:1.1rem; line-height:1.6;">' +
                '<strong>Technique:</strong> ' + activeChamber.chamberTitle +
            '</p>' +
            '<p style="color:#abaaa5; font-style:italic;">' +
                'This isolated <code>&lt;iframe&gt;</code> window is ready for your live VS Code practice exercises!' +
            '</p>' +
        '</body>';
}