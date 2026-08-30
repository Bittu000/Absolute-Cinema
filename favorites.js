/* =========================================================
   DOM Elements
   ========================================================= */

const movie_grid = document.querySelector(".movie-grid");
const empty_favorites = document.querySelector(".empty-favorites");

const menu_btn = document.querySelector(".menu-btn");
const nav_links = document.querySelector(".nav-links");


/* =========================================================
   TMDB API
   ========================================================= */

const API_TOKEN = `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOGQ1YWUxMjYzY2I3MTM0YTI5ZjNhMDJkNGNjYzBmZSIsIm5iZiI6MTc4NzgyNjEyOC4zNjYwMDAyLCJzdWIiOiI2YTkwMGZkMDBlNmEwNDk1MTMzMTA3NWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Cay0nyS-6piro5KkqZ41ktfyBjKF3jgICZ7YrxQOst4`;


/* =========================================================
   Favorites
   ========================================================= */

// Get the saved movie IDs from localStorage.
//
// The IDs are converted to Numbers so they match
// the IDs returned by the TMDB API.
let favorites = (
    JSON.parse(localStorage.getItem("favorites")) || []
).map(Number);


/* =========================================================
   Navbar
   ========================================================= */

// Opens and closes the mobile navigation menu.
menu_btn.addEventListener("click", () => {
    nav_links.classList.toggle("show");
});


/* =========================================================
   Empty Favorites State
   ========================================================= */

// Shows the empty state when there are no saved movies.
const updateEmptyState = () => {

    if (favorites.length === 0) {
        empty_favorites.style.display = "block";
    } else {
        empty_favorites.style.display = "none";
    }
};


/* =========================================================
   Movie Card
   ========================================================= */

// Creates the HTML for one favorite movie.
const createMovieCard = (movie) => {

    const title = movie.title || "Unknown Movie";
    const rating = movie.vote_average || "N/A";
    const releaseDate = movie.release_date || "N/A";

    const posterURL = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "";

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

            <button class="favorite-btn favorited">
                ♥
            </button>

        </div>
    `;
};


/* =========================================================
   Load Favorite Movies
   ========================================================= */

// Fetches the full movie information for every saved ID
// and displays the movies on the Favorites page.
const getFavorites = async () => {

    for (const movieId of favorites) {

        const movieUrl =
            `https://api.themoviedb.org/3/movie/${movieId}`;

        const res = await fetch(movieUrl, {
            headers: {
                Authorization: API_TOKEN
            }
        });

        const movie = await res.json();

        movie_grid.innerHTML += createMovieCard(movie);
    }
};


/* =========================================================
   Favorite Button
   ========================================================= */

// Removes a movie from favorites when its heart button
// is clicked.
movie_grid.addEventListener("click", (event) => {

    if (event.target.classList.contains("favorite-btn")) {

        const card = event.target.closest(".movie-card");
        const movieId = Number(card.dataset.movieId);


        // Remove the movie ID from the favorites array.
        favorites = favorites.filter((id) => id !== movieId);


        // Save the updated list to localStorage.
        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );


        // Remove the movie card from the page.
        card.remove();


        // Show the empty state if this was the last favorite.
        updateEmptyState();

        return;
    }


    /* -----------------------------------------------------
       Open Movie Details
    ----------------------------------------------------- */

    const card = event.target.closest(".movie-card");

    if (!card) {
        return;
    }

    const movieId = card.dataset.movieId;

    window.location = `movie-details.html?id=${movieId}`;
});


/* =========================================================
   Initialize Favorites Page
   ========================================================= */

updateEmptyState();
getFavorites();