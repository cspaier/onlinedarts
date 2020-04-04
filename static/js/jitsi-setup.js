//Jitsi setup
//https://github.com/jitsi/jitsi-meet/blob/master/doc/api.md
function jitsiConnect(el, jitsiRoom, password){
    var domain = "meet.jit.si";
    var options = {
      roomName: jitsiRoom,
      width: "100%",
      //height: "auto",
      parentNode: el,
      configOverwrite: {},
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'fullscreen',
          'fodeviceselection', 'profile', 'chat', 'settings',
          'videoquality', 'filmstrip', 'tileview',
        ],
        MOBILE_APP_PROMO: false,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
      }
  }
  const api = new JitsiMeetExternalAPI(domain, options);
  api.executeCommand('subject', ' ');
}
