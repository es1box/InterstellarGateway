document.addEventListener("DOMContentLoaded", function() {
    const newsList = document.getElementById("news-list");

    // Пример загрузки новостей
    fetch('/news/example-news.md')
        .then(response => response.text())
        .then(text => {
            const newsItem = document.createElement('div');
            newsItem.innerHTML = marked.parse(text); // Используем Markdown для новостей
            newsList.appendChild(newsItem);
        });
});
