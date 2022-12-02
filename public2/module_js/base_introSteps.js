let jqhxrArray = new Array(); // this array will be handed to Promise.all
let pathArrayIntro = window.location.pathname.split('/');
const subdirectory1 = pathArrayIntro[1]; // idenify the current page
const subdirectory2 = pathArrayIntro[2]; // idenify the current module
let startTimestamp = Date.now();


const stepsListSecond = [
    {
      element: '#step1',
      intro: `Click "Next" to begin!`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['']
    },
    {
      element: '#step2',
      // intro: `You have recently seen that some people keep saying mean
      // things about Dylan. A group of friends from school are bullying
      // Dylan on social media.`,
      intro: `You were looking through your friend requests on social media and Woah! It looks like Elvis Pres1ey who has requested to be your friend!`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.1.mp3']
    },
    {
      element: '#step3',
      // intro: `<b>Cyberbullying</b> is when someone posts or shares
      // negative things about someone else online. <br>The <b>bully</b> may
      // use digital devices, sites, or apps. The bully often does this again
      // and again to the same person.`,
      intro: `You click on his account to learn more about him.`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.2.mp3']
    },
    {
      element: '#harmony-page',
      intro: `A <b>troll</b> is a fake social media account, often created to spread misleading information or scam people.`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.3.mp3']
    },
    {
      element: '#harmony-page',
      intro: `This Elvis account is an example of a <b>troll</b>.`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.3.mp3']
    },
    {
      element: '.bio',
      intro: `The troll’s account is <b>populated</b> with data that makes them look believable and fit the <b>narrative</b> that the malicious actor wants to push (e.g. a famous musician).`,
      position: 'right',
      scrollTo: 'tooltip',             
      audioFile: ['CUSML.6.3.4.mp3']
    },
    {
        element: '#userName',
        intro: `Paying attention to the the <b>spelling</b> throughout the profile can help you identify a troll. Here the number one is used instead of the letter "L".`,
        position: 'right',
        scrollTo: 'tooltip',             
        audioFile: ['CUSML.6.3.4.mp3']
      },
    {
      element: '#harmony-pic',
      intro: `Like many trolls, they pose as a <b>celebrity</b>. This is a common tactic of internet charlatans; trolls and bots sell disinformation in the same way advertisers sell their products`,
      position: 'top',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.5.mp3']
    },
    {
      element: '#twitterNav',
      intro: `Notice Elvis' profile statistics. He has a lot of tweets for only being on Twitter since November! <b>Bots</b> are made to post regularly follow and like eachother's content.`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.6.mp3']
    },
    {
      element: '#opinion',
      intro: `She has very <b>strong political opinions</b> and sets herself up in direct <b>opposition</b> to an extreme version of people on the other side of the political divide. Harmony’s goal is to make us more disgusted with one another and make meaningful compromise more difficult.`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.7.mp3']
    },
    {
      element: '#actionsOverlay',
      intro: `Unwitting legitimate accounts react to the content posted by the troll accounts, e.g., re-sharing it or interacting directly with them. This will turn the <b>disinformation seeds planted</b> by the malicious actor into an <b>organic disinformation campaign</b> where content is shared by both troll accounts and legitimate users`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.6.mp3']
    },
    {
      element: '#decline',
      intro: `This is a troll, you should decline their request`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['CUSML.6.3.6.mp3']
    }
  ];

function startIntro(enableDataCollection) {
    // let blah = stepList;
    // console.log("HA");
    // console.log(subdirectory2);
    if(subdirectory2 === "cyberbullying"){
        var intro = introJs().setOptions({
            steps: stepsListSecond,
            'hidePrev': true,
            'hideNext': true,
            'exitOnOverlayClick': false,
            'exitOnEsc': false,
            'showStepNumbers': false,
            'showBullets': false,
            'scrollToElement': true,
            'doneLabel': 'Done &#10003'
        });
    } else if (subdirectory2 === "learn2") {
        var intro = introJs().setOptions({
            steps: stepsList,
            'hidePrev': true,
            'hideNext': true,
            'exitOnOverlayClick': false,
            'exitOnEsc': false,
            'showStepNumbers': false,
            'showBullets': false,
            'scrollToElement': true,
            'doneLabel': 'Done &#10003'
        });
    }

    /*
    onbeforechange:
    "Given callback function will be called before starting a new step of
    introduction. The callback function receives the element of the new step as
    an argument."
    */
    intro.onbeforechange(function() {
        // if this function is defined in the custom js file, run it
        try {
            additionalOnBeforeChange($(this));
        } catch (error) {
            if (!(error instanceof ReferenceError)) {
                console.log("There has been an unexpected error:");
                console.log(error);
            }
        }
        // Skip the remaining code in this function if data collection is disabled.
        if (!enableDataCollection) {
            return;
        }
        // Data collection is enabled:
        // ._currentStep has the number of the NEXT tutorial box you're moving toward.
        // However, we want to know the number of the step we are LEAVING.
        // We can use ._direction to determine if we are going forward or backward,
        // and then subtract/add accordingly to get the number we want.
        let leavingStep = 0;
        if ($(this)[0]._direction === "forward") {
            leavingStep = ($(this)[0]._currentStep - 1);
        } else if ($(this)[0]._direction === "backward") {
            leavingStep = ($(this)[0]._currentStep + 1);
        } else {
            console.log(`There was an error in calculating the step number.`);
        }
        let totalTimeOpen = Date.now() - startTimestamp;
        let cat = new Object();
        cat.subdirectory1 = subdirectory1;
        cat.subdirectory2 = subdirectory2;
        cat.stepNumber = leavingStep;
        cat.viewDuration = totalTimeOpen;
        cat.absoluteStartTime = startTimestamp;
        // Check that leavingStep is a legitimate number. -1 seems to occur whenever
        // the page is loaded, or when the back button is used - we don't want to
        // record those occurrences.
        if (leavingStep !== -1) {
            const jqxhr = $.post("/introjsStep", {
                action: cat,
                _csrf: $('meta[name="csrf-token"]').attr('content')
            });
            jqhxrArray.push(jqxhr);
        }
    });

    /*
    onafterchange:
    "Given callback function will be called after starting a new step of
    introduction. The callback function receives the element of the new step as
    an argument."
    */
    intro.onafterchange(function() {
        Voiceovers.playVoiceover(stepsList[$(this)[0]._currentStep].audioFile);
        // reset the timestamp for the next step
        startTimestamp = Date.now();
        hideHelpMessage();
    })

    /*
    onbeforexit:
    "Works exactly same as onexit but calls before closing the tour. Also,
    returning false would prevent the tour from closing."
    */
    intro.onbeforeexit(function() {
        hideHelpMessage();
        Voiceovers.pauseVoiceover();
        // if this function is defined in the custom js file, run it
        try {
            additionalOnBeforeExit();
        } catch (error) {
            if (!(error instanceof ReferenceError)) {
                console.log("There has been an unexpected error:");
                console.log(error);
            }
        }

        // Skip the remaining code in this function if data collection is disabled.
        if (!enableDataCollection) {
            window.location.href='/tutorial/learn2';

            // window.location.href = `/${nextPageURL}/${subdirectory2}`;
            return;
        }
        // Data collection is enabled:
        let leavingStep = $(this)[0]._currentStep;
        // edge case: current step will = -1 when the user leaves the page using
        // something like the back button. Don not record that.
        let totalTimeOpen = Date.now() - startTimestamp;
        let cat = new Object();
        cat.subdirectory1 = subdirectory1;
        cat.subdirectory2 = subdirectory2;
        cat.stepNumber = leavingStep;
        cat.viewDuration = totalTimeOpen;
        cat.absoluteStartTime = startTimestamp;
        const jqxhr = $.post("/introjsStep", {
            action: cat,
            _csrf: $('meta[name="csrf-token"]').attr('content')
        });
        jqhxrArray.push(jqxhr);
        // this is the last step in the module, so change pages once all Promises
        // are completed
        Promise.all(jqhxrArray).then(function() {
            // use the variable nextPageURL defined in the custom js file for the page
            window.location.href='/tutorial/learn2';

            // window.location.href = `/${nextPageURL}/${subdirectory2}`
        });
    });

    intro.start(); //start the intro
    return intro;
};

function isTutorialBoxOffScreen(bottomOffset) {
    if (window.scrollY > bottomOffset) {
        return true;
    } else {
        return false;
    }
}

function hideHelpMessage() {
    if ($('#clickNextHelpMessage').is(':visible')) {
        $('#clickNextHelpMessage').transition('fade');
    }
}

function showHelpMessage() {
    if ($('#clickNextHelpMessage').is(':hidden')) {
        $('#clickNextHelpMessage').transition('fade down');
    }
}

$(window).on("load", function() {
    const enableDataCollection = $('meta[name="isDataCollectionEnabled"]').attr('content') === "true";
    // if this function is defined in the custom js file, run it
    try {
        customOnWindowLoad(enableDataCollection);
    } catch (error) {
        if (error instanceof ReferenceError) {
            const intro = startIntro(enableDataCollection);
            const tooltipTopOffset = $('.introjs-tooltip').offset().top;
            const tooltipBottomOffset = tooltipTopOffset + $('.introjs-tooltip').outerHeight();
            let scrolledAway = false;
            // When the user scrolls, check that they haven't missed the first tooltip.
            // If the tooltip is scrolled out of the viewport and the user is still on
            // the first tooltip step after 4 seconds, show a help message.
            $(window).scroll(function() {
                // only want to do this once, so check that scrolledAway is false
                if (isTutorialBoxOffScreen(tooltipBottomOffset) && (!scrolledAway)) {
                    scrolledAway = true;
                    setTimeout(function() {
                        if (intro._currentStep === 0) {
                            showHelpMessage();
                        }
                    }, 4000);
                }
            });
        } else {
            console.log("There has been an unexpected error:");
            console.log(error);
        }
    }
});