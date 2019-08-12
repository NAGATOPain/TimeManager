// Dash board

function btnHeaderClick(){
    window.location.href = '/dashboard';
}

function sideButtonClick(btnName){
    console.log(`${btnName} clicked !`);
    $.post('/dashboard', {btnClicked: btnName}, function (data, status, jqXHR){
        $('#title').text(data.title);
        $('#content').text(data.content);
        $('.sidebar-component').css('background', '#18344d');
        $(`#${btnName}`).css('background', '#5dc27b');
    }).done(function(){
        console.log(`Request done!`);
    }).fail(function(jqxhr, settings, ex){
        console.log(`Failed ${ex}`);
    });
}

$(document).ready(function(){

    const button = ['btnInbox', 'btnBooks', 'btnProject', 'btnDaily', 'btnMoney', 'btnSchedule'];

    $('#header').click(btnHeaderClick);
    button.forEach((btnName) => {
        $(`#${btnName}`).click(() => sideButtonClick(btnName));
    });

});
