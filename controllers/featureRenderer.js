const model = require('../models/model.js');
const enviroment = require('../env.js');

async function renderHomeFeature(request){
    const sidebarComponents = [
        { 'id': 'btnInbox', 'icon': '/img/inbox.png'},
        { 'id': 'btnBooks', 'icon': '/img/book.png'},
        { 'id': 'btnProject', 'icon': '/img/project.png'},
        { 'id': 'btnDaily', 'icon': '/img/daily.png'},
        { 'id': 'btnMoney', 'icon': '/img/money.png'}
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
        $.post('/dashboard/inbox/add', {inbox: inboxWork, fromTime: fromTime, toTime: toTime})
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
    return {title: 'Books', content: 'This feature will release in the next version.'};
}

async function renderProjectFeature(request){
    return {title: 'Projects', content: 'This feature will release in the next version.'};
}

async function renderDailyFeature(request){

    const dailyData = await model.getDailyData(request);

    let returnData = { title: 'Daily Works', content: '' };
    returnData.content += `<div id='calendar'></div>
    <script>

    function getDailyDialogBoxMessage(data){
        return \`
        <div class="d-flex flex-row align-items-center">
            <input class="form-control m-2" id="daily_name" placeholder="What would you do ?" value="\$\{data.name\}">
        </div>
        <div class="d-flex flex-row align-items-center">
            From <input class="form-control m-2" type="time" id="from_time" value="\$\{data.from_t\}">
            To <input class="form-control m-2" type="time" id="to_time" value="\$\{data.to_t\}">
        </div>
        <div class="d-flex flex-row align-items-center">
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-1" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[1] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-1">Mon</label>
            </div>
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-2" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[2] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-2">Tue</label>
            </div>
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-3" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[3] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-3">Wed</label>
            </div>
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-4" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[4] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-4">Thu</label>
            </div>
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-5" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[5] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-5">Fri</label>
            </div>
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-6" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[6] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-6">Sat</label>
            </div>
            <div class="custom-control custom-checkbox ">
                <input id="checkbox-0" class="m-1 custom-control-input" type="checkbox" \$\{data.daily[0] === '1' ? 'checked' : ''\}>
                <label class="m-2 custom-control-label" for="checkbox-0">Sun</label>
            </div>
        </div>

        <div class="btn-group btn-group-toggle d-flex align-items-center mt-3 mb-3" data-toggle="buttons">
            <label id="colorLabel0" class="btn btn-outline-success active mr-3">
                <input type="radio" name="options" id="colorOption0" autocomplete="off" checked>Green
            </label>
            <label id="colorLabel1" class="btn btn-outline-warning mr-3">
                <input type="radio" name="options" id="colorOption1" autocomplete="off">Yellow
            </label>
            <label id="colorLabel2" class="btn btn-outline-info">
                <input type="radio" name="options" id="colorOption2" autocomplete="off">Blue
            </label>
        </div>

        <div id="dailyAlert" class="d-none form-group alert alert-danger alert-dismissible fade show"></div>
        \`;
    }

    var dialogGUI = {
        title: '',
        message: '',
        button: {}
    };
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
                    dialogGUI.title = 'Add new event';
                    dialogGUI.message = getDailyDialogBoxMessage({name: '', from_t: '', to_t: '', daily: '0000000'});
                    dialogGUI.buttons = {
                        ok: {
                            label: 'OK',
                            className: 'btn-info',
                            callback: function(){
                                const dailyName = $("#daily_name").val();
                                const fromTime = $("#from_time").val();
                                const toTime = $("#to_time").val();
                                let dailyDays = [];
                                for (let i = 0; i < 7; ++i)
                                    dailyDays.push($("#checkbox-" + i).is(':checked'));
                                let color = '';
                                for (let i = 0; i < 3; ++i){
                                    if ($("#colorOption" + i).is(':checked')){
                                        color = $("#colorLabel" + i).css("background-color");
                                    }
                                }

                                $.post('/dashboard/daily/add', {name: dailyName, from_time: fromTime, to_time: toTime, daily_days: dailyDays, color: color})
                                .done((data) => {
                                    if (data.content === 'Invalid'){
                                        $("#dailyAlert").toggleClass("d-none d-block");
                                        $("#dailyAlert").text("Your input is invalid !");
                                    }
                                    else if (data.content === 'Error'){
                                        $("#dailyAlert").toggleClass("d-none d-block");
                                        $("#dailyAlert").text("Some errors have occured !");
                                    }
                                    else {
                                        bootbox.hideAll();
                                        bootbox.alert("Successful");
                                        $('#content').html(data.content);
                                    }
                                });
                                return false;
                            }
                        }
                    };
                    bootbox.dialog(dialogGUI);
                }
            }
        },

        eventLimit: true,
        weekNumbers: true,
        events: ${JSON.stringify(dailyData)},
        eventClick: function(info){
            const eventName = info.event.title;
            dialogGUI.title = \`Modify \$\{eventName\}\`;
            $.post('/dashboard/daily/getdata', {name: eventName})
            .done((data) => {
                $("#daily_name").text(data.content);
                dialogGUI.message = getDailyDialogBoxMessage(data);
                dialogGUI.buttons = {
                    modify: {
                        label: 'Modify',
                        className: 'btn-info',
                        callback: function(){
                            const oldName = eventName;
                            const newName = $("#daily_name").val();
                            const fromTime = $("#from_time").val();
                            const toTime = $("#to_time").val();
                            let dailyDays = [];
                            for (let i = 0; i < 7; ++i)
                                dailyDays.push($("#checkbox-" + i).is(':checked'));
                            
                            let color = '';
                            for (let i = 0; i < 3; ++i){
                                if ($("#colorOption" + i).is(':checked')){
                                    color = $("#colorLabel"+ i).css("background-color");
                                }
                            }

                            $.post('/dashboard/daily/modify', {oldName: eventName, newName: newName, fromTime: fromTime, toTime: toTime, dailyDays: dailyDays, color: color})
                            .done((data) => {
                                if (data.content === 'Error'){
                                    bootbox.alert("Some errors have occured!");
                                }
                                else if (data.content === 'Invalid'){
                                    bootbox.alert("Your input is invalid!");
                                }
                                else {
                                    bootbox.hideAll();
                                    bootbox.alert("You've modified " + eventName);
                                    $('#content').html(data.content);
                                }
                            });

                            return false;
                        }
                    },

                    delete: {
                        label: 'Delete',
                        className: 'btn-danger',
                        callback: function(){
                            bootbox.confirm("Are you sure for deleting " + eventName + "?", function(result){
                                if (result) {
                                    $.post('/dashboard/daily/delete', {name: eventName})
                                    .done((data) => {
                                        if (data.content === 'Error'){
                                            bootbox.alert("Some errors have occured!");
                                        }
                                        else {
                                            bootbox.alert("You've deleted " + eventName);
                                            $('#content').html(data.content);
                                        }
                                    });
                                }
                            });
                        }
                    }
                };
                bootbox.dialog(dialogGUI);
            });
        }
    });
    calendar.render();
    </script>`;

    return returnData;
}

async function renderMoneyFeature(request){
    const moneyData = await model.getMoneyData(request);
    const moneySum = await model.getMoneySum(request);

    let returnData = { title: 'Money', content: '' };

    returnData.content = `<div class="row">
        <div class="col">
            <input class="form-control" id="moneyName" placeholder="What has you bought ?">
        </div>
        <div class="col">
            <input class="form-control ml-2" id="money" placeholder="3000">
        </div>
    </div>
    <div id="moneyAlert" class="d-none form-group alert alert-danger alert-dismissible fade show"></div>
    <script>
    function submitForm(){
        $('#moneyName').attr("disable", "disable");
        let moneyName = $('#moneyName').val();
        let money = $('#money').val();
        $.post('/dashboard/money/add', {name: moneyName, money: money})
        .done((data) => {
            if (data.content === 'Error'){
                $("#moneyAlert").toggleClass("d-none d-block");
                $("#moneyAlert").text("Some errors have occured !");
            }
            else if (data.content === 'Invalid'){
                $("#moneyAlert").toggleClass("d-none d-block");
                $("#moneyAlert").text("Your input is invalid. The name must be [A-Z][a-z][0-9]-.,?() and spaces, and at least 2 charaters!");
            }
            else {
                $("#moneyAlert").toggleClass("d-block d-none");
                $('#content').html(data.content);
            }
        });
        $('#moneyName').removeAttr("disable");
    }
    $('#moneyName').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            submitForm();
        }
    });
    $('#money').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            submitForm();
        }
    });
    $('#time').keypress((event) => {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'){
            submitForm();
        }
    });
    </script>
    <div class="row">
        <button id="btn-all" type="button" class="btn btn-dark ml-3 mt-3 mb-2 mr-1">all</button>
        <button id="btn-month" type="button" class="btn btn-dark mt-3 mb-2 mr-1">month</button>
        <button id="btn-day" type="button" class="btn btn-dark mt-3 mb-2 mr-1">today</button>
    </div>
    <script>
        $('#btn-all').click(function(){
            $.post('/dashboard/money/render', {all: true, month: false, day: false})
            .done((data) => {
                if (data.content === 'Error'){
                    $("#moneyAlert").toggleClass("d-none d-block");
                    $("#moneyAlert").text("Some errors have occured !");
                }
                else {
                    $("#moneyAlert").toggleClass("d-block d-none");
                    $('#content').html(data.content);
                }
            });
        });
        $('#btn-month').click(function(){
            $.post('/dashboard/money/render', {all: false, month: true, day: false})
            .done((data) => {
                if (data.content === 'Error'){
                    $("#moneyAlert").toggleClass("d-none d-block");
                    $("#moneyAlert").text("Some errors have occured !");
                }
                else {
                    $("#moneyAlert").toggleClass("d-block d-none");
                    $('#content').html(data.content);
                }
            });
        });
        $('#btn-day').click(function(){
            $.post('/dashboard/money/render', {all: false, month: false, day: true})
            .done((data) => {
                if (data.content === 'Error'){
                    $("#moneyAlert").toggleClass("d-none d-block");
                    $("#moneyAlert").text("Some errors have occured !");
                }
                else {
                    $("#moneyAlert").toggleClass("d-block d-none");
                    $('#content').html(data.content);
                }
            });
        });
    </script>
    <table id="moneyTable" class="table table-bordered">
    <thead class="thead-dark">
    <tr>
      <th scope="col">#</th>
      <th scope="col">Product</th>
      <th scope="col">Cost</th>
      <th scope="col">Date</th>
      <th scope="col"></th>
    </tr>
    </thead><tbody>
    `;

    moneyData.forEach((value, index) => {
        returnData.content += `<tr class="${parseFloat(value.money) >= 0 ? "table-success" : "table-danger"}">
            <th>${index + 1}</th>
            <td id="moneyName-${index}">${value.moneyName}</td>
            <td id="money-${index}">${value.money}</td>
            <td id="time-${index}">${value.time}</td>
            <td class="text-center">
                <button id="button-${index}" type="button" class="btn btn-dark"><i class="fas fa-edit"></i></button>
            </td>
            <script>
                $("#button-${index}").click(function () {
                    bootbox.dialog({
                        title: "Modify event ${value.moneyName} at ${value.time}",
                        message: \`
                        <div class="d-flex flex-row align-items-center">
                            Name <input class="form-control m-2" id="moneyDialogName" value="${value.moneyName}">
                            Cost <input class="form-control m-2" id="moneyDialog" value="${value.money}">
                        </div>
                        \`,
                        onEscape: true,
                        buttons: {
                            ok: {
                                label: 'Modify',
                                className: 'btn-dark',
                                callback: function() {
                                    const oldName = '${value.moneyName}';
                                    const newName = $("#moneyDialogName").val();
                                    const oldMoney = '${value.money}';
                                    const newMoney = $("#moneyDialog").val();

                                    $.post('/dashboard/money/update', {oldName: oldName, newName: newName, oldMoney: oldMoney, newMoney: newMoney})
                                    .done((data) => {
                                        if (data.content === 'Error'){
                                            bootbox.alert("Some errors have occured !");
                                        }
                                        else if (data.content === 'Invalid'){
                                            bootbox.alert("Your input is invalid !");
                                        }
                                        else {
                                            bootbox.hideAll();
                                            bootbox.alert("Modified ${value.moneyName} successful!");
                                            $('#content').html(data.content);
                                        }
                                    });
                                    return false;
                                }
                            }
                        }
                    });
                });
            </script>
            </tr>
        `;
    });

    returnData.content += `
    </tbody>
    <tfoot>
        <tr>
            <th scope="col"></th>
            <th scope="col"><b>Your currency</b></th>
            <th class="text-center" colspan="2" scope="col">${moneySum}</th>
        </tr>
    </tfoot>
    </table>
    <script>
        $('#moneyTable').DataTable({
            scrollY: '60vh',
            scrollCollapse: true,
            searching: false, paging: false, info: false
        });
        $('.dataTables_length').addClass('bs-select');
    </script>`;

    return returnData;
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

    else
        return renderError(request);
}
