// DOM elements
const background = document.getElementById("background");
const content = document.getElementById("content");
let optionsContainer = null;
let data = {};

// Typing experience settings
const settings = {
    typingSounds: {
        comfy: "assets/type_1.wav",
        hacker: "assets/type_2.wav",
        notebook: "assets/type_2.wav",
    },
    typingSpeeds: { comfy: 2, hacker: 2, notebook: 4 },
    typingSoundSpeed: { comfy: 1, hacker: 0.5, notebook: 1.5 },
    typingSoundFrequency: { comfy: 4, hacker: 2, notebook: 3 },
    beepSoundSpeed: { comfy: 1, hacker: 0.75, notebook: 2.75 },
};

// Typing modes
const modes = { comfy: "comfy", hacker: "hacker", notebook: "notebook" };

const mode = modes.notebook;

// Fetch data
fetch("data/showcase.json").then(res => res.json()).then(init);

function init(input) {
    // load data
    input.settings.engine.mode = modes[Object.keys(modes)[Math.floor(Math.random() * Object.keys(modes).length)]];
    const { data, settings: { engine: { mode } } } = input;
    const experienceData = {};

    // Dynamically add stylesheet based on mode
    document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="style/${mode}.css" />`);

    // Audio elements for typing and beep sounds
    const typeSound = new Audio(settings.typingSounds[mode]);
    const beepSound = new Audio("assets/beep.wav");

    for (const audio of [typeSound, beepSound]) audio.load();

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // sound play util
    function playSound(sound, playbackRate = 1, volume = 1) {
        const audio = sound.cloneNode();
        audio.mozPreservesPitch = false;
        audio.playbackRate = playbackRate;
        audio.volume = volume;
        audio.play();
    }

    // play typing sound
    function playKeypressSound() {
        playSound(typeSound, 3 * settings.typingSoundSpeed[mode] + Math.random(), 0.5);
    }

    // play beep sound
    async function playBeepSound() {
        await sleep(100);
        playSound(beepSound, settings.beepSoundSpeed[mode] - 0.35 + Math.random() * 0.4, 0.5);
    }

    // adjust the background
    async function adjustSize() {
        var fullSize = content.scrollHeight;
        background.style.height = fullSize + 'px';
        background.style.width = content.scrollWidth + 'px';
    }

    // typewriter effect
    async function typeText(text) {
        const frequency = settings.typingSoundFrequency[mode];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement("span");
            content.appendChild(span);

            let delay = 30 * (0.5 + Math.random());

            const delays = { ",": 100, ".": 100, "?": 100, "!": 100, "\n": 100 };

            if (char in delays) delay = delays[char];

            if (i % frequency == 0) playKeypressSound();

            const predictionSize = settings.typingSpeeds[mode] * 2.75;
            let predicted = "";
            for (let j = 0; j < predictionSize; j++) {
                if (i + j < text.length) predicted += text[i + j];
            }

            span.innerHTML = predicted;
            adjustSize();
            span.innerHTML = char == "\n" ? "<br>" : char;

            await sleep(delay / settings.typingSpeeds[mode]);
        }
    }

    // handle clicks for options
    async function handleClick(path, elm) {
        for (const options of optionsContainer.children) {
            if (options == elm) continue;
            options.classList.remove("show");
            options.classList.add("hide");
        }

        elm.classList.add("clicked");

        if (path.indexOf("href:") == 0) {
            window.location.href = path.slice(5);
            return;
        }

        await sleep(300);

        renderData(data[path]);
    }

    // create option
    function handleOption(text, path) {
        const option = document.createElement("div");

        if (text.indexOf("query:") == 0) {
            const description = text.slice(6);

            const input = document.createElement("input");
            const variable_name = path.split(":")[0];
            const destination = path.split(":")[1];

            option.classList.add("option");
            option.classList.add("input");
            option.classList.add("animate");

            option.appendChild(document.createTextNode(description));
            option.appendChild(input);


            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter") {
                    const query = input.value;
                    experienceData[variable_name] = query;
                    renderData(data[destination]);
                }
            });

            optionsContainer.appendChild(option);
            input.focus();
            return option;
        }

        option.classList.add("option");
        option.classList.add("choice");
        option.classList.add("animate");

        let finalText = text;

        for (const [key, value] of Object.entries(experienceData)) {
            finalText = finalText.replaceAll(`{${key}}`, value);
        }

        let textNode = document.createTextNode(finalText);
        option.appendChild(textNode);
        option.setAttribute("path", path);

        option.addEventListener("mousedown", () => handleClick(path, option));

        optionsContainer.appendChild(option);
        return option;
    }

    // display options
    async function displayOptions(options) {
        optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options");

        content.appendChild(optionsContainer);

        for (const [text, path] of Object.entries(options)) {
            const option = handleOption(text, path);
        }

        for (const option of optionsContainer.children) {
            await sleep(125);
            option.classList.remove("animate");
            playBeepSound();
        }

        await sleep(100);

        for (const option of optionsContainer.children) {
            option.classList.add("show");
        }

        document.addEventListener("keydown", (e) => {
            const index = parseInt(e.key);
            
            if (isNaN(index)) return;
            if (index > optionsContainer.children.length) return;
            if (index < 1) return;
            const option = optionsContainer.children[index - 1];
            if (!option.classList.contains("choice")) return;
            handleClick(option.getAttribute("path"), option);
        }, { once: true });
    }

    // render data on the screen
    async function renderData(data) {
        content.innerHTML = "";

        let finalText = data.text;

        for (const [key, value] of Object.entries(experienceData)) {
            finalText = finalText.replaceAll(`{${key}}`, value);
        }

        await typeText(finalText);
        await displayOptions(data.options);
    }

    // start the experience
    async function start() {
        document.removeEventListener("mousedown", start);
        await renderData(data.entry);
    }

    // Event listener to start the experience on mousedown
    document.addEventListener("mousedown", start);
}
