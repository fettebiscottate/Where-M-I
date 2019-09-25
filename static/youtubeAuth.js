/**OAuth 2.0 is the industry-standard protocol for authorization. 
 * OAuth 2.0 supersedes the work done on the original OAuth protocol created in 2006. 
 * OAuth 2.0 focuses on client developer simplicity while providing specific authorization flows for 
 * web applications, desktop applications, mobile phones, and living room devices. */

var googleUser = {}; // GoogleUser object represents one user account. GoogleUser objects are typically obtained by calling GoogleAuth.currentUser.get().
var authToken;
var channelId;
var userVideoIdList = [];


/** load bigG auth2 library, initialize GoogleAuth object and set the button
 * https://developers.google.com/identity/sign-in/web/reference
*/
function loadGoogleButton() {
  gapi.load('auth2', function () {
    auth2 = gapi.auth2.init({
      apiKey: key,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
      client_id: clientID,
      scope: 'https://www.googleapis.com/auth/youtube',
    })
    auth2acces(document.getElementById('googlebutton'));
  });
};

/** called after init 
 * .attachClickHandler(container, options, onsuccess, onfailure) attaches the sign-in flow to the click handler.
 * gapi.auth2.getAuthInstance() returns the GoogleAuth object
 * on succes get auth token, channel id, and channel videos
 * on error : alert error
*/
function auth2acces(element) {
  auth2.attachClickHandler(element, {}, //{} is an object containing key-value pairs of parameters. Unused. See GoogleAuth.signIn().
    function (googleUser) {
      channelId = []
      if (googleUser.getBasicProfile().getName() !== null) {
        //GoogleUser.getAuthResponse get the response object from the user's auth session.
        authToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        getChannelId();
        getVideo();
      }
    }, function (error) {
      alert(JSON.stringify(error));
    });
}

/** logout*/
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut();
  location.reload();
  auth2.disconnect();
}

/** call api and update global var channelId 
 * use auth token previously granted by the user
*/
function getChannelId() {
  $.get(
    "https://www.googleapis.com/youtube/v3/channels", {
    part: 'id,contentDetails,snippet',
    access_token: authToken,
    key: key,
    mine: true,
  },
    function (data) {
      channelId = data.items[0].id;
    }
  );
}

/** call api and handle the promise to parse result into an array 
*/
function getVideo() {
  userVideoIdList = []
  gapi.client.youtube.search.list({
    "part": "snippet",
    "forMine": true,
    "maxResults": maxelement,
    "type": "video"
  })
    .then(function (responseQuery) {
      $.each(responseQuery.result.items, function (objectVideo) {
        userVideoIdList.push(responseQuery.result.items[objectVideo].id.videoId)
      })
    },
      function (error) { console.error(error); });
}


/** Get list of videos from the logged account and inject them into html modal*/
function getList() {
  $("#videoList").empty(); //flush the modal
  var stringToInject;
  if (userVideoIdList.length == 0) {
    stringToInject = `<h3>Empty</h3>`;
    $('#videoList').append(stringToInject);
  }
   
  for (currentVideo = 0; currentVideo < userVideoIdList.length; currentVideo++) {
    gapi.client.youtube.videos.list({
      "part": "snippet",
      "id": userVideoIdList[currentVideo],
    })
      .then(function (response) {
        const videoId = response.result.items[0].id;
        const videoTitle = response.result.items[0].snippet.title;

        stringToInject = `<div>${videoTitle}</div><div><button  class="btn btn-success"id="${videoId}">Play</button> <button class="btn btn-warning" class="pause">Pause</button></div><br>
                   <script>
                    $("#${videoId}").click(function(){
                    player.loadVideoById(this.id);
                    });

                    $(".pause").click(function(){
                      player.pauseVideo();
                    })
                  </script>`;

        $('#videoList').append(stringToInject);

      },
        function (error) { console.error(error); });
  }

}


