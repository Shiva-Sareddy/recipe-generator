// Modern Recipe Generator App - JavaScript
class RecipeApp {
    constructor() {
        this.currentUser = null;
        this.currentDietaryFilter = "none";
        this.currentIngredients = [];
        this.currentRecipe = null;
        this.isLoading = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserData();
        this.checkNameModal();
        this.updateCharCount();
    }

    // Event Binding
    bindEvents() {
        // Modal events
        document
            .getElementById("submitName")
            .addEventListener("click", () => this.handleNameSubmit());
        document
            .getElementById("nameInput")
            .addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.handleNameSubmit();
            });
        document
            .getElementById("profileBtn")
            .addEventListener("click", () => this.showNameModal());

        // Input method toggle
        document
            .getElementById("textToggle")
            .addEventListener("click", () => this.switchInputMethod("text"));
        document
            .getElementById("imageToggle")
            .addEventListener("click", () => this.switchInputMethod("image"));

        // Text input events
        document
            .getElementById("ingredientTextarea")
            .addEventListener("input", () => {
                this.updateCharCount();
                this.validateInput();
            });
        document
            .getElementById("clearText")
            .addEventListener("click", () => this.clearTextInput());

        // Image upload events
        this.bindImageUploadEvents();

        // Filter events
        this.bindFilterEvents();

        // Generate button
        document
            .getElementById("generateBtn")
            .addEventListener("click", () => this.generateRecipe());

        // Recipe actions
        document
            .getElementById("regenerateBtn")
            .addEventListener("click", () => this.regenerateRecipe());
        document
            .getElementById("saveAsPdfBtn")
            .addEventListener("click", () => this.saveAsPDF());
        document
            .getElementById("shareBtn")
            .addEventListener("click", () => this.shareRecipe());

        // Panel toggles
        document
            .getElementById("ingredientsToggle")
            .addEventListener("click", () => this.togglePanel("ingredients"));
        document
            .getElementById("instructionsToggle")
            .addEventListener("click", () => this.togglePanel("instructions"));
    }

    // User Management
    loadUserData() {
        this.currentUser = localStorage.getItem("makeNow_userName");
        this.currentDietaryFilter =
            localStorage.getItem("makeNow_dietaryFilter") || "none";

        if (this.currentUser) {
            this.updateGreeting();
        }

        // Set saved dietary filter
        this.setActiveFilter(this.currentDietaryFilter);
    }

    checkNameModal() {
        const modal = document.getElementById("nameModal");
        if (!this.currentUser) {
            modal.classList.add("active");
            document.getElementById("nameInput").focus();
        }
    }

    showNameModal() {
        const modal = document.getElementById("nameModal");
        const nameInput = document.getElementById("nameInput");
        nameInput.value = this.currentUser || "";
        modal.classList.add("active");
        nameInput.focus();
    }

    handleNameSubmit() {
        const nameInput = document.getElementById("nameInput");
        const name = nameInput.value.trim();

        if (name.length < 2) {
            this.showToast(
                "Please enter a valid name (at least 2 characters)",
                "error"
            );
            return;
        }

        if (name.length > 30) {
            this.showToast("Name is too long (maximum 30 characters)", "error");
            return;
        }

        this.currentUser = name;
        localStorage.setItem("makeNow_userName", name);
        this.updateGreeting();
        document.getElementById("nameModal").classList.remove("active");
        this.showToast(
            `Welcome ${name}! Ready to create some amazing recipes? 🍳`,
            "success"
        );
    }

    updateGreeting() {
        if (!this.currentUser) return;

        const hour = new Date().getHours();
        let greeting;

        if (hour >= 5 && hour < 12) {
            greeting = `Good morning, ${this.currentUser}! ☀️`;
        } else if (hour >= 12 && hour < 17) {
            greeting = `Good afternoon, ${this.currentUser}! 🌤️`;
        } else if (hour >= 17 && hour < 21) {
            greeting = `Good evening, ${this.currentUser}! 🌅`;
        } else {
            greeting = `Hello, ${this.currentUser}! 🌙`;
        }

        document.getElementById("greetingText").textContent = greeting;
    }

    // Input Method Management
    switchInputMethod(method) {
        const textToggle = document.getElementById("textToggle");
        const imageToggle = document.getElementById("imageToggle");
        const textArea = document.getElementById("textInputArea");
        const imageArea = document.getElementById("imageInputArea");

        if (method === "text") {
            textToggle.classList.add("active");
            imageToggle.classList.remove("active");
            textArea.classList.add("active");
            imageArea.classList.remove("active");
        } else {
            imageToggle.classList.add("active");
            textToggle.classList.remove("active");
            imageArea.classList.add("active");
            textArea.classList.remove("active");
        }

        this.validateInput();
    }

    // Text Input Management
    updateCharCount() {
        const textarea = document.getElementById("ingredientTextarea");
        const charCount = document.getElementById("charCount");
        const count = textarea.value.length;
        charCount.textContent = `${count}/500`;

        if (count > 450) {
            charCount.style.color = "var(--warning-600)";
        } else {
            charCount.style.color = "var(--gray-500)";
        }
    }

    clearTextInput() {
        document.getElementById("ingredientTextarea").value = "";
        this.updateCharCount();
        this.validateInput();
    }

    // Image Upload Management
    bindImageUploadEvents() {
        const uploadZone = document.getElementById("uploadZone");
        const imageInput = document.getElementById("imageInput");
        const removeBtn = document.getElementById("removeImage");

        uploadZone.addEventListener("click", () => imageInput.click());
        uploadZone.addEventListener("dragover", (e) => this.handleDragOver(e));
        uploadZone.addEventListener("dragleave", (e) =>
            this.handleDragLeave(e)
        );
        uploadZone.addEventListener("drop", (e) => this.handleDrop(e));

        imageInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        removeBtn.addEventListener("click", () => this.removeImage());
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById("uploadZone").classList.add("dragover");
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById("uploadZone").classList.remove("dragover");
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById("uploadZone").classList.remove("dragover");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleImageUpload(files[0]);
        }
    }

    handleImageUpload(file) {
        // Validate file
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result);
            this.processImageOCR(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    validateImageFile(file) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            this.showToast(
                "Please upload a valid image file (JPG, PNG, or WEBP)",
                "error"
            );
            return false;
        }

        if (file.size > maxSize) {
            this.showToast(
                "Image file is too large. Please choose a file under 5MB",
                "error"
            );
            return false;
        }

        return true;
    }

    displayImagePreview(imageSrc) {
        const preview = document.getElementById("imagePreview");
        const img = document.getElementById("previewImg");

        img.src = imageSrc;
        preview.style.display = "block";

        this.validateInput();
    }

    async processImageOCR(imageSrc) {
        try {
            // Show loading state
            const ocrResult = document.getElementById("ocrResult");
            const detectedText = document.getElementById("detectedText");

            ocrResult.style.display = "block";
            detectedText.innerHTML =
                '<div class="loading-text">🔍 Analyzing image for ingredients...</div>';

            // This is a placeholder for OCR functionality
            // In a real implementation, you would use Tesseract.js here
            setTimeout(() => {
                const mockIngredients = [
                    "chicken breast",
                    "tomatoes",
                    "onions",
                    "garlic",
                    "bell peppers",
                    "olive oil",
                    "rice",
                ];

                const detectedIngredients = mockIngredients.slice(
                    0,
                    Math.floor(Math.random() * 4) + 3
                );
                detectedText.textContent = detectedIngredients.join(", ");

                this.currentIngredients = detectedIngredients;
                this.validateInput();
            }, 2000);
        } catch (error) {
            console.error("OCR Error:", error);
            this.showToast(
                "Failed to analyze image. Please try typing ingredients manually.",
                "error"
            );
            document.getElementById("ocrResult").style.display = "none";
        }
    }

    removeImage() {
        document.getElementById("imagePreview").style.display = "none";
        document.getElementById("imageInput").value = "";
        document.getElementById("ocrResult").style.display = "none";
        this.currentIngredients = [];
        this.validateInput();
    }

    // Filter Management
    bindFilterEvents() {
        const filterOptions = document.querySelectorAll(".filter-option");
        filterOptions.forEach((option) => {
            option.addEventListener("click", () => {
                const filter = option.dataset.filter;
                this.setActiveFilter(filter);
                this.currentDietaryFilter = filter;
                localStorage.setItem("makeNow_dietaryFilter", filter);
            });
        });
    }

    setActiveFilter(filter) {
        const filterOptions = document.querySelectorAll(".filter-option");
        const filterBadge = document.getElementById("filterBadge");

        filterOptions.forEach((option) => {
            if (option.dataset.filter === filter) {
                option.classList.add("active");
                filterBadge.textContent =
                    option.querySelector("span").textContent;
            } else {
                option.classList.remove("active");
            }
        });
    }

    // Input Validation
    validateInput() {
        const generateBtn = document.getElementById("generateBtn");
        const textArea = document.getElementById("textInputArea");
        const imageArea = document.getElementById("imageInputArea");

        let hasIngredients = false;

        if (textArea.classList.contains("active")) {
            const text = document
                .getElementById("ingredientTextarea")
                .value.trim();
            if (text.length > 0) {
                hasIngredients = true;
                this.currentIngredients = text
                    .split(",")
                    .map((ingredient) => ingredient.trim())
                    .filter((ingredient) => ingredient.length > 0);
            }
        } else if (imageArea.classList.contains("active")) {
            hasIngredients = this.currentIngredients.length > 0;
        }

        generateBtn.disabled = !hasIngredients || this.isLoading;

        if (hasIngredients && !this.isLoading) {
            generateBtn.classList.add("ready");
        } else {
            generateBtn.classList.remove("ready");
        }
    }

    // Recipe Generation
    async generateRecipe() {
        if (this.isLoading || this.currentIngredients.length === 0) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            // Simulate API call with realistic delay
            const recipe = await this.callRecipeAPI();
            this.displayRecipe(recipe);
            this.showToast("Recipe generated successfully! 🎉", "success");
        } catch (error) {
            console.error("Recipe generation error:", error);
            this.showToast(
                "Failed to generate recipe. Please try again.",
                "error"
            );
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async regenerateRecipe() {
        if (this.currentIngredients.length === 0) {
            this.showToast("Please add ingredients first", "warning");
            return;
        }

        await this.generateRecipe();
    }

    showLoadingState() {
        const generateBtn = document.getElementById("generateBtn");
        const btnContent = generateBtn.querySelector(".btn-content");
        const btnLoading = generateBtn.querySelector(".btn-loading");

        generateBtn.disabled = true;
        btnContent.style.display = "none";
        btnLoading.style.display = "flex";

        this.validateInput();
    }

    hideLoadingState() {
        const generateBtn = document.getElementById("generateBtn");
        const btnContent = generateBtn.querySelector(".btn-content");
        const btnLoading = generateBtn.querySelector(".btn-loading");

        btnContent.style.display = "flex";
        btnLoading.style.display = "none";

        this.validateInput();
    }

    async callRecipeAPI() {
        // Simulate API delay
        await new Promise((resolve) =>
            setTimeout(resolve, 2000 + Math.random() * 3000)
        );

        // Mock recipe data - In real implementation, this would call OpenAI API
        const mockRecipes = [
            {
                title: "Mediterranean Chicken Bowl",
                prepTime: "15 mins",
                cookTime: "25 mins",
                servings: "4 people",
                difficulty: "Easy",
                ingredients: [
                    "2 lbs chicken breast, cut into cubes",
                    "2 cups cooked rice",
                    "3 large tomatoes, diced",
                    "1 large onion, sliced",
                    "4 cloves garlic, minced",
                    "2 bell peppers, sliced",
                    "1/4 cup olive oil",
                    "1 tsp oregano",
                    "Salt and pepper to taste",
                ],
                instructions: [
                    "Heat olive oil in a large skillet over medium-high heat.",
                    "Season chicken cubes with salt, pepper, and oregano.",
                    "Cook chicken until golden brown and cooked through, about 6-8 minutes.",
                    "Remove chicken and set aside. In the same pan, sauté onions until translucent.",
                    "Add garlic and bell peppers, cook for 3-4 minutes until fragrant.",
                    "Add diced tomatoes and cook until they start to break down, about 5 minutes.",
                    "Return chicken to the pan and toss to combine with vegetables.",
                    "Serve over cooked rice and garnish with fresh herbs if desired.",
                ],
            },
            {
                title: "Savory Chicken Fried Rice",
                prepTime: "10 mins",
                cookTime: "20 mins",
                servings: "3 people",
                difficulty: "Easy",
                ingredients: [
                    "2 cups cooked rice (preferably day-old)",
                    "1 lb chicken breast, diced",
                    "2 large tomatoes, chopped",
                    "1 medium onion, diced",
                    "3 cloves garlic, minced",
                    "2 tbsp olive oil",
                    "2 eggs, beaten",
                    "2 tbsp soy sauce",
                    "1 tsp sesame oil",
                    "Green onions for garnish",
                ],
                instructions: [
                    "Heat 1 tablespoon of olive oil in a large wok or skillet over high heat.",
                    "Add beaten eggs and scramble quickly. Remove and set aside.",
                    "Add remaining oil to the pan and cook diced chicken until golden, about 5-6 minutes.",
                    "Add onions and garlic, stir-fry for 2 minutes until fragrant.",
                    "Add tomatoes and cook until they start to soften, about 3 minutes.",
                    "Add the cooked rice, breaking up any clumps with a spatula.",
                    "Stir in soy sauce and sesame oil, tossing everything together.",
                    "Return scrambled eggs to the pan and toss gently to combine.",
                    "Garnish with chopped green onions and serve immediately.",
                ],
            },
        ];

        // Apply dietary filter logic
        let filteredRecipes = mockRecipes;
        if (this.currentDietaryFilter !== "none") {
            // In a real implementation, this would filter based on dietary requirements
            filteredRecipes = mockRecipes.map((recipe) => {
                return {
                    ...recipe,
                    title: `${this.getDietaryPrefix()} ${recipe.title}`,
                    ingredients: this.adaptIngredientsForDiet(
                        recipe.ingredients
                    ),
                };
            });
        }

        // Return a random recipe
        return filteredRecipes[
            Math.floor(Math.random() * filteredRecipes.length)
        ];
    }

    getDietaryPrefix() {
        const prefixes = {
            vegetarian: "Vegetarian",
            vegan: "Vegan",
            keto: "Keto",
            "gluten-free": "Gluten-Free",
            "dairy-free": "Dairy-Free",
        };
        return prefixes[this.currentDietaryFilter] || "";
    }

    adaptIngredientsForDiet(ingredients) {
        // Simple adaptation logic - in real implementation, this would be more sophisticated
        if (
            this.currentDietaryFilter === "vegetarian" ||
            this.currentDietaryFilter === "vegan"
        ) {
            return ingredients.map((ingredient) =>
                ingredient.replace(/chicken|beef|pork|meat/gi, "tofu or tempeh")
            );
        }
        return ingredients;
    }

    // Recipe Display
    displayRecipe(recipe) {
        this.currentRecipe = recipe;

        // Update recipe header
        document.getElementById("recipeTitle").textContent = recipe.title;
        document.getElementById("prepTime").textContent = recipe.prepTime;
        document.getElementById("cookTime").textContent = recipe.cookTime;
        document.getElementById("servings").textContent = recipe.servings;
        document.getElementById("difficulty").textContent = recipe.difficulty;

        // Display ingredients
        this.displayIngredients(recipe.ingredients);

        // Display instructions
        this.displayInstructions(recipe.instructions);

        // Show recipe section
        document.getElementById("recipeSection").style.display = "block";

        // Smooth scroll to recipe
        document.getElementById("recipeSection").scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        // Save to localStorage for future reference
        localStorage.setItem("makeNow_lastRecipe", JSON.stringify(recipe));
    }

    displayIngredients(ingredients) {
        const ingredientsList = document.getElementById("ingredientsList");
        ingredientsList.innerHTML = "";

        ingredients.forEach((ingredient) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="ingredient-checkbox" onclick="this.classList.toggle('checked')"></div>
                <span>${ingredient}</span>
            `;
            ingredientsList.appendChild(li);
        });
    }

    displayInstructions(instructions) {
        const instructionsList = document.getElementById("instructionsList");
        instructionsList.innerHTML = "";

        instructions.forEach((instruction, index) => {
            const div = document.createElement("div");
            div.className = "instruction-step";
            div.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-content">${instruction}</div>
            `;
            instructionsList.appendChild(div);
        });
    }

    // Panel Management
    togglePanel(panelType) {
        const toggle = document.getElementById(`${panelType}Toggle`);
        const panel = toggle.closest(`.${panelType}-panel`);
        const content = panel.querySelector(".panel-content");
        const icon = toggle.querySelector("i");

        if (panel.classList.contains("collapsed")) {
            panel.classList.remove("collapsed");
            content.style.display = "block";
            icon.className = "fas fa-chevron-up";
        } else {
            panel.classList.add("collapsed");
            content.style.display = "none";
            icon.className = "fas fa-chevron-down";
        }
    }

    // Recipe Actions
    async saveAsPDF() {
        if (!this.currentRecipe) {
            this.showToast("No recipe to save", "warning");
            return;
        }

        try {
            this.showToast("Preparing PDF download...", "success");

            // Create PDF content
            const pdfContent = this.generatePDFContent();

            // In a real implementation, you would use jsPDF here
            // For now, we'll simulate the PDF generation
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulate download
            this.simulateDownload(
                `${this.currentRecipe.title.replace(/\s+/g, "_")}.pdf`
            );

            this.showToast("Recipe saved as PDF! 📄", "success");
        } catch (error) {
            console.error("PDF generation error:", error);
            this.showToast(
                "Failed to generate PDF. Please try again.",
                "error"
            );
        }
    }

    generatePDFContent() {
        const recipe = this.currentRecipe;
        const date = new Date().toLocaleDateString();

        return `
            makeNow Recipe
            Generated on: ${date}
            User: ${this.currentUser}
            
            ${recipe.title}
            
            Prep Time: ${recipe.prepTime}
            Cook Time: ${recipe.cookTime}
            Servings: ${recipe.servings}
            Difficulty: ${recipe.difficulty}
            
            INGREDIENTS:
            ${recipe.ingredients
                .map((ingredient, index) => `${index + 1}. ${ingredient}`)
                .join("\n")}
            
            INSTRUCTIONS:
            ${recipe.instructions
                .map((instruction, index) => `${index + 1}. ${instruction}`)
                .join("\n\n")}
            
            ---
            Created with makeNow - AI Recipe Generator
        `;
    }

    simulateDownload(filename) {
        const element = document.createElement("a");
        const content = this.generatePDFContent();
        const file = new Blob([content], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        element.click();
        URL.revokeObjectURL(element.href);
    }

    shareRecipe() {
        if (!this.currentRecipe) {
            this.showToast("No recipe to share", "warning");
            return;
        }

        const shareData = {
            title: this.currentRecipe.title,
            text: `Check out this amazing recipe: ${this.currentRecipe.title}`,
            url: window.location.href,
        };

        if (navigator.share) {
            navigator
                .share(shareData)
                .then(() =>
                    this.showToast("Recipe shared successfully! 🎉", "success")
                )
                .catch((error) => {
                    console.error("Error sharing:", error);
                    this.fallbackShare();
                });
        } else {
            this.fallbackShare();
        }
    }

    fallbackShare() {
        const recipeText = `${
            this.currentRecipe.title
        }\n\nIngredients:\n${this.currentRecipe.ingredients.join(
            "\n"
        )}\n\nInstructions:\n${this.currentRecipe.instructions
            .map((instruction, index) => `${index + 1}. ${instruction}`)
            .join("\n")}`;

        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(recipeText)
                .then(() =>
                    this.showToast("Recipe copied to clipboard! 📋", "success")
                )
                .catch(() => this.showToast("Unable to copy recipe", "error"));
        } else {
            this.showToast("Sharing not supported on this device", "warning");
        }
    }

    // Toast Notifications
    showToast(message, type = "success") {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        const icon = this.getToastIcon(type);

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${icon} ${this.getToastTitle(
            type
        )}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add("show"), 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️",
        };
        return icons[type] || icons.info;
    }

    getToastTitle(type) {
        const titles = {
            success: "Success",
            error: "Error",
            warning: "Warning",
            info: "Info",
        };
        return titles[type] || titles.info;
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Error Handling
    handleError(error, context = "Unknown") {
        console.error(`Error in ${context}:`, error);
        this.showToast(
            `Something went wrong in ${context}. Please try again.`,
            "error"
        );
    }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.recipeApp = new RecipeApp();
});

// Service Worker Registration (for future PWA capabilities)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}

// Global error handler
window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
    if (window.recipeApp) {
        window.recipeApp.showToast("An unexpected error occurred", "error");
    }
});

// Handle online/offline status
window.addEventListener("online", () => {
    if (window.recipeApp) {
        window.recipeApp.showToast("You are back online! 🌐", "success");
    }
});

window.addEventListener("offline", () => {
    if (window.recipeApp) {
        window.recipeApp.showToast(
            "You are offline. Some features may not work.",
            "warning"
        );
    }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + Enter to generate recipe
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (window.recipeApp && !window.recipeApp.isLoading) {
            window.recipeApp.generateRecipe();
        }
    }

    // Escape to close modal
    if (e.key === "Escape") {
        const modal = document.getElementById("nameModal");
        if (modal.classList.contains("active")) {
            modal.classList.remove("active");
        }
    }
});

// Prevent form submission on Enter in text inputs
document.addEventListener("keypress", (e) => {
    if (
        e.key === "Enter" &&
        e.target.tagName === "INPUT" &&
        e.target.type === "text"
    ) {
        e.preventDefault();
    }
});
