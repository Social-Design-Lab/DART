const progressBar = document.getElementById('theft-progress');
let pageReload= false;

$(document).ready(function() {
    // Load the first page based on the URL
    console.log("The start page: " + startPage);
    setLinks(startPage);

    $('#backButton').on('click', function() {
        console.log("Back button clicked");
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = urlParams.get('page');

        $('.ui.sidebar').sidebar('hide');


        const { backlink, nextlink } = setLinks(currentPage);
        history.pushState(null, '', backlink);

        // console.log("Backlink: " + backlink);
        // console.log("Nextlink: " + nextlink);



        const backParams = new URLSearchParams(backlink);
        const backPage = backParams.get('page');

        // console.log("Back Page: " + backPage);
        // console.log("Current Page: " + currentPage);


    

        
        // $('#' + currentPage).removeClass('transition visible');
        // $('#' + currentPage).css('display', ''); 
        // $('#' + currentPage).addClass('hidden');

        if(backPage === null) {
            window.location.href = backlink;
        } else {
            // $('#' + backPage).transition('fade');

            // fade out current page, then fade in previous page. at half duration each, 400ms total
            $('#' + currentPage).transition({
                animation: 'fade out',
                duration: 200,
                onComplete: function() {
                    $('#' + backPage).transition({
                        animation: 'fade in',
                        duration: 200,
                    });
                }
            });

        }


        updateProgressBar();
    });
    
    $('#nextButton').on('click', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = urlParams.get('page');
        
        $('.ui.sidebar').sidebar('hide');

        const { backlink, nextlink } = setLinks(currentPage);
        history.pushState(null, '', nextlink);

        // console.log("Backlink: " + backlink);
        // console.log("Nextlink: " + nextlink);


        const nextParams = new URLSearchParams(nextlink);
        const nextPage = nextParams.get('page');

        // fade out current page, then fade in next page. at half duration each, 400ms total
        $('#' + currentPage).transition({
            animation: 'fade out',
            duration: 200,
            onComplete: function() {
                $('#' + nextPage).transition({
                    animation: 'fade in',
                    duration: 200,
                });
            }
        });

        // $('#' + currentPage).transition('fade out');
        // $('#' + nextPage).transition('fade in');
        // hide current page then show next page
        // $('#' + nextPage).transition({
        //     animation: 'fade in',
        //     onBeforeShow: function(showFunction) {
        //         // Perform actions before the show transition starts
        //         $('#' + currentPage).removeClass('transition visible');
        //         $('#' + currentPage).css('display', '');
        //         $('#' + currentPage).addClass('hidden');
        
        //         // Call the showFunction to trigger the show transition
        //         showFunction();
        //     }        
        //     // onComplete: function() {
        //     //     console.log('Next btn: nextPage fade done.');
        //     // }
        // });



        // console.log("Back Page: " + backPage);
        // console.log("Current Page: " + currentPage);



        // if(nextPage === 'quiz') {
        //     $('#quiz-template').transition('fade');      
        // }


    

        // if(currentPage === 'quiz') {
        //     var filename = 'module_js/module_quiz.js';
        //     appendScriptWithVariables(filename, module, currentPage, section, nextlink, progress);
        // }
        
        // $('#' + currentPage).removeClass('transition visible');
        // $('#' + currentPage).css('display', ''); 
        // $('#' + currentPage).addClass('hidden');

        // $('#' + nextPage).transition('fade');
        // $('#' + nextPage).transition({
        //     animation: 'fade',
        //     onComplete: function() {
        //         console.log('Next btn: nextPage fade done.');
        //     }
        // });


        updateProgressBar();


    });
});

function setLinks(currentPage) {
    let backlink, nextlink;

    if(!pageReload) {
        $('#' + currentPage).transition('fade in');
        pageReload = true;
    }

    if(section === 'concepts') {
        if(currentPage === 'objectives') {
            // $('#objectives').transition('fade');
            backlink = `/challenge/identity`;
            nextlink = `/course-player?module=identity&section=concepts&page=intro-video`;
        } 
        else if(currentPage === 'intro-video') {
            // pause video
            $('#my_video_1')[0].player.pause();

            // $('#intro-video').transition('fade');
            backlink = `/course-player?module=identity&section=concepts&page=objectives`;
            nextlink = `/course-player?module=identity&section=concepts&page=definitions`;
        } else if(currentPage === 'definitions') {
            console.log("setLinks is at definitions");

            // $('#definitions').transition('fade');
            backlink = `/course-player?module=identity&section=concepts&page=intro-video`;
            nextlink = `/course-player?module=identity&section=concepts&page=personal-info`;
        } else if(currentPage === 'personal-info') {
            console.log("setLinks is at personal-info");

            // $('#personal-info').transition('fade');
            backlink = `/course-player?module=identity&section=concepts&page=definitions`;
            nextlink = `/course-player?module=identity&section=concepts&page=activity`;
        } else if(currentPage === 'activity') {
            console.log("setLinks is at activity");

            // $('#activity').transition('fade');
            backlink = `/course-player?module=identity&section=concepts&page=personal-info`;
            nextlink = `/course-player?module=identity&section=concepts&page=reflection`;
        } else if(currentPage === 'reflection') {
            console.log("setLinks is at reflection");

            // $('#reflection').transition('fade');
            // $('#reflection').transition({
            //     animation: 'fade',
            //     // onStart: function() {
            //     //     // $('#quiz-template').addClass('hidden');  
            //     //     $('#reflection').css('display', ''); 
            //     //     $('#reflection').addClass('hidden');               
            //     // },
            //     onComplete: function() {
            //         console.log('SetLinks: reflection fade done');
            //     }
            // });

            backlink = `/course-player?module=identity&section=concepts&page=activity`;
            nextlink = `/course-player?module=identity&section=concepts&page=quiz`;
        } else if(currentPage === 'quiz') {
            console.log("setLinks is at quiz");
            
            backlink = `/course-player?module=identity&section=concepts&page=reflection`;
            nextlink = `/course-player?module=identity&section=concepts&page=takeaways`;
            progress = (7 / total) * 100;

            // console.log("Page is quiz-template")
            // console.log("module: " + module)
            // console.log("section: " + section)

            // $('#quiz-template').transition('fade');
            // $('#quiz-template').transition({
            //     animation: 'fade',
            //     // onStart: function() {
            //     //     $('#quiz-template').css('display', ''); 
            //     //     $('#quiz-template').addClass('hidden');               
            //     // },
            //     onComplete: function() {
            //         console.log('SetLinks: quiz-template fade done');
            //     }
            // });

            // startQuiz()
            // console.log("***Quiz started")

            // var filename = 'module_js/module_quiz.js';
            // appendScriptWithVariables(filename, module, currentPage, section, nextlink, progress);


        } else if(currentPage === 'takeaways') {
            // $('#takeaways').transition('fade');
            // $('#takeaways').transition({
            //     animation: 'fade',
            //     onComplete: function() {
            //         console.log('SetLinks: takeaways fade done');
            //     }
            // });
            backlink = `/course-player?module=identity&section=concepts&page=quiz`;
            nextlink = `/course-player?module=identity&section=concepts&page=objectives`;
        }

        // $('#' + currentPage).removeClass('transition visible');
        // $('#' + currentPage).css('display', ''); 
        // $('#' + currentPage).addClass('hidden');

    }

    return { backlink, nextlink };

}


function updateProgressBar() {
    let progress;

    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');

    

    if (pageParam === 'objectives') {
        progress = (1 / total) * 100;
    } else if (pageParam === 'intro-video') {
        progress = (2 / total) * 100;
    } else if (pageParam === 'definitions') {
        progress = (3 / total) * 100;
    } else if (pageParam === 'personal-info') {
        progress = (4 / total) * 100;
    } else if (pageParam === 'activity') {
        progress = (5 / total) * 100;
    } else if (pageParam === 'reflection') {
        progress = (6 / total) * 100;
    } else if (pageParam === 'quiz') {
        progress = (7 / total) * 100;
    }

    // console.log("Progress: " + progress);

    if (progressBar) {
        progressBar.setAttribute('data-percent', progress);
        progressBar.querySelector('.bar').style.width = progress + "%";
        if(progress > 0 && progress < 100){
        progressBar.querySelector('.bar').style.backgroundColor = '#7AC4E0';
        } else if(progress == 100) {
        progressBar.querySelector('.bar').style.backgroundColor = '#3757A7';
        }
        // progressBar.querySelector('.progress').textContent = progress + "%";
    } else {
        console.error('Could not find progress bar element');
    }
}

function appendScriptWithVariables(filename, modID, page, currentSection, nextLink, progress) {
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';
    script.setAttribute('mod-id', modID);
    script.setAttribute('page', page);
    script.setAttribute('current-section', currentSection);
    script.setAttribute('next-link', nextLink);
    script.setAttribute('progress', progress);

    head.appendChild(script);
}
