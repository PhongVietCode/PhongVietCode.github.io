<?php

$conn = mysqli_connect("localhost","root","","os_question");

$stmt = $conn->prepare("SELECT `question`, `option1`, `option2`, `option3`, `option4`, `correct_option`, `explain` FROM `schedule_quiz`");

// EXECUTE THE QUERY	

$stmt->execute();

// binding the result to the query

$stmt->bind_result($question, $option1, $option2, $option3, $option4, $correct_option, $explain);

// create empty array

$questions_array = array();

// traverse through all the question

while($stmt->fetch()){
	$temp = array();
	$temp['question'] = $question;
	$temp['option1'] = $option1;
	$temp['option2'] = $option2;
	$temp['option3'] = $option3;
	$temp['option4'] = $option4;
	$temp['correct_option'] = $correct_option;
	$temp['explain'] = $explain;

	array_push($questions_array, $temp);

}

// display the result in JSON format
echo json_encode($questions_array);

?>

