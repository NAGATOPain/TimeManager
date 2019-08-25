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

function syncButtonClick(){
    const WUNDERLIST_CLIENT_ID = `d05f1b8a90a3a914b30a`;
    const WUNDERLIST_REDIRECT_URL = `http://localhost:3000/wunderlist/token`;
    window.open(`https://www.wunderlist.com/oauth/authorize?client_id=${WUNDERLIST_CLIENT_ID}&redirect_uri=${WUNDERLIST_REDIRECT_URL}&state=RANDOM`, "", "width:100%,height:100%");
}

$(document).ready(function(){

    const button = ['btnInbox', 'btnBooks', 'btnProject', 'btnDaily', 'btnMoney'];

    $('#header').click(btnHeaderClick);
    button.forEach((btnName) => {
        $(`#${btnName}`).click(() => sideButtonClick(btnName));
    });

    $(`#syncButton`).click(syncButtonClick);
});
