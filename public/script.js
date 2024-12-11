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