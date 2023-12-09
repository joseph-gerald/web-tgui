const content = document.getElementById("content");
const typeSound = new Audio("assets/type_1.wav");
const beepSound = new Audio("assets/beep.wav");

const optionsContainer = document.createElement("div");
optionsContainer.classList.add("options");

content.appendChild(optionsContainer);

for (const audio of [typeSound, beepSound]) audio.load();

const data = {
    start: {
        "text": "Hello, look at this!",
        options: {
            "Hello": "hello",
            "World": "world",
            "Yap machine": "yap",
        }
    },
    hello: {
        "text": "Hello!",
        options: {
            "Back": "start"
        }
    },
    world: {
        "text": "World!",
        options: {
            "Back": "start"
        }
    },
    yap: {
        "text": "YAP ".repeat(100),
        options: {
            "Back": "start"
        }
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function playSound(sound, playbackRate = 1, volume = 1) {
    const audio = sound.cloneNode();
    audio.mozPreservesPitch = false;
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    audio.play();
}

function playKeypressSound() {
    playSound(typeSound, 3 + Math.random());
}

async function playBeepSound() {
    await sleep(500);
    playSound(beepSound, 1 - 0.35 + Math.random() * 0.4, 0.5);
}

async function adjustSize() {
    const oldHeight = content.style.height;
    content.style.height = 'auto';

    var fullSize = content.scrollHeight - 10;
    content.style.height = oldHeight;

    await sleep(0);
    content.style.height = fullSize + 'px';
}

async function typeText(text) {
    const frequency = 2;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement("span");
        span.innerHTML = char;
        content.appendChild(span);

        let delay = 30;

        const delays = {
            ",": 100,
            ".": 100,
            "?": 100,
            "!": 100,
            "\n": 100,
        }

        if (char in delays) {
            delay = delays[char];
        }

        if (i % frequency == 0) playKeypressSound();
        await sleep(delay);
    }
}

async function displayOptions(options) {

    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add("options");

    content.appendChild(optionsContainer);
    for (const [text, path] of Object.entries(options)) {
        const option = document.createElement("div");
        option.classList.add("option");
        option.classList.add("animate");
        option.innerHTML = "> " + text;
        option.addEventListener("mousedown", () => { renderData(data[path]) });
        optionsContainer.appendChild(option);
    }

    for (const option of optionsContainer.children) {
        await sleep(100);
        option.classList.remove("animate");
        playBeepSound();
    }

    
    for (const option of optionsContainer.children) {
        option.classList.add("show");
    }
}

async function renderData(data) {
    content.innerHTML = "";

    await typeText(data.text)
    await displayOptions(data.options);
    adjustSize();
}

function start() {
    renderData(data.start);
    document.removeEventListener("mousedown", start);
}

document.addEventListener("mousedown", start)