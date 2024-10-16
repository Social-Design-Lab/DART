const progressBar = document.getElementById("theft-progress");
let pageReload = false;
let badgeEarned = false;
let choice = "addiction"
$(document).ready(function () {
  if (speechData !== "none") {
    $("#page-article").click();
  } else {
    $("#volume-button").hide();
  }

  if (section === "practice") {
    setupPractice();
    setIntroduction();
  }

  // Check if the video element exists before initializing Video.js
  if ($("#my_video_1").length > 0) {
    // Initialize Video.js and make it so when user clicks on the video, stop the voiceover narration and highlighting
    var player = videojs("my_video_1");

    // Add event listener for the 'play' event using Video.js's on() method
    // could use 'play' 'pause' 'click' etc
    player.on("play", function () {
      console.log("video playing");
      turnOffNarrationAndHighlighting();
    });
  }
  // else {
  //     console.log("No video element found with ID 'my_video_1'");
  // }

  // var player = videojs('my_video_1');
  // // Event listener for the 'play' event using Video.js's on() method
  // if(player) {
  //     player.on('play', function() {
  //         console.log("video playing");
  //         turnOffNarrationAndHighlighting();

  //     });
  // }

  // for highlighting
  // avatarSpeechData = speechData[page][avatar];
  // wordData= avatarSpeechData.filter(entry => entry.type === "word");

  // console.log("Speech data: " + speechData);
  // console.log(JSON.stringify(speechData))

  // Load the first page based on the URL
  // console.log("The start page: " + startPage);
  // narration audio dropdown
  $(".ui.dropdown").dropdown();
  $(".ui.dropdown2").dropdown({
    onChange: function (value, text, $selectedItem) {
      updateAvatar(value.replace(/,/g, ""));
    },
  });
  $(".ui.dropdown3").dropdown({
    onChange: function (value, text, $selectedItem) {
      changeSpeed(value.replace(/,/g, ""));
    },
  });

  $(".ui.slider").slider({
    min: 0.5,
    max: 2,
    start: 1,
    step: 0.25,
  });
  // if starting page in activity, add all the audios for practice grandparent
  if (
    startPage === "activity" ||
    startPage === "activity2" ||
    startPage === "activity3" ||
    startPage === "activity4"
  ) {


    // add click event to the roleplay choice buttons
    // setIntroduction();
  }
  // later make so check from db whether to play audio / highlight
  setLinks(startPage);
  updateProgressBar();

  // for testing only do pages with speech data to avoid console log error
  if (speechData !== "none") {
    if (page === "quiz") {
      document.addEventListener("QuizDataLoaded", function (e) {
        pastAttempts = e.detail.pastAttempts;
        console.log(
          "the past attempts now after custom event loaded: " + pastAttempts
        );
        if (pastAttempts) {
          const urlParams = new URLSearchParams(window.location.search);
          page = "quiz-results";
          urlParams.set("question", page);
          const newUrl = window.location.pathname + "?" + urlParams.toString();
          history.pushState({ path: newUrl }, "", newUrl);
        }
        playAudio(page);
        toggleHighlighting();
        startHighlightingWords();
      });
    } else {
      // add event listener for types slideshow pages to play correct audio for the current slide
      $("#steps-slider").on(
        "afterChange",
        function (event, slick, currentSlide) {
          // slide count starts at zero so add 1 to get the correct slide number
          let slideNum = currentSlide + 1;
          console.log("Current slide number:", slideNum);

          if (slideNum !== 1) {
            slideResetNarrationAndHighlighting(); // stop and remove previous audio/highlighting (needed to fix when user clicks next before narration is finished)

            const urlParams = new URLSearchParams(window.location.search);
            page = "types-" + slideNum;
            urlParams.set("slide", page);
            const newUrl =
              window.location.pathname + "?" + urlParams.toString();
            history.pushState({ path: newUrl }, "", newUrl);

            playAudio(page);
            toggleHighlighting();
            startHighlightingWords();
          } else {
            // remove slide param when returning back to first slide
            if (window.location.search.includes("slide")) {
              const urlParams = new URLSearchParams(window.location.search);
              urlParams.delete("slide");
              const newUrl =
                window.location.pathname + "?" + urlParams.toString();
              history.pushState({ path: newUrl }, "", newUrl);

              // not needed, does it below
              page = "types";
              playAudio(page);
              toggleHighlighting();
              startHighlightingWords();
            }
          }
        }
      );
    }

    playAudio(page);
    toggleHighlighting();
    startHighlightingWords();

    // else {
    //     playAudio(page);
    //     toggleHighlighting();
    //     startHighlightingWords();
    // }
  }
  // if(wordHighlighting || sentenceHighlighting) {
  //     startHighlightingWords();
  // }

  $("#backButton").on("click", function () {
    // console.log("Back button clicked");
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get("page");

    if (currentPage === "quiz") {
      // clear quiz-results highlights to catch when user presses button before narration is finished
      $("#showResults").removeClass("highlightedResults");
      $("#narrate-view-answers").removeClass("highlightedButton");
      $("#narrate-try-again").removeClass("highlightedButton");
      $("#narrate-next").removeClass("highlightedButton");
      $("#nextButton").removeClass("highlightedButton");
    }

    $(".ui.sidebar").sidebar("hide");

    // stop and reset audio and highlighting immediately
    if (speechData !== "none") {
      stopHighlighting();
    }

    const { backlink, nextlink } = setLinks(currentPage);
    history.pushState(null, "", backlink);

    const backParams = new URLSearchParams(backlink);
    // changed from const to let so on quiz pages can override backPage from quiz to quiz-results if user has past attempts
    let backPage = backParams.get("page");

    var audio = document.getElementById("narration-audio");
    audio.src = `https://dart-store.s3.amazonaws.com/medication-narration/${section}/${backPage}_${avatar}.mp3`;
    audio.load(); // Reload the audio to apply the new source

    if (backPage === null) {
      window.location.href = backlink;
    }
    // instead have it so only if they press the back button on the first page of the module, it will reload the page
    else if (
      currentPage != "intro-video" &&
      (backPage === "objectives" || backPage === "intro")
    ) {
      location.reload();
    } else {
      // fade out current page, then fade in previous page. at half duration each, 400ms total
      $("#" + currentPage).transition({
        animation: "fade out",
        duration: 200,
        onComplete: function () {
          if (backPage === "types") {
            $("#steps-slider").slick("refresh");
            $("#image-slider").slick("refresh");
          }

          $("#" + backPage).transition({
            animation: "fade in",
            duration: 200,
          });

          if (speechData !== "none") {
            if (pastAttempts && backPage === "quiz") {
              const urlParams = new URLSearchParams(window.location.search);
              backPage = "quiz-results";
              urlParams.set("question", backPage);
              const newUrl =
                window.location.pathname + "?" + urlParams.toString();
              history.pushState({ path: newUrl }, "", newUrl);
            }

            playAudio(backPage);
            toggleHighlighting();
            startHighlightingWords();
          }
        },
      });
    }
    updateProgressBar();
  });

  $("#nextButton").on("click", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get("page");
    if (currentPage === "quiz") {
      // clear quiz-results highlights to catch when user presses button before narration is finished
      $("#showResults").removeClass("highlightedResults");
      $("#narrate-view-answers").removeClass("highlightedButton");
      $("#narrate-try-again").removeClass("highlightedButton");
      $("#narrate-next").removeClass("highlightedButton");
      $("#nextButton").removeClass("highlightedButton");
    }

    $(".ui.sidebar").sidebar("hide");

    // stop and reset audio and highlighting immediately
    if (speechData !== "none") {
      stopHighlighting();
    }

    // restartWordHighlighting();

    const { backlink, nextlink } = setLinks(currentPage);
    history.pushState(null, "", nextlink);

    const nextParams = new URLSearchParams(nextlink);
    //  changed from const to let so on quiz pages can override nextPage from quiz to quiz-results if user has past attempts
    let nextPage = nextParams.get("page");

    if (nextPage === "objectives" || nextPage === "intro") {
      location.reload();
    }

    if (currentPage === "certificate") {
      window.location.href = "/about/medication";
    }

    // fade out current page, then fade in next page. at half duration each, 400ms total
    $("#" + currentPage).transition({
      animation: "fade out",
      duration: 200,
      onComplete: function () {
        // post badge if at end
        if (
          !badgeEarned &&
          (nextPage === "takeaways" || nextPage === "badge")
        ) {
          if (section === "challenge") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Challenge",
              "Bronze",
              "Challenge Conqueror",
              "/badges/identity/challenge_conqueror.svg"
            );

            badgeEarned = true;
          } else if (section === "concepts") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Concepts",
              "Bronze",
              "Foundation Acheivers",
              "/badges/identity/foundation_acheivers.svg"
            );

            badgeEarned = true;
          } else if (section === "consequences") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Consequences",
              "Bronze",
              "Aftermath Ace",
              "/badges/identity/aftermath_ace.svg"
            );

            badgeEarned = true;
          } else if (section === "techniques") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Techniques",
              "Silver",
              "Trained Tactician",
              "/badges/identity/trained_tactician.svg"
            );

            badgeEarned = true;
          } else if (section === "protection") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Protection",
              "Silver",
              "Prodigy Protector",
              "/badges/identity/prodigy_protector.svg"
            );

            badgeEarned = true;
          } else if (section === "reporting") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Reporting",
              "Gold",
              "Alert Advocate",
              "/badges/identity/alert_advocate.svg"
            );

            badgeEarned = true;
          } else if (section === "practice") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Practice",
              "Gold",
              "Scam Spotter",
              "/badges/identity/scam_spotter.svg"
            );

            badgeEarned = true;
          } else if (section === "evaluation") {
            document.getElementById("unlockBadge").play();

            $("#earned_badge").transition({
              animation: "tada in",
              duration: "1s",
            });

            postBadge(
              "Medication Scams",
              "Evaluation",
              "Platinum",
              "Champion of Completion",
              "/badges/identity/champion_of_completion.svg"
            );

            badgeEarned = true;
          }
        }
        if (nextPage === "types") {
          $("#steps-slider").slick("refresh");
          $("#image-slider").slick("refresh");
        }

        if (nextPage === "introduction") {
          $("#nextButton").prop("disabled", true);
        }

        $("#" + nextPage).transition({
          animation: "fade in",
          duration: 200,
        });

        if (nextPage === "quiz" && $(".preButton").text() != "Try Again") {
          $("#nextButton").hide();
          $("#backButton").hide();
          $("#module-footer").hide();
        }
        // if(section === "techniques" && nextPage === 'activity') {
        //     introJs().addHints();
        // }
        if(section === 'practice' && nextPage === 'introduction') {
            setupPractice();
        }

        if (speechData !== "none") {
          if (pastAttempts && nextPage === "quiz") {
            const urlParams = new URLSearchParams(window.location.search);
            nextPage = "quiz-results";
            urlParams.set("question", nextPage);
            const newUrl =
              window.location.pathname + "?" + urlParams.toString();
            history.pushState({ path: newUrl }, "", newUrl);
          }
          playAudio(nextPage);
          toggleHighlighting();
          startHighlightingWords();
        }
      },
    });

    updateProgressBar();
  });
});


function setLinks(currentPage) {
  let backlink, nextlink;

  // console.log("module: " + module + " section: " + section + " page: " + currentPage);

  if (!pageReload) {
    $("#" + currentPage).transition({
      animation: "fade in",
      onComplete: function () {
        if(section === "techniques" && currentPage === 'activity') {
          introJs().addHints();
        }

        if(section == 'practice' && currentPage == 'introduction') {
            setupPractice();
        }
      },
    });

    pageReload = true;
  }

  // if(currentPage === 'objectives' || currentPage === 'intro') {
  //     $('#backButton').on('click', function() {
  //         location.reload();
  //         // window.location.href = backlink;
  //     });
  // }

  if (section === "challenge") {
    let baseurl = "/course-player?module=medication&section=challenge&page=";

    if (currentPage === "intro") {
      backlink = "/about/medication";
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "intro";
      nextlink = baseurl + "badge";
    } else if (currentPage === "badge") {
      backlink = baseurl + "quiz";
      nextlink =
        "/course-player?module=medication&section=concepts&page=objectives";
    }
  } else if (section === "concepts") {
    let baseurl = "/course-player?module=medication&section=concepts&page=";

    if (currentPage === "objectives") {
      backlink =
        "/course-player?module=medication&section=challenge&page=intro";
      nextlink = baseurl + "intro-video";
    } else if (currentPage === "intro-video") {
      // pause video
      // $("#my_video_1")[0].player.pause();
      backlink = baseurl + "objectives";
      nextlink = baseurl + "definitions";
    } else if (currentPage === "definitions") {
      backlink = baseurl + "intro-video";
      nextlink = baseurl + "types";
    } else if (currentPage === "types") {
      backlink = baseurl + "definitions";
      nextlink = baseurl + "work";
    } else if (currentPage === "work") {
      backlink = baseurl + "types";
      //___________________
      nextlink = baseurl + "supplements";
    } else if (currentPage === "supplements") {
      backlink = baseurl + "work";
      nextlink = baseurl + "drugs";
    } else if (currentPage === "drugs") {
      backlink = baseurl + "supplements";
      // --------------------------------
      nextlink = baseurl + "dietary";
    } else if (currentPage === "dietary") {
      backlink = baseurl + "drugs";
      nextlink = baseurl + "activity";
    } else if (currentPage === "activity") {
      backlink = baseurl + "dietary";
      //_______________________
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "activity";
      nextlink = baseurl + "reflection";
    } else if (currentPage === "reflection") {
      backlink = baseurl + "quiz";
      nextlink = baseurl + "takeaways";
    } else if (currentPage === "takeaways") {
      backlink = baseurl + "reflection";
      nextlink =
        "/course-player?module=medication&section=consequences&page=objectives";
    }
  } else if (section === "consequences") {
    let baseurl = "/course-player?module=medication&section=consequences&page=";

    if (currentPage === "objectives") {
      backlink =
        "/course-player?module=medication&section=concepts&page=objectives";
      nextlink = baseurl + "financial";
    } else if (currentPage === "financial") {
      backlink = baseurl + "objectives";
      nextlink = baseurl + "health";
    } else if (currentPage === "health") {
      backlink = baseurl + "financial";
      nextlink = baseurl + "targets";
    } else if (currentPage === "targets") {
      backlink = baseurl + "health";
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "targets";
      nextlink = baseurl + "reflection";
    } else if (currentPage === "reflection") {
      backlink = baseurl + "quiz";
      nextlink = baseurl + "takeaways";
    } else if (currentPage === "takeaways") {
      backlink = baseurl + "reflection";
      nextlink =
        "/course-player?module=medication&section=techniques&page=objectives";
    }
  } else if (section === "techniques") {
    let baseurl = "/course-player?module=medication&section=techniques&page=";

    if (currentPage === "objectives") {
      backlink =
        "/course-player?module=medication&section=consequences&page=objectives";
      nextlink = baseurl + "emotion";
    } else if (currentPage === "emotion") {
      backlink = baseurl + "objectives";
      nextlink = baseurl + "misleading";
    } else if (currentPage === "misleading") {
      backlink = baseurl + "emotion";
      nextlink = baseurl + "terminology";
    } else if (currentPage === "terminology") {
      backlink = baseurl + "misleading";
      nextlink = baseurl + "activity";
    } else if (currentPage === "activity") {
      backlink = baseurl + "terminology";
      nextlink = baseurl + "testimonial";
    } else if (currentPage === "testimonial") {
      backlink = baseurl + "activity";
      nextlink = baseurl + "placebo";
    } else if (currentPage === "placebo") {
      backlink = baseurl + "testimonial";
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "placebo";
      nextlink = baseurl + "reflection";
    } else if (currentPage === "reflection") {
      backlink = baseurl + "quiz";
      nextlink = baseurl + "takeaways";
    } else if (currentPage === "takeaways") {
      backlink = baseurl + "reflection";
      nextlink =
        "/course-player?module=medication&section=signs&page=objectives";
    }
  } else if (section === "signs") {
    let baseurl = "/course-player?module=medication&section=signs&page=";

    if (currentPage === "objectives") {
      backlink =
        "/course-player?module=medication&section=techniques&page=objectives";
      nextlink = baseurl + "types";
    } else if (currentPage === "types") {
      backlink = baseurl + "objectives";
      nextlink = baseurl + "testimonial";
    } else if (currentPage === "testimonial") {
      backlink = baseurl + "types";
      nextlink = baseurl + "satisfaction";
    } else if (currentPage === "satisfaction") {
      backlink = baseurl + "testimonial";
      nextlink = baseurl + "promotion";
    } else if (currentPage === "promotion") {
      backlink = baseurl + "satisfaction";
      nextlink = baseurl + "prescription";
    } else if (currentPage === "prescription") {
      backlink = baseurl + "promotion";
      nextlink = baseurl + "payment";
    } else if (currentPage === "payment") {
      backlink = baseurl + "prescription";
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "payment";
      nextlink = baseurl + "reflection";
    } else if (currentPage === "reflection") {
      backlink = baseurl + "quiz";
      nextlink = baseurl + "takeaways";
    } else if (currentPage === "takeaways") {
      backlink = baseurl + "reflection";
      nextlink =
        "/course-player?module=medication&section=protection&page=objectives";
    }
  } else if (section === "protection") {
    let baseurl = "/course-player?module=medication&section=protection&page=";

    if (currentPage === "objectives") {
      backlink =
        "/course-player?module=medication&section=signs&page=objectives";
      nextlink = baseurl + "methods";
    } else if (currentPage === "methods") {
      backlink = baseurl + "objectives";
      nextlink = baseurl + "sources";
    } else if (currentPage === "sources") {
      backlink = baseurl + "methods";
      nextlink = baseurl + "types";
    } else if (currentPage === "types") {
      backlink = baseurl + "sources";
      nextlink = baseurl + "verify1";
    } else if (currentPage === "verify1") {
      backlink = baseurl + "types";
      nextlink = baseurl + "verify2";
    } else if (currentPage === "verify2") {
      backlink = baseurl + "verify1";
      nextlink = baseurl + "doctor";
    } else if (currentPage === "doctor") {
      backlink = baseurl + "verify2";
      nextlink = baseurl + "postScam";
    } else if (currentPage === "postScam") {
      backlink = baseurl + "doctor";
      nextlink = baseurl + "report";
    } else if (currentPage === "report") {
      backlink = baseurl + "postScam";
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "report";
      nextlink = baseurl + "reflection";
    } else if (currentPage === "reflection") {
      backlink = baseurl + "quiz";
      nextlink = baseurl + "takeaways";
    } else if (currentPage === "takeaways") {
      backlink = baseurl + "reflection";
      nextlink =
        "/course-player?module=medication&section=practice&page=objectives";
    }
  } else if (section === "practice") {
    let baseurl = "/course-player?module=medication&section=practice&page=";
    let holdPrev = 'reflection'

    if (currentPage === "objectives") {
      backlink =
        "/course-player?module=medication&section=protection&page=objectives";
      nextlink = baseurl + "introduction";
    } else if (currentPage === "introduction") {
      backlink = baseurl + "objectives";
      nextlink = baseurl + "activity";

    } else if (currentPage === "activity") {
      backlink = baseurl + "introduction";
      nextlink = baseurl + "activity2";

    } else if (currentPage === "activity2") {
      backlink = baseurl + "activity";
      nextlink = baseurl + "activity3";

    } else if (currentPage === "activity3") {
      backlink = baseurl + "activity2";
      nextlink = baseurl + "activity4";

    } else if (currentPage === "activity4") {
      backlink = baseurl + "activity3";
      nextlink = baseurl + "reflection";

    } else if (currentPage === "reflection") {
      backlink = baseurl + "activity4";
      nextlink = baseurl + "takeaways";
      holdPrev = "reflection"
    } else if (currentPage === "activity5") {
      backlink = baseurl + "introduction";
      nextlink = baseurl + "activity6";

    } else if (currentPage === "activity6") {
      backlink = baseurl + "activity5";
      nextlink = baseurl + "activity7";

    } else if (currentPage === "activity7") {
      backlink = baseurl + "activity6";
      nextlink = baseurl + "activity8";

    } else if (currentPage === "activity8") {
      backlink = baseurl + "activity7";
      nextlink = baseurl + "reflection2";

    } else if (currentPage === "reflection2") {
      holdPrev = "reflection2"
      backlink = baseurl + "activity8";
      nextlink = baseurl + "takeaways";
    } else if (currentPage === "takeaways") {
      backlink = baseurl + holdPrev;
      nextlink = "/course-player?module=medication&section=evaluation&page=intro";

      // complete module status to 100 manually since there is no quiz
      console.log("HEY Posting to complete practice module status");
      $.post("/completeModuleStatus", {
        modId: "medication",
        section: "practice",
      });
    } 


  } else if (section === "evaluation") {
    let baseurl = "/course-player?module=medication&section=evaluation&page=";

    if (currentPage === "intro") {
      backlink =
        "/course-player?module=medication&section=practice&page=objectives";
      nextlink = baseurl + "quiz";
    } else if (currentPage === "quiz") {
      backlink = baseurl + "intro";
      nextlink = baseurl + "badge";
    } else if (currentPage === "badge") {
      backlink = baseurl + "quiz";
      nextlink = baseurl + "certificate";
    } else if (currentPage === "certificate") {
      backlink = baseurl + "badge";
      nextlink = "/about/medication";
    }
  }

  return { backlink, nextlink };
}

function updateProgressBar() {
  let progress;

  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");

  if (section === "challenge") {
    if (pageParam === "intro") {
      progress = 0;
    } else if (pageParam === "quiz") {
      progress = 20;
    } else if (pageParam === "badge") {
      progress = 100;
    }
  } else if (section === "concepts") {
    if (pageParam === "objectives") {
      progress = 0;
    } else if (pageParam === "intro-video") {
      progress = (1 / total) * 100;
    } else if (pageParam === "definitions") {
      progress = (2 / total) * 100;
    } else if (pageParam === "types") {
      progress = (3 / total) * 100;
    } else if (pageParam === "work") {
      progress = (4 / total) * 100;
    } else if (pageParam === "supplements") {
      progress = (5 / total) * 100;
    } else if (pageParam === "drugs") {
      progress = (6 / total) * 100;
    } else if (pageParam === "dietary") {
      progress = (7 / total) * 100;
    } else if (pageParam === "activity") {
      progress = (8 / total) * 100;
    } else if (pageParam === "quiz") {
      progress = (9 / total) * 100;
    } else if (pageParam === "reflection") {
      progress = (13 / total) * 100;
    } else if (pageParam === "takeaways") {
      progress = 100;
    }
  } else if (section === "consequences") {
    if (pageParam === "objectives") {
      progress = 0;
    } else if (pageParam === "financial") {
      progress = (1 / total) * 100;
    } else if (pageParam === "health") {
      progress = (2 / total) * 100;
    } else if (pageParam === "targets") {
      progress = (3 / total) * 100;
    } else if (pageParam === "quiz") {
      progress = (4 / total) * 100;
    } else if (pageParam === "reflection") {
      progress = (7 / total) * 100;
    } else if (pageParam === "takeaways") {
      progress = 100;
    }
  } else if (section === "techniques") {
    if (pageParam === "objectives") {
      progress = 0;
    } else if (pageParam === "emotion") {
      progress = (1 / total) * 100;
    } else if (pageParam === "misleading") {
      progress = (2 / total) * 100;
    } else if (pageParam === "terminology") {
      progress = (3 / total) * 100;
    } else if (pageParam === "activity") {
      progress = (4 / total) * 100;
    } else if (pageParam === "testimonial") {
      progress = (5 / total) * 100;
    } else if (pageParam === "placebo") {
      progress = (6 / total) * 100;
    } else if (pageParam === "quiz") {
      progress = (7 / total) * 100;
    } else if (pageParam === "reflection") {
      progress = (12 / total) * 100;
    } else if (pageParam === "takeaways") {
      progress = 100;
    }
  } else if (section === "signs") {
    if (pageParam === "objectives") {
      progress = 0;
    } else if (pageParam === "types") {
      progress = (1 / total) * 100;
    } else if (pageParam === "testimonial") {
      progress = (2 / total) * 100;
    } else if (pageParam === "satisfaction") {
      progress = (3 / total) * 100;
    } else if (pageParam === "promotion") {
      progress = (4 / total) * 100;
    } else if (pageParam === "prescription") {
      progress = (5 / total) * 100;
    } else if (pageParam === "payment") {
      progress = (6 / total) * 100;
    } else if (pageParam === "quiz") {
      progress = (7 / total) * 100;
    } else if (pageParam === "reflection") {
      progress = (11 / total) * 100;
    } else if (pageParam === "takeaways") {
      progress = 100;
    }
  } else if (section === "protection") {
    if (pageParam === "objectives") {
      progress = 0;
    } else if (pageParam === "methods") {
      progress = (1 / total) * 100;
    } else if (pageParam === "sources") {
      progress = (2 / total) * 100;
    } else if (pageParam === "types") {
      progress = (3 / total) * 100;
    } else if (pageParam === "verify1") {
      progress = (4 / total) * 100;
    } else if (pageParam === "verify2") {
      progress = (5 / total) * 100;
    } else if (pageParam === "doctor") {
      progress = (6 / total) * 100;
    } else if (pageParam === "postScam") {
      progress = (7 / total) * 100;
    } else if (pageParam === "report") {
      progress = (8 / total) * 100;
    } else if (pageParam === "quiz") {
      progress = (9 / total) * 100;
    } else if (pageParam === "reflection") {
      progress = (16 / total) * 100;
    } else if (pageParam === "takeaways") {
      progress = 100;
    }
  } else if (section === "practice") {
    if (pageParam === "objectives") {
        progress = 0; // 0%
    } else if (pageParam === "introduction") {
        progress = (1 / total) * 100; // ~11%
    } else if (pageParam === "activity") {
        progress = (2 / total) * 100; // ~22%
    } else if (pageParam === "activity2") {
        progress = (3 / total) * 100; // ~33%
    } else if (pageParam === "activity3") {
        progress = (4 / total) * 100; // ~33% (same as activity2)
    } else if (pageParam === "activity4") {
        progress = (5 / total) * 100; // ~44%
    } else if (pageParam === "activity5") {
        progress = (2 / total) * 100; // ~55%
    } else if (pageParam === "activity6") {
        progress = (3 / total) * 100; // ~55% (same as activity5)
    } else if (pageParam === "activity7") {
        progress = (4 / total) * 100; // ~66%
    } else if (pageParam === "activity8") {
        progress = (5 / total) * 100; // ~77%
    } else if (pageParam === "reflection") {
        progress = (6 / total) * 100; // ~88%
    } else if (pageParam === "reflection2") {
        progress = (6 / total) * 100; // ~88% (same as reflection)
    } else if (pageParam === "takeaways") {
        progress = 100;
    }

  }

  else if (section === "evaluation") {
    if (pageParam === "intro") {
      progress = 0;
    } else if (pageParam === "quiz") {
      progress = (1 / total) * 100;
    } else if (pageParam === "badge") {
      progress = 100;
    } else if (pageParam === "certificate") {
      progress = 100;
    }
  }

  console.log("The Progress: " + progress);

  if (progressBar) {
    progressBar.setAttribute("data-percent", progress);
    progressBar.querySelector(".bar").style.width = progress + "%";
    if (progress > 0 && progress < 100) {
      progressBar.querySelector(".bar").style.backgroundColor = "#7AC4E0";
    } else if (progress == 100) {
      progressBar.querySelector(".bar").style.backgroundColor = "#3757A7";
    }
    // progressBar.querySelector('.progress').textContent = progress + "%";
  } else {
    console.error("Could not find progress bar element");
  }
}

function appendScriptWithVariables(
  filename,
  modID,
  page,
  section,
  nextLink,
  progress
) {
  var head = document.getElementsByTagName("head")[0];

  var script = document.createElement("script");
  script.src = filename;
  script.type = "text/javascript";
  script.setAttribute("mod-id", modID);
  script.setAttribute("page", page);
  script.setAttribute("current-section", section);
  script.setAttribute("next-link", nextLink);
  script.setAttribute("progress", progress);

  head.appendChild(script);
}

function setIntroduction() {
  document.querySelectorAll(".ui.button[data-role]").forEach((button) => {
    button.addEventListener("click", function () {
      choice = this.getAttribute("data-role");


      console.log("The choice: ", choice);
      
      if(choice == "addiction") {
          console.log("INider")
          window.location.href = "course-player?module=medication&section=practice&page=activity";

      } else if(choice == "aging") {
          window.location.href = "course-player?module=medication&section=practice&page=activity5";
      } 

    });
  });
}

