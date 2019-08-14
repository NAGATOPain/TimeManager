// Dash board

function btnHeaderClick(){
    window.location.href = '/dashboard';
}

function sideButtonClick(btnName){
    $('.sidebar-component').css('background', '#18344d');
    $(`#${btnName}`).css('background', '#5dc27b');
    $.post('/dashboard', {btnClicked: btnName}, function (data, status, jqXHR){
        $('#title').text(data.title);
        $('#content').html(data.content);
    }).done(function(){

    }).fail(function(jqxhr, settings, ex){
        console.log(`Failed ${ex}`);
    });
}

$(document).ready(function(){

    const button = ['btnInbox', 'btnBooks', 'btnProject', 'btnDaily', 'btnMoney'];

    $('#header').click(btnHeaderClick);
    button.forEach((btnName) => {
        $(`#${btnName}`).click(() => sideButtonClick(btnName));
    });
});
