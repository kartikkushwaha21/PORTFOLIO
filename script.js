document.addEventListener("DOMContentLoaded", () => {
    initRevealAnimations();
    initActiveNav();
    initSmoothScroll();
    initThemeToggle();
    initTextRotation();
    initProjectFilters();
    initProjectSliders();
    initProjectGallery();
    initBackToTop();
    initContactForm();
    initParticles();
});

function initRevealAnimations() {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
    });

    elements.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 0.04, 0.28)}s`;
        observer.observe(element);
    });
}

function initActiveNav() {
    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll(".nav-link");

    const updateActiveLink = () => {
        let current = "";

        sections.forEach((section) => {
            const top = section.offsetTop - 140;
            const bottom = top + section.offsetHeight;

            if (window.scrollY >= top && window.scrollY < bottom) {
                current = section.id;
            }
        });

        links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
        });
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 100,
                behavior: "smooth",
            });
        });
    });
}

function initThemeToggle() {
    const button = document.querySelector(".theme-toggle");

    if (!button) {
        return;
    }

    applyTheme(true);
    localStorage.setItem("portfolio-theme", "dark");

    button.addEventListener("click", () => {
        const isDark = !document.body.classList.contains("dark-mode");
        applyTheme(isDark);
        localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    });

    function applyTheme(isDark) {
        document.body.classList.toggle("dark-mode", isDark);
        button.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

function initTextRotation() {
    class TxtRotate {
        constructor(element, values, period) {
            this.element = element;
            this.values = values;
            this.period = Number(period) || 2000;
            this.index = 0;
            this.text = "";
            this.isDeleting = false;
            this.tick();
        }

        tick() {
            const current = this.values[this.index % this.values.length];

            this.text = this.isDeleting
                ? current.substring(0, this.text.length - 1)
                : current.substring(0, this.text.length + 1);

            this.element.innerHTML = `<span class="wrap">${this.text}</span>`;

            let timeout = this.isDeleting ? 55 : 105;

            if (!this.isDeleting && this.text === current) {
                timeout = this.period;
                this.isDeleting = true;
            } else if (this.isDeleting && this.text === "") {
                this.isDeleting = false;
                this.index += 1;
                timeout = 350;
            }

            window.setTimeout(() => this.tick(), timeout);
        }
    }

    document.querySelectorAll(".txt-rotate").forEach((element) => {
        const values = element.getAttribute("data-rotate");
        const period = element.getAttribute("data-period");

        if (values) {
            new TxtRotate(element, JSON.parse(values), period);
        }
    });
}

function initProjectFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            buttons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            cards.forEach((card) => {
                const visible = filter === "all" || card.dataset.category === filter;
                card.style.display = visible ? "" : "none";
            });
        });
    });
}

function initProjectSliders() {
    const sliders = document.querySelectorAll(".project-slider");

    sliders.forEach((slider) => {
        const track = slider.querySelector(".project-slider-inner");
        const slides = Array.from(track.querySelectorAll("img"));
        const prev = slider.querySelector(".slider-prev");
        const next = slider.querySelector(".slider-next");
        const dotsWrap = slider.querySelector(".slider-dots");
        let current = 0;
        let timerId;

        if (slides.length <= 1) {
            prev?.remove();
            next?.remove();
            return;
        }

        slides.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.className = `slider-dot${index === 0 ? " active" : ""}`;
            dot.type = "button";
            dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
            dot.addEventListener("click", () => {
                goTo(index);
                restart();
            });
            dotsWrap.appendChild(dot);
        });

        const dots = Array.from(dotsWrap.querySelectorAll(".slider-dot"));

        const goTo = (index) => {
            current = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        const start = () => {
            timerId = window.setInterval(() => {
                goTo(current + 1);
            }, 4200);
        };

        const stop = () => window.clearInterval(timerId);
        const restart = () => {
            stop();
            start();
        };

        prev?.addEventListener("click", () => {
            goTo(current - 1);
            restart();
        });

        next?.addEventListener("click", () => {
            goTo(current + 1);
            restart();
        });

        let startX = 0;

        slider.addEventListener("touchstart", (event) => {
            startX = event.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener("touchend", (event) => {
            const endX = event.changedTouches[0].screenX;
            const delta = endX - startX;

            if (Math.abs(delta) < 40) {
                return;
            }

            goTo(delta < 0 ? current + 1 : current - 1);
            restart();
        }, { passive: true });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    });
}

function initProjectGallery() {
    const modal = document.getElementById("projectGallery");
    const container = modal?.querySelector(".gallery-container");
    const title = modal?.querySelector(".gallery-title");
    const dotsWrap = modal?.querySelector(".gallery-dots");
    const closeButton = modal?.querySelector(".gallery-close");
    const prevButton = modal?.querySelector(".gallery-prev");
    const nextButton = modal?.querySelector(".gallery-next");
    const triggers = document.querySelectorAll(".gallery-trigger");

    if (!modal || !container || !dotsWrap || !title) {
        return;
    }

    const projectMap = {
        "breakout-game": {
            title: "Breakout Ball Game",
            images: ["images/BBG4.jpg", "images/BBG1.jpg", "images/BBG2.jpg", "images/BBG3.jpg", "images/BBG5.jpg", "images/BBG6.jpg"],
        },
        "stock-analyzer": {
            title: "Stock Symbol Analyzer",
            images: ["images/b1.png", "images/b2.png"],
        },
        "multi-lang-project": {
            title: "Multi-Language Coding Platform",
            images: ["images/a1.png", "images/A2 (2).png", "images/a3.png", "images/a4.png"],
        },
        "note-app": {
            title: "Advanced Notes App",
            images: ["images/AN1.png", "images/AN2.png", "images/AN3.png", "images/AN4.png", "images/AN5.png"],
        },
    };

    let activeProject = null;
    let currentIndex = 0;

    const update = () => {
        container.querySelectorAll(".gallery-slide").forEach((slide, index) => {
            slide.classList.toggle("active", index === currentIndex);
        });
        dotsWrap.querySelectorAll(".gallery-dot").forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    };

    const render = () => {
        if (!activeProject) {
            return;
        }

        title.textContent = activeProject.title;
        container.innerHTML = "";
        dotsWrap.innerHTML = "";

        activeProject.images.forEach((src, index) => {
            const slide = document.createElement("div");
            slide.className = `gallery-slide${index === currentIndex ? " active" : ""}`;

            const image = document.createElement("img");
            image.src = src;
            image.alt = `${activeProject.title} screenshot ${index + 1}`;
            slide.appendChild(image);
            container.appendChild(slide);

            const dot = document.createElement("button");
            dot.className = `gallery-dot${index === currentIndex ? " active" : ""}`;
            dot.type = "button";
            dot.setAttribute("aria-label", `View screenshot ${index + 1}`);
            dot.addEventListener("click", () => {
                currentIndex = index;
                update();
            });
            dotsWrap.appendChild(dot);
        });
    };

    const open = (projectId) => {
        activeProject = projectMap[projectId];

        if (!activeProject) {
            return;
        }

        currentIndex = 0;
        render();
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const close = () => {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => open(trigger.dataset.project));
    });

    prevButton?.addEventListener("click", () => {
        if (!activeProject) {
            return;
        }

        currentIndex = (currentIndex - 1 + activeProject.images.length) % activeProject.images.length;
        update();
    });

    nextButton?.addEventListener("click", () => {
        if (!activeProject) {
            return;
        }

        currentIndex = (currentIndex + 1) % activeProject.images.length;
        update();
    });

    closeButton?.addEventListener("click", close);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            close();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (modal.style.display !== "flex") {
            return;
        }

        if (event.key === "Escape") {
            close();
        } else if (event.key === "ArrowLeft" && activeProject) {
            currentIndex = (currentIndex - 1 + activeProject.images.length) % activeProject.images.length;
            update();
        } else if (event.key === "ArrowRight" && activeProject) {
            currentIndex = (currentIndex + 1) % activeProject.images.length;
            update();
        }
    });
}

function initBackToTop() {
    const button = document.getElementById("backToTopBtn");

    if (!button) {
        return;
    }

    const toggleVisibility = () => {
        button.style.display = window.scrollY > 420 ? "grid" : "none";
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function initContactForm() {
    const form = document.getElementById("contactForm");

    if (!form) {
        return;
    }

    const honeypot = document.createElement("input");
    honeypot.type = "text";
    honeypot.name = "_honey";
    honeypot.style.display = "none";
    form.appendChild(honeypot);

    form.addEventListener("submit", (event) => {
        const name = form.querySelector("#name")?.value.trim();
        const email = form.querySelector("#email")?.value.trim();
        const message = form.querySelector("#message")?.value.trim();

        if (!name || !email || !message) {
            event.preventDefault();
            window.alert("Please fill in your name, email, and message before sending.");
        }
    });
}

function initParticles() {
    if (typeof particlesJS === "undefined" || !document.getElementById("particles-js")) {
        return;
    }

    particlesJS("particles-js", {
        particles: {
            number: {
                value: 34,
                density: { enable: true, value_area: 900 },
            },
            color: { value: ["#e76f51", "#2a9d8f", "#f4a261"] },
            shape: { type: "circle" },
            opacity: {
                value: 0.35,
                random: true,
            },
            size: {
                value: 4,
                random: true,
            },
            line_linked: {
                enable: true,
                distance: 160,
                color: "#d0b8a4",
                opacity: 0.22,
                width: 1,
            },
            move: {
                enable: true,
                speed: 1.2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
            },
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true,
            },
            modes: {
                grab: {
                    distance: 150,
                    line_linked: { opacity: 0.35 },
                },
                push: { particles_nb: 3 },
            },
        },
        retina_detect: true,
    });
}




// start http://127.0.0.1:8000
