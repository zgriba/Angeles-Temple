// ============================================================================
// CANG JING GE (Hall of Scrolls) — 3D Sacred Library Logic
// ============================================================================

// 1. ENTERING THE SACRED LIBRARY BUILDING (Hide the Garden and the Sun!)
function enterHallOfScrolls() {
    const mainScene = document.querySelector('main');
    const scrollsSection = document.getElementById('temple-scrolls');
    
    // We switch the State Machine exclusively to the Hall of Scrolls building
    mainScene.className = 'entered-scrolls';

    // If the Library hasn't been built yet, we send 🦅 Shen Ying to fetch views/scrolls.html
    if (scrollsSection.innerHTML.trim() === "") {
        fetch('views/scrolls.html')
            .then(response => response.text())
            .then(html => {
                scrollsSection.innerHTML = html;
                setupScrollsLibrary();
            })
            .catch(error => {
                console.error("Scrolls Falcon error:", error);
            });
    }
}
// 2. CONFIGURING INTERACTIONS WITHIN THE LIBRARY (Kakejiku Scrolls & The 2 Wings)
function setupScrollsLibrary() {
    const mainScene = document.querySelector('main');
    const btnLeave = document.getElementById('btn-leave-scrolls');
    const btnWingImperial = document.getElementById('btn-wing-imperial');
    const btnWingWorld = document.getElementById('btn-wing-world');
    const imperialWing = document.getElementById('imperial-scrolls-wing');
    const worldWing = document.getElementById('world-registry-wing');
    const senseiText = document.getElementById('scrolls-sensei-text');
    const kakejikuScrolls = document.querySelectorAll('.kakejiku-scroll')
    const filterButtons = document.querySelectorAll('#world-registry-wing .filter-btn');

    // A. The "<- Garden" button takes us back to the Garden Courtyard
    btnLeave.addEventListener('click', () => {
        mainScene.className = 'entered-garden';
    });

    // B. When we hover the mouse over any of the 3 Large Kakejiku Scrolls:
    kakejikuScrolls.forEach(scroll => {
        scroll.addEventListener('mouseenter', () => {
            const story = scroll.getAttribute('data-story');
            senseiText.textContent = story;
        });
    });

    // C. Switching to Wing 1: Zgriba Imperial Archive (Your 3 Scrolls)
    btnWingImperial.addEventListener('click', () => {
        btnWingImperial.classList.add('active-wing');
        btnWingWorld.classList.remove('active-wing');
        imperialWing.classList.remove('hidden');
        worldWing.classList.add('hidden');
        senseiText.textContent = "Hover over any of the three Imperial Scrolls to read the architecture of the Zgriba Ecosystem.";
    });

    // D. Switching to Wing 2: World Masters Registry (Global GitHub Table)
    btnWingWorld.addEventListener('click', () => {
        btnWingWorld.classList.add('active-wing');
        btnWingImperial.classList.remove('active-wing');
        imperialWing.classList.add('hidden');
        worldWing.classList.remove('hidden');
        senseiText.textContent = "Inspecting the highest-ranked open-source scrolls across the global GitHub realm.";
        loadWorldRegistry('csharp');
    });

    // E. Language-switching buttons (C#, JS, CSS) in Wing 2
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            loadWorldRegistry(selectedLang);
        });
    });

}
// 3. FETCHING THE GLOBAL RANKING FROM THE GITHUB API (For Wing 2)
function loadWorldRegistry(language) {
    const tableBody = document.getElementById('leaderboard-rows');
    tableBody.innerHTML = '<tr><td colspan="5">⏳ 🦅 Shen Ying is fetching live rankings from GitHub...</td></tr>';
    const gitHubUrl = 'https://api.github.com/search/repositories?q=language:' + language + '&sort=stars&order=desc&per_page=10';
    
    fetch(gitHubUrl)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            data.items.forEach((repo, index) => {
                const rank = index + 1;
                const row = document.createElement('tr');

                row.innerHTML = 
                    '<td>#' + rank + '</td>' +
                    '<td><a class="table-link" href="' + repo.html_url + '" target="_blank"><strong>' + repo.name + '</strong></a></td>' +
                    '<td><a class="table-link" href="' + repo.owner.html_url + '" target="_blank">' + repo.owner.login + '</a></td>' +
                    '<td>' + repo.language + '</td>' +
                    '<td>⭐ ' + repo.stargazers_count + '</td>';

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("GitHub Falcon error:", error);
        });
}