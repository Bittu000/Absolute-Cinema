const menu_btn = document.querySelector(".menu-btn");
const search_input = document.querySelector(".search-input");
const search_btn = document.querySelector(".search-btn");
const nav_links = document.querySelector(".nav-links");
const movie_grid = document.querySelector(".movie-grid");

menu_btn.addEventListener("click", () => {
    nav_links.classList.toggle("show");
})

const url = "https://jsonplaceholder.typicode.com/posts";

const getMovies = async () => {
    const res = await fetch(url);
    const data = await res.json();

    let cards = "";
    data.forEach((movie) => {
        const posterURL = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
        cards += `
        <div class="movie-card">
            <h3>${movie.title}</h3>
            <p>⭐ ${movie.vote_average}</p>
            <p>${movie.release_date}</p>
        </div>`;
    });
    movie_grid.innerHTML = cards;

}
getMovies();