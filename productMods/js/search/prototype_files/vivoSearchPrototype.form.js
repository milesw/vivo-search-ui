$(document).ready(function() {

    // Add the dropdown menu to the search form, add a special class to the text input.
    $('#search-form').css('position', 'relative').prepend('<a href="#" class="dropdown"><span></span></a>').find('.search-vivo').addClass('menu');

    // Toggle the dropdown menu.
    $('#search-form .dropdown').click(function(e) {
        e.preventDefault();
        $('#search-form .search-filters').toggle();
        $('#search-form .dropdown').toggleClass('dropdown-open');
    });

    // Make sure all clicks on the dropdown don't close it.
    $('#search-form .search-filters').mouseup(function() { return false });

    // Hide the menu when a user clicks somewhere else.
    $(document).mouseup(function(e) {
        if ($(e.target).parent('.dropdown').length == 0) {
            $('.dropdown').removeClass('dropdown-open');
            $('#search-form .search-filters').hide();
        }
    });
});