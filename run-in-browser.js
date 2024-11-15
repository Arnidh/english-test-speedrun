fetch(
    "https://raw.githubusercontent.com/Arnidh/english-test-speedrun/refs/heads/main/speedrun.js"
)
    .then((response) => response.text())
    .then((code) => eval(code));
