// Helper function to add delay
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to trigger a click event on a text area
function triggerTextareaClick(textarea) {
    const mouseEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });

    textarea.dispatchEvent(mouseEvent);
}

// Function to call OpenAI's GPT API for an answer
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
                model: "gpt-4", // Replace with your desired model
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
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        }
        console.error("No valid response received from LLM:", data);
        return null;
    } catch (error) {
        console.error("Error fetching answer from LLM:", error);
        return null;
    }
}

// Function to handle answering questions
async function answerQuestion() {
    try {
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

            const labels = document.querySelectorAll("label");
            for (let label of labels) {
                if (label.textContent.trim().toLowerCase() === answer.toLowerCase()) {
                    label.click();
                    console.log("Clicked label matching answer:", answer);
                    return;
                }
            }

            const buttons = document.querySelectorAll("button");
            for (let button of buttons) {
                if (button.textContent.trim().toLowerCase() === answer.toLowerCase()) {
                    button.click();
                    console.log("Clicked button matching answer:", answer);
                    return;
                }
            }
        }

        const textArea = document.querySelector("textarea");
        if (textArea) {
            const answer = await fetchAnswerFromLLM("Provide an appropriate answer for a text area.");
            console.log("Fetched answer for textarea from LLM:", answer);

            if (answer) {
                textArea.value = answer;
                triggerTextareaClick(textArea);
                console.log("Filled text area with:", answer);
            }
        }
    } catch (error) {
        console.error("Error in answerQuestion function:", error);
    }
}

// Function to handle navigation to the next screen
async function nextScreen() {
    return new Promise(async (resolve) => {
        const submitBtn = document.querySelector("#testSubmit");

        if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
            console.log("Submit button enabled, clicking...");
            await sleep(500);
            submitBtn.click();

            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.type === "childList") {
                        console.log("Next screen loaded.");
                        observer.disconnect();
                        resolve();
                        return;
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } else {
            console.warn("Submit button is disabled.");
            resolve();
        }
    });
}

// Main loop to automate the process
async function main() {
    while (true) {
        try {
            const startButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim().toLowerCase() === "start");

            if (startButton) {
                console.log("Start button detected, clicking...");
                await sleep(500);
                startButton.click();
                await nextScreen();
                continue;
            }

            const continueButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim().toLowerCase() === "continue");

            if (continueButton) {
                console.log("Continue button detected, clicking...");
                await sleep(500);
                continueButton.click();
                await nextScreen();
                continue;
            }

            const submitBtn = document.querySelector("#testSubmit");
            if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
                console.log("Submit button detected, clicking...");
                await sleep(500);
                submitBtn.click();
                await nextScreen();
                continue;
            }

            if (submitBtn && submitBtn.classList.contains("disabledElement")) {
                console.log("Submit button is disabled, answering questions...");
                await answerQuestion();
            }

            await sleep(2000);
        } catch (error) {
            console.error("Error in main loop:", error);
        }
    }
}

// Start the script
main();
