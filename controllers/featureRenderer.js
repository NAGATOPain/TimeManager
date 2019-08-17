const model = require('../models/model.js');
const enviroment = require('../env.js');

async function renderHomeFeature(request){
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
        eventLimit: true,
        events: []
    };

    calendarProperties.events = await model.getCalendarData(request);

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
    let returnData = { title: 'Inbox', content: '' };
    returnData.content = `
    <div class="row mb-3">
        <div class="col">
            <input class="form-control" id="inbox" placeholder="What would you do ?">
        </div>
        <div class="col">
            <div class="d-flex flex-row align-items-center">
                <div class="mr-3 ml-3"> From </div>
                <input class="form-control" type="datetime-local" id="from_time">
                <div class="mr-3 ml-3"> To </div>
                <input class="form-control" type="datetime-local" id="to_time">
            </div>
        </div>
    </div>
    <div id="inboxAlert" class="d-none form-group alert alert-danger alert-dismissible fade show"></div>
    <script>
    function submitForm(){
        $('#inbox').attr("disable", "disable");
        let inboxWork = $('#inbox').val();
        let fromTime = $('#from_time').val();
        let toTime = $('#to_time').val();
        $.post('/dashboard/inbox', {inbox: inboxWork, fromTime: fromTime, toTime: toTime})
        .done((data) => {
            if (data.content === 'Error'){
                $("#inboxAlert").toggleClass("d-none d-block");
                $("#inboxAlert").text("Some errors have occured !");
            }
            else if (data.content === 'Invalid'){
                $("#inboxAlert").toggleClass("d-none d-block");
                $("#inboxAlert").text("Your input must be [A-Z][a-z][0-9]-.,?() and spaces, and at least 2 charaters!");
            }
            else {
                $("#inboxAlert").toggleClass("d-block d-none");
                $('#content').html(data.content);
            }
        });
        $('#inbox').removeAttr("disable");
    }
    $('#inbox').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            submitForm();
        }
    });
    $('#from_time').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            submitForm();
        }
    });
    $('#to_time').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            submitForm();
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
                                const workText = $("#label-${index}").text();
                                $.post('/dashboard/inbox/done', {name: workText})
                                .done((data) => {
                                    if (data.content === 'Error'){
                                        $("#inboxAlert").toggleClass("d-none d-block");
                                        $("#inboxAlert").text("Some errors have occured !");
                                    }
                                    else {
                                        bootbox.alert("You've done " + workText + ". Good jobs!");
                                        $("#inboxAlert").toggleClass("d-block d-none");
                                        $('#content').html(data.content);
                                    }
                                });
                            });
                            $("#button-${index}-2").click(() => {
                                const workText = $("#label-${index}").text();
                                $.post('/dashboard/inbox/delete', {name: workText})
                                .done((data) => {
                                    if (data.content === 'Error'){
                                        $("#inboxAlert").toggleClass("d-none d-block");
                                        $("#inboxAlert").text("Some errors have occured !");
                                    }
                                    else {
                                        bootbox.alert("You deleted " + workText);
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

    let returnData = { title: 'Daily Works', content: '' };
    returnData.content += `<div id='calendar'></div>
    <script>
        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            height: 'parent',
            themeSystem: 'bootstrap',
            plugins: ['interaction', 'dayGrid'],
            defaultView: 'dayGridWeek',
            header: {
                left: 'title',
                center: 'addNewDaily',
                right: 'prev, today, next'
            },

            customButtons: {
                addNewDaily: { text: 'add event',
                click: function(){
                        let dialog = bootbox.dialog({
                            title: 'Add new event',
                            size: 'large',
                            message: \`
                            <div class="d-flex flex-row align-items-center">
                                <input class="form-control m-2" id="inbox" placeholder="What would you do ?">
                                <input class="form-control m-2" type="time" id="from_time">
                                <input class="form-control m-2" type="time" id="to_time">
                            </div>
                            <div class="d-flex flex-row align-items-center">
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Mon</label>
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Tue</label>
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Wed</label>
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Thu</label>
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Fri</label>
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Sat</label>
                                <label class="m-2"><input class="m-1" type="checkbox" value="">Sun</label>
                            </div>
                            \`,
                            buttons: {
                                ok: {
                                    label: 'OK',
                                    className: 'btn-info',
                                    callback: function(){
                                        console.log("OK DUDE");
                                    }
                                }
                            }
                        });
                    }
                }
            },

            eventLimit: true,
            weekNumbers: true,
            events: ${JSON.stringify(await model.getDailyData(request))},

            editable: true,
            eventDrop: function(info){

            }
        });
        calendar.render();
    </script>`;

    return returnData;
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
