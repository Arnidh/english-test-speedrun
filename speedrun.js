// Helper function to wait for an element to appear
async function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const interval = 100; // Check every 100ms
        let elapsedTime = 0;

        const check = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(check);
                resolve(element);
            }

            elapsedTime += interval;
            if (elapsedTime >= timeout) {
                clearInterval(check);
                reject(new Error(`Timeout waiting for element: ${selector}`));
            }
        }, interval);
    });
}

// Helper function to add delay
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to fetch the answer from OpenAI API
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
                model: "gpt-4", // Use your preferred model
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: question },
                ],
                max_tokens: 100,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        }
        console.error("No valid response from LLM:", data);
        return null;
    } catch (error) {
        console.error("Error fetching answer from LLM:", error);
        return null;
    }
}

// Function to handle MCQs
async function handleMCQs(questionText) {
    try {
        const answer = await fetchAnswerFromLLM(questionText);
        console.log("Fetched answer from LLM:", answer);

        if (!answer) {
            console.warn("No answer received for MCQ.");
            return false;
        }

        const labels = document.querySelectorAll("label");
        for (let label of labels) {
            const labelText = label.textContent.trim();
            console.log("Checking label:", labelText);
            if (labelText.toLowerCase() === answer.toLowerCase()) {
                label.click();
                console.log("Clicked label:", labelText);
                return true;
            }
        }

        console.warn("Answer not matched with any label.");
        return false;
    } catch (error) {
        console.error("Error handling MCQs:", error);
        return false;
    }
}

// Function to handle text inputs
async function handleTextInput(questionText) {
    const textArea = document.querySelector("textarea");
    if (textArea) {
        const answer = await fetchAnswerFromLLM(questionText);
        console.log("Fetched answer for text area from LLM:", answer);

        if (answer) {
            textArea.value = answer;
            textArea.dispatchEvent(new Event("input", { bubbles: true }));
            console.log("Filled text area with:", answer);
            return true;
        }
    }
    console.warn("No text area found.");
    return false;
}

// Function to answer the current question
async function answerQuestion() {
    try {
        const questionElement = await waitForElement(".question-text");
        const questionText = questionElement.textContent.trim();
        console.log("Extracted question:", questionText);

        // Check for MCQs
        const hasMCQs = document.querySelectorAll("label").length > 0;
        if (hasMCQs) {
            console.log("MCQ detected. Handling MCQs...");
            const success = await handleMCQs(questionText);
            if (success) return true;
        }

        // Check for text input
        const textArea = document.querySelector("textarea");
        if (textArea) {
            console.log("Text input detected. Handling text area...");
            const success = await handleTextInput(questionText);
            if (success) return true;
        }

        console.warn("No known question type detected.");
        return false;
    } catch (error) {
        console.error("Error answering question:", error);
        return false;
    }
}

// Function to navigate to the next screen
async function nextScreen() {
    const submitBtn = await waitForElement("#testSubmit", 5000).catch(() => null);

    if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
        console.log("Submit button enabled, clicking...");
        await sleep(500);
        submitBtn.click();
        return true;
    }

    console.warn("Submit button is disabled or not found.");
    return false;
}

// Main loop to automate the process
async function main() {
    while (true) {
        try {
            // Handle start button
            const startButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim().toLowerCase() === "start");

            if (startButton) {
                console.log("Start button detected, clicking...");
                await sleep(500);
                startButton.click();
                continue;
            }

            // Handle continue button
            const continueButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim().toLowerCase() === "continue");

            if (continueButton) {
                console.log("Continue button detected, clicking...");
                await sleep(500);
                continueButton.click();
                continue;
            }

            // Handle submit or answer questions
            const submitSuccess = await nextScreen();
            if (!submitSuccess) {
                console.log("Answering questions...");
                await answerQuestion();
            }

            await sleep(2000); // Pause between iterations
        } catch (error) {
            console.error("Error in main loop:", error);
        }
    }
}

// Start the script
main();
