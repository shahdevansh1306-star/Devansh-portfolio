const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = document.querySelectorAll(".reveal");
const yearNode = document.getElementById("current-year");
const progressBar = document.querySelector(".scroll-progress__bar");
const countUpItems = document.querySelectorAll(".count-up");
const resumeLinks = document.querySelectorAll(".js-resume-download");
const contactForm = document.getElementById("contact-form");
const contactFormStatus = document.getElementById("contact-form-status");
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.getElementById("theme-color-meta");
const typingText = document.querySelector(".typing-text");
const meterFills = document.querySelectorAll(".meter-fill");
const projectCards = document.querySelectorAll(".project-card");

const themeColors = {
  light: "#f6efe5",
  dark: "#0c1513",
};

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? "Light UI" : "Dark UI";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColors[theme] || themeColors.light);
  }
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const preferredTheme = (() => {
  const storedTheme = window.localStorage.getItem("portfolio-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
})();

applyTheme(preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem("portfolio-theme", nextTheme);
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const updateScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

resumeLinks.forEach((link) => {
  link.addEventListener("click", async (event) => {
    if (!/^https?:/.test(window.location.protocol)) {
      return;
    }

    event.preventDefault();

    try {
      const response = await fetch(link.href, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Resume fetch failed");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = objectUrl;
      tempLink.download = link.getAttribute("download") || "Devansh-Shah-Resume.pdf";
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (_error) {
      window.open(link.href, "_blank", "noopener");
    }
  });
});

if (contactForm) {
  const clearFormStatus = () => {
    if (contactFormStatus) {
      contactFormStatus.textContent = "";
    }
  };

  contactForm.addEventListener("input", clearFormStatus);
  contactForm.addEventListener("change", clearFormStatus);

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const projectType = String(formData.get("projectType") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !projectType || !message) {
      if (contactFormStatus) {
        contactFormStatus.textContent = "Please fill in all fields so I can understand your project clearly.";
      }
      return;
    }

    const subject = encodeURIComponent(`${projectType} inquiry from ${name}`);
    const body = encodeURIComponent(
      [
        `Hi Devansh,`,
        ``,
        `I would like to discuss this project: ${projectType}`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        ``,
        `Project brief:`,
        message,
      ].join("\n")
    );

    if (contactFormStatus) {
      contactFormStatus.textContent = "Opening your email app with the drafted project brief...";
    }

    window.location.href = `mailto:shahdevansh1306@gmail.com?subject=${subject}&body=${body}`;
  });
}

if (typingText) {
  const words = (typingText.dataset.words || "")
    .split("|")
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let wordIndex = 0;
    let charIndex = words[0].length;
    let isDeleting = false;

    const tickTyping = () => {
      const activeWord = words[wordIndex];
      typingText.textContent = activeWord.slice(0, charIndex);

      const delay = isDeleting ? 42 : 74;

      if (!isDeleting && charIndex === activeWord.length) {
        isDeleting = true;
        window.setTimeout(tickTyping, 1200);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      charIndex += isDeleting ? -1 : 1;
      window.setTimeout(tickTyping, delay);
    };

    typingText.textContent = words[0];
    window.setTimeout(tickTyping, 900);
  }
}

projectCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--spot-x", `${x}%`);
    card.style.setProperty("--spot-y", `${y}%`);
  });
});

const animateCount = (element) => {
  const target = Number(element.dataset.target || "0");
  const suffix = element.dataset.suffix || "";
  const duration = 1200;
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    element.textContent = `${current.toString().padStart(target >= 1000 ? 4 : 2, "0")}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.65,
    }
  );

  countUpItems.forEach((item) => countObserver.observe(item));

  const meterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const fill = entry.target;
        fill.style.width = fill.dataset.width || "0%";
        observer.unobserve(fill);
      });
    },
    {
      threshold: 0.5,
    }
  );

  meterFills.forEach((fill) => meterObserver.observe(fill));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (!visibleSection) {
        return;
      }

      const sectionId = visibleSection.target.getAttribute("id");
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-active", isMatch);
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-20% 0px -45% 0px",
    }
  );

  document.querySelectorAll("main section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  countUpItems.forEach((item) => animateCount(item));
  meterFills.forEach((fill) => {
    fill.style.width = fill.dataset.width || "0%";
  });
}
