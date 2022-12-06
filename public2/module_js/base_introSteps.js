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
    //   audioFile: ['']
    },
    {
      element: '#step2',
      intro: `You were looking through your friend requests on social media and Woah! It looks like Elvis Pres1ey has requested to be your friend!`,
      position: 'right',
      scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.1.mp3']
    },
    {
      element: '#step2',
      intro: `A <b>troll</b> is a fake social media account, often created to spread misleading information or scam people.`,
      position: 'right',
      scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.3.mp3']
    },
    {
      element: '#step2',
      intro: `This Elvis account is an example of a <b>troll</b>. Lets look at the red flags you should be aware of to help you identify him as a troll`,
      position: 'right',
      scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.3.mp3']
    },
    {
        element: '#mutual',
        intro: `First notice that you have no <b>mutual friends</b>. You should be careful of accepting friend requests like this especially if you don't know them in real life as it is difficult to know what a random person's intention is in friending you.`,
        position: 'right',
        scrollTo: 'tooltip'
        // audioFile: ['CUSML.6.3.3.mp3']
      },
      {
        element: '.approveDeclineBtns',
        intro: `Accepting a friend request allows them to <b>access</b> more information about you and your current network of friends so it is important that you <b>look further</b> into these requests before making a decision about accepting them. Lets go to his public profile page and investigate!`,
        position: 'right',
        scrollTo: 'tooltip'
        // audioFile: ['CUSML.6.3.3.mp3']
      },
    {
    element: '#harmony-pic',
    intro: `They pose as a well known <b>celebrity</b>. Scammers often pretend to be celebrities you look up to and trust in an attempt to manipulate you`,
    position: 'right',
    scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.5.mp3']
    },
    {
      element: '.populatedBio',
      intro: `The troll’s account is <b>populated</b> with data that makes them look believable and fit the <b>narrative</b> that the malicious actor wants to push (e.g. a famous musician).`,
      position: 'right',
      scrollTo: 'tooltip'             
    //   audioFile: ['CUSML.6.3.4.mp3']
    },
    {
        element: '#userName',
        intro: `Paying attention to the the <b>spelling</b> throughout the profile can help you identify a troll. The celebrity's real name is usually taken so trolls will use slight variations in the name to bypass this. Here the number one is used instead of the letter "L".`,
        position: 'right',
        scrollTo: 'tooltip',             
        // audioFile: ['CUSML.6.3.4.mp3']
      },
    {
      element: '#twitterNav',
      intro: `Notice his profile statistics. He has a <b>lot of messages</b> for only being on Twitter for one months! Also, the <b>ratio</b> of following to followers is off. You would expect a celebrity to have more followers since they're famous.`,
      position: 'right',
      scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.6.mp3']
    },
    {
      element: '#opinion',
      intro: `He has very suspicious posts where he is trying to get people to click a link. You should <b>not click links</b> found on social media unless you're 100% sure they're safe as they can be malicious.`,
      position: 'right',
      scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.7.mp3']
    },
    {
      element: '#postButtons',
      intro: `Lastly, the message has few likes, reshares, and comments which is a sign that this isn't a real person with authentic connections as they have thousands of followers but very little <b>engagement</b>.`,
      position: 'right',
      scrollTo: 'tooltip'
    //   audioFile: ['CUSML.6.3.6.mp3']
    },
    {
      element: '#decline',
      intro: `This is a troll, you should decline this request.<br><br> <em>Press the <b>decline</b> button to continue</em>`,
      position: 'right',
      scrollTo: 'element',         
    }
  ];

  const stepsListThird = [
    {
      element: '#step1',
      intro: `Looks like you have another friend request!`,
      position: 'right',
      scrollTo: 'tooltip',
      audioFile: ['']
    },
      {
        element: '#step2',
        intro: `This account is an example of a <b>real person</b>. Lets look at the green flags you should be aware of to help you identify him a real person rather than a troll`,
        position: 'right',
        scrollTo: 'tooltip',
        audioFile: ['CUSML.6.3.3.mp3']
      },
      {
          element: '#mutual',
          intro: `First notice that you have many <b>mutual friends</b>.`,
          position: 'right',
          scrollTo: 'tooltip',
          audioFile: ['CUSML.6.3.3.mp3']
        },
        {
            element: '.populatedBio',
            intro: `Unlike Elvis, Chris isn't trying to get you to click a link in his bio. Instead, he is <b>sharing about his personal life</b>. The facts in his bio can be <b>easily confirmed</b> by looking at his feed and account statistics. Trolls avoid using identifying information that is easy to debunk.`,
            position: 'right',
            scrollTo: 'tooltip',             
            audioFile: ['CUSML.6.3.4.mp3']
          },
          {
            element: '#joined-date',
            intro: `We can also see that he has been on the social media site of <b>many years</b>`,
            position: 'right',
            scrollTo: 'tooltip',             
            audioFile: ['CUSML.6.3.4.mp3']
          },
        {
            element: '#harmony-pic',
            intro: `Chris shares nice pictures of him with his family. This helps show that he is a real person as well as give insight into one of his <b>motivations</b> for being on social media—connecting with family. This is something trolls aren't interested in.`,
            position: 'right',
            scrollTo: 'tooltip',
            audioFile: ['CUSML.6.3.3.mp3']
          },
          {
            element: '#chrisFeed',
            intro: `He posts about <b>places to eat in his hometown</b>. Professional trolls are speaking to a wide audience, not just their neighbors in Columbia City. They aren’t very likely to put research into where to find good brisket.`,
            position: 'right',
            scrollTo: 'tooltip',
            audioFile: ['CUSML.6.3.3.mp3']
          },
          {
            element: '#chrisFeed',
            intro: `It is important to note that most social media accounts are indeed operated by <b>real people</b>. This is true with accounts that discuss politics, race, and culture (topics trolls focus on) the same as any other.`,
            position: 'right',
            scrollTo: 'tooltip',
            audioFile: ['CUSML.6.3.3.mp3']
          },
      {
        element: '#accept',
        intro: `This is not a troll, you should accept this request`,
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
            // 'doneLabel': 'Done &#10003'
        });
    } else if (subdirectory2 === "learn2") {
        var intro = introJs().setOptions({
            steps: stepsListThird,
            'hidePrev': true,
            'hideNext': true,
            'exitOnOverlayClick': false,
            'exitOnEsc': false,
            'showStepNumbers': false,
            'showBullets': false,
            'scrollToElement': true,
            'doneLabel': 'Done &#10003'
        });
    } else if (subdirectory2 === "learn3") {
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
            if(subdirectory2 === "cyberbullying"){
                window.location.href='/tutorial/learn2';
            } else if(subdirectory2 === "learn2") {
                window.location.href='/tutorial/learn3';
            }else {
                let tempSub = "cyberbullying";
                window.location.href = `/${nextPageURL}/${tempSub}`;
            }
            // if(subdirectory2 === "cyberbullying"){
            //     window.location.href='/tutorial/learn2';
            // } else if(subdirectory2 === "learn2")
            //     window.location.href='/tutorial/learn3';
            // } else {
            //     window.location.href = `/${nextPageURL}/${subdirectory2}`;
            // }
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