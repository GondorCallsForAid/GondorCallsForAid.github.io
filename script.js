document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#container');

    const startHunters = document.querySelector('#startHunters');

    const hunterImageSrc = "images/Robin.png";

    const numHunters = 6;
    const hunters = [];
    const bugs = [];
    const bugTargets = new Map(); // Map to track bugs being targeted by hunters

    function createBug() {
        const words = ['Slow Performance', 'Model Overfitting', 'Stupid Bugs', 'Data Leaks', 'Irrelevant Features', 'Concept Drift', 'Merge Conflict']; // Sample words
        const word = words[Math.floor(Math.random() * words.length)]; // Select a random word
    
        const bug = document.createElement('div');
        bug.classList.add('bug');
    
        // Create an img element for the bug image
        const bugImage = new Image();
        bugImage.src = 'images/bug_triangle.png'; // Set the src attribute to the URL of your triangle image
        bugImage.classList.add('bug-image'); // Add the bug-image class
        bug.appendChild(bugImage); // Append the bug image to the bug element
    
        // Create a span element for the bug text
        const bugText = document.createElement('span');
        bugText.textContent = word; // Set the content of the bug text
        bug.appendChild(bugText); // Append the bug text to the bug element
    
        container.appendChild(bug);
    
        // Randomly position the bug
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
    
        bug.style.left = randomX + 'px';
        bug.style.top = randomY + 'px';
    
        bugs.push(bug);
    
        moveBug(bug);
    }

    startHunters.addEventListener('click', () => {
        // Create hunters on button click
        for (let i = 0; i < numHunters; i++) {
            const hunter = createHunter();
            hunters.push(hunter);
        }
    });

    function createHunter() {
        const hunter = document.createElement('img'); // Create an img element
        hunter.classList.add('hunter');
        hunter.src = hunterImageSrc; // Set the src attribute to your image URL
        container.appendChild(hunter);

        // Randomly position the hunter
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;

        hunter.style.left = randomX + 'px';
        hunter.style.top = randomY + 'px';

        moveHunter(hunter);

        return hunter;
    }
    
    function moveHunter(hunter) {
        const speed = 1.5; // Adjust the speed of the hunters
        let targetBug = null; // Current target bug for the hunter
    
        function frameHunter() {
            if (bugs.length === 0) {
                requestAnimationFrame(frameHunter);
                return;
            }
    
            const hunterRect = hunter.getBoundingClientRect();
            const hunterX = hunterRect.left + hunterRect.width / 2;
            const hunterY = hunterRect.top + hunterRect.height / 2;
    
            // If no target or target is removed, find a new target
            if (!targetBug || !bugs.includes(targetBug)) {
                let nearestBug = null;
                let minDistance = Infinity;
                bugs.forEach(bug => {
                    if (!bugTargets.has(bug)) {
                        const bugRect = bug.getBoundingClientRect();
                        const bugX = bugRect.left + bugRect.width / 2;
                        const bugY = bugRect.top + bugRect.height / 2;
                        const dx = bugX - hunterX;
                        const dy = bugY - hunterY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestBug = bug;
                        }
                    }
                });
    
                if (nearestBug) {
                    targetBug = nearestBug;
                    bugTargets.set(targetBug, hunter);
                }
            }
    
            if (targetBug) {
                // Move towards the current target bug
                const bugRect = targetBug.getBoundingClientRect();
                const bugX = bugRect.left + bugRect.width / 2;
                const bugY = bugRect.top + bugRect.height / 2;
                const dx = bugX - hunterX;
                const dy = bugY - hunterY;
                const angle = Math.atan2(dy, dx);
                const newX = hunterX + Math.cos(angle) * speed;
                const newY = hunterY + Math.sin(angle) * speed;
                hunter.style.left = newX - hunterRect.width / 2 + 'px';
                hunter.style.top = newY - hunterRect.height / 2 + 'px';
    
                // Check if the hunter caught the bug
                const distanceToBug = Math.sqrt((newX - bugX) ** 2 + (newY - bugY) ** 2);
                if (distanceToBug < 15) {
                    container.removeChild(targetBug);
                    const bugIndex = bugs.indexOf(targetBug);
                    if (bugIndex !== -1) {
                        bugs.splice(bugIndex, 1);
                        bugTargets.delete(targetBug);
                        targetBug = null; // Reset target bug after catching
                    }
                }
            }
    
            // Continue hunting for bugs
            requestAnimationFrame(frameHunter);
        }
        frameHunter();
    }
    
    function moveBug(bug) {
        const speed = 0.5; // Adjust the speed of the bug

        function frameBug() {
            if (!bugs.includes(bug)) return;

            const bugX = parseFloat(bug.style.left);
            const bugY = parseFloat(bug.style.top);
            const dx = mouseX - bugX;
            const dy = mouseY - bugY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if a hunter touches the bug
            let closestHunterDistance = Infinity;
            hunters.forEach(hunter => {
                const hunterRect = hunter.getBoundingClientRect();
                const hunterX = hunterRect.left + hunterRect.width / 2;
                const hunterY = hunterRect.top + hunterRect.height / 2;
                const dx = hunterX - bugX;
                const dy = hunterY - bugY;
                const distanceHunter = Math.sqrt(dx * dx + dy * dy);
                if (distanceHunter < closestHunterDistance) {
                    closestHunterDistance = distanceHunter;
                }
            });

            if (closestHunterDistance < 10) {
                // If the hunter is close enough to the bug, remove it
                container.removeChild(bug);
                const bugIndex = bugs.indexOf(bug);
                if (bugIndex !== -1) {
                    bugs.splice(bugIndex, 1);
                }
            } else if (distance < speed) {
                // If the bug is close enough to the cursor, remove it
                container.removeChild(bug);
                const bugIndex = bugs.indexOf(bug);
                if (bugIndex !== -1) {
                    bugs.splice(bugIndex, 1);
                }
            } else {
                const angle = Math.atan2(dy, dx);
                const newX = bugX + Math.cos(angle) * speed;
                const newY = bugY + Math.sin(angle) * speed;
                bug.style.left = newX + 'px';
                bug.style.top = newY + 'px';
                requestAnimationFrame(frameBug);
            }
        }

        frameBug();
    }

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.pageX;
        mouseY = event.pageY;
    });

    setInterval(createBug, 200); // Creates a bug every second
});
