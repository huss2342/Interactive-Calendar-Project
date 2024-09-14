
function resetForm() {
    let inputIds = ['eventForm', 'title', 'date', 'time', 'eventId'];
    let inputs = inputIds.map(id => document.getElementById(id));

    // Reset the form if it's found
    if (inputs[0]) {
        inputs[0].reset();
        console.log("Event form reset.");
    } else {
        console.error("Event form not found in the DOM for reset.");
    }

    // Clear individual input fields starting from index 1, since index 0 is the form itself
    for (let i = 1; i < inputs.length; i++) {
        if (inputs[i]) {
            inputs[i].value = '';
        } else {
            console.error(`${inputIds[i]} input not found in the DOM.`);
        }
    }
}

//this will create a form that will make it possible for the user to add events 
function showEventsAddMenu(formattedDate, eventTitles) {
    let formContainer = document.getElementById('event-form-container');

    if (!formContainer) {
        console.error("Event form container not found in the DOM.");
        return;
    }

    // Function to reset form state
    function resetForm() {
        // Resetting the form fields to their default values
        let eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.reset();
            console.log("Event form reset.");
        } else {
            console.error("Event form not found in the DOM for reset.");
            return; // No need to proceed if the form isn't found
        }

        // Resetting variables to their initial state
        parsedDate = null;
        formattedDate = "";

 
    }




    // Function to parse date from your custom formatted string
    function parseDate(formattedDate) {
        // Extract date components. Based on your log, it seems like the format is "Date: [date], Month: [month], Year: [year]"
        let dateComponents = formattedDate.match(/Date: (\d+), Month: (\d+), Year: (\d+)/);
        if (!dateComponents) {
            console.error("Invalid date format received: ", formattedDate);
            return null;
        }

        let date = parseInt(dateComponents[1], 10);
        let month = parseInt(dateComponents[2], 10) - 1; // convert to 0-based index for the month
        let year = parseInt(dateComponents[3], 10);

        return { date, month, year };
    }

    function formatToInputDate(parsedDate) {
        // Months in JavaScript are 0-based, so we add 1 to get the correct month number
        let month = parsedDate.month + 1;

        // Format day and month to be two-digits
        let formattedDate = parsedDate.year + '-'
            + (month < 10 ? '0' + month : month) + '-'
            + (parsedDate.date < 10 ? '0' + parsedDate.date : parsedDate.date);

        return formattedDate;
    }

    // Assuming formattedDate is the date string you are receiving
    let parsedDate = parseDate(formattedDate);
    if (!parsedDate) {
        console.log("Invalid date format received: ", formattedDate);
        return; // Could not parse the date, so we don't proceed
    }

    let dateField = document.getElementById('date');
    if (dateField) {
        let inputDate = formatToInputDate(parsedDate);
        dateField.value = inputDate; // This line actually sets the value in the input field
        console.log("Date field populated with value: ", inputDate);
    } else {
        console.error("Date field not found in the DOM.");
    }





    formContainer.style.display = "block"; // Ensure it's visible
    console.log("Event form displayed.");

    // When the user clicks the cancel button, hide the form container
    let cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.onclick = function () {
            formContainer.style.display = "none";
            formContainer.classList.add('hidden'); // In case you're using this class in CSS
            resetForm();
            console.log("Event form hidden after cancel.");
        };
    } else {
        console.error("Cancel button not found in the DOM.");
    }

    // Similar for form submission, if you're hiding the form after submission:
    let eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.onsubmit = function (e) {
            e.preventDefault();
            // Your submission logic here

            // After submission logic
            formContainer.style.display = "none";


            resetForm();



            console.log("Event form hidden after submission.");
        };
    } else {
        console.error("Event form not found in the DOM.");
    }
}





//making a form for editing or deleting a form 

//this will create a form that will make it possible for the user to edit and delete events 
function showEventsEditOrDeleteMenu(formattedDate, old_eventinfo) {

    let formContainer = document.getElementById('event-form-container2');

    if (!formContainer) {
        console.error("Event form container not found in the DOM.");
        return;
    }

    // Function to reset form state
    function resetForm() {
        // Resetting the form fields to their default values
        let eventForm = document.getElementById('eventForm2');
        if (eventForm) {
            eventForm.reset();
            console.log("Event form reset.");
        } else {
            console.error("Event form not found in the DOM for reset.");
            return; // No need to proceed if the form isn't found
        }

        // Resetting variables to their initial state
        parsedDate = null;
        formattedDate = "";


    }




    // Function to parse date from your custom formatted string
    function parseDate(formattedDate) {
        // Extract date components. Based on your log, it seems like the format is "Date: [date], Month: [month], Year: [year]"
        let dateComponents = formattedDate.match(/(\d+)-(\d+)-(\d+)/);
        if (!dateComponents) {
            console.error("Invalid date format received: ", formattedDate);
            return null;
        }

        let date = parseInt(dateComponents[3], 10);
        let month = parseInt(dateComponents[2], 10) - 1; // convert to 0-based index for the month
        let year = parseInt(dateComponents[1], 10);

        return { date, month, year };
    }

    function formatToInputDate(parsedDate) {
        // Months in JavaScript are 0-based, so we add 1 to get the correct month number
        let month = parsedDate.month + 1;

        // Format day and month to be two-digits
        let formattedDate = parsedDate.year + '-'
            + (month < 10 ? '0' + month : month) + '-'
            + (parsedDate.date < 10 ? '0' + parsedDate.date : parsedDate.date);

        return formattedDate;
    }

    // Assuming formattedDate is the date string you are receiving
    let parsedDate = parseDate(formattedDate);
    if (!parsedDate) {
        console.log("Invalid date format received: ", formattedDate);
        return; // Could not parse the date, so we don't proceed
    }

    let dateField = document.getElementById('date2');
    if (dateField) {
        let inputDate = formatToInputDate(parsedDate);
        dateField.value = inputDate; // This line actually sets the value in the input field
        console.log("Date field populated with value: ", inputDate);
    } else {
        console.error("Date field not found in the DOM.");
    }


        let reading_old_info = old_eventinfo.split("~");
        //fill in old values
          let title2_input = document.getElementById('title2');
          title2_input.value =  reading_old_info[1];
          let time2_input = document.getElementById('time2');
          time2_input.value =  reading_old_info[0];
          let eventid2_input = document.getElementById('eventId2');
          eventid2_input.value =  reading_old_info[2];
        
          //get the old tag info

          
        //get the tag that we want TAG CREATIVE PORTION
        const radioButtons = document.getElementsByName('taginput2');

        let taginput =  reading_old_info[3];
    
    
 
        for (const radioButton of radioButtons) {
        if (radioButton.value === taginput) {

            //check the correct tag option
            radioButton.checked = true;
            break;
        }
    }

    formContainer.style.display = "block"; // Ensure it's visible
    console.log("Event form displayed.");

    // When the user clicks the cancel button, hide the form container
    let cancelButton = document.getElementById('cancelButton2');
    if (cancelButton) {
        cancelButton.onclick = function () {
            formContainer.style.display = "none";
            formContainer.classList.add('hidden'); // In case you're using this class in CSS
            resetForm();
            console.log("Event form hidden after cancel.");
        };
    } else {
        console.error("Cancel button not found in the DOM.");
    }


    // When the user clicks the delete button, delete the event, and  hide the form container
    let deleteButton = document.getElementById('deleteButton');
    if (deleteButton) {
        deleteButton.onclick = function () {

            //delete event 
            formContainer.style.display = "none";
            formContainer.classList.add('hidden'); // In case you're using this class in CSS
            resetForm();
            console.log("Event form hidden after deleting an event.");
        };
    } else {
        console.error("Delete button not found in the DOM.");
    }

    // If you are editing an event
    let eventForm = document.getElementById('eventForm2');
    if (eventForm) {
        eventForm.onsubmit = function (e) {
            e.preventDefault();
            // Your submission logic here

            // After submission logic
            formContainer.style.display = "none";
            resetForm();
            console.log("Event form hidden after editing an event.");
        };
    } else {
        console.error("edit button on form not found in the DOM.");
    }
}
