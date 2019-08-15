// Dash board

function btnHeaderClick(){
    window.location.href = '/dashboard';
}

function sideButtonClick(btnName){
    $('.sidebar-component').css('background', '#18344d');
    $(`#${btnName}`).css('background', '#5dc27b');
    $.post('/dashboard', {btnClicked: btnName})
    .done(function(data){
        $('#title').text(data.title);
        $('#content').html(data.content);
    });
}

function inboxSubmitButtonClick(inboxWork){
}

$(document).ready(function(){

    const button = ['btnInbox', 'btnBooks', 'btnProject', 'btnDaily', 'btnMoney'];

    $('#header').click(btnHeaderClick);
    button.forEach((btnName) => {
        $(`#${btnName}`).click(() => sideButtonClick(btnName));
    });
});
