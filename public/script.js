function displayPostCharCount() {
    let charCount = document.getElementById('postTextBox').value.length;
    document.getElementById('postCharCount').innerHTML = `${255-charCount}/255 characters left`;
}