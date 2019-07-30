var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var getUserMediaVideo = document.querySelector('video#getusermedia');
var recordedVideo = document.querySelector('video#recorded');

var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;

 
var isSecureOrigin = location.protocol === 'https:' ||
location.host === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
  audio: true,
  video: { width: 2880, height: 1800 }
 
};

function setUserMediaURL() { navigator.getUserMedia(constraints, successCallback, errorCallback) };

function successCallback(stream) {
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  if (window.URL) {
    getUserMediaVideo.src = window.URL.createObjectURL(stream);
  } else {
    getUserMediaVideo.src = stream;
  }
}

function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

/*function setUserMediaURL () {
 navigator.mediaDevices.getUserMedia(constraints)
 .then(function(stream) {
   console.log('getUserMedia() got stream: ', stream);
   window.stream = stream;
   if (window.URL) {
     getUserMediaVideo.src = window.URL.createObjectURL(stream);
   } else {
     getUserMediaVideo.src = stream;
   }
 }).catch(function(error) {
   console.log('navigator.getUserMedia error: ', error);
 });
}*/

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}



function toggleRecording() {
  if (recordButton.textContent === 'START RECORDING') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'START RECORDING';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

function startRecording() {
  var options = {mimeType: 'video/webm', bitsPerSecond: 100000};
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {mimeType: 'video/webm,codecs=vp9', bitsPerSecond: 100000};
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'video/vp8'; 
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' +
            'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
  }
  setUserMediaURL();
  getUserMediaVideo.controls = false;
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'STOP RECORDING';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10);
  console.log('MediaRecorder started', mediaRecorder);
}


function stopRecording() {
  mediaRecorder.stop();
  getUserMediaVideo.src = window.URL.createObjectURL(new Blob(recordedBlobs, {type: 'video/webm'}));
  getUserMediaVideo.controls = true;
  console.log('Recorded Blobs: ', recordedBlobs);
  //recordedVideo.controls = true;
}
function play() {
  setUserMediaURL();
  getUserMediaVideo.controls = false;

}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'Flocab_MV';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

setUserMediaURL();
