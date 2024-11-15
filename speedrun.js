// Helper function to add delay
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to trigger a click event
function triggerTextareaClick(textarea) {
    const mouseEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });

    textarea.dispatchEvent(mouseEvent);
}

// Function to call OpenAI's GPT API to get an answer
async function fetchAnswerFromLLM(question) {
    const apiKey = "0334229e8ccc48329d31675a9bd4717b"; // Replace with your OpenAI API key
    const endpoint = "https://api.openai.com/v1/chat/completions";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4", // Replace with the desired model (e.g., gpt-3.5-turbo)
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant.",
                    },
                    {
                        role: "user",
                        content: question,
                    },
                ],
                max_tokens: 100,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        return data.choices[0]?.message?.content.trim();
    } catch (error) {
        console.error("Error fetching answer from LLM:", error);
        return null;
    }
}

// Function to automate answering questions
async function answerQuestion() {
    try {
        // For questions displayed in a text element
        const questionElement = document.querySelector(".question-text");
        if (questionElement) {
            const question = questionElement.textContent.trim();
            console.log("Extracted question:", question);

            const answer = await fetchAnswerFromLLM(question);
            console.log("Fetched answer from LLM:", answer);

            if (!answer) {
                console.warn("No answer received from LLM.");
                return;
            }

            // Match answer with available labels or buttons
            const labels = document.querySelectorAll("label");
            for (let label of labels) {
                if (label.textContent.trim() === answer) {
                    label.click();
                    return;
                }
            }

            const buttons = document.querySelectorAll("button");
            for (let button of buttons) {
                if (button.textContent.trim() === answer) {
                    button.click();
                    return;
                }
            }
        }

        // For text-area-based questions
        const textArea = document.querySelector("textarea");
        if (textArea) {
            const answer = await fetchAnswerFromLLM("Please provide an appropriate answer.");
            console.log("Fetched answer for textarea from LLM:", answer);

            if (answer) {
                textArea.value = answer;
                triggerTextareaClick(textArea);
            }
        }
    } catch (error) {
        console.error("Error answering question:", error);
    }
}

// Function to move to the next screen
async function nextScreen() {
    return new Promise(async (resolve) => {
        const submitBtn = document.querySelector("#testSubmit");

        if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
            await sleep(500);
            submitBtn.click();

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "childList") {
                        console.log("Next screen loaded");
                        observer.disconnect();
                        resolve();
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
            console.log("Waiting for next screen to load");
        } else {
            console.warn("Submit button is still disabled");
            resolve();
        }
    });
}

// Main automation loop
async function main() {
    while (true) {
        try {
            // Start button handling
            const startButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim() === "Start");

            if (startButton) {
                console.log("Start button detected, clicking...");
                await sleep(500);
                startButton.click();
                await nextScreen();
                await sleep(2000);
                continue;
            }

            // Continue button handling
            const continueButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim() === "Continue");

            if (continueButton) {
                console.log("Continue button detected, clicking...");
                await sleep(500);
                continueButton.click();
                await nextScreen();
                continue;
            }

            // Submit button handling
            const submitBtn = document.querySelector("#testSubmit");

            if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
                console.log("Submit button enabled, clicking to go to next screen...");
                await sleep(500);
                submitBtn.click();
                await nextScreen();
                continue;
            }

            if (submitBtn && submitBtn.classList.contains("disabledElement")) {
                console.log("Submit button is disabled, answering questions...");

                const textarea = document.querySelector("textarea");
                if (textarea) {
                    console.log("Textarea detected, stopping the script.");
                    alert("Textarea questions need to be answered manually. Restart script once you're done.");
                    return;
                }

                const recordingButton = document.querySelector('button[aria-label="start-recording"]');
                if (recordingButton) {
                    console.log("Speech-based questions detected, stopping the script.");
                    alert("Speech-based questions need to be done manually. Restart script once you're done.");
                    return;
                }

                await answerQuestion();
            }

            await sleep(2000);
        } catch (error) {
            console.error("Error in main loop, restarting script...", error);
        }
    }
}

// Run the main automation function
main();
