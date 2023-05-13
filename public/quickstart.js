$(function() {
  // Initialize the Firebase app in the service worker by passing the generated config
  const firebaseConfig = {
    apiKey: 'AIzaSyBhIbqPRNjmaw7rsm0qsLoC7pBtYgBjwwk',
    authDomain: 'hyper-search-259de.firebaseapp.com',
    databaseURL: 'https://hyper-search-259de-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'hyper-search-259de',
    storageBucket: 'hyper-search-259de.appspot.com',
    messagingSenderId: '786618085756',
    appId: '1:786618085756:web:a3e4f8183139fd10b434f9',
    measurementId: 'G-BKCGNYGRBK',
  };

  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();
  const fcmStatus = document.getElementById('fcmStatus');

  messaging.getToken({
    vapidKey: 'BHOQDHHDKeBusJi75mi-BP5Tx0VZ0PV4hYR8IzBiWcLhppu_QWJL1W8JRVK3oULnPfgfMm1HqnWWpNFLkdOBA2o',
  }).then((currentToken) => {
    if (currentToken) {
      // request token
      fcmStatus.innerText = currentToken;

    } else {
      console.warn('No token available.');
      fcmStatus.innerText = 'No token available.';
    }
  }).catch((err) => {
    console.error('An error occurred while retrieving token. ', err);
    fcmStatus.innerText = 'Failed to acquire token.';
    console.error(err);
  });

  const speakerDevices = document.getElementById('speaker-devices');
  const ringtoneDevices = document.getElementById('ringtone-devices');
  const outputVolumeBar = document.getElementById('output-volume');
  const inputVolumeBar = document.getElementById('input-volume');
  const volumeIndicators = document.getElementById('volume-indicators');
  const callButton = document.getElementById('button-call');
  const outgoingCallHangupButton = document.getElementById('button-hangup-outgoing');
  const callControlsDiv = document.getElementById('call-controls');
  const audioSelectionDiv = document.getElementById('output-selection');
  const getAudioDevicesButton = document.getElementById('get-devices');
  const logDiv = document.getElementById('log');
  const incomingCallDiv = document.getElementById('incoming-call');
  const incomingCallHangupButton = document.getElementById(
    'button-hangup-incoming',
  );
  const incomingCallAcceptButton = document.getElementById(
    'button-accept-incoming',
  );
  const incomingCallRejectButton = document.getElementById(
    'button-reject-incoming',
  );
  const phoneNumberInput = document.getElementById('phone-number');
  const incomingPhoneNumberEl = document.getElementById('incoming-number');
  const startupButton = document.getElementById('startup-button');
  const swSetupButton = document.getElementById('sw-setup-button');

  const notifyIncomingCallButton = document.getElementById('notify-incoming-button');
  const notifyAnswerCallButton = document.getElementById('notify-call-answer-button');
  const notifyRejectCallButton = document.getElementById('notify-call-reject-button');
  notifyIncomingCallButton.disabled = true;
  notifyAnswerCallButton.disabled = true;
  notifyRejectCallButton.disabled = true;

  notifyIncomingCallButton.addEventListener('click', notifyIncomingCall);
  notifyAnswerCallButton.addEventListener('click', notifyAnswerCall);
  notifyRejectCallButton.addEventListener('click', notifyRejectCall);

  let device;
  let token;
  let sw;
  let swController;
  let incomingNotification;

  // Event Listeners

  callButton.onclick = (e) => {
    e.preventDefault();
    makeOutgoingCall();
  };
  getAudioDevicesButton.onclick = getAudioDevices;
  speakerDevices.addEventListener('change', updateOutputDevice);
  ringtoneDevices.addEventListener('change', updateRingtoneDevice);


  // SETUP STEP 0 (optional):
  // Setup a Service Worker to handle background events
  swSetupButton.addEventListener('click', setupServiceWorker);

  // SETUP STEP 2: Request an Access Token
  async function setupServiceWorker() {
    log('Setting up service worker');

    if ('serviceWorker' in navigator) {
      try {
        sw = await navigator.serviceWorker.register('sw.js');
        log('Service worker registered! 😎', sw);
        await navigator.serviceWorker.ready;
        swController = navigator.serviceWorker.controller;
        log('Service worker controller ready! 😎', swController);
        swController.postMessage({
          action: 'test',
        });
        await waitForServiceWorkerReadyAndSetupUI();
      } catch (err) {
        log('😥 Service worker registration failed: ', err);
      }
    }
  }

  async function waitForServiceWorkerReadyAndSetupUI() {
    if (sw.active.state === 'activated') {
      swSetupButton.disabled = true;

      notifyIncomingCallButton.disabled = false;
    } else {
      setTimeout(waitForServiceWorkerReadyAndSetupUI, 1000);
    }
  }

  async function notifyIncomingCall() {
    return showNotification('Incoming Call', {
      body: 'Charles Dyason (+27730398806)',
      tag: '+27730398806',
      image: 'https://avatars.githubusercontent.com/u/29998700?v=4',
      requireInteraction: true,
      actions: [
        {
          action: 'answer',
          title: 'Answer',
          icon: 'icons/answer/128.png',
        },
        {
          action: 'reject',
          title: 'Reject',
          icon: 'icons/hangup/128.png',
        },
      ],
    }).then((notification) => {
      incomingNotification = notification;

      notifyAnswerCallButton.disabled = false;
      notifyRejectCallButton.disabled = false;
    });
  }

  async function notifyAnswerCall() {
    console.log('answering call from UI');
    clearNotification('answer', incomingNotification.tag);
  }

  async function notifyRejectCall() {
    console.log('rejecting call from UI');
    clearNotification('reject', incomingNotification.tag);
  }

  async function showNotification(title, options) {
    if (incomingNotification) {
      incomingNotification.close();
    }
    await sw.showNotification(title, options);
    let notifications = await sw.getNotifications();
    return notifications.find((n) => n.tag === options.tag);
  }

  function clearNotification(action, tag) {
    if (incomingNotification && sw) {
      sw.postMessage({action, tag});
    }
    notifyAnswerCallButton.disabled = true;
    notifyRejectCallButton.disabled = true;
  }

  // SETUP STEP 1:
  // Browser client should be started after a user gesture
  // to avoid errors in the browser console re: AudioContext
  startupButton.addEventListener('click', startupClient);

  // maybeLoadServiceWorker();

  async function maybeLoadServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        sw = await navigator.serviceWorker.ready;
        log('Service worker registered! 😎', sw);
        await navigator.serviceWorker.ready;
        swController = navigator.serviceWorker.controller;
        log('Service worker controller ready! 😎', swController);
        swController.postMessage({
          action: 'test',
        });
        await waitForServiceWorkerReadyAndSetupUI();
      } catch (err) {
        log('😥 Service worker registration failed: ', err);
      }
    }
  }

  // SETUP STEP 2: Request an Access Token
  async function startupClient() {
    log('Requesting Access Token...');

    try {
      const data = await $.getJSON('/token');
      log('Got a token.');
      token = data.token;
      setClientNameUI(data.identity);
      intitializeDevice();
    } catch (err) {
      console.log(err);
      log('An error occurred. See your browser console for more information.');
    }
  }

  // SETUP STEP 3:
  // Instantiate a new Twilio.Device
  function intitializeDevice() {
    logDiv.classList.remove('hide');
    log('Initializing device');
    device = new Twilio.Device(token, {
      logLevel: 1,
      // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
      // providing better audio quality in restrained network conditions.
      codecPreferences: ['opus', 'pcmu'],
    });

    addDeviceListeners(device);

    // Device must be registered in order to receive incoming calls
    device.register();
    device.onIncomingCallReceived(handleIncomingCall);
  }

  // SETUP STEP 4:
  // Listen for Twilio.Device states
  function addDeviceListeners(device) {
    device.on('registered', function() {
      log('Twilio.Device Ready to make and receive calls!');
      callControlsDiv.classList.remove('hide');
    });

    device.on('error', function(error) {
      log('Twilio.Device Error: ' + error.message);
    });

    device.on('incoming', handleIncomingCall);

    device.audio.on('deviceChange', updateAllAudioDevices.bind(device));

    // Show audio selection UI if it is supported by the browser.
    if (device.audio.isOutputSelectionSupported) {
      audioSelectionDiv.classList.remove('hide');
    }
  }

  // MAKE AN OUTGOING CALL

  async function makeOutgoingCall() {
    var params = {
      // get the phone number to call from the DOM
      To: phoneNumberInput.value,
    };

    if (device) {
      log(`Attempting to call ${params.To} ...`);

      // Twilio.Device.connect() returns a Call object
      const call = await device.connect({params});

      // add listeners to the Call
      // "accepted" means the call has finished connecting and the state is now "open"
      call.on('accept', updateUIAcceptedOutgoingCall);
      call.on('disconnect', updateUIDisconnectedOutgoingCall);
      call.on('cancel', updateUIDisconnectedOutgoingCall);

      outgoingCallHangupButton.onclick = () => {
        log('Hanging up ...');
        call.disconnect();
      };

    } else {
      log('Unable to make call.');
    }
  }

  function updateUIAcceptedOutgoingCall(call) {
    log('Call in progress ...');
    callButton.disabled = true;
    outgoingCallHangupButton.classList.remove('hide');
    volumeIndicators.classList.remove('hide');
    bindVolumeIndicators(call);
  }

  function updateCallRejected() {
    log("Call rejected.");
  }

  function updateUIDisconnectedOutgoingCall() {
    log('Call disconnected.');
    callButton.disabled = false;
    outgoingCallHangupButton.classList.add('hide');
    volumeIndicators.classList.add('hide');
  }

  // HANDLE INCOMING CALL

  function handleIncomingCall(call) {
    log(`Incoming call from ${call.parameters.From}`);

    //show incoming call div and incoming phone number
    incomingCallDiv.classList.remove('hide');
    incomingPhoneNumberEl.innerHTML = call.parameters.From;

    //add event listeners for Accept, Reject, and Hangup buttons
    incomingCallAcceptButton.onclick = () => {
      acceptIncomingCall(call);
    };

    incomingCallRejectButton.onclick = () => {
      rejectIncomingCall(call);
    };

    incomingCallHangupButton.onclick = () => {
      hangupIncomingCall(call);
    };

    // add event listener to call object
    call.on('cancel', handleDisconnectedIncomingCall);
    call.on('disconnect', handleDisconnectedIncomingCall);
    call.on('reject', handleDisconnectedIncomingCall);
  }

  // ACCEPT INCOMING CALL

  function acceptIncomingCall(call) {
    call.accept();

    //update UI
    log('Accepted incoming call.');
    incomingCallAcceptButton.classList.add('hide');
    incomingCallRejectButton.classList.add('hide');
    incomingCallHangupButton.classList.remove('hide');
  }

  // REJECT INCOMING CALL

  function rejectIncomingCall(call) {
    call.reject();
    log('Rejected incoming call');
    resetIncomingCallUI();
  }

  // HANG UP INCOMING CALL

  function hangupIncomingCall(call) {
    call.disconnect();
    log('Hanging up incoming call');
    resetIncomingCallUI();
  }

  // HANDLE CANCELLED INCOMING CALL

  function onStatusChange(status) {
    console.log(`Status changed: ${status}`);
  }

  function handleAnswered() {
    console.log("Answered!");
  }

  function handleConnected() {
    console.log("Connected!");
  }

  function handleDisconnectedIncomingCall() {
    log('Incoming call ended.');
    resetIncomingCallUI();
  }

  // MISC USER INTERFACE

  // Activity log
  function log(message) {
    logDiv.innerHTML += `<p class="log-entry">&gt;&nbsp; ${message} </p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  function setClientNameUI(clientName) {
    var div = document.getElementById('client-name');
    div.innerHTML = `Your client name: <strong>${clientName}</strong>`;
  }

  function resetIncomingCallUI() {
    incomingPhoneNumberEl.innerHTML = '';
    incomingCallAcceptButton.classList.remove('hide');
    incomingCallRejectButton.classList.remove('hide');
    incomingCallHangupButton.classList.add('hide');
    incomingCallDiv.classList.add('hide');
  }

  // AUDIO CONTROLS

  async function getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({audio: true});
    updateAllAudioDevices.bind(device);
  }

  function updateAllAudioDevices() {
    if (device) {
      updateDevices(speakerDevices, device.audio.speakerDevices.get());
      updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
    }
  }

  function updateOutputDevice() {
    const selectedDevices = Array.from(speakerDevices.children)
      .filter((node) => node.selected)
      .map((node) => node.getAttribute('data-id'));

    device.audio.speakerDevices.set(selectedDevices);
  }

  function updateRingtoneDevice() {
    const selectedDevices = Array.from(ringtoneDevices.children)
      .filter((node) => node.selected)
      .map((node) => node.getAttribute('data-id'));

    device.audio.ringtoneDevices.set(selectedDevices);
  }

  function bindVolumeIndicators(call) {
    call.on('volume', function(inputVolume, outputVolume) {
      var inputColor = 'red';
      if (inputVolume < 0.5) {
        inputColor = 'green';
      } else if (inputVolume < 0.75) {
        inputColor = 'yellow';
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 300) + 'px';
      inputVolumeBar.style.background = inputColor;

      var outputColor = 'red';
      if (outputVolume < 0.5) {
        outputColor = 'green';
      } else if (outputVolume < 0.75) {
        outputColor = 'yellow';
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 300) + 'px';
      outputVolumeBar.style.background = outputColor;
    });
  }

  // Update the available ringtone and speaker devices
  function updateDevices(selectEl, selectedDevices) {
    selectEl.innerHTML = '';

    device.audio.availableOutputDevices.forEach(function(device, id) {
      var isActive = selectedDevices.size === 0 && id === 'default';
      selectedDevices.forEach(function(device) {
        if (device.deviceId === id) {
          isActive = true;
        }
      });

      var option = document.createElement('option');
      option.label = device.label;
      option.setAttribute('data-id', id);
      if (isActive) {
        option.setAttribute('selected', 'selected');
      }
      selectEl.appendChild(option);
    });
  }
});
