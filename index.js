const geniusAccessToken = 'ssqCR4lyLZghKwRSwv9eXNYOGZoOSycPCKrN2TzOIcEmZavM1AlZIdHTjORdCzp3'
const geniusSearchUrl = 'https://api.genius.com/search'

const apiseeds_apikey = '5xgE0Em4EurKgNXoeJ28YseD4UwgQKqKfBgAhWfqpMUO16iCPgiggfnZ1US54LKJ'
const apiseedSearchUrl = 'https://orion.apiseeds.com/api/music/lyric/'


$(function toggleHomeButton() {
    $('#nav-home').click(function(event) {
        event.preventDefault();
        $('#match-page').addClass('hidden');
        $('#results').addClass('hidden');
    });
});


$(function toggleMatchPage() {
    $('.match-list').click(function(event) {
        event.preventDefault();
        $('#match-page').toggleClass('hidden');
    });
});

//New Feature//
$(function closeMatchPage() {
    $('main').click(function() {
        $('#match-page').addClass('hidden');
    });
});

//Feature Update//
$(function toggleLyricDisplay() {
    $('#results').on('click', '.song-name-artist', function(event) {
        const targetLyrics = $(this)
        const otherLyrics = $('.song-name-artist').not(targetLyrics)

        targetLyrics.parents('.search-result').find('.lyric-box').toggleClass('hidden');
        targetLyrics.parents('.search-result').find('.lyric-link').toggleClass('hidden');
        otherLyrics.parents('.search-result').find('.lyric-box').addClass('hidden');
        otherLyrics.parents('.search-result').find('.lyric-link').addClass('hidden');
        console.log('I clicked it');
    });
});


$(function deleteMatches() {
    $('#added-matches').on('click', '.delete-from-matches', function(event) {
        $(this).parent().remove();
    });
});

function matchItem(mtxt,murl) {
    return `<li class="match">
                <div class="art-container">
                    <img src="${murl}" class="song-artwork">
                </div>
                <div class="match-name-artist">
                    <p class="matched-text">${mtxt}</p>
                </div>
                <div class="delete-from-matches"></div>
            </li>`
}

function addMatches(resJson) {
    $('#added-matches').empty();
    for (let m=0; m<resJson.response.hits.length & m<10; m++) {
    $('#results').on('click', `.atm${m}`, function(event) {
        $('#added-matches').append(matchItem(resJson.response.hits[m].result.full_title, resJson.response.hits[m].result.song_art_image_thumbnail_url));
        $('#added-matches').removeClass('hidden');
    });
    };
};

//SECOND FETCH//

    function getLyrics(geniusJsonHits) {
    const apiArtistUrl = geniusJsonHits.result.primary_artist.url;
    const artist = apiArtistUrl.split('sts/').pop().replace(/-/g," ");
    const track = geniusJsonHits.result.title;
    const uriArtist = encodeURIComponent(artist);
    const uriTrack = encodeURIComponent(track);
     
    const apiseedUrl = apiseedSearchUrl+`${uriArtist}/${uriTrack}?apikey=`+apiseeds_apikey;

    console.log(apiseedUrl);

    fetch(apiseedUrl)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(repsonse.statusText);
    })
    .then(responseJson => {console.log(responseJson); displayLyrics(responseJson)})
    .catch(error => console.log('No lyric found. Try again later'));
};

function displayLyrics(apiseedJson) {
    const apiArtist = apiseedJson.result.artist.name;
    const apiInterim = apiArtist.toLowerCase();
    const apiArtistTight = apiInterim.replace(/-/g,"").replace(/ /g,"");
    $('li').append(function() {
        if (apiArtistTight === $(this).attr('id')) {
        
            return  `<div class="lyric-box hidden">
                        <pre class="lyrics">${formatLyrics(apiseedJson)}</pre>
                    </div>`
        }
    });
};


function formatLyrics(apiJson) {
    const someString = apiJson.result.track.text;
    console.log('%c a colorful message', 'background: green; color: white; display: block;');
    console.log(someString);
    return someString;
};

function notAvailable() {
    setTimeout(function() {
        $('.search-result').not(':has(.lyric-box)').append(`
            <div class="lyric-box hidden">
                <pre class="lyrics">No lyric preview available.</pre>
            </div>
        `)
        console.log(5);
    }, 3000);
};

function displaySearchResults(resJson) {
    $('#results').empty();
    for (let i=0; i<resJson.response.hits.length & i<10; i++) {
        const artistUrl = resJson.response.hits[i].result.primary_artist.url;
        const interim = artistUrl.toLowerCase();
        const artist = interim.split('sts/').pop().replace(/-/g,"");
        $('#results').append(`
            <li class="search-result" id="${artist}">
                <div class="playback-line">
                    <div class="add-to-matches atm${i}"></div>
                    <div class="song-name-artist">
                        <p class="search-text" id="st${i}">${resJson.response.hits[i].result.full_title}</p>
                    </div>
                    <div class="lyric-link hidden">
                        <a href="${resJson.response.hits[i].result.url}" target="_blank">Full Lyric Page</a>
                    </div>
                </div>
            </li>
        `);
        getLyrics(resJson.response.hits[i]);
    };
    $('#results').removeClass('hidden');
};

function formatParameters(params) {
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

//FIRST FETCH//

function getSearchResults(geniusQuery) {
    const parameters = {
        q: geniusQuery,
        page: 1,
        per_page: 20,
        access_token: geniusAccessToken,
    };

    const geniusQueryString = formatParameters(parameters);
    const url = geniusSearchUrl+'?'+geniusQueryString;

    console.log(url);

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        };
        throw new Error(repsonse.statusText);
    })
    .then(responseJson => {displaySearchResults(responseJson); addMatches(responseJson)})
    .catch(error => alert(`There seems to be a problem: ${error.message}`));
};

$(function handleSearch() {
    $('#find').click(function(event) {
        event.preventDefault();
        const geniusQuery = $('input').val();
        getSearchResults(geniusQuery);
        notAvailable();
    });
});