const moment = require("moment-timezone");

// See http://momentjs.com/timezone/ for more zones.
const trackedZones = {
  "EST": "America/Toronto",
  "CST": "America/Resolute",
  "MST": "America/Edmonton",
  "PST": "America/Vancouver"
};

const getZoneByAbbrev = function(searchFor) {
  searchFor = searchFor.toUpperCase();
  return Object.keys(trackedZones).includes(searchFor) ? trackedZones[searchFor] : null;
};

const helpMessage = "Please enter requests in the format **!time 11:11 xm ZZZ** (*Ex: 12:35 pm EST*), or just enter **!time** by itself (with no parameters) for the current server time.";
const genericErrorMessage = "Invalid time request. " + helpMessage;
const availableZones = Object.keys(trackedZones).join("/");

module.exports = {
  usage: "",
  name: "time",
  fn: (args, msg) => {
    // console.log(timeCmd);
    let inMoment = null;

    const currentTime = moment();
    
    if(args.length === 0) {
      inMoment = currentTime;
    } else if(args[0] === 'help') {
      return msg.channel.send(helpMessage + "\nAvailable Zones: ["+ availableZones +"]");
    } else if(args.length < 2) { // need at least 2 arguments. Ex: 9am, EST
      return msg.channel.send(genericErrorMessage);
    } else {
      
      args = args.map(a => a.toUpperCase());
      
      const inZone =  ["AM", "PM"].includes(args[1]) ? args[2].toUpperCase() : args[1];
      if(!(inZone in trackedZones)) {
        msg.channel.send("I'm sorry. I'm not tracking the timezone: " + inZone);
      }

      const inTime = args[0] + ( ["AM", "PM"].includes(args[1]) ? " " + args[1] : "" );

      inMoment = moment(inTime, "h:mm a").isValid() ? moment(inTime, "h:mm a") 
                : moment(inTime, "h:mma").isValid() ? moment(inTime, "h:mma") 
                : moment(inTime, "h a").isValid() ? moment(inTime, "h a") 
                : moment(inTime, "ha").isValid() ? moment(inTime, "ha") : null;

      if(!moment.isMoment(inMoment)) {
        msg.channel.send(genericErrorMessage);
      }

      let zoneName = getZoneByAbbrev(inZone)
      if(zoneName !== null) {
        // Timezone is changed, but moment in time remains the same (really only offsets the time reading), 
        // so we'll set the hour and minute explicitly below.
        let zoneMoment = inMoment.clone().tz(zoneName);

        // Had to add this hack for h:mma format which was incorrectly reading pm times when no space was used after the numeric portion of the time.
        if(inMoment.get("hour") < 12 && inTime.toLowerCase().indexOf("pm") !== -1) { 
          zoneMoment.set("hour", inMoment.get("hour") + 12);
        } else {
          zoneMoment.set("hour", inMoment.get("hour"));
        }
        zoneMoment.set("minute", inMoment.get("minute"));

        inMoment = zoneMoment;
      } else {
        return msg.channel.send("Sorry. That's not a valid timezone.");
      }
      
    }
      
    const irlTime = inMoment || moment(); // use inMoment if it was provided as a param, otherwise use the current time.
    
    let outMsg = "```fix\nTime by Zone: ";
    for(let prop in trackedZones) {
      const thisTime = irlTime.clone().tz(trackedZones[prop])
      outMsg += "\n" + thisTime.format(" [[]z[]] h:mm a");
    } 
    
    if(inMoment !== currentTime) {
      const hours = moment.duration(irlTime.diff(currentTime)).asHours();
      outMsg += "\n(" + hours.toFixed(2) + " hours)";
    }
    
    outMsg += "\n```";
    
    return msg.channel.send(outMsg);
  },
};