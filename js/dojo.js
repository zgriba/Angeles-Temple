// We store the Pagoda database in this global drawer after the Falcon brings it.
let dojoDatabase = null;
let activeChamber = null;
let scannedFloorCode = {};

// List of the ACTUAL project files, grouped by the 6 floors (floorId: 1 -> 6)
const projectFilesByFloor = {
    1: ['index.html', 'favicon.svg', 'views/garden.html', 'views/dojo.html', 'js/main.js', 'js/dojo.js'],
    2: ['css/variables.css', 'css/layout.css', 'css/components.css', 'css/garden.css', 'css/dojo.css'],
    3: ['js/main.js', 'js/dojo.js'],
    4: ['database/dojo.sql'],
    5: ['backend-csharp/TempleGuardian.cs'],
    6: ['database/dojo-db.json', 'index.html', 'js/main.js', 'js/dojo.js']
};

// THE FINGERPRINT OF EACH ROOM (The keywords that the machine looks for in your code for each of the 36 rooms!)
const chamberSignatures = {

    // ground floor 0: HTML5 (Realms 1 – 5)
    1: ['<!doctype', '<html', '<head', '<body', 'header', '<header', '<main', '<section', '<article', '<nav', 'footer', '<meta', '<div'],
    2: ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6', '<p', '<ul', '<li', '<a', 'href', '<span', '<strong', '<em'],
    3: ['<table', '<thead', '<tbody', '<tr', '<th', '<td', 'colspan'],
    4: ['<form', '<input', '<select', '<option', '<button', '<label', 'for='],
    5: ['<svg', 'viewbox', '<rect', '<path', '<text', 'tabindex', 'fill=', 'stroke='],

    // 1st. Floor: CSS3 (Realms 6 – 12)
    6: [':root', '--', 'var(', ':hover', ':focus', ':has(', '::befor', '::after'],
    7: ['margin', 'padding', 'border', 'position:', 'absolute', 'fixed', 'relative', 'z-index', 'top:', 'left:', 'bpttom:', 'right:'],
    8: ['display: flex', 'flex-direction', 'jutify-content', 'align-items', 'gap:', 'flex-wrap', 'flex:'],
    9: ['display: grid', 'grid-template-columns', 'repeat(', '1fr'],
    10: ['background', 'linear-gradient', 'radial-gradient', 'rgba(', 'hsl(', 'box-shadow', 'opacity', 'filter:', 'color:'],
    11: ['perspective', 'transform', 'rotatex', 'scale(', 'translatex', 'translatey', 'transition', '@keyframes'],
    12: ['@media', 'clamp(', 'min(', 'max-width', 'min-width', 'vw', 'vh', 'rem'],

    // 2nd. Floor: JavaScript (Räume 13 – 20)
    13: ['const ', 'let ', '===', '!==', ' + ', ' * ', 'true', 'false', 'null'],
    14: ['function ', '=>', 'return'],
    15: ['if (', 'if(', 'else if', 'else {', '&&', '||', '!'],
    16: ['.foreach', '.filter', '.find', '.map', '.split', '[]', '.length'],
    17: ['document.', 'queryselector', 'gatelementbyid', '.innerhtml', '.textcontent', '.classlist', '.classname', 'createelement', 'appendchild'],
    18: ['addeventlistener', "'click'", "'change'", "'mouseenter'", '.value', 'stoppropagation'],
    19: ['fetch(', '.then(', '.catch(', '.json()', '.text()', 'promise.all'],
    20: ['console.log', 'console.error', 'throw new error', 'catch'],

    // 3rd Floor: SQL (Rooms 21 - 26)
    21: ['create table', 'primary key', 'foreign key', 'reference', 'int', 'varchar', 'decimal'],
    22: ['select ', 'from ', 'where ', 'order by', 'asc', 'desc'],
    23: ['insert into', 'values', 'update ', 'set ', 'delete from'],
    24: ['inner join', 'left join', ' on '],
    25: ['count(', 'sum(', 'avg(', 'group by', 'having'],
    26: ['create view', 'subquery', 'exist'],

    // 4th Floor: C# .NET (Rooms 27 - 33)
    27: ['usin system', 'namespace ', 'static void main', 'int ', 'double ', 'string ', 'bool', 'console.writeline'],
    28: ['if (', 'else', 'switch', 'for (', 'foreach', 'while'],
    29: ['public ', 'private ', 'void ', 'return ', 'try', 'catch'],
    30: ['class ', 'new ', '{ get; set; }'],
    31: ['interface ', 'override', 'virtual', 'abstract'],
    32: ['list<', 'dictionary<', '.where(', '.select(', '.firstordefault('],
    33: ['webapplication', 'mapget', 'mappost', 'apicontroller', ' async '],

    // 5th Floor: Fullstack & Git (Rooms 34 - 36)
    34: ['git ', 'github', 'commit', 'branch'],
    35: ['link rel="stylesheet"', 'script src=', 'defer', 'export ', 'import '],
    36: ['fetch(', 'database/', 'view/', 'backend-csharp/']
};

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

// THE AUTOMATIC SCANNER: Reads all actual project files and calculates 0.01% per line!
function scanRealProjectFiles() {
    const floorIds = [1, 2, 3, 4, 5, 6];

    const scanPromises = floorIds.map(floorId => {
        const files = projectFilesByFloor[floorId];

        const filePromises = files.map(filePath => {
            return fetch(filePath)
                .then(res => res.ok ? res.text() : "")
                .then(text => {
                    const validLines = text.split('\n').filter(line => line.trim() !== '');
                    return { file: filePath, lines: validLines };
                })
                .catch(() => ({ file: filePath, lines: [] }));
        });

        return Promise.all(filePromises).then(results => {
            scannedFloorCode[floorId] = results;

            // For EACH room on this floor, we filter for ONLY the lines that contain the keywords for that room!
            dojoDatabase.dojoChambers.forEach(chamber => {
                if (chamber.floorId === floorId) {
                    const keywords = chamberSignatures[chamber.chamberId] || [];
                    let chamberStrikes = 0 ;
                    let matchedExemples = [];

                    results.forEach(fileItem => {
                        fileItem.lines.forEach(line => {
                            const lowerLine = line.toLowerCase();
                            const isMatch = keywords.some(word => lowerLine.includes(word));

                            if (isMatch) {
                                chamberStrikes = chamberStrikes + 1;
                                if (matchedExemples.length < 15) {
                                    matchedExemples.push({ file: fileItem.file, code: line.trim() });
                                }
                            }
                        });
                    });

                    // We apply the Law of 10,000 Strikes (1 line of this technique = 0.01%)
                    chamber.strikes = chamberStrikes;
                    chamber.mastery = Number((chamberStrikes * 0.01).toFixed(2));
                    chamber.matchedLines = matchedExemples;  
                }
            });
        });
    });

    return Promise.all(scanPromises);
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
                // We scan all the project's actual files before displaying the doors!
                return scanRealProjectFiles();
                
            })
            .then(() => {
                setupPagodaNavigation();
                renderPagodaFloor(1); // We start on the Ground Floor (floorId = 1, i.e., Level 0: HTML5)
            })

            .catch(error => {
                console.error("Pagoda Falcon error:", error);
            });
    } else {
        // Every time we re-enter the Pagoda, we re-scan the project code!
        scanRealProjectFiles().then(() => {
            const floorSelect = document.getElementById('floor-select');
            const currebtFloorId = floorSelect ? Number(floorSelect.value) : 1;
        });
    }
}

// 2. CONFIGURING THE TOP NAVIGATION (The "<- Garden" button and the Floors 0–5 drop-down menu)
function setupPagodaNavigation() {
    const mainScene = document.querySelector('main');
    const btnLeaveDojo = document.getElementById('btn-leave-dojo');
    const floorSelect = document.getElementById('floor-select');
    const chamberSelect = document.getElementById('chamber-select');
    const btnBackToFloor = document.getElementById('btn-back-to-floor');
    const btnTrainChamber = document.getElementById('btn-train-chamber')

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
        document.getElementById('chamber-arena').classList.add('hidden');
        document.getElementById('dojo-hall-scene').classList.remove('hidden');
        renderPagodaFloor(chosenFloorId);
    });

    // When the user selects a Room from the second drop-down menu at the top:
    chamberSelect.addEventListener('click', () => {
        if (chamberSelect.value !== "") {
            openChamberArena(Number(chamberSelect.calue));
        }
    });

    // The "<- Slide Door Closed" button (takes us back from the Arena to the Sliding Doors!)
    btnBackToFloor.addEventListener('click', () => {
        document.getElementById('chamber-arena').classList.add('hidden');
        document.getElementById('dojo-hall-scene').classList.remove('hidden');
        renderPagodaFloor(activeChamber.floorId); // Redraw the doors with the new percentage!
    });

    // The button in Arena performs a live re-scan of entire VS Code project!
    btnTrainChamber.textContent = "🔄 Rescan Project Code (0.01% / Strike)";
    btnTrainChamber.addEventListener('click', () => {
        scanRealProjectFiles().then(() => {
            if (activeChamber) {
                openChamberArena(activeChamber.chamberId);
            }
        });
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
            '<div class="door-title"><strong>' + chamber.chamberTitle + '</strong></div>' +
            '<div class="door-mastery-seal">' + chamber.mastery + '% (' + (chamber.strikes || 0) + ' Strikes)</div>';
        
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
    arenaMastery.textContent = 
        activeChamber.mastery + "% (" + (activeChamber.strikes || 0) + " / 10,000 Strikes) | " + getShaolinRank(activeChamber.mastery);
    arenaNotes.textContent = activeChamber.studyNotes;

    const floorFiles = scannedFloorCode[activeChamber.floorId] || [];
    sandboxLabel.textContent = "Live Project Scanner (" + floorFiles.length + " files tracked)";

    // D. We are building the live report with the EXACT lines found in the project for this technique!
    let reportHtml = '';
    const examples = activeChamber.matchedLines || [];

    if (examples.length === 0) {
        reportHtml = '<p style="color:#abaaa5;">No strikes recorded for this specific technique yet. Practice it in your project files!</p>';
    } else {
        examples.forEach(ex => {
            const safeCode = ex.code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            reportHtml = reportHtml + 
                '<div style="background:rgba(255,255,255,0.05); border-left:3px solid #d4af37; padding:8px 12px; margin-bottom:8px; font-family:monospace; font-size:0.85rem;">' +
                    '<span style="color:#d4af37;">[' + ex.file + ']</span> ' +
                    '<span style="color:#a8ff60;">' + safeCode + '</span>' +
                '</div>';
        });
    }

    arenaIframe.srcdoc = 
        '<body style="background:#111115; color:#f0f4f8; font-family:Georgia,serif; padding:20px;">' +
            '<h3 style="color:#d4af37; border-bottom:1px solid #d4af37; padding-bottom:8px; margin-top:0;">' +
                '⚔️ Technique Telemetry: ' + (activeChamber.strikes || 0) + ' / 10,000 Strikes (' + activeChamber.mastery + '%)' +
            '</h3>' +
            '<p style="color:#abaaa5; font-size:0.9rem;">Real lines of code detected for <strong>' + activeChamber.chamberTitle + '</strong> across your project:</p>' +
            reportHtml +
        '</body>';
}