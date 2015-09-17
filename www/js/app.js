/*
**

PUBLIC VARIABLES

**
*/

//Include trailing slash in EVERY URL

var liveAPIUrl = "http://liveresultat.orientering.se/"; //Source API
var jsonProxyUrl = "http://liveol.xyz/app/jsonp/" //JSON Proxy

//Cache
var cacheAPIUrl = "http://liveol.xyz/app/cache/cached/"; //Cached API Resources
var cacheFunctionUrl = "http://liveol.xyz/app/cache/"; //Run a cache-function from here



/*
**

GLOBAL FUNCTIONS

**
*/

//Todays date
function today() {
  var d = new Date();

  var month = d.getMonth()+1;
  var day = d.getDate();

  var output = d.getFullYear() + '-' +
      (month<10 ? '0' : '') + month + '-' +
      (day<10 ? '0' : '') + day;

  return output;
}

//Check connection
function connectionStatus(status) {
  if (status == false) {
    $("body").addClass("offline");
    $("#offline-notice").slideDown();
  } else {
    return true;
  }
}

/*
**

APP FUNCTIONS

**
*/

//Get competitions
//TODO (Sometime): Write BETTER pagination, this is weird...
function getComps() {
  //remove button
  $(".getmore").fadeOut(300, function() {
    $(this).parent().html("20 Tävlingar laddades").hide().fadeIn();
  });

  counter += 21;
  counterMax += 40;

  var jsonget = $.getJSON( jsonProxyUrl + "jsonp.php?url=" + cacheAPIUrl + "getcompetitions.json", function( data ) { //Apparently this needs to be proxied to bypass cache?!?! Server config problem?
  //var jsonget = $.getJSON( "http://ghostops.nu/content/jsonp/jsonp.php?url=http%3A%2F%2Fliveresultat.orientering.se%2Fapi.php%3Fmethod%3Dgetcompetitions", function( data ) {
    $.each( data.competitions, function( key, val ) {

      if($("#" + val.id).length) {
        //return true to skip result
        return true;
      } else {
        $("#data").append( "<li class='table-view-cell' id='" + val.id + "'><a href='competition.html#" + val.id + "' class='navigate-right' data-transition='slide-in' data-ignore='push'>" + val.name + "<span class='date'>" + val.date + "</span></a></li>" );
      }

      if (val.date == today()) {
        $("#" + val.id).addClass("today");
      }

      if (counter == counterMax) {
        $("#data").append('<li class="table-view-divider"><button class="btn-primary btn-block getmore" onclick="getComps()">Ladda fler tävlingar</button></li>');
        return false;
      }

      counter++;
    });

  });
  jsonget.complete(function() {
    $("body").removeClass("loading");
  });
}

//Getcomp metainfo
function getMeta() {

  $.ajax({ 
    url: cacheAPIUrl + "getcompetitioninfo-" + compID + ".json", 
    success: function() { 
      //REMEMBER TO ENCODE CALLED UPON URL
      var str = cacheAPIUrl + "getcompetitioninfo-" + compID + ".json";
      var encoded = str;
      appendIt(encoded);

      console.log('using cached meta');
    },
    error: function() { 
      //REMEMBER TO ENCODE CALLED UPON URL
      var str = liveAPIUrl + "api.php?method=getcompetitioninfo&comp=" + compID;
      var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);
      appendIt(encoded);

      //Try to cache file for future reference
      $.ajax({ 
        url: cacheFunctionUrl + "getcache.php?method=getcompetitioninfo&comp=" + compID, 
        success: function() { console.log("Meta Cached!") } 
      });

      console.log('using live meta');
    } 
  });

  function appendIt(encoded) {
    var jsonget = $.getJSON( encoded, function( data ) {
      $(".compName").html(data.name);
      $(".compOrganizer").html(data.organizer);
      $(".compDate").html(data.date);

      //Club Name From URL
      if (typeof clubID !== 'undefined') {
        $(".clubName").html(clubID.replace(/%20/g, ' '));
      }
    });

    jsonget.complete(function() {
      $("body").removeClass("loading");
    });
  }

}

//Getcomp latest runners
function getLatestRunner() {
  //REMEMBER TO ENCODE CALLED UPON URL
  var str = liveAPIUrl + "api.php?method=getlastpassings&comp=" + compID;
  var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);

  //Clear box
  $("#latestRunners").html("");

  var jsonget = $.getJSON( encoded, function( data ) {
    if (jQuery.isEmptyObject(data.passings) == true) {
      $("#latestRunners").append( "<li class='table-view-cell emptyClassesArray'>Inga löpare i mål än!</li>" );
    } else {
      $.each( data.passings, function( key, val ) {
        if (val.controlName == "") {
          val.controlName = "Gick i mål";
        } else {
          val.controlName = " Passerade " + val.controlName;
        }
        $("#latestRunners").append('<li class="table-view-cell media"><div class="media-body"><span class="latestClass">' + val.class + '</span> ' + val.runnerName + '<p>' + val.controlName + ' med tiden ' + val.time + '</p></div><p class="pull-right">' + val.passtime + '</p></li>');
      });
    }
  });

  jsonget.complete(function() {
    $("body").removeClass("loading");
  });
}

//Getcomp classes
function getClass() {

  $.ajax({ 
    url: cacheAPIUrl + "getclasses-" + compID + ".json", 
    success: function() { 
      //REMEMBER TO ENCODE CALLED UPON URL
      var str = cacheAPIUrl + "getclasses-" + compID + ".json";
      var encoded = str;
      appendIt(encoded);

      console.log('using cached classdata');
    },
    error: function() { 
      //REMEMBER TO ENCODE CALLED UPON URL
      var str = liveAPIUrl + "api.php?method=getclasses&comp=" + compID;
      var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);
      appendIt(encoded);

      //Try to cache file for future reference
      $.ajax({ 
        url: cacheFunctionUrl + "getcache.php?method=getclasses&comp=" + compID, 
        success: function() { console.log("ClassData Cached!") } 
      });

      console.log('using live classdata');
    } 
  });

  function appendIt(encoded) {
    var jsonget = $.getJSON( encoded, function( data ) {
      if (jQuery.isEmptyObject(data.classes) == true) {
        $("#classes").append( "<li class='table-view-cell emptyClassesArray'>Inga klasser i mål än!</li>" );
      } else {
        $.each( data.classes, function( key, val ) {
          var classUrl = val.className.replace(/\s/g,"%20");
          $("#classes").append( "<li class='table-view-cell' id='" + val.className + "'><a href='results.html#" + compID + "&" + classUrl + "' class='navigate-right' data-transition='slide-in' data-ignore='push'>" + val.className +"</a></li>" );
        });
      }
    });

    jsonget.complete(function() {
      $("body").removeClass("loading");
    });
  }

}

//Getcomp classtimes
function getClassTime() {
  //REMEMBER TO ENCODE CALLED UPON URL
  var str = liveAPIUrl + "api.php?comp=" + compID + "&method=getclassresults&class=" + classID;
  var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);

  var jsonget = $.getJSON( encoded, function( data ) {
    if (jQuery.isEmptyObject(data.results) == true) {
      $("#classes").append( "<td class='emptyClassesArray'>Inga klasser i mål än!</td>" );
    } else {
      $.each( data.results, function( key, val ) {
        //checkStatus(val.status, val.name);
        if (val.club == "vacant") {return true;}
        if (val.place == "") {val.place = "-"};
        var clubUrl = val.club.replace(/\s/g,"%20");
        //Regular data
        $("#results").append('<li class="table-view-cell"><span class="badge">' + val.place + '</span><div class="name">' + val.name + '</div><div class="result">' + val.result + ' <p>' + val.timeplus + '</p></div><p class="club"><a data-ignore="push" href="club.html#' + compID + '&' + clubUrl + '">' + val.club + '</a></p></li>');
        //Tabular data
        if (val.place == "-") {val.place = "<span class='noPlacement'>999999</span>"}
        $("#resultsTable tbody").append('<tr><td>' + val.place + '</td><td>' + val.name + '</td><td>' + val.club + '</td><td>' + val.result + '</td><td>' + val.timeplus + '</td></tr>');
      });
    }
  });

  jsonget.complete(function() {
    $("body").removeClass("loading");
  });
}

//Slient check for new results
//Ulz = utilities? I don't even...
function hashUlz(s) {
  if (s == true) {
    console.log("silent hashUlz")
  }
  //REMEMBER TO ENCODE CALLED UPON URL
  var str = liveAPIUrl + "api.php?comp=" + compID + "&method=getclassresults&class=" + classID;
  var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);

  var jsonget = $.getJSON( encoded, function( data ) {
    var hash = data.hash;

    console.log("Hash: " + hash);
    if (hash != (localStorage['oldHash'])) {
      //This will hopefully only change hash on pageload, not double the results loaded
      if (s != true) {
        $("#resultsTable tbody").html("");
        $("#results").html("");
        getClassTime();
      }
      console.log("Hash changed!");
    };
    localStorage.setItem('oldHash', hash);
    console.log("Local Hash: " + localStorage['oldHash']);
  });
}

//Get club results
function getClubResults() {
  //REMEMBER TO ENCODE CALLED UPON URL
  var str = liveAPIUrl + "api.php?comp=" + compID + "&method=getclubresults&club=" + clubID;
  var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);

  var jsonget = $.getJSON( encoded, function( data ) {

    if (jQuery.isEmptyObject(data.results) == true) {
      $("#classes").append( "<td class='emptyClassesArray'>Inga klasser i mål än!</td>" );
    } else {
      $.each( data.results, function( key, val ) {
        //checkStatus(val.status, val.name);
        if (val.club == "vacant") {return true;}
        if (val.place == "") {val.place = "-"};
        if ( val.class == "" ) { val.class = "Odefinierad";  }
        var classUrl = val.class.replace(/\s/g,"%20");

        //Regular data
        $("#results").append('<li class="table-view-cell"><span class="badge">' + val.place + '</span><div class="name">' + val.name + '</div><div class="result">' + val.result + ' <p>' + val.timeplus + '</p></div><p class="club"><a data-ignore="push" href="results.html#' + compID + '&' + classUrl + '">' + val.class + '</a></p></li>');
        //Tabular data
        if (val.place == "-") {val.place = "<span class='noPlacement'>999999</span>"}
        $("#resultsTable tbody").append('<tr><td>' + val.place + '</td><td>' + val.name + '</td><td>' + val.club + '</td><td>' + val.result + '</td><td>' + val.timeplus + '</td></tr>');
      });
    }
  });

  jsonget.complete(function() {
    $("body").removeClass("loading");
  });
}

//Slient check for new results (club)
//Todo: Write a SINGLE hashUlz function, rename hashUlz.....
function hashUlzClub(s) {
  if (s == true) {
    console.log("silent hashUlzClub")
  }
  //REMEMBER TO ENCODE CALLED UPON URL
  var str = liveAPIUrl + "api.php?comp=" + compID + "&method=getclubresults&club=" + clubID;
  var encoded = jsonProxyUrl + "jsonp.php?url=" + encodeURIComponent(str);

  var jsonget = $.getJSON( encoded, function( data ) {
    var hash = data.hash;

    console.log("Club Hash: " + hash);
    if (hash != (localStorage['oldClubHash'])) {
      //This will hopefully only change hash on pageload, not double the results loaded
      if (s != true) {
        $("#resultsTable tbody").html("");
        $("#results").html("");
        getClubResults();
      }
      console.log("Club Hash changed!");
    };
    localStorage.setItem('oldClubHash', hash);
    console.log("Local Club Hash: " + localStorage['oldClubHash']);
  });
}

/*
**

DEBUG FUNCTIONS

**
*/

//Statuscheck
function checkStatus(s,n) {
  if (s == 0) {console.log(n + " " + s + " OK")};
  if (s == 1) {console.log(n + " " + s + " Did not start");};
  if (s == 2) {console.log(n + " " + s + " Did not finish")};
  if (s == 3) {console.log(n + " " + s + " Missing punch")};
  if (s == 4) {console.log(n + " " + s + " Disqualified")};
  if (s == 5) {console.log(n + " " + s + " Over (max) time")};
  if (s == 6) {console.log(n + " " + s + " Over (max) time")};
  if (s == 7) {console.log(n + " " + s + " Over (max) time")};
  if (s == 8) {console.log(n + " " + s + " Over (max) time")};
  if (s == 9) {console.log(n + " " + s + " Over (max) time")};
  if (s == 10) {console.log(n + " " + s + " Not Started Yet");};
  if (s == 11) {console.log(n + " " + s + " Over (max) time")};
  if (s == 12) {console.log(n + " " + s + " Over (max) time")};
}

//Simulate comp today
function todaySim(n) {
  $('#data li:lt(' + n + ')').toggleClass("today");
}

//Open index debug console
var debugCount = 0;
$("h1").click(function() {
  if ( debugCount === 4 ) { $("#devbox").show(); debugCount = 0; }
  debugCount++; 
});
$("#closedevbox").click(function() {
  debugCount = 0;
  $("#devbox").hide();
});