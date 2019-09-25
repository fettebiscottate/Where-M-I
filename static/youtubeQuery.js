
/** search videos on Youtube
 * get olc
 * create request data and execute request, add response handler
 */
var maxelement = 7;

function searchYoutubeVideo() {
  var youtubeSearchString = $('#openLocationCode').val().substring(0,8);
  var request = gapi.client.youtube.search.list({
    part: 'snippet',
    q: youtubeSearchString,
    maxResults: maxelement,
    type: 'video'
  });
  //execute the request calling the function with video the parameters associated to the request
  request.execute(function (responseQuery) {
    onYoutubeSearchResponse(responseQuery, youtubeSearchString);
  });
}

/** while the document is loading load the youtube api*/
function onClientLoad() {
  gapi.client.load('youtube', 'v3', function () {
    onYouTubeApiLoad();
  });
}

/** when the api are loaded, set the api key */
function onYouTubeApiLoad() {
  gapi.client.setApiKey(key);
}

/**pause the player */
function pausePlayer() {
  player.pauseVideo();
}
/**start the player */
function playPlayer() {
  player.playVideo();
}

/**Youtube search response event handler */
function onYoutubeSearchResponse(response, youtubeSearchString) {
  $("#modalResults").empty();
  var videos = response['items'];
  var stringToInject;
  // If video is empty or undefined show an empty modalResult html
  if (videos == '' || (typeof videos == 'undefined')) {
    stringToInject = `<div>empty</div>`
    $('#modalResults').append(stringToInject);
  }
  listaVideo = [];
  listaId = [];
  listaDati = [];
  var index = 0;

  if (typeof videos !== 'undefined') {
    videos.forEach(element => {

      listaDati[index] = element.snippet.description;

        var videoData = new Object();
        videoData.title = element.snippet.title;
        videoData.id = element.id.videoId;
        videoData.openLocationCodeString = convertYoutubedescriptionToOlc(listaDati[index]);
        // fill the listaId with videoDataId
        if (videoData.openLocationCodeString.includes(youtubeSearchString)) {
          listaId.push(videoData.id);

          if (!listaVideo.includes(videoData.openLocationCodeString)) {
            listaVideo.push(videoData.openLocationCodeString)
            getPositionFromOlcToMap(videoData.openLocationCodeString);
            stringToInject = `<div>${videoData.title}</div><div><button class="btn btn-success" onclick="player.loadVideoById('${videoData.id}')">Play</button> <button class="btn btn-warning" onclick="player.pauseVideo()">Pause</button></div><br>`;
            $('#modalResults').append(stringToInject);
            index++;
          }
          else if (listaVideo.includes(videoData.openLocationCodeString)) {
            getPositionFromOlcToMap(videoData.openLocationCodeString);
            stringToInject = `<div>${videoData.title}</div><div><button class="btn btn-success" onclick="player.loadVideoById('${videoData.id}')">Play</button> <button class="btn btn-warning" onclick="player.pauseVideo()">Pause</button></div><br>`;
            $('#modalResults').append(stringToInject);
            index++;
          }
          else {
            index++;
          }
        }
        else {
          index++;
        }
    });
    if (listaId[0]) {
      player.loadVideoById(listaId[0]);

    }
  }
}

var listaId = [];
var listaDati = [];
var openLocationCodeString = [];
var listaVideo = [];


/**parse the olc from youtube description
 * TO DO: use regex
 * */
function convertYoutubedescriptionToOlc(youtubeVideoDescription) {
  var pluscode;
    pluscode = youtubeVideoDescription.split(":");
  return pluscode[0];
}

/**if the checkbox is clicked show the filters */
function onClickCheckBox() {
  $("#searchFilterOptions").is(':checked') ? $('#selectionFilters').show(): $('#selectionFilters').hide() ;
}

/**get location data from openlocationcode (used when adding a marker for the places founded) */
function getPositionFromOlcToMap(openLocationCodeString) {
  var locationCoordinates = OpenLocationCode.decode(openLocationCodeString);
  L.marker([locationCoordinates.latitudeCenter, locationCoordinates.longitudeCenter]).addTo(map).bindPopup(`<h6>Discover</h6> <div><button class = "btn" onclick="clipListShow('${openLocationCodeString}')">Clips</button></div>`).openPopup();
}

/** Show the modal with the list of clips for the place*/
function clipListShow(openLocationCodeCurrentVideo) {
  $("#modalClips").html("");
  var stringToInject;
  gapi.client.youtube.search.list({
    part: 'snippet',
    q: openLocationCodeCurrentVideo,
    type: 'video',
    maxResults: maxelement
  })
    .then(function (response) {
      $.each(response.result.items, function (index) {
        var description = response.result.items[index].snippet.description;
        var pluscode = convertYoutubedescriptionToOlc(description)
        if (openLocationCodeCurrentVideo == pluscode) {
          var videoId = response.result.items[index].id.videoId;
          var videoTitle = response.result.items[index].snippet.title;
          stringToInject = `<div> ${videoTitle}</div><div><button class="btn btn-success" onclick="player.loadVideoById('${videoId}')">Play</button> <button class="btn btn-warning"onclick="player.pauseVideo()">Pause</button></div><br>`;
          $('#modalClips').append(stringToInject);
          $('#modalClipsExpanded').modal('show');
        }
      })

    },
      function (error) { console.error(error); });
}
