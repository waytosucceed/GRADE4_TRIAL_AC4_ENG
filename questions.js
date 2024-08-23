var questions = [];
var i = 0;
var count = 0;
var score = 0;
var Ansgiven = []; // Store answers given by the user
var previousQuestionIndex = null; // Track the previously displayed question
var topicName = ''; // Variable to store the topic name
const submitSound =document.getElementById("submit-sound");

// Fetch the questions from the JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // Get the selected topic from the URL
    const urlParams = new URLSearchParams(window.location.search);
    topicName = urlParams.get('topic'); // Store topic name for later use

    // Find the questions for the selected topic
    const selectedTopic = data.topics.find(t => t.heading === topicName);

    if (selectedTopic) {
      questions = selectedTopic.questions; // Access the questions array for the selected topic
      count = questions.length;

      // Store total number of questions in localStorage
      localStorage.setItem(topicName + '_totalQuestions', count);

      // Load the heading from the selected topic
      document.getElementById('heading').innerText = topicName || 'Default Heading'; // Set default heading if not provided
      loadButtons();
      loadQuestion(i);

      // Store topics in local storage for the results page
      const topics = JSON.parse(localStorage.getItem('topics')) || [];
      if (!topics.find(t => t.heading === topicName)) {
        topics.push(selectedTopic);
        localStorage.setItem('topics', JSON.stringify(topics));
      }
    } else {
      document.getElementById('heading').innerText = 'Topic not found';
      document.getElementById('buttonContainer').innerHTML = 'No questions available for this topic.';
    }
  });

function loadButtons() {
  var buttonContainer = document.getElementById("buttonContainer");
  buttonContainer.innerHTML = ""; // Clear previous buttons
  for (var j = 0; j < questions.length; j++) {
    var btn = document.createElement("button");
    btn.className = "btn btn-default smallbtn";
    btn.innerHTML = "Q" + (j + 1);
    btn.setAttribute("onclick", "abc(" + (j + 1) + ")");

    // Check if the topic has been completed and disable the button if necessary
    if (localStorage.getItem(topicName + '_completed')) {
      btn.classList.add("disabled-btn");
      btn.disabled = true;
    }

    buttonContainer.appendChild(btn);
  }
  // Highlight the button for the current question
  highlightButton(i);
  // Update button styles based on answered questions
  updateButtonStyles();
}

function loadQuestion(index) {
 
  var randomQuestion = questions[index];
  var passageTextElement = document.getElementById("passageText");
  var imageContainer = document.getElementById("picdiv");
  var questionDiv = document.getElementById("questiondiv");
  var optionsContainer = document.getElementById("options");
  
  // Clear previous content
  optionsContainer.innerHTML = "";
  document.getElementById("math_ques").src = "";

  if (randomQuestion.passage) {
    passageTextElement.innerHTML = "<p>" + randomQuestion.passage + "</p>";
    passageTextElement.style.display = "block"; // Show the passage text
    imageContainer.style.display = "none"; // Hide the image container
    questionDiv.classList.add("full-width"); // Add class for full width
    
  } else {
    passageTextElement.style.display = "none"; // Hide the passage text if not available
    imageContainer.style.display = "block"; // Show the image container
    document.getElementById("math_ques").src = randomQuestion.image || "./assests/images/dummy-img.png";
    questionDiv.classList.remove("full-width"); // Remove class for full width
  }

  document.getElementById("numdiv").innerHTML = randomQuestion.questionNo;
  document.getElementById("question").innerHTML = randomQuestion.question;
  
  if (randomQuestion.options && randomQuestion.options.length > 0) {
    // Display options as radio buttons
    randomQuestion.options.forEach(function(option) {
      var li = document.createElement("li");
      li.innerHTML = '<input type="radio" name="answer" value="' + option + '" onchange="handleAnswerChange()"> ' + option;
      optionsContainer.appendChild(li);
    });

    // Load the previously selected answer if available
    var previouslySelected = Ansgiven[index];
    if (previouslySelected !== null && previouslySelected !== undefined) {
      document.querySelector('input[name="answer"][value="' + randomQuestion.options[previouslySelected] + '"]').checked = true;
    }
  } else {
    // Display text area for open-ended questions
    var textArea = document.createElement("textarea");
    textArea.id = "answerTextArea";
    textArea.rows = 4;
    textArea.cols = 50;
    textArea.placeholder = "Write your answer here...";
    optionsContainer.appendChild(textArea);
    
    // Load the previously entered answer if available
    if (Ansgiven[index]) {
      textArea.value = Ansgiven[index];
    }
  }

  // Remove highlight from the previously displayed question
  if (previousQuestionIndex !== null) {
    document.getElementById("question").classList.remove("highlight");
  }

  // Highlight the current question
  document.getElementById("question").classList.add("highlight");

  // Save the current question index
  previousQuestionIndex = index;

  // Update button visibility based on whether an answer is selected
  updateButtonVisibility();
  // Highlight the button for the current question
  highlightButton(index);
  // Update button styles
  updateButtonStyles();

  // Update the Next button or Submit Answers button
  updateButtonText();
}

function saveCurrentAnswer() {
  var selectedAnswer = document.querySelector('input[name="answer"]:checked');
  var textAreaAnswer = document.getElementById("answerTextArea");

  if (selectedAnswer) {
    Ansgiven[i] = questions[i].options.indexOf(selectedAnswer.value);
  } else if (textAreaAnswer && textAreaAnswer.value.trim() !== "") {
    Ansgiven[i] = textAreaAnswer.value.trim();
  } else {
    Ansgiven[i] = null; // Mark as not answered
  }
}

function handleAnswerChange() {
  // Show the Submit Answer button and hide the Next button when an answer is selected
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";
}

function newques() {
  // Save the answer for the current question
  saveCurrentAnswer();

  if (i === count - 1) {
    // Display results
    displayResults();
    // Hide buttonContainer
    document.getElementById("buttonContainer").style.display = "none";
  } else {
    // Move to the next question
    i++;
    loadQuestion(i);
    document.getElementById("result").innerHTML = "";
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";
    
    // Update button visibility and styles
    updateButtonVisibility();
    updateButtonStyles();
  }
}

// function saveCurrentAnswer() {
//   var selectedAnswer = document.querySelector('input[name="answer"]:checked');
//   if (selectedAnswer) {
//     Ansgiven[i] = questions[i].options.indexOf(selectedAnswer.value);
//   } else {
//     Ansgiven[i] = null; // Mark as not answered
//   }
// }


function displayResults() {
 
    // Calculate the score based on saved answers
  score = Ansgiven.reduce((total, answer, index) => {
    if (questions[index].options) {
      // Multiple-choice question
      return answer === questions[index].answer ? total + 1 : total;
    } else {
      // Open-ended question
      document.getElementById("picdiv").style.display = "none";
      document.getElementById("questiondiv").style.width = "100%";


      return answer === questions[index].answer ? total + 1 : total;
    
    }
  }, 0);

  // Save the score and completion status in local storage
  localStorage.setItem(topicName + '_score', score);
  localStorage.setItem(topicName + '_completed', 'true'); // Mark topic as completed

  // Hide certain elements
  document.getElementById("math_ques").style.display = "none";
  document.getElementById("numdiv").style.display = "none";
  document.getElementById("question").style.display = "none";
  document.getElementById("nextbtn").style.display = "none";
  document.getElementById("result").style.display = "none";
  document.getElementById("options").style.display = "none";
  document.getElementById("head").innerHTML = "Check Your Answers";

  // Calculate percentage and feedback message
  var percentage = (score / count) * 100;
  var progressBarColor = "";
  var feedbackMessage = "";

  if (percentage <= 40) {
    progressBarColor = "#F28D8D"; /* Dark Pastel Red */
    feedbackMessage = "You may need more practice.";
  } else if (percentage > 40 && percentage <= 70) {
    progressBarColor = "#6C8EBF"; /* Dark Pastel Blue */
    feedbackMessage = "Well done!";
  } else if (percentage > 70) {
    progressBarColor = "#B5E7A0"; /* Dark Pastel Green */
    feedbackMessage = "Excellent job!";
  }

  document.getElementById("picdiv").style.backgroundColor = "#B7A0D0"; /* Dark Pastel Lavender */
  document.getElementById("picdiv").style.fontSize = "1.8rem"; /* Larger font size for feedback */
  document.getElementById("picdiv").style.textAlign = "center";
  document.getElementById("picdiv").style.color = "#333"; /* Darker color for text */

  var Dis = "Thank you for participating.<br><br>Score: " + score + "/" + count + "<br><br>";
  var home = "<a href='index.html'><b class='btn btn-success next-btn-progress'>Next</b></a><br>";
  var content = Dis + feedbackMessage + "<br><div class='progress'> <div class='progress-bar' role='progressbar' aria-valuenow='" + percentage + "' aria-valuemin='0' aria-valuemax='100' style='width:" + percentage + "%;background-color:" + progressBarColor + ";'> </div></div>" + home;

  // Store the results content in local storage with a unique key
  localStorage.setItem(topicName + '_results_content', content);

  // Prepare question and answer details
  var questionContent = "";
  document.getElementById("questiondiv").style.textAlign = "left";
  document.getElementById("questiondiv").style.color = "black";
  document.getElementById("questiondiv").style.fontSize = "18px";
  document.getElementById("questiondiv").innerHTML = ""; // Clear previous content

  for (var j = 0; j < questions.length; j++) {
    var ques = questions[j].question;
    var correctAnswer = questions[j].options ? questions[j].options[questions[j].answer] : questions[j].answer;
    var givenAnswer = Ansgiven[j];

    if (questions[j].options) {
      // Multiple-choice question
       givenAnswer = Ansgiven[j] !== undefined ? (Ansgiven[j] !== null ? questions[j].options[Ansgiven[j]] : "Not Answered") :"Not Answered";
       var passage = questions[j].passage ? "<br><b>Passage:</b> " + questions[j].passage + "<br>" : ""; // Check if passage is present
       console.log("passage", passage)
       if(passage){
        var num = j + 1;

        questionContent += "Q." + num + " " + ques + passage + "<br>" + "Correct Answer: " + correctAnswer + "<br>" + "Answer Given: " + givenAnswer + "<br><br>";
       }   
       else{
        var num = j + 1;

        questionContent += "Q." + num + " " + ques  + "<br>" + "Correct Answer: " + correctAnswer + "<br>" + "Answer Given: " + givenAnswer + "<br><br>";
       } 

    } else {
      // Open-ended question

      givenAnswer = givenAnswer !== null ? givenAnswer : "Not Answered";
      correctAnswer = ""
      var num = j + 1;
// 
          questionContent += "Q." + num + " " + ques + "<br>" + "<br>" + "Answer Given: " + givenAnswer + "<br><br>";

    
     
    }

    // var num = j + 1;
  }


    localStorage.setItem(topicName + '_question_content', questionContent);

  document.getElementById("picdiv").innerHTML = content;

  document.getElementById("questiondiv").innerHTML = questionContent + home;
}





function checkAnswer() {
  
  submitSound.play();

  saveCurrentAnswer();
  document.getElementById("subbtn").style.display = "none";
  document.getElementById("nextbtn").style.display = "inline-block";
}

function abc(x) {
  // Save the current answer before changing questions
  saveCurrentAnswer();
  i = x - 1;
  loadQuestion(i);
  document.getElementById("result").innerHTML = "";
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";

  // Update button styles and visibility
  highlightButton(i);
  updateButtonStyles();
}

function updateButtonVisibility() {

  var selectedAnswer = document.querySelector('input[name="answer"]:checked');
  var textAreaAnswer = document.getElementById("answerTextArea");
  
  if (selectedAnswer || (textAreaAnswer && textAreaAnswer.value.trim() !== "")) {
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";

  } else {
    

    document.getElementById("subbtn").style.display = "none";
    document.getElementById("nextbtn").style.display = "inline-block";
  }
}

function highlightButton(index) {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove highlight from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("highlighted-btn");
  }

  // Add highlight to the current button
  if (index >= 0 && index < buttons.length) {
    buttons[index].classList.add("highlighted-btn");
  }
}

function updateButtonStyles() {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove "answered-btn" class from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("answered-btn");
  }

  // Add "answered-btn" class to the button for the answered questions
  // Ansgiven.forEach((answer, index) => {
  //   if (answer) {
  //     if (index >= 0 && index < buttons.length) {
  //       buttons[index].classList.add("answered-btn");
  //     }
  //   }
  // });
  Ansgiven.forEach((answer, index) => {
    if (answer !== null) { // Ensure the answer is not null
      if (index >= 0 && index < buttons.length) {
        buttons[index].classList.add("answered-btn");
      }
    }
  });
}

function updateButtonText() {
  var nextButton = document.getElementById("nextbtn");    

  if (i === count - 1) {
    nextButton.innerHTML = "FINISH TEST";
    nextButton.onclick = function() {
      newques(); // Calls newques which will hide buttonContainer
    };
  } else {
    nextButton.innerHTML = "Next";   
  }
}


