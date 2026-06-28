const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/lqwsw3bcxijr2e68f5d5bj9ycyrnvd24";

let selectedMood = "";
let selectedCharacter = "";

const themes = {
  Peaceful: {
    pageBg: "#eef6ee",
    cardBg: "#f7fbf6",
    primary: "#2e5a46",
    secondary: "#4c7c64",
    button: "#2e5a46",
    border: "#bfd9c4",
    input: "#fbfff9",
    petalLight: "#ddeed8",
    petalDark: "#88be97",
    message: "Your heart feels grounded."
  },

  Happy: {
    pageBg: "#fff7d6",
    cardBg: "#fffbea",
    primary: "#9c6a00",
    secondary: "#b8860b",
    button: "#c79200",
    border: "#f2d57a",
    input: "#fffdf2",
    petalLight: "#ffe59e",
    petalDark: "#ffc83d",
    message: "Today feels full of light."
  },

  Inspired: {
    pageBg: "#f7f0fc",
    cardBg: "#fcf8ff",
    primary: "#65428c",
    secondary: "#8a6db4",
    button: "#65428c",
    border: "#d5c2ec",
    input: "#fffaff",
    petalLight: "#e6d7fa",
    petalDark: "#b994f3",
    message: "Capture this spark before it disappears."
  },

  Tired: {
    pageBg: "#eef4fa",
    cardBg: "#f8fbff",
    primary: "#4a688e",
    secondary: "#6487af",
    button: "#4a688e",
    border: "#c7d8ea",
    input: "#fbfdff",
    petalLight: "#dde8f7",
    petalDark: "#8dafd6",
    message: "Rest is productive too."
  },

  Anxious: {
    pageBg: "#f5f5f6",
    cardBg: "#fbfbfc",
    primary: "#59626b",
    secondary: "#7c8691",
    button: "#59626b",
    border: "#d5d8dc",
    input: "#ffffff",
    petalLight: "#ecedef",
    petalDark: "#b5bbc3",
    message: "One breath at a time."
  },

  Sad: {
    pageBg: "#eef5fb",
    cardBg: "#f8fcff",
    primary: "#436d97",
    secondary: "#6e8fb6",
    button: "#436d97",
    border: "#c7d8ea",
    input: "#fbfdff",
    petalLight: "#d9eaf8",
    petalDark: "#8fb6dc",
    message: "Be gentle with yourself today."
  },

  Powerful: {
    pageBg: "#eef4ef",
    cardBg: "#f8fbf8",
    primary: "#124a32",
    secondary: "#2f6e53",
    button: "#124a32",
    border: "#8db69b",
    input: "#fbfff9",
    petalLight: "#9ed8b1",
    petalDark: "#2f8f5b",
    message: "You are capable of incredible things."
  }
};

function getTimeSlot() {
  const hour = new Date().getHours();

  if (hour < 12) return "Morning";
  if (hour < 18) return "Noon";
  return "Night";
}

function getTodayKey() {
  const today = new Date().toISOString().split("T")[0];
  return `${today}-${getTimeSlot()}`;
}

function applyTheme(mood) {
  const theme = themes[mood];

  if (!theme) return;

  document.documentElement.style.setProperty("--page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--card-bg", theme.cardBg);
  document.documentElement.style.setProperty("--primary", theme.primary);
  document.documentElement.style.setProperty("--secondary", theme.secondary);
  document.documentElement.style.setProperty("--button-bg", theme.button);
  document.documentElement.style.setProperty("--border", theme.border);
  document.documentElement.style.setProperty("--input-bg", theme.input);
  document.documentElement.style.setProperty("--petal-light", theme.petalLight);
  document.documentElement.style.setProperty("--petal-dark", theme.petalDark);

  document.getElementById("title").textContent = theme.message;
}

function setupWidget() {
  document.getElementById("slot").textContent = `${getTimeSlot()} Check-In`;

  const savedEntry = JSON.parse(localStorage.getItem(getTodayKey()));

  if (savedEntry) {
    selectedMood = savedEntry.mood;
    selectedCharacter = savedEntry.character;

    document.getElementById("note").value = savedEntry.note || "";

    document.querySelectorAll(".mood").forEach(button => {
      if (button.dataset.mood === selectedMood) {
        button.classList.add("selected");
      }
    });

    applyTheme(selectedMood);

    document.getElementById("savedMessage").textContent =
      `Saved locally: ${savedEntry.character} ${savedEntry.mood}`;
  }
}

document.querySelectorAll(".mood").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood").forEach(btn => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedMood = button.dataset.mood;
    selectedCharacter = button.textContent;

    applyTheme(selectedMood);
  });
});

async function saveMood() {
  const note = document.getElementById("note").value;

  if (!selectedMood) {
    document.getElementById("savedMessage").textContent = "Choose a mood first.";
    return;
  }

  const entry = {
    name: `${selectedCharacter} ${selectedMood} — ${getTimeSlot()} Check-In`,
    character: selectedCharacter,
    mood: selectedMood,
    note: note,
    slot: getTimeSlot(),
    date: new Date().toISOString()
  };

  localStorage.setItem(getTodayKey(), JSON.stringify(entry));

  document.getElementById("savedMessage").textContent = "Saving to Notion...";

  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry)
    });

    document.getElementById("savedMessage").textContent =
      `Saved to Notion: ${entry.character} ${entry.mood}`;
  } catch (error) {
    document.getElementById("savedMessage").textContent =
      "Saved on this device, but not sent to Notion.";

    console.error("Webhook error:", error);
  }
}

setupWidget();
