# CursorTutorial

## Chrome Extension: Sensitive Info Highlighter for ChatGPT

This Chrome extension monitors user input in ChatGPT and highlights sensitive information such as emails and phone numbers. It uses only a `content.js` and a `manifest.json`—no popup.html, background.js, or external libraries.

---

### Features

- **Monitors** the ChatGPT input area in real time.
- **Highlights** sensitive information (emails, phone numbers) as you type.
- **Displays** a popup warning above the input box.
- **No external dependencies**—just vanilla JavaScript and inline CSS.

---

## How It Works

### 1. Input Detection

- Targets the ChatGPT input area:  
  `textarea#prompt-textarea`
- Assumes exactly one `<p>` element inside the textarea containing the user input.
- Extracts the text content of the `<p>` tag only.
- Adds:
  - An `input` event listener to monitor typing.
  - A `blur` event listener to remove highlights and popups when the input is no longer focused.

### 2. Sensitive Information Detection

Detects the following patterns using regular expressions:

- **Email addresses:**
  ```js
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
  ```
- **Phone numbers:**
  ```js
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  ```

Highlights any detected sensitive content inline using a `<span>` element with the class `sensitive-info-highlight`.

---

### 3. Styling

- Injects a `<style>` element programmatically using JavaScript.
- Adds rules for:
  - `.sensitive-info-highlight`: yellow background, padding, rounded edges.
  - `.sensitive-info-popup`: light gray background, padding, rounded corners, border, shadow, font settings, and flex layout.

---

### 4. Overlay Behavior

- Creates a `div` element (overlay) to mimic the content of the input and apply highlights.
- The overlay is absolutely positioned on top of the textarea.
- Pointer events are disabled on the overlay.
- Preserves white space and line breaks using `white-space: pre-wrap` and `word-break: break-word`.

---

### 5. Popup Behavior

- Creates a popup (`div.sensitive-info-popup`) and appends it to `document.body`.
- The popup:
  - Is absolutely positioned above the input textarea.
  - Matches the width of the textarea and auto-adjusts height.
  - Displays a message:  
    `You input sensitive information: <b>type1, type2</b>`
  - Includes:
    - A **"Know more..."** button (styled as a link, triggers `alert()` when clicked).
    - A **close ("×")** button to remove the popup.
  - Is positioned using `getBoundingClientRect()` to align directly above the input box.
  - Temporarily sets `visibility: hidden` while measuring height for accurate placement.

---

### 6. Cleanup

- On every input, removes any existing highlights or popup before reapplying.
- Ensures only one set of listeners is attached by marking the textarea with a custom attribute `data-sensitiveInfoListener`.

---

### 7. Initialization

- Uses `setInterval()` to check for the presence of the textarea.
- Once detected, adds the necessary event listeners if not already present.

---

## Constraints

- **No external libraries.**
- **No popup.html or background.js.**
- **Only vanilla JavaScript and inline CSS via JavaScript.**
- **All code inside a single `content.js` file.**