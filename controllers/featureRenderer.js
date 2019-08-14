const model = require('../models/model.js');
const enviroment = require('../env.js');

function renderHomeFeature(){
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

function renderInboxFeature(){
    return model.getInboxData();
}

function renderBookFeature(){
    return {title: 'Books', content: '2'};
}

function renderProjectFeature(){
    return {title: 'Projects', content: '3'};
}

function renderDailyFeature(){
    return {title: 'Daily Works', content: '4'};
}

function renderMoneyFeature(){
    return {title: 'Money', content: '5'};
}

function renderScheduleFeature(){
    return {title: 'Schedule Render', content: '6'};
}

function renderError(){
    return {title: 'Error', content: 'ERROR'};
}

exports.render = (btnClicked) => {
    if (btnClicked === 'btnHome')
        return renderHomeFeature();

    else if (btnClicked === 'btnInbox')
        return renderInboxFeature();

    else if (btnClicked === 'btnBooks')
        return renderBookFeature();

    else if (btnClicked === 'btnProject')
        return renderProjectFeature();

    else if (btnClicked === 'btnDaily')
        return renderDailyFeature();

    else if (btnClicked === 'btnMoney')
        return renderMoneyFeature();

    else if (btnClicked === 'btnSchedule')
        return renderScheduleFeature();

    else
        return renderError();
}
