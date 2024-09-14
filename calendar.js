
$(document).ready(function () {

    //declaring variables 
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();


    //the month and year the user is currently looking at
    let currentMonthviewed = today.getMonth();
    let currentYearviewed = today.getFullYear();

    let calendar = document.getElementById('calendar');
    let eventForm = document.getElementById('eventForm');
    let monthYearElement = document.getElementById('monthYear');

    let isEventFormShown = false;

    let dateInput = document.getElementById('date');
    let timeInput = document.getElementById('time');
    let eventIdInput = document.getElementById('eventId');
    let cancelButton = document.getElementById('cancelButton');
    let titleInput = document.getElementById('title');

    //ADDING TEST DYNAMIC UPDATE CODE


    // Check authentication status when the page loads
    checkAuthentication1();


    // Bind the logout function to the logout link
    $("#logoutLink").click(function () {
        logout();
        checkAuthentication1();  // Update UI after logout

    });

    // Bind the login and register functions to the respective buttons
    $("#login_btn").click(loginAjax); // assuming 'login_btn' is the ID of your login button
    $("#register_btn").click(registerAjax); // assuming 'register_btn' is the ID of your register button



    //check the user authentication
    function checkAuthentication() {
        let isAuthenticated = localStorage.getItem('token'); // Adjust depending on how you track logged-in status
        let loginStatusElement = $('#login-status');
        let storedUsername = localStorage.getItem('username');
        let logoutLink = $('#logoutLink');
        let formContainer = $('#form-container');

        if (isAuthenticated) {
            // Update UI for logged-in users
            loginStatusElement.text('You are logged in as ' + storedUsername);
            logoutLink.show();
            formContainer.hide();

            return true;

        } else {
            // Update UI for guests
            loginStatusElement.text('You are not logged in');
            logoutLink.hide();
            formContainer.show();
            return false;

        }
    }
    //another check authentication function
    function checkAuthentication1() {
        let isAuthenticated = localStorage.getItem('token'); // Adjust depending on how you track logged-in status
        let loginStatusElement = $('#login-status');
        let storedUsername = localStorage.getItem('username');
        let logoutLink = $('#logoutLink');
        let formContainer = $('#form-container');
        let shareCalendarLink = $('#shareCalendarLink');
        let sharedUserNameField = $('#sharedUserName');

        if (isAuthenticated) {
            // Update UI for logged-in users
            loginStatusElement.text('You are logged in as ' + storedUsername);
            logoutLink.show();
            shareCalendarLink.show();
            formContainer.hide();
            sharedUserNameField.show();
            return true;

        } else {
            // Update UI for guests
            loginStatusElement.text('You are not logged in');
            logoutLink.hide();
            formContainer.show();
            shareCalendarLink.hide();
            sharedUserNameField.hide();
            return false;

        }
    }


    function loginAjax(event) {
        const username = document.getElementById("loginForm-username").value;
        const password = document.getElementById("loginForm-password").value;

        // Check if username and password are empty
        if (username.trim() === "" || password.trim() === "") {
            alert("Username and password are required.");
            return; // Do not proceed with the request
        }


        const data = { 'username': username, 'password': password };

        //conducts the fetch request to get data from the login database using login.php
        fetch("login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse response as text
            })
            .then(textData => {
                try {
                    const data = JSON.parse(textData);
                    if (data.success) {
                        //SET THE CSRF TOKEN
                        localStorage.setItem('csrf_js_token', data.current_csrf_token);
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('username', username);
                        localStorage.setItem('loogedin_id', data.currentuserid);
                        // Clear the form fields
                        document.getElementById("loginForm-username").value = '';
                        document.getElementById("loginForm-password").value = '';
                        checkAuthentication1(); // Update UI

                        //refreshcalandar
                        refreshCalendar();

                        //catch various exceptions and error messages that could occur due to json processes
                    } else {
                        alert('You were not logged in due to an error, your username was likely invalid please try again');
                        console.log(`You were not logged in ${data.message}`);
                    }
                } catch (error) {
                    alert('You were not logged in due to an error, your username was likely invalid please try again');
                    console.log('Invalid JSON response:');
                }
            })
            .catch(err => {
                alert('You were not logged in due to an error, your username was likely invalid please try again');
                console.error('Error:', err);
            });
    }


    //register agax function for registering users
    function registerAjax(event) {
        const username = document.getElementById("registerForm-username").value;
        const password = document.getElementById("registerForm-password").value;

        const data = { 'username': username, 'password': password };
        // Check if username and password are empty
        if (username.trim() === "" || password.trim() === "") {
            alert("Username and password are required.");
            return; // Do not proceed with the request
        }

        //conducts fetch request to get the username and password data from the database in order to register the user in the calendar application
        fetch("register.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse response as text
            })
            .then(textData => {
                try {
                    const data = JSON.parse(textData);
                    if (data.success) {
                        console.log("Registration successful!");
                        alert("Registration successful!");
                        // Clear the form fields
                        document.getElementById("loginForm-username").value = '';
                        document.getElementById("loginForm-password").value = '';
                        checkAuthentication1(); // Update UI

                        //various error messages for  invalid username and json processes
                    } else {
                        console.log(`Registration failed: ${data.message}`);
                        alert('You were not registered due to an error, your username was likely invalid please try again');
                    }
                } catch (error) {
                    console.log('Invalid JSON response:');
                    alert('You were not registered due to an error, your username was likely invalid please try again');
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }

    function logout() {
        // Clear user authentication token or data
        localStorage.removeItem('token'); // Adjust if you're using a different method of tracking login status
        console.log("You've been logged out");
        checkAuthentication1(); // Update UI after logout

        //RESET THE CSRF TOKEN ON LOG OUT
        localStorage.setItem('csrf_js_token', "");
        let formContainer = document.getElementById('event-form-container2');
        if (formContainer.style.display === "block") {
            formContainer.style.display = "none";
        }
        formContainer = document.getElementById('event-form-container');
        if (formContainer.style.display === "block") {
            formContainer.style.display = "none";
        }
        console.log(formContainer.style.display);
        // formContainer.classList.add('hidden');
        //refreshcalandar
        refreshCalendar();

    }



    if (localStorage.getItem('token')) {
        refreshCalendar();

    } else {

        createCalendar(currentMonth, currentYear, []);
    }

    //function creates a calendar
    function createCalendar(month, year, events) {
        calendar.innerHTML = ''; // Clear the previous calendar

        let firstDay = new Date(year, month, 1);
        let lastDay = new Date(year, month + 1, 0);
        let startingDay = firstDay.getDay();
        let endingDay = lastDay.getDate();

        monthYearElement.textContent = getMonthName(month) + ' ' + year;

        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        // Create the header row with weekday labels
        let headerRow = document.createElement('tr');
        let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < weekdays.length; i++) {
            let th = document.createElement('th');
            th.textContent = weekdays[i];
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);

        // Create the calendar cells
        let date = 1;
        for (let row = 0; row < 6; row++) {
            let weekRow = document.createElement('tr');
            for (let col = 0; col < 7; col++) {
                if (row === 0 && col < startingDay) {
                    // Add empty cells before the first day of the month
                    let emptyCell = document.createElement('td');

                    weekRow.appendChild(emptyCell);
                } else if (date > endingDay) {
                    // All days for this month are done, break out of the loop
                    break;
                } else {
                    let cell = document.createElement('td');

                    cell.textContent = date;  // This line sets the day number


                    // Create a container for the events
                    let eventsList = document.createElement('div');
                    eventsList.className = 'events-list';
                    //if the user is logged in and they have at least one event

                    if (events.length > 0 && localStorage.getItem('token')) {


                        //sort the events by year month and day
                        events.sort((a, b) => {
                            let dateA = new Date(a.date);
                            let dateB = new Date(b.date);
                            return dateA - dateB;
                        });

                        //sort the events by time
                        events.sort((a, b) => {
                            // Split the time by ':' to get hours and minutes
                            let timeA = a.time.split(':');
                            let timeB = b.time.split(':');

                            // Convert the hours and minutes to minutes since midnight for easier comparison
                            let minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
                            let minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);

                            return minutesA - minutesB;
                        });

                        events.forEach(function (event) {


                            eventstring = JSON.stringify(event.date);


                            // Check if the event date matches the current cell date

                            //get the day value of the event that is being cycled through

                            //get the components of the event data that is on the form              

                            let current_event_info = eventstring.split("-");


                            let current_year = Number(current_event_info[0].replace(/["']/g, ''));

                            let current_month = Number(current_event_info[1]);
                            let current_day = Number(current_event_info[2].replace(/["']/g, ''));
                            let current_month_name = getMonthName(current_month);


                            //get the components of what is currently displayed on the form


                            let current_display_month = month;
                            let current_display_year = year;



                            //check if the current date data value is in the calendar

                            if (month === current_month - 1 && current_display_year === current_year && current_day === date) {
                                // Create a new anchor element
                                let clickableText = document.createElement("a");
                                clickableText.href = "#";
                                clickableText.classList.add("custom-link");

                                // Set its content
                                let eventElement = document.createElement('span'); // 'span' is an inline element
                                eventElement.textContent = "• " + event.time + ": " + event.title;
                                if (event.is_shared) {
                                    clickableText.classList.add('shared-event');
                                }
                                else {
                                        //give the text button tag a color based on the tag
                                        if (event.tags === "School"){


                                            clickableText.classList.add('school-event');
                                        }
                                        else if (event.tags === "Work"){

                                            clickableText.classList.add('work-event');
                                        
                                        }
                                        else if (event.tags === "Family"){

                                            clickableText.classList.add('family-event');

                                        }
                                        else if (event.tags === "Other"){


                                            clickableText.classList.add('other-event');

                                        }

                                }
                                

                               

                                 
                                // Append the eventElement to the clickableText
                                clickableText.appendChild(eventElement);
                            


                          

                                // Add an event listener for the 'click' event
                                clickableText.addEventListener("click", function (clickEvent) {
                                    clickEvent.stopPropagation();
                                    clickEvent.preventDefault();
                                    let editdateinput = `${current_year}-${month + 1}-${current_day}`;
                                    
                                    let inputtextContent = `${event.time}~${event.title}~${event.id}~${event.tags}`;
                                    window.showEventsEditOrDeleteMenu(editdateinput, inputtextContent);
                                });

                                // Append a line break and then the clickable text to the cell
                                cell.appendChild(document.createElement("br"));
                                cell.appendChild(clickableText);
                            }


                        });



                    }


                    //bind click events to buttons 
                    $(cell).off('click').on('click', function (event) {
                        let isloggedin_user = checkAuthentication(event);


                        // check that this happens on the parent
                        if (event.target === this || event.target.parentNode === this) {

                            date_from_form = cell.textContent.split("•")[0]
                            //make sure the user is logged in and bind the events 
                            //accordingly
                            if (!isloggedin_user) {
                                alert("You are not logged in");
                                return;
                            }
                            let selectedDate = new Date(year, month, date);
                            let formattedDate =
                                "Date: " + date_from_form +
                                ", Month: " + selectedDate.getMonth() +
                                ", Year: " + selectedDate.getFullYear();
                            // Assuming you want to show all event titles for this day
                            let eventTitles = Array.from(eventsList.children).map(e => e.textContent).join(", ");
                            if (eventTitles) {

                                window.showEventsAddMenu(formattedDate, eventTitles);
                            } else {

                                window.showEventsAddMenu(formattedDate, 'No Events');
                            }
                        }

                    });

                    cell.appendChild(eventsList); // Append events container to the cell
                    weekRow.appendChild(cell);



                    date++;  // Increment the date
                }
            }
            tbody.appendChild(weekRow);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        calendar.appendChild(table);
    }

    function refreshCalendar() {


        // code to get events 
        let pulledevents = ["No Events on this Date"];
        let isloggedin_user = checkAuthentication1();

        //make sure the user is logged in and bind the events 
        //accordingly
        if (!isloggedin_user) { //make a default calendar for guests
            createCalendar(currentMonth, currentYear, pulledevents);

            return;
        }

        const username_input = localStorage.getItem('username');

        const getting_event_data = { 'username': username_input };
        //make a fetch requesr to get the events from the php file get_events.php
        const res = fetch("event/get_events.php", {
            method: 'POST',
            body: JSON.stringify(getting_event_data),
            headers: { 'content-type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse response as text
            })
            .then(textData1 => {
                try {
                    const eventdata = JSON.parse(textData1);


                    if (eventdata.success) {
                        localStorage.setItem('token', eventdata.token);

                        createCalendar(currentMonth, currentYear, eventdata.events);
                    } else {
                        console.log(`Your event was unable to be pulled from your calendar account database: ${data.message}`);
                    }
                } catch (error) {
                    console.log('Invalid JSON response: ', error);
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }

    function getMonthName(month) {
        let months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month];
    }

    //adds events to the database
    $("#eventForm").submit(function (e) {
        e.preventDefault(); // to prevent form from submitting normally

        //get the needed components
        const date_input = document.getElementById("date").value;
        const title_input = document.getElementById("title").value;
        const time_input = document.getElementById("time").value;
        const username_input = localStorage.getItem('username');



        //get the tag that we want TAG CREATIVE PORTION
        const radioButtons = document.getElementsByName('taginput');

        let taginput;

        for (const radioButton of radioButtons) {
            if (radioButton.checked) {
                taginput = radioButton.value;
                break;
            }
        }


        //get the currently stored CSRF token input
        const sent_csrf_token = localStorage.getItem('csrf_js_token');

        // Retrieve the value from the "shared-users" input and split it into an array of usernames
        const sharedUsers = document.getElementById("shared-users").value.split(' ');


        //send the values including the csrf token, tag input input to the json
        const data = { 'date': date_input, 'title': title_input, 'time': time_input, 'username': username_input, 'sharedUsers': sharedUsers, 'sent_csrf_token': sent_csrf_token, 'sent_tag_option': taginput };


        //conducts fetch request to add an event from the database, conducts php fetch request accordingly 
        const res = fetch("event/add_event.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse response as text
            })
            .then(textData1 => {
                try {
                    const data = JSON.parse(textData1);

                    //CSRF ELIMINATING HACKERS
                    if (data.hacker) {
                        alert("YOU ARE A CSRF TOKEN HACKER, LOGGING YOU OUT NOW")
                        logout();
                        return;
                    }

                    if (data.success) {
                        localStorage.setItem('token', data.token);
                        console.log("Your event has been uploaded to your calendar account database!");
                        // Redirect to the home page
                        //refresh the calendar when completed
                        refreshCalendar();

                    } else {
                        console.log(`Your event was unable to be uploaded to your calendar account database: ${data.message}`);
                    }
                } catch (error) {
                    console.log('Invalid JSON response:');
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });


    });

    //if we need to edit an event
    $("#eventForm2").submit(function (e) {

        //get the event components
        const date_input = document.getElementById("date2").value;
        const title_input = document.getElementById("title2").value;
        const time_input = document.getElementById("time2").value;
        const eventid_input = document.getElementById("eventId2").value;
        const username_input = localStorage.getItem('username');
        const sharedUsers = document.getElementById("shared-users2").value.split(' ');


        //get the currently stored CSRF token input
        const sent_csrf_token = localStorage.getItem('csrf_js_token');



        //get the tag that we want TAG CREATIVE PORTION
        const radioButtons = document.getElementsByName('taginput2');

        let taginput2;

        for (const radioButton of radioButtons) {
            if (radioButton.checked) {
                taginput2 = radioButton.value;
                break;
            }
        }


        //send the values including the csrf token input to the json
        //doesnt take the tag??????????????????????????????????????????????? 
        const data = { 'date': date_input, 'title': title_input, 'time': time_input, 'username': username_input,'sharedUsers': sharedUsers, 'event_id': eventid_input, 'sent_csrf_token': sent_csrf_token, 'sent_tag_option': taginput2 };

        //conduct a php request to edit_event.php, this will edit the event based on what is retrieved.
        const res = fetch("event/edit_event.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse response as text
            })
            .then(textData1 => {
                try {
                    const data = JSON.parse(textData1);



                    //CSRF ELIMINATING HACKERS
                    if (data.hacker) {
                        alert("YOU ARE A CSRF TOKEN HACKER, LOGGING YOU OUT NOW")
                        logout();
                        return;
                    }
                    if (data.success) {
                        localStorage.setItem('token', data.token);
                        console.log("Your event has been edited in your calendar account database!");
                        // Redirect to the home page


                        //refresh the calendar
                        refreshCalendar();
                    } else {
                        console.log(`Your event was unable to be edited in your calendar account database: ${data.message}`);
                        alert(`Your event was unable to be edited : ${data.message}`);
                    }
                } catch (error) {
                    console.log('Invalid JSON response:', error);
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    });

    //if we need to edit an event
    $("#deleteButton").click(function (e) {
        const eventid_input = document.getElementById("eventId2").value;
        const username_input = localStorage.getItem('username');
        console.log("event id: " + eventid_input);
        //get the currently stored CSRF token input
        const sent_csrf_token = localStorage.getItem('csrf_js_token');

        //send the values including the csrf token input to the json
        const data = { 'username': username_input, 'event_id': eventid_input, 'sent_csrf_token': sent_csrf_token };

        const res = fetch("event/delete_event.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse response as text
            })
            .then(textData1 => {
                try {

                    const data = JSON.parse(textData1);

                    //CSRF ELIMINATING HACKERS
                    if (data.hacker) {
                        alert("YOU ARE A CSRF TOKEN HACKER, LOGGING YOU OUT NOW")
                        logout();
                        return;
                    }

                    if (data.success) {
                        localStorage.setItem('token', data.token);
                        console.log("Your event has been deleted from your calendar account database!");
                        // Redirect to the home page


                        //refresh the calendar
                        refreshCalendar();

                    } else {
                        console.log(`Your event was unable to be deleted from your calendar account database: ${data.message}`);
                    }
                } catch (error) {
                    console.log('Invalid JSON response:', error);
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    });


    // Event handlers for previous and next buttons
    $("#prevButton").click(function () {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        refreshCalendar();
    });

    $("#nextButton").click(function () {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        refreshCalendar();
    });

    // Event handler for clicking on an event
    if (isEventFormShown) {
        $(document).on("click", "li", function () {
            let eventId = this.dataset.eventId;
            let eventTitle = this.textContent;
            let cell = this.closest('td');

            titleInput.value = eventTitle;
            dateInput.value = cell.textContent;
            timeInput.value = '';

            eventIdInput.value = eventId;

            hideEventForm();
        });
    }


    // Refresh the calendar when the page loads
    refreshCalendar();
});

$(document).ready(function () {
    $("#shareCalendarLink").click(function () {
        shareAllEventsWithUser();
    });
});

function getAllEventsForCurrentUser() {
    const username_input = localStorage.getItem('username');

    const getting_event_data = { 'username': username_input };

    return fetch("event/get_events.php", {
        method: 'POST',
        body: JSON.stringify(getting_event_data),
        headers: { 'content-type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            if (data.success) {
                return data.events;
            } else {
                throw new Error(data.message);
            }
        });
}


function shareAllEventsWithUser() {
    const sharedUsers = $('#sharedUserName').val().split(' ');  // Get the entered usernames

    if (sharedUsers == "") {
        alert("Please enter at least one username to share with.");
        return;
        
    }
    
    if (!sharedUsers.length) {
        alert("Please enter at least one username to share with.");
        return;
    }

    console.log("Sharing all events with users:", sharedUsers.join(', '));

    // Retrieve all events 
    getAllEventsForCurrentUser().then(allEvents => {
        allEvents.forEach(event => {
            // Construct the data object for the server request
            const data = {
                'date': event.date,
                'title': event.title,
                'time': event.time,
                'username': localStorage.getItem('username'),
                'event_id': event.id,
                'sent_csrf_token': localStorage.getItem('csrf_js_token'),
                'sent_tag_option': event.tags,
                'sharedUsers': sharedUsers  // Correct the property name
            };

            // Send the updated event to the server
            fetch("event/edit_event.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'content-type': 'application/json' }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();  // Parse response as text
            })
            .then(textData => {
                try {
                    const data = JSON.parse(textData);
                    if (data.success) {
                        console.log(`Event ${event.id} shared successfully!`);
                        // alert(`Event ${event.id} shared successfully!`);
                    } else {
                        // console.log('Failed to share event:', data.message);
                        alert(`You cannot share: ${event.title}, \nonly the original creator can share this event!`);
                    }
                } catch (error) {
                    console.log('Invalid JSON response:', error);
                }
            })
            .catch(err => console.error('Error:', err));
        });
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error("Failed to retrieve events:", error);
    });
}
