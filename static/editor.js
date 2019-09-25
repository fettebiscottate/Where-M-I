
var desc = new String("");
var recordedBlob;
var dTitle;
var registratore;

/** 
 * get olc
 * add it to the video description string 
 */
function functionSave() {
  var openlocationcodeValue = document.getElementById('openLocationCode').value;
  desc = [];
  desc = openlocationcodeValue + ":";
  dTitle = document.modulo.tit.value;
  if ((dTitle == "") || (dTitle == "undefined")) {
    alert("Missing Title")
  }
  var purpose = document.getElementById("purpose");
  var purposeSelection = purpose.options[purpose.selectedIndex].value;
  desc += purposeSelection + ":";
  var language = document.getElementById("lang");
  var languageSelection = language.options[language.selectedIndex].value;
  desc += languageSelection + ":";
  var categoria = document.getElementById("category");
  var categoriaSel = categoria.options[categoria.selectedIndex].value;
  desc += categoriaSel + ":";
  var pubblico = document.getElementById("audience");
  var pubblicoSel = pubblico.options[pubblico.selectedIndex].value;
  desc += pubblicoSel;

  let preview = document.getElementById("preview");
  registratore = document.getElementById("registratore");
  let startButton = document.getElementById("startButton");
  let stopButton = document.getElementById("stopButton");
  let downloadButton = document.getElementById("downloadButton");
  let recorderId;
  let recorder;
  var maxAllowedRegistrationLenght;

  switch (purposeSelection) {
    case "what":
      maxAllowedRegistrationLenght = 10000;
      break;
    case "how":
      maxAllowedRegistrationLenght = 10000*2;
      break;
    default:
      maxAllowedRegistrationLenght = 10000*3;
      break;
  }

  /** Start recording
   * set the recorder
   * 
   */

   //prende in input lo stream dati e la lunghezza in millisecondi
  function startRecording(stream, lengthInMS) {

    //inizializza un array vuoto
    let data = [];

    //fa partire lo stram dati
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = event => data.push(event.data);
    recorder.start();
    //identifica ogni registrazione con un Id diverso, imposta una nuova traccia ogni volta
    recorderId = setTimeout(function () { recorder.state == "registratore"; recorder.stop(); stream.getTracks().forEach(track => track.stop()); }, lengthInMS);
    //promessa che indica se è stata rispettata o no.
    //se si allora ok, se no ritorna un errore
    return new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
    })
      .then(() => data);
  }
 
  /** Stop the recording and each track */

  function stop(stream) {
    //resetta il tempo di timeout, ferma il recorder
    clearTimeout(recorderId);
    recorder.stop();
    stream.getTracks().forEach(track => track.stop());
  }


  startButton.addEventListener("click", function () {
    //ask the browser for permission
    navigator.mediaDevices.getUserMedia({

      //permette di registrare sia audio che video
      video: true,
      audio: true
    }).then(stream => {

      //lo stream serve sia per l' anteprima in diretta, sia per l' anteprima successiva che per il dowload del .webm
      preview.srcObject = stream;
      downloadButton.href = stream;
      preview.captureStream = preview.captureStream || preview.mozCaptureStream || preview.webkitCaptureStream;

      //promesssa con concatenazione di funzioni
      return new Promise(resolve => preview.onplaying = resolve);
    }).then(() => startRecording(preview.captureStream(), maxAllowedRegistrationLenght))
      .then(recordedChunks => {
        //registra in formato blob, inserendo il tipo video/webm, il registrato poi si può scaricare grazie al bottone dowload
        recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
        registratore.src = URL.createObjectURL(recordedBlob);
        downloadButton.href = registratore.src;
        downloadButton.download = "clip.webm";

      })

      //log se errore
      .catch(log);
  }, false);


  //ferma la preview
  stopButton.addEventListener("click", function () {
    if (recorder.state == "registratore") {
      stop(preview.srcObject);
    }
  }, false);
}

/** Upload video to youtube
 * get the auth token previously generated, set data, encode the data, place the recorded blob in a FormData, ajax call to youtube api
 * on success: alert, set getvideo after timeout, reset registratore source
 */
function uploadVideo() {
  var authToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
  var youtubeVideoData = {
    kind: 'youtube#video',
    snippet: {
      title: dTitle,
      description: desc,
    },
    status: {
      privacyStatus: 'public', //upload video public
      embeddable: true
    }
  };
  //use FormData to send the parameters of the request  and the binary blob
  var youtubeVideoDataAsBlob = new Blob([JSON.stringify(youtubeVideoData)], { type: 'application/json' });
  var form = new FormData();
  form.append('video', youtubeVideoDataAsBlob);
  form.append('mediaBody', recordedBlob);
  //Perform an asynchronous HTTP (Ajax) request.
  $.ajax({
    url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token='
      + encodeURIComponent(authToken) + '&part=snippet,status', //encode string as valid URI
    data: form,
    cache: false,
    contentType: false,
    processData: false,
    method: 'POST',
    success: function (data) {
      alert("Success");
      setTimeout(getVideo(), 15000);
      registratore.src = URL.revokeObjectURL(recordedBlob); //remove recorded blob
    }
  });

}
