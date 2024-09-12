var courses = [];


$(document).ready(function () {
  console.log("Document is ready. Courses are passed from the server.");
  // console.log("*Courses: ", courses)

  // Render courses that were passed in the template
  renderCourses(courses);  // `courses` comes passed from route and server side pug template

  // Add search functionality
  $('#course-search').on('input', filterCourses);

  // Initialize accordion
  $('.ui.accordion').accordion();

  // Add sorting functionality
  $('#ascend').on('click', function() {
    sortCourses('ascend');
  });

  $('#descend').on('click', function() {
    sortCourses('descend');
  });
});

function renderCourses(data) {
  console.log("Courses data passed to renderCourses:", data); // Check the structure of the data

  var container = $('#courses-container');
  container.empty();
  if (data.length === 0) {
    container.append('<p>No courses available at the moment.</p>');
  } else {
    data.forEach(function(item) {
      var courseHtml = `
        <div class="card">
          <div class="image">
            <img src="${item.image_link}" alt="${item.title} Banner Image" style="width: 100%; height: 125px; object-fit: cover;">
          </div>
          <div class="content">
            <div class="meta" style="text-align: end;">
              ${item.duration} min
            </div>
            <div class="header">${item.title}</div>
            <div class="description">
              ${item.description}
            </div>
          </div>
          <div class="extra content">
            <a href="${item.link}">
              <button class="ui blue button">Learn Now <i class="arrow right icon"></i></button>
            </a>
          </div>
        </div>
      `;
      container.append(courseHtml);
    });
  }
}

function filterCourses() {
  var searchTerm = $('#course-search').val().toLowerCase();
  console.log("filtering", searchTerm);
  var filteredCourses = courses.filter(function(course) {
    return course.title.toLowerCase().includes(searchTerm);
  });
  renderCourses(filteredCourses);
}

function sortCourses(order) {
  courses.sort(function(a, b) {
    if (order === 'ascend') {
      return a.title.localeCompare(b.title);
    } else if (order === 'descend') {
      return b.title.localeCompare(a.title);
    }
  });
  renderCourses(courses);
}

// $(document).ready(function () {
//   console.log("Document is ready, making API call.");
//   $.get("/api/courses", function (data) {
//     console.log("API response received.");
//     console.log("Response table info:");
//     console.log(data);
//     courses = data;
//     renderCourses(courses);

//     $('#course-search').on('input', filterCourses);
//   }).fail(function() {
//     console.log("API call failed.");
//     $('#courses-container').append('<p>Failed to load courses. Please try again later.</p>');
//   });

//   $('.ui.accordion').accordion();

//   $('#ascend').on('click', function() {
//     sortCourses('ascend');
//   });

//   $('#descend').on('click', function() {
//     sortCourses('descend');
//   });
// });
