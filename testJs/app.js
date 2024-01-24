function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Add event listener for auto save checkbox
document.getElementById('autoSaveCheck').addEventListener('change', function() {
    if(this.checked) {
        // Handle auto save logic
        console.log('Auto save is checked');
    } else {
        // Handle logic when auto save is not checked
        console.log('Auto save is unchecked');
    }
});