/* =========================================================
   DOM Elements
   ========================================================= */

const menu_btn = document.querySelector(".menu-btn");
const nav_links = document.querySelector(".nav-links");

const search_input = document.querySelector(".search-input");
const search_btn = document.querySelector(".search-btn");

const movie_grid = document.querySelector(".movie-grid");
const movies_heading = document.querySelector("#movies-heading");


/* =========================================================
   TMDB API
   ========================================================= */

const API_TOKEN = `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOGQ1YWUxMjYzY2I3MTM0YTI5ZjNhMDJkNGNjYzBmZSIsIm5iZiI6MTc4NzgyNjEyOC4zNjYwMDAyLCJzdWIiOiI2YTkwMGZkMDBlNmEwNDk1MTMzMTA3NWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Cay0nyS-6piro5KkqZ41ktfyBjKF3jgICZ7YrxQOst4`;


/* =========================================================
   Navbar
   ========================================================= */

// Opens and closes the mobile navigation menu.
menu_btn.addEventListener("click", () => {
    nav_links.classList.toggle("show");
});


/* =========================================================
   Favorites Helpers
   ========================================================= */

// Gets the movie IDs saved in localStorage.
const getFavorites = () => {
    return JSON.parse(localStorage.getItem("favorites")) || [];
};

// Checks whether a movie is currently a favorite.
const isMovieFavorite = (movieId, favorites) => {
    return favorites.includes(movieId.toString());
};


/* =========================================================
   Movie Card
   ========================================================= */

// Creates the HTML for one movie card.
const createMovieCard = (movie, favorites) => {

    const title = movie.title || "Unknown Movie";
    const rating = movie.vote_average || "N/A";
    const releaseDate = movie.release_date || "N/A";

    const posterURL = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "";

    const isFavorite = isMovieFavorite(movie.id, favorites);

    return `
        <div class="movie-card" data-movie-id="${movie.id}">

            ${
                movie.poster_path
                    ? `<img src="${posterURL}" alt="${title}">`
                    : `<div class="no-poster">🎬<br>No Poster</div>`
            }

            <h3>${title}</h3>

            <p>⭐ ${rating}</p>

            <p>${releaseDate}</p>

            <button class="favorite-btn ${isFavorite ? "favorited" : ""}">
                ${isFavorite ? "♥" : "♡"}
            </button>

        </div>
    `;
};


/* =========================================================
   Display Movies
========================================================= */

// Displays an array of movies inside the movie grid.
const displayMovies = (movies) => {

    const favorites = getFavorites();

    let cards = "";

    movies.forEach((movie) => {
        cards += createMovieCard(movie, favorites);
    });

    movie_grid.innerHTML = cards;
};


/* =========================================================
   Get Popular Movies
========================================================= */

const getPopularMovies = async () => {

    const url = "https://api.themoviedb.org/3/movie/popular";

    const res = await fetch(url, {
        headers: {
            Authorization: API_TOKEN
        }
    });

    const data = await res.json();

    displayMovies(data.results);
};

getPopularMovies();


/* =========================================================
   Search Movies
========================================================= */

const searchMovies = async () => {

    const query = search_input.value.trim();

    // Don't search if the input is empty.
    if (!query) {
        return;
    }

    const searchUrl =
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`;

    const res = await fetch(searchUrl, {
        headers: {
            Authorization: API_TOKEN
        }
    });

    const data = await res.json();

    movies_heading.textContent =
        `Search Results for "${query}"`;

    // Show the empty-search state when no movies are found.
    if (data.results.length === 0) {

        movie_grid.innerHTML = `
            <div class="no-results">

                <div class="no-results-icon"></div>

                <h3>No Search Results</h3>

            </div>
        `;

        return;
    }

    displayMovies(data.results);
};


/* =========================================================
   Search Button
========================================================= */

search_btn.addEventListener("click", () => {
    searchMovies();
});


/* =========================================================
   Search With Enter Key
========================================================= */

search_input.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchMovies();
    }

});


/* =========================================================
   Movie Card Clicks
========================================================= */

movie_grid.addEventListener("click", (event) => {

    const card = event.target.closest(".movie-card");

    if (!card) {
        return;
    }


    /* -----------------------------------------------------
       Favorite Button
    ----------------------------------------------------- */

    if (event.target.classList.contains("favorite-btn")) {

        // Prevent the card click from opening the details page.
        event.stopPropagation();

        const movieId = card.dataset.movieId;

        let favorites = getFavorites();


        // Add movie to favorites.
        if (!favorites.includes(movieId)) {

            favorites.push(movieId);

            event.target.classList.add("favorited");
            event.target.textContent = "♥";

        }

        // Remove movie from favorites.
        else {

            favorites = favorites.filter((id) => id !== movieId);

            event.target.classList.remove("favorited");
            event.target.textContent = "♡";
        }


        // Save the updated favorites list.
        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        return;
    }


    /* -----------------------------------------------------
       Open Movie Details
    ----------------------------------------------------- */

    const movieId = card.dataset.movieId;

    window.location = `movie-details.html?id=${movieId}`;
});