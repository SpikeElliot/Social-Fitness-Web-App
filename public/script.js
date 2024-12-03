function displayTypingCharCount() {
    let textBoxes = document.getElementsByClassName('postTextBox');
    let charDisplays = document.getElementsByClassName('postCharCount');

    for (let i = 0; i < textBoxes.length; i++) {
        charsLeft = 255 - textBoxes[i].value.length;
        charDisplays[i].innerHTML = `${charsLeft}/255 characters left`;
    }
}