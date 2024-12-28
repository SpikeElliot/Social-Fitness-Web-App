function displayTypingCharCount() {
    let textBoxes = document.getElementsByClassName('postTextBox');
    let charDisplays = document.getElementsByClassName('postCharCount');

    for (let i = 0; i < textBoxes.length; i++) {
        charsLeft = 255 - textBoxes[i].value.length;
        if (charsLeft <= 30) {
            charDisplays[i].style.display = "inline-block";
            charDisplays[i].innerHTML = `${charsLeft} characters left`;
        } else {
            charDisplays[i].style.display = "none";
        }
    }
}

function likeToUnlike(image) {
    image.src = "/assets/heart.png";
}

function unlikeToLike(image) {
    image.src = "/assets/heart-full.png";
}

// Take a time in seconds and convert to necessary format
function formatTime(duration) {
    let hrs = Math.floor(a.elapsed_time/3600);
    let mins = Math.floor((a.elapsed_time - hrs*3600)/60);
    let secs = (a.elapsed_time%60);

    let timeString = '';
    if (hrs != 0) timestring += `${hours.toString().padStart(2, '0')}:`;
    if (mins != 0) timeString += `${mins.toString().padStart(2, '0')}:`;
    timeSting += secs.toString().padStart(2, '0');
    
    return timeString;
}