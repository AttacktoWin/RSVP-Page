$(document).ready(function() {
    // SEARCH PAGE
    
    $('#searchbox').on('focus keypress', function() {
        var term = $('#searchbox').val().toLowerCase().trim();
        $(".group").remove();



        $.get(`https://rsvp.husakandbhatrimony.com/search/${term}`, function(data, status) {
            data = JSON.parse(data);
            for (var i = 0; i < data.length; i++) {
                var element = "";
                if (data[i].members > 0) {
                    var members = data[i].members.toString();
                    var id = data[i].id;

                    element += `<div class="group" group-id="${id}">
                                    <div class="name">${data[i].name}</div>
                                    <div class="main">${data[i].main}<div>
                                    <div class="members">+${members} more</div>
                                </div>`
                } else {
                    element += `<div class="group" group-id="${data[i].id}">
                                    <div class="name">${data[i].name}</div>
                                    <div class="main">${data[i].main}<div>
                                </div>`
                }
                $('.search').append(element);
            }
        });
    });

    $('.search').on('click', 'div', function() {
        var groupId = $(this).attr('group-id');
        window.location.href = `https://rsvp.husakandbhatrimony.com/group/${groupId}`;
    });



    // GROUP PAGE

    $("#song-container").on('click', 'div', function() {
        if($(this).attr('add')) {
            $(this).remove();
            $('#song-container').append(`<input type="text" id="newSong">`)
            $('#newSong').focus();
        } else {
            var groupId = $('#familyName').attr('group-id');
            var song = $(this).text();
            $.get(`https://rsvp.husakandbhatrimony.com/group/${groupId}/remove/${song}`, function (data, status) {
                $("#song-container").empty();
                for (var i = 0; i < data.length; i++) {
                    $('#song-container').append(`<div class="song">${data[i]}</div>`);
                }
                $('#song-container').append(`<div class="song" id="add" add="true">+ Add Song</div>`);
            })
        }
    });

    $("#song-container").on('blur', 'input', function() {
        var groupId = $('#familyName').attr('group-id');
        var song = $('#newSong').val().trim();
        $.get(`https://rsvp.husakandbhatrimony.com/group/${groupId}/add/${song}`, function (data, status) {
            $('#song-container').empty();
            for (var i = 0; i < data.length; i++) {
                $('#song-container').append(`<div class="song">${data[i]}</div>`);
            }
            $('#song-container').append(`<div class="song" id="add" add="true">+ Add Song</div>`);
        });
    });

    $("#song-container").on('keyup', 'input', function() {
        if (event.keyCode === 13) {
            var groupId = $('#familyName').attr('group-id');
            var song = $('#newSong').val().trim();
            $.get(`https://rsvp.husakandbhatrimony.com/group/${groupId}/add/${song}`, function (data, status) {
                $('#song-container').empty();
                for (var i = 0; i < data.length; i++) {
                    $('#song-container').append(`<div class="song">${data[i]}</div>`);
                }
                $('#song-container').append(`<div class="song" id="add" add="true">+ Add Song</div>`);
            });
        }
    });

    $("#submit").on('click', function() {
        var groupId = $('#familyName').attr('group-id');
        var group = [];

        var person = {
            name: "",
            hindu: false,
            civil: false,
            dance: false
        };

        for (var i = 0; i < $(':checkbox').length; i++) {
            if (person.name != $($(':checkbox')[i]).attr('person') && person.name != "") {
                group.push(person);
                person = {
                    name: "",
                    hindu: false,
                    civil: false,
                    dance: false
                };
            }

            if ($($(':checkbox')[i]).attr('date') == 'hindu') {
                person.name = $($(':checkbox')[i]).attr('person');
                person.hindu = $(':checkbox')[i].checked;
            } else if ($($(':checkbox')[i]).attr('date') == 'civil') {
                person.civil = $(':checkbox')[i].checked;
            } else if ($($(':checkbox')[i]).attr('date') == 'dance') {
                person.dance = $(':checkbox')[i].checked;
            }
        }

        group.push(person);

        group = JSON.stringify(group);

        $.post(`https://rsvp.husakandbhatrimony.com/group/${groupId}`, {group: group}, function(data, status) {
            if (status == 'success') {
                window.location.href = 'https://rsvp.husakandbhatrimony.com/finish';
            }
        });
    });
});