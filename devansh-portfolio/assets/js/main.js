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

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
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
}
