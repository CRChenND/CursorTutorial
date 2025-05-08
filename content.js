// Inject styles for highlight and popup
const style = document.createElement('style');
style.innerHTML = `
  .sensitive-info-popup {
    position: absolute;
    left: 0;
    bottom: 100%;
    margin-bottom: 8px;
    background: #ececec;
    color: #222;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 1.1em;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    z-index: 10000;
    border: 1px solid #d0d0d0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sensitive-info-highlight {
    background: #f7c873;
    color: #222;
    border-radius: 3px;
    padding: 0 2px;
  }
`;
document.head.appendChild(style);

// Patterns for sensitive info
const SENSITIVE_PATTERNS = [
  { type: "email", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: "phone number", regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  { type: "address", regex: /\b(?:St\.|Street|Rd\.|Road|Ave\.|Avenue)\b/g }
];

let popup = null;
let overlay = null;

function highlightSensitiveInfo(textarea) {
  removeHighlights(textarea);
  removePopup();

  const value = textarea.querySelector('p').textContent;
  let foundTypes = new Set();
  let highlightedHTML = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  SENSITIVE_PATTERNS.forEach(({ type, regex }) => {
    highlightedHTML = highlightedHTML.replace(regex, match => {
      foundTypes.add(type);
      return `<span class="sensitive-info-highlight">${match}</span>`;
    });
  });

  if (foundTypes.size === 0) return;

  // Create overlay for highlights
  overlay = document.createElement('div');
  overlay.className = 'sensitive-info-overlay';
  overlay.style.cssText = `
    position: absolute;
    left: 0; top: 0; width: 100%; height: 100%;
    pointer-events: none;
    color: transparent;
    white-space: pre-wrap;
    word-break: break-word;
    font: inherit;
    z-index: 2;
    padding: 8px 12px;
  `;
  overlay.innerHTML = highlightedHTML.replace(/\n/g, '<br>');

  // Position overlay on top of textarea
  textarea.parentElement.style.position = 'relative';
  textarea.style.background = 'transparent';
  textarea.style.position = 'relative';
  textarea.parentElement.appendChild(overlay);

  // Show popup above textarea
  showPopup(textarea, Array.from(foundTypes));
}

function removeHighlights(textarea) {
  if (overlay && overlay.parentElement) overlay.remove();
  overlay = null;
}

function showPopup(textarea, types) {
  popup = document.createElement('div');
  popup.className = 'sensitive-info-popup';

  // Message span with bold types
  const messageSpan = document.createElement('span');
  messageSpan.innerHTML = `You input sensitive information: <b>${types.join(', ')}</b>`;
  messageSpan.style.flex = '1';
  messageSpan.style.overflowWrap = 'break-word';
  messageSpan.style.display = 'block';
  messageSpan.style.fontSize = '1.05em';
  messageSpan.style.color = '#222';
  messageSpan.style.fontWeight = '400';

  // 'Know more...' button styled as subtle link
  const knowMoreBtn = document.createElement('button');
  knowMoreBtn.textContent = 'Know more...';
  knowMoreBtn.style.background = 'none';
  knowMoreBtn.style.border = 'none';
  knowMoreBtn.style.color = '#6b6b6b';
  knowMoreBtn.style.cursor = 'pointer';
  knowMoreBtn.style.fontWeight = '500';
  knowMoreBtn.style.fontSize = '1em';
  knowMoreBtn.style.marginLeft = '16px';
  knowMoreBtn.style.marginRight = '8px';
  knowMoreBtn.style.padding = '0';
  knowMoreBtn.onmouseover = function() { knowMoreBtn.style.textDecoration = 'underline'; };
  knowMoreBtn.onmouseout = function() { knowMoreBtn.style.textDecoration = 'none'; };
  knowMoreBtn.onclick = function(e) {
    e.stopPropagation();
    alert('You can add more info here!');
  };

  // Close (x) button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.3em';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#888';
  closeBtn.style.padding = '0 8px';
  closeBtn.style.marginLeft = '4px';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.onclick = function() {
    removePopup();
  };

  // Style popup for layout and appearance
  popup.style.minHeight = '44px';
  popup.style.height = 'auto';
  popup.style.alignItems = 'center';
  popup.style.padding = '0 18px 0 18px';
  popup.style.boxSizing = 'border-box';
  popup.style.display = 'flex';
  popup.style.position = 'absolute';
  popup.style.background = '#ececec';
  popup.style.borderRadius = '12px';
  popup.style.border = '1px solid #d0d0d0';
  popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  popup.style.zIndex = '10000';
  popup.style.fontFamily = 'inherit';
  popup.style.margin = '0';
  popup.style.gap = '0';

  // Add elements to popup
  popup.appendChild(messageSpan);
  popup.appendChild(knowMoreBtn);
  popup.appendChild(closeBtn);

  document.body.appendChild(popup);

  // Position popup absolutely above the textarea
  const rect = textarea.getBoundingClientRect();
  popup.style.width = `${rect.width}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
  // Temporarily set visibility hidden to measure height
  popup.style.visibility = 'hidden';
  popup.style.display = 'flex';
  const popupHeight = popup.offsetHeight;
  // Now set the correct top position
  popup.style.top = `${rect.top + window.scrollY - popupHeight - 8}px`;
  popup.style.visibility = 'visible';
}

function removePopup() {
  if (popup && popup.parentElement) popup.remove();
  popup = null;
}

// Find the ChatGPT textarea and observe for input
function observeTextarea() {
  const interval = setInterval(() => {
    // ChatGPT input textarea (robust selector)
    const textarea = document.getElementById('prompt-textarea');
    if (textarea && !textarea.dataset.sensitiveInfoListener) {
      textarea.dataset.sensitiveInfoListener = "true";
      textarea.addEventListener('input', () => highlightSensitiveInfo(textarea));
      textarea.addEventListener('blur', () => {
        removeHighlights(textarea);
        removePopup();
      });
    }
  }, 1000);
}

observeTextarea();