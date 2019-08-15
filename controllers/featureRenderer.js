const model = require('../models/model.js');
const enviroment = require('../env.js');

function renderHomeFeature(request){
    const sidebarComponents = [
        { 'id': 'btnInbox', 'icon': '/img/inbox.png', 'text': 'Inbox'},
        { 'id': 'btnBooks', 'icon': '/img/book.png', 'text': 'Books'},
        { 'id': 'btnProject', 'icon': '/img/project.png', 'text': 'Projects'},
        { 'id': 'btnDaily', 'icon': '/img/daily.png', 'text': 'Daily Works'},
        { 'id': 'btnMoney', 'icon': '/img/money.png', 'text': 'Money'}
    ];

    const calendarProperties = {
        height: 'parent',
        themeSystem: 'bootstrap',
        plugins: [ 'timeGrid' , 'dayGrid', 'list'],
        defaultView: 'dayGridMonth',
        header: {
            left: 'dayGridMonth, dayGridWeek, timeGridDay, listWeek',
            center: 'title',
            right: 'prev, today, next'
        },
        selectable: true,
        events: []
    };

    const calendarScript = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var calendarEl = document.getElementById('calendar');
            var calendar = new FullCalendar.Calendar(calendarEl, ${JSON.stringify(calendarProperties)});
            calendar.render();
        });
    </script>`;

    const obj = {
        'sidebarComponent': sidebarComponents,
        'APP_NAME': enviroment.APP_NAME,
        'APP_VERSION': enviroment.APP_VERSION,
        'title': '',
        'calendarDiv': `<div id='calendar'></div>`,
        'calendarScript': calendarScript
    }
    return obj;
}

async function renderInboxFeature(request){
    let returnData = {
        title: 'Inbox',
        content: ''
    };
    returnData.content = `<div class="form-group">
        <input class="form-control" id="inbox" placeholder="What would you do ?">
        <div id="inboxAlert" class="d-none form-group alert alert-danger alert-dismissible fade show"></div>
    </div>
    <script>
    $('#inbox').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            $('#inbox').attr("disable", "disable");
            let inboxWork = $('#inbox').val();
            $.post('/dashboard/inbox', {inbox: inboxWork})
            .done((data) => {
                if (data.content === 'Error'){
                    $("#inboxAlert").toggleClass("d-none d-block");
                    $("#inboxAlert").text("Some errors have occured !");
                }
                else if (data.content === 'Invalid'){
                    $("#inboxAlert").toggleClass("d-none d-block");
                    $("#inboxAlert").text("Your input must be [A-Z][a-z][0-9]-.,?() and spaces!");
                }
                else {
                    $("#inboxAlert").toggleClass("d-block d-none");
                    $('#content').html(data.content);
                }
            });
            $('#inbox').removeAttr("disable");
        }
    });
    </script>
    `;
    const inboxData = await model.getInboxData(request);
    if (inboxData === undefined || inboxData.length == 0){
        returnData.content += 'There is no works here!';
    }
    else {
        returnData.content += `<ul class="list-group fill-viewport-height-2">`;
        inboxData.forEach((item, index) => {
            returnData.content += `<li class="list-group-item">
                <div class="row align-items-center">
                    <div class="col text-center">
                        <div id="label-${index}" class="ml-2 font-weight-bold">${item.name}</div>
                    </div>
                    <div class="col-2">
                        <button type="button" id="button-${index}-2" class="btn btn-warning mr-2 float-right"><i class="fas fa-trash"></i></button>
                        <button type="button" id="button-${index}-1" class="btn btn-info mr-2 float-right"><i class="fas fa-check"></i></button>
                        <script>
                            $("#button-${index}-1").click(() => {
                                $.post('/dashboard/inbox/done', {name: $("#label-${index}").text()})
                                .done((data) => {
                                    if (data.content === 'Error'){
                                        $("#inboxAlert").toggleClass("d-none d-block");
                                        $("#inboxAlert").text("Some errors have occured !");
                                    }
                                    else {
                                        $("#inboxAlert").toggleClass("d-block d-none");
                                        $('#content').html(data.content);
                                    }
                                });
                            });
                            $("#button-${index}-2").click(() => {
                                $.post('/dashboard/inbox/delete', {name: $("#label-${index}").text()})
                                .done((data) => {
                                    if (data.content === 'Error'){
                                        $("#inboxAlert").toggleClass("d-none d-block");
                                        $("#inboxAlert").text("Some errors have occured !");
                                    }
                                    else {
                                        $("#inboxAlert").toggleClass("d-block d-none");
                                        $('#content').html(data.content);
                                    }
                                });
                            });
                        </script>
                    </div>
                </div>
            </li>`;
        });
        returnData.content += `</ul>`;
    }
    return returnData;
}

async function renderBookFeature(request){
    return {title: 'Books', content: '2'};
}

async function renderProjectFeature(request){
    return {title: 'Projects', content: '3'};
}

async function renderDailyFeature(request){
    return {title: 'Daily Works', content: '4'};
}

async function renderMoneyFeature(request){
    return {title: 'Money', content: '5'};
}

async function renderScheduleFeature(request){
    return {title: 'Schedule Render', content: '6'};
}

async function renderError(request){
    return {title: 'Error', content: 'ERROR'};
}

exports.render = async (btnClicked, request) => {
    if (btnClicked === 'btnHome')
        return renderHomeFeature(request);

    else if (btnClicked === 'btnInbox')
        return renderInboxFeature(request);

    else if (btnClicked === 'btnBooks')
        return renderBookFeature(request);

    else if (btnClicked === 'btnProject')
        return renderProjectFeature(request);

    else if (btnClicked === 'btnDaily')
        return renderDailyFeature(request);

    else if (btnClicked === 'btnMoney')
        return renderMoneyFeature(request);

    else if (btnClicked === 'btnSchedule')
        return renderScheduleFeature(request);

    else
        return renderError(request);
}
