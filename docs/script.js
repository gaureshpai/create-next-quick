const hamburgerMenu = document.getElementById("hamburger-menu")
const mainNav = document.getElementById("main-nav")
const sidebar = document.getElementById("sidebar")
const copyButtons = document.querySelectorAll(".copy-btn")

// Toggle hamburger menu and navigation
hamburgerMenu.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("active")
    mainNav.classList.toggle("active")
})

// Close menu when a nav link is clicked
document.querySelectorAll("#main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
        hamburgerMenu.classList.remove("active")
        mainNav.classList.remove("active")
    })
})

// Toggle sidebar on mobile
hamburgerMenu.addEventListener("click", () => {
    sidebar.classList.toggle("active")
})

// Close sidebar when a sidebar link is clicked
document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove("active")
            hamburgerMenu.classList.remove("active")
        }
    })
})

copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const textToCopy = button.getAttribute("data-code")
        const originalText = button.innerHTML // Declare originalText variable here

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                button.classList.add("copied")
                button.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>'

                setTimeout(() => {
                    button.classList.remove("copied")
                    button.innerHTML = originalText
                }, 2000)
            })
            .catch(() => {
                button.innerHTML = '<span class="copy-icon">✗</span><span class="copy-text">Failed</span>'
                setTimeout(() => {
                    button.innerHTML = originalText
                }, 2000)
            })
    })
})

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest("header")) {
        hamburgerMenu.classList.remove("active")
        mainNav.classList.remove("active")
    }
})
