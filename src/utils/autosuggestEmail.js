export class autoSuggestEmail {
  constructor(inputElement, options = {}) {  
    const supportsModernBrowser = !!document.querySelector && !!window.addEventListener;
    if (!supportsModernBrowser) return;

    this.inputElement = inputElement;
    this.options = options;

    const defaultOptions = {
      domains: [
        "aol.com",
        "facebook.com",
        "gmail.com",
        "googlemail.com",
        "hotmail.com",
        "hotmail.co.uk",
        "icloud.com",
        "live.com",
        "me.com",
        "mail.com",
        "msn.com",
        "outlook.com",
        "yahoo.com",
        "yahoo.co.uk",
        "ymail.com",
      ],
      priority: [
        "gmail.com",
        "icloud.com",
        "hotmail.com",
        "facebook.com",
        "outlook.com",
        "yahoo.com",
      ],
    };

    // Merge default options with provided options
    for (let key in defaultOptions) {
      if (defaultOptions.hasOwnProperty(key) && !this.options.hasOwnProperty(key)) {
        this.options[key] = defaultOptions[key];
      }
    }

    // Set default input element if not provided
    if (this.inputElement === undefined || this.inputElement === null) {
      this.inputElement = document.querySelector("form input#email");
    }

    if (this.inputElement === null) return;

    // Create dropdown list container
    this.listContainer = document.createElement("ul");
    this.listContainer.style.display = "none";
    this.listContainer.style.position = "absolute";
    this.listContainer.id = "asm-autolist";
    this.listContainer.className = "asm-dropdown";
    this.inputElement.parentNode.insertBefore(
      this.listContainer,
      this.inputElement.nextSibling
    );

    // Bind event listeners
    this.inputElement.addEventListener("keydown", (e) => {
      // Solo prevenir Enter si hay sugerencias visibles
      if (e.keyCode === 13 && this.listContainer.style.display !== "none") {
        e.preventDefault();
      }
    });

    this.inputElement.addEventListener("keyup", (e) => this.handleKeyup(e));
  }

  addClass(element, className) {
    if (element.classList) {
      element.classList.add(className);
    } else {
      element.className += " " + className;
    }
  }

  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  setupListItems() {
    const items = this.listContainer.querySelectorAll("li");
    this.addClass(items[0], "is-highlighted");

    for (let i = 0; i < items.length; i++) {
      items[i].style.cursor = "pointer";
      
      items[i].addEventListener("click", () => {
        this.inputElement.value = items[i].textContent;
        this.listContainer.style.display = "none";
        
        // Dispatch input event to trigger validation
        const inputEvent = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        this.inputElement.dispatchEvent(inputEvent);
      });

      items[i].addEventListener("mouseenter", function() {
        const siblings = this.parentNode.childNodes;
        for (let j = 0; j < siblings.length; j++) {
          siblings[j].classList.remove("is-highlighted");
        }
        this.classList.add("is-highlighted");
      });
    }

    this.listContainer.style.display = "";
  }

  handleKeyup(e) {
    // Enter key
    if (e.keyCode === 13) {
      const highlighted = document.getElementsByClassName("is-highlighted");
      if (highlighted.length > 0) {
        e.preventDefault();
        this.inputElement.value = highlighted[0].textContent;
        this.listContainer.style.display = "none";
        
        // Dispatch input event to trigger validation
        const inputEvent = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        this.inputElement.dispatchEvent(inputEvent);
      }
    }
    // Left, Right, or Backspace
    else if (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 8) {
      this.listContainer.style.display = "none";
    }
    // Down or Up arrow
    else if (e.keyCode === 40 || e.keyCode === 38) {
      const highlighted = document.getElementsByClassName("is-highlighted");
      if (highlighted.length > 0) {
        const nextElement = e.keyCode === 40 
          ? highlighted[0].nextSibling 
          : highlighted[0].previousSibling;
        
        if (nextElement) {
          const siblings = nextElement.parentNode.childNodes;
          for (let i = 0; i < siblings.length; i++) {
            siblings[i].classList.remove("is-highlighted");
          }
          this.addClass(nextElement, "is-highlighted");
        }
      }
    }
    // Other keys - show suggestions
    else {
      // Clear existing list
      while (this.listContainer.firstChild) {
        this.listContainer.removeChild(this.listContainer.firstChild);
      }
      this.listContainer.style.display = "none";

      const parts = this.inputElement.value.trim().split("@");
      if (parts.length < 2 || parts[0] === "") return;

      const domainPart = parts[1];
      const exactMatches = [];
      const fuzzyMatches = [];

      if (domainPart.length === 0) {
        // Show priority domains when @ is typed
        for (let i = 0; i < this.options.priority.length; i++) {
          exactMatches.push(this.options.priority[i]);
        }
      } else {
        // Find matching domains
        for (let i = 0; i < this.options.domains.length; i++) {
          const domain = this.options.domains[i];
          const domainPrefix = domain.substr(0, domainPart.length);
          
          if (domainPart === domainPrefix) {
            exactMatches.push(domain);
          } else if (
            this.levenshteinDistance(domainPart, domainPrefix) < 2 &&
            domainPart.length > 1
          ) {
            fuzzyMatches.push(domain);
          }
        }
      }

      // Display exact matches
      if (exactMatches.length > 0) {
        for (let i = 0; i < exactMatches.length; i++) {
          const remaining = exactMatches[i].substr(domainPart.length);
          const li = document.createElement("li");
          li.innerHTML = this.inputElement.value + "<strong>" + remaining + "</strong>";
          this.listContainer.appendChild(li);
        }
        this.setupListItems();
      }
      // Display fuzzy matches if no exact matches
      else if (fuzzyMatches.length > 0) {
        for (let i = 0; i < fuzzyMatches.length; i++) {
          const li = document.createElement("li");
          li.innerHTML = parts[0] + "@<strong>" + fuzzyMatches[i] + "</strong>";
          this.listContainer.appendChild(li);
        }
        this.setupListItems();
      }
    }
  }
}