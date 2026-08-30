/* =========================================================
   DOM Elements
   ========================================================= */

const menu_btn = document.querySelector(".menu-btn");
const nav_links = document.querySelector(".nav-links");
const movie_details = document.querySelector(".movie-details");


/* =========================================================
   TMDB API
   ========================================================= */

const API_TOKEN = `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOGQ1YWUxMjYzY2I3MTM0YTI5ZjNhMDJkNGNjYzBmZSIsIm5iZiI6MTc4NzgyNjEyOC4zNjYwMDAyLCJzdWIiOiI2YTkwMGZkMDBlNmEwNDk1MTMzMTA3NWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Cay0nyS-6piro5KkqZ41ktfyBjKF3jgICZ7YrxQOst4`;

const API_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


/* =========================================================
   Navbar
   ========================================================= */

// Open/close the navigation menu on small screens.
menu_btn.addEventListener("click", () => {
    nav_links.classList.toggle("show");
});


/* =========================================================
   Get Movie ID From URL
   ========================================================= */

// Example:
// movie-details.html?id=550

const query_params = new URLSearchParams(window.location.search);
const movie_id = query_params.get("id");


/* =========================================================
   API Helper
   ========================================================= */

// This function handles all requests to TMDB.
// That way we don't have to repeat the same fetch code
// for movie details, cast, trailer, and similar movies.

const fetchFromTMDB = async (endpoint) => {

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            Authorization: API_TOKEN
        }
    });

    return await response.json();
};


/* =========================================================
   Main Movie Details
   ========================================================= */

const getMovieDetails = async () => {

    // Stop if there is no movie ID in the URL.
    if (!movie_id) {
        movie_details.innerHTML = `
            <p>Movie not found.</p>
        `;
        return;
    }


    const movie = await fetchFromTMDB(
        `/movie/${movie_id}`
    );


    /* -----------------------------------------------------
       Movie Information
    ----------------------------------------------------- */

    const title = movie.title || "Unknown Movie";
    const rating = movie.vote_average || "N/A";
    const release_date = movie.release_date || "N/A";
    const runtime = movie.runtime || "N/A";
    const overview = movie.overview || "No overview available.";


    /* -----------------------------------------------------
       Poster
    ----------------------------------------------------- */

    const poster_url = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "";


    /* -----------------------------------------------------
       Genres
    ----------------------------------------------------- */

    const genres = movie.genres
        .map((genre) => genre.name)
        .join(" • ");


    /* -----------------------------------------------------
       Display Main Movie Section
    ----------------------------------------------------- */

    movie_details.innerHTML = `

        <div class="movie-main">

            <div class="movie-poster">

                ${
                    movie.poster_path
                        ? `
                            <img
                                src="${poster_url}"
                                alt="${title}"
                            >
                        `
                        : `
                            <div class="no-poster">
                                🎬<br>No Poster
                            </div>
                        `
                }

            </div>


            <div class="movie-info">

                <h2>${title}</h2>

                <p class="rattt">
                    ⭐ ${rating}
                </p>

                <p class="low">
                    📅 ${release_date}
                </p>

                <p class="low">
                    ⏱️ ${runtime} minutes
                </p>

                <p>
                    ${genres}
                </p>

            </div>

        </div>


        <div class="sec-heading">

            <h2>Overview</h2>

            <p class="o-text">
                ${overview}
            </p>


            <h2>Cast</h2>

            <div class="cast-list"></div>


            <h2>Trailer</h2>

            <div class="trailer"></div>


            <h2>Similar Movies</h2>

            <div class="similar-list"></div>

        </div>
    `;


    // The HTML above must be created first.
    // Then these functions can find their containers.
    getCredits();
    getTrailer();
    getSimilarMovies();
};


/* =========================================================
   Cast
   ========================================================= */

const getCredits = async () => {

    const credits = await fetchFromTMDB(
        `/movie/${movie_id}/credits`
    );


    let cast_cards = "";


    // Show only the first 6 cast members.
    credits.cast.slice(0, 6).forEach((credit) => {

        const profile_url = credit.profile_path
            ? `${IMAGE_BASE_URL}${credit.profile_path}`
            : "";


        cast_cards += `

            <div class="m-card">

                ${
                    credit.profile_path
                        ? `
                            <img
                                src="${profile_url}"
                                alt="${credit.name}"
                            >
                        `
                        : `
                            <div class="no-poster">
                                👤<br>No Image
                            </div>
                        `
                }

                <h3>
                    ${credit.name}
                </h3>

                <h4>
                    ${credit.character}
                </h4>

            </div>

        `;
    });


    const cast_list =
        document.querySelector(".cast-list");

    cast_list.innerHTML = cast_cards;
};


/* =========================================================
   Trailer
   ========================================================= */

const getTrailer = async () => {

    const video_data = await fetchFromTMDB(
        `/movie/${movie_id}/videos`
    );


    // Find the first YouTube trailer.
    const trailer = video_data.results.find((video) => {

        return (
            video.type === "Trailer" &&
            video.site === "YouTube"
        );

    });


    const trailer_container =
        document.querySelector(".trailer");


    /* -----------------------------------------------------
       Trailer Found
    ----------------------------------------------------- */

    if (trailer) {

        const youtube_url =
            `https://www.youtube.com/embed/${trailer.key}`;


        trailer_container.innerHTML = `

            <iframe
                src="${youtube_url}"
                allowfullscreen>
            </iframe>

        `;

    }


    /* -----------------------------------------------------
       No Trailer
    ----------------------------------------------------- */

    else {

        trailer_container.innerHTML = `
            <p>No trailer available.</p>
        `;

    }
};


/* =========================================================
   Similar Movies
   ========================================================= */

const getSimilarMovies = async () => {

    const similar_data = await fetchFromTMDB(
        `/movie/${movie_id}/similar`
    );


    /* -----------------------------------------------------
       Get Current Favorites
    ----------------------------------------------------- */

    const favorites = (
        JSON.parse(localStorage.getItem("favorites")) || []
    ).map(Number);


    /* -----------------------------------------------------
       Create Movie Cards
    ----------------------------------------------------- */

    let similar_cards = "";


    // Show only the first 6 similar movies.
    similar_data.results.slice(0, 6).forEach((movie) => {

        const title = movie.title || "Unknown Movie";
        const rating = movie.vote_average || "N/A";
        const release_date = movie.release_date || "N/A";


        const poster_url = movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : "";


        const is_favorite =
            favorites.includes(Number(movie.id));


        similar_cards += `

            <div
                class="movie-card"
                data-movie-id="${movie.id}"
            >

                ${
                    movie.poster_path
                        ? `
                            <img
                                src="${poster_url}"
                                alt="${title}"
                            >
                        `
                        : `
                            <div class="no-poster">
                                🎬<br>No Poster
                            </div>
                        `
                }

                <h3>
                    ${title}
                </h3>

                <p>
                    ⭐ ${rating}
                </p>

                <p>
                    ${release_date}
                </p>

                <button
                    class="favorite-btn ${
                        is_favorite ? "favorited" : ""
                    }"
                >
                    ${is_favorite ? "♥" : "♡"}
                </button>

            </div>

        `;
    });


    const similar_list =
        document.querySelector(".similar-list");

    similar_list.innerHTML = similar_cards;
};


/* =========================================================
   Similar Movie Interactions
   ========================================================= */

// IMPORTANT:
//
// We attach the click listener to movie_details,
// NOT similar_list.
//
// movie_details already exists when this script starts.
// similar_list does NOT exist until getMovieDetails()
// creates it with innerHTML.
//
// This prevents the "null.addEventListener" error.

movie_details.addEventListener("click", (event) => {

    const card = event.target.closest(".movie-card");


    // Ignore clicks that aren't inside a movie card.
    if (!card) {
        return;
    }


    const movie_id = Number(card.dataset.movieId);


    /* -----------------------------------------------------
       Favorite Button
    ----------------------------------------------------- */

    if (event.target.classList.contains("favorite-btn")) {

        const button = event.target;


        let favorites = (
            JSON.parse(localStorage.getItem("favorites")) || []
        ).map(Number);


        // Movie is already a favorite → remove it.
        if (favorites.includes(movie_id)) {

            favorites = favorites.filter(
                (id) => id !== movie_id
            );

            button.classList.remove("favorited");
            button.textContent = "♡";

        }


        // Movie isn't a favorite → add it.
        else {

            favorites.push(movie_id);

            button.classList.add("favorited");
            button.textContent = "♥";
        }


        // Save updated favorites.
        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );


        return;
    }


    /* -----------------------------------------------------
       Movie Card Click
    ----------------------------------------------------- */

    window.location =
        `movie-details.html?id=${movie_id}`;
});


/* =========================================================
   Initialize Page
   ========================================================= */

getMovieDetails();