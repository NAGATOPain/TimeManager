function renderInboxFeature(){
    return {title: 'Inbox', content: '1'};
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

    if (btnClicked === 'btnInbox')
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
