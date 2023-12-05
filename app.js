const appContainer = document.getElementById("app");
let favoriteMeals = JSON.parse(localStorage.getItem("favoriteMeals")) || [];

function renderHome() {
  appContainer.innerHTML = `
        <div id="favoritesLink">
            <button href="#" onclick="renderFavorites()">My Favourite Meals</button>
        </div>
        <br>
        <div>
            <input type="text" id="searchInput" placeholder="Search for a meal">
            <div id="searchResults"></div>
        </div>
    `;

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  searchInput.addEventListener("input", debounce(searchMeal, 500));

  function searchMeal() {
    const query = searchInput.value.trim();
    if (query === "") {
      searchResults.innerHTML = "";
      return;
    }

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.meals) {
          searchResults.innerHTML = data.meals
            .map((meal) => renderMealResult(meal))
            .join("");
        } else {
          searchResults.innerHTML = "No results found";
        }
      })
      .catch((error) => console.error("Error fetching meals:", error));
  }

  function renderMealResult(meal) {
    return `
            <div class="meal-result">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%">
                <p>${meal.strMeal}</p>
                <button onclick="renderMealDetail(${meal.idMeal})">Details </button>
                <button onclick="addToFavorites(${meal.idMeal},'${meal.strMeal}')">Add to Favorites </button>
            </div>
            <br>
        `;
  }
  updateFavoritesLink();
}

function addToFavorites(mealId, MealName) {
  const meal = favoriteMeals.find((m) => m.idMeal === mealId);
  if (!meal) {
    const newFavorite = { idMeal: mealId, strMeal: MealName };
    favoriteMeals.push(newFavorite);
    updateFavoritesLink();
    saveFavoriteMeals();
  }
}

function updateFavoritesLink() {
  const favoritesLink = document.getElementById("favoritesLink");
  const hasFavorites = favoriteMeals.length > 0;
  favoritesLink.style.display = hasFavorites ? "block" : "none";
}

function saveFavoriteMeals() {
  localStorage.setItem("favoriteMeals", JSON.stringify(favoriteMeals));
}

function renderMealDetail(mealId) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then((response) => response.json())
    .then((data) => {
      const meal = data.meals[0];
      appContainer.innerHTML = `
                <button href="#" onclick="renderHome()">Home</button>
                <button href="#" onclick="renderFavorites()">My Favourite Meals</button>
                <br>
                <br>
                <br>
                <div>
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%">
                    <h2>${meal.strMeal}</h2>
                    <p>${meal.strInstructions}</p>
                    <button onclick="addToFavorites(${meal.idMeal},'${meal.strMeal}')">Add to Favorites </button>
                </div>
            `;
    })
    .catch((error) => console.error("Error fetching meal details:", error));
}

function renderFavorites() {
  appContainer.innerHTML = `
        <div>
            <button href="#" onclick="renderHome()">Home</button>
            <h2>My Favourite Meals</h2>
            <div id="favoriteList"></div>
        </div>
    `;

  const favoriteList = document.getElementById("favoriteList");

  if (favoriteMeals.length === 0) {
    favoriteList.innerHTML = "You have no favorite meals yet.";
    return;
  }

  favoriteList.innerHTML = favoriteMeals
    .map((meal) => renderFavoriteItem(meal))
    .join("");

  function renderFavoriteItem(meal) {
    return `
            <div class="favorite-item">
                <p>${meal.strMeal}</p>
                <button href="#" onclick="renderMealDetail(${meal.idMeal})">Details</button>
                <button onclick="removeFromFavorites(${meal.idMeal})">Remove from Favorites </button>
            </div>
        `;
  }
}

function removeFromFavorites(mealId) {
  favoriteMeals = favoriteMeals.filter((meal) => meal.idMeal !== mealId);
  saveFavoriteMeals();
  renderFavorites();
}

// Utility function to debounce input events
function debounce(func, delay) {
  let timeoutId;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Initial render
renderHome();
